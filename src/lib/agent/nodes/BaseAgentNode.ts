import { ChatAnthropic } from "@langchain/anthropic";
import {
  SystemMessage,
  AIMessage,
  ToolMessage,
  HumanMessage,
  type BaseMessage,
  type AIMessageChunk,
} from "@langchain/core/messages";
import type { StructuredToolInterface } from "@langchain/core/tools";
import { concat } from "@langchain/core/utils/stream";
import type { Runnable } from "@langchain/core/runnables";
import { checkInjection } from "../guardrails/injection-patterns";
import { encodeEvent, type Artifact, type StreamEvent } from "../helper/stream";
import { toolLog } from "@/lib/tool-logger";

type StreamableModel = Runnable<BaseMessage[], AIMessageChunk>;

const REFUSAL = "I can't help with that, but I'm happy to assist with your question.";

const PRIMARY_MODEL = "claude-sonnet-4-20250514";
const FALLBACK_MODEL = "claude-sonnet-4-5-20250929";

const DEFAULT_MAX_ITERATIONS = 5;
const DEFAULT_ITERATION_TIMEOUT_MS = 120_000;
const DEFAULT_MAX_RETRIES = 3;
const RETRY_DELAY_MS = 2_000;

function isOverloadedError(err: unknown): boolean {
  const msg = err instanceof Error ? err.message : String(err);
  return msg.includes("overloaded") || msg.includes("529") || msg.includes("Overloaded");
}

export interface StreamWriter {
  enqueue(data: Uint8Array): void;
  close(): void;
}

export type RawMessage = { role: "user" | "assistant"; content: string };

export interface AgentRunParams {
  messages: RawMessage[];
  systemPrompt: string;
  [key: string]: unknown;
}

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

export abstract class BaseAgentNode<TParams extends AgentRunParams = AgentRunParams> {
  protected readonly nodeName: string;
  protected streamWriter: StreamWriter | null = null;
  protected collectedArtifacts: Artifact[] = [];
  protected fullResponse = "";
  protected lcMessages: BaseMessage[] = [];

  constructor(nodeName: string) {
    this.nodeName = nodeName;
  }

  protected log(message: string, ...args: unknown[]) {
    toolLog(this.nodeName, message, ...args);
  }

  protected logError(message: string, ...args: unknown[]) {
    toolLog(this.nodeName, `ERROR: ${message}`, ...args);
  }

  protected emit(event: StreamEvent) {
    if (!this.streamWriter) return;
    this.streamWriter.enqueue(encodeEvent(event));
  }

  protected emitText(text: string) {
    this.fullResponse += text;
    this.emit({ type: "text", content: text });
  }

  protected emitStatus(message: string) {
    this.emit({ type: "status", message });
  }

  protected emitArtifact(artifact: Artifact) {
    this.collectedArtifacts.push(artifact);
    this.emit({ type: "artifact", artifact });
  }

  protected emitError(message: string) {
    this.emit({ type: "error", message });
  }

  protected createModel(config?: {
    maxTokens?: number;
    model?: string;
  }): ChatAnthropic {
    return new ChatAnthropic({
      model: config?.model ?? PRIMARY_MODEL,
      maxTokens: config?.maxTokens ?? 16384,
      anthropicApiKey: process.env.ANTHROPIC_API_KEY,
    });
  }

  private static toLangChainMessages(msgs: RawMessage[]): BaseMessage[] {
    return msgs.map((m) =>
      m.role === "user"
        ? new HumanMessage(m.content)
        : new AIMessage(m.content),
    );
  }

  protected checkGuardrail(): boolean {
    const last = this.lcMessages[this.lcMessages.length - 1];
    if (!(last instanceof HumanMessage)) return false;

    const content =
      typeof last.content === "string"
        ? last.content
        : JSON.stringify(last.content);

    const result = checkInjection(content);
    if (result.blocked) {
      this.log("Guardrail blocked:", result.reason);
      this.emitText(REFUSAL);
      return true;
    }
    return false;
  }

  /**
   * Invoke the model with retry logic. Returns the full AIMessage (not chunked).
   * Falls back to a secondary model on overloaded errors.
   */
  private async invokeWithRetry(
    model: StreamableModel,
    messages: BaseMessage[],
    fallbackModel?: StreamableModel,
  ): Promise<AIMessage> {
    let lastError: unknown;
    let activeModel = model;

    for (let attempt = 1; attempt <= DEFAULT_MAX_RETRIES; attempt++) {
      try {
        this.log(`Invoking model (attempt ${attempt}/${DEFAULT_MAX_RETRIES})`);
        const response = await activeModel.invoke(messages);
        return response as AIMessage;
      } catch (err) {
        lastError = err;
        const msg = err instanceof Error ? err.message : String(err);
        this.logError(`Invoke failed (attempt ${attempt}):`, msg);

        if (isOverloadedError(err) && fallbackModel && activeModel !== fallbackModel) {
          this.log(`Primary model overloaded, switching to fallback (${FALLBACK_MODEL})`);
          this.emitStatus("Switching to backup model...");
          activeModel = fallbackModel;
        }

        if (attempt < DEFAULT_MAX_RETRIES) {
          await sleep(RETRY_DELAY_MS);
        }
      }
    }

    throw lastError;
  }

  /**
   * Stream model response with retry. Accumulates chunks and returns full AIMessage.
   * Streams text tokens to the client in real time.
   * Falls back to a secondary model on overloaded errors.
   */
  private async streamWithRetry(
    model: StreamableModel,
    messages: BaseMessage[],
    fallbackModel?: StreamableModel,
  ): Promise<AIMessage> {
    let lastError: unknown;
    let activeModel = model;

    for (let attempt = 1; attempt <= DEFAULT_MAX_RETRIES; attempt++) {
      try {
        this.log(`Streaming model (attempt ${attempt}/${DEFAULT_MAX_RETRIES})`);
        const stream = await activeModel.stream(messages);
        let aggregated: AIMessageChunk | undefined;

        for await (const chunk of stream) {
          aggregated = aggregated ? concat(aggregated, chunk) : chunk;

          const hasToolCalls =
            (chunk.tool_calls && chunk.tool_calls.length > 0) ||
            (chunk.tool_call_chunks && chunk.tool_call_chunks.length > 0);

          if (!hasToolCalls) {
            let text = "";
            if (typeof chunk.content === "string") {
              text = chunk.content;
            } else if (Array.isArray(chunk.content)) {
              for (const block of chunk.content) {
                if (
                  typeof block === "object" &&
                  block.type === "text" &&
                  "text" in block
                )
                  text += block.text;
              }
            }
            if (text) {
              this.emitText(text);
            }
          }
        }

        if (!aggregated) {
          throw new Error("Empty stream response");
        }

        return new AIMessage({
          content: aggregated.content,
          tool_calls: aggregated.tool_calls,
          response_metadata: aggregated.response_metadata,
        });
      } catch (err) {
        lastError = err;
        const msg = err instanceof Error ? err.message : String(err);
        this.logError(`Stream failed (attempt ${attempt}):`, msg);

        if (isOverloadedError(err) && fallbackModel && activeModel !== fallbackModel) {
          this.log(`Primary model overloaded, switching to fallback (${FALLBACK_MODEL})`);
          this.emitStatus("Switching to backup model...");
          activeModel = fallbackModel;
        }

        if (attempt < DEFAULT_MAX_RETRIES) {
          await sleep(RETRY_DELAY_MS);
        }
      }
    }

    throw lastError;
  }

  /**
   * Core tool loop. Streams text to client, executes tool calls manually,
   * loops until the model responds without tool calls or hits max iterations.
   */
  protected async streamWithToolLoop(
    systemPrompt: string,
    messages: BaseMessage[],
    tools: StructuredToolInterface[],
    options?: {
      maxIterations?: number;
      iterationTimeoutMs?: number;
    },
  ): Promise<void> {
    const maxIterations = options?.maxIterations ?? DEFAULT_MAX_ITERATIONS;
    const iterationTimeoutMs =
      options?.iterationTimeoutMs ?? DEFAULT_ITERATION_TIMEOUT_MS;

    const model = this.createModel();
    const boundModel: StreamableModel =
      tools.length > 0 ? model.bindTools(tools) : model;

    const fallback = this.createModel({ model: FALLBACK_MODEL });
    const boundFallback: StreamableModel =
      tools.length > 0 ? fallback.bindTools(tools) : fallback;

    const toolMap = new Map<string, StructuredToolInterface>();
    for (const tool of tools) {
      toolMap.set(tool.name, tool);
    }

    const conversationMessages: BaseMessage[] = [
      new SystemMessage(systemPrompt),
      ...messages,
    ];

    for (let iteration = 1; iteration <= maxIterations; iteration++) {
      this.log(`Tool loop iteration ${iteration}/${maxIterations}`);

      const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(
          () => reject(new Error(`Iteration timed out after ${iterationTimeoutMs / 1000}s`)),
          iterationTimeoutMs,
        ),
      );

      let response: AIMessage;
      try {
        response = await Promise.race([
          this.streamWithRetry(boundModel, conversationMessages, boundFallback),
          timeoutPromise,
        ]);
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        this.logError("Stream/timeout error:", msg);
        this.emitError(msg);
        return;
      }

      const toolCalls = response.tool_calls ?? [];

      if (toolCalls.length === 0) {
        this.log("No tool calls, stream complete");
        return;
      }

      this.log(
        `Agent requested ${toolCalls.length} tool call(s):`,
        toolCalls.map((tc) => tc.name).join(", "),
      );

      if (toolCalls.some((tc) => tc.name === "generatePdf")) {
        this.emitStatus("Generating document...");
      }

      conversationMessages.push(response);

      for (const toolCall of toolCalls) {
        const tool = toolMap.get(toolCall.name);
        if (!tool) {
          this.logError(`Unknown tool: ${toolCall.name}`);
          conversationMessages.push(
            new ToolMessage({
              content: `Error: tool "${toolCall.name}" does not exist.`,
              tool_call_id: toolCall.id!,
            }),
          );
          continue;
        }

        this.log(`Executing tool: ${toolCall.name}`);
        try {
          const result = await tool.invoke(toolCall.args);
          const resultStr = typeof result === "string" ? result : JSON.stringify(result);
          this.log(`Tool result preview:`, resultStr.slice(0, 300));

          try {
            const parsed = JSON.parse(resultStr);
            if (parsed.artifact) {
              this.log("Artifact detected:", parsed.artifact.id);
              this.emitArtifact(parsed.artifact);
            }
            if (parsed.error) {
              this.log("Tool returned error:", parsed.error);
            }
          } catch {
            // not JSON, that's fine
          }

          conversationMessages.push(
            new ToolMessage({
              content: resultStr,
              tool_call_id: toolCall.id!,
            }),
          );
        } catch (err) {
          const msg = err instanceof Error ? err.message : String(err);
          this.logError(`Tool execution failed:`, msg);
          conversationMessages.push(
            new ToolMessage({
              content: JSON.stringify({ error: msg }),
              tool_call_id: toolCall.id!,
            }),
          );
        }
      }
    }

    this.logError(`Reached max iterations (${maxIterations})`);
    this.emitError("The agent could not complete the task within the allowed number of steps.");
  }

  /**
   * Creates a ReadableStream that runs the agent and streams NDJSON events.
   * Subclasses implement runAgent() with their specific logic.
   */
  public run(params: TParams): ReadableStream {
    const node = this;

    return new ReadableStream({
      async start(controller) {
        let closed = false;

        const writer: StreamWriter = {
          enqueue(data: Uint8Array) {
            if (closed) return;
            try {
              controller.enqueue(data);
            } catch {
              closed = true;
            }
          },
          close() {
            if (closed) return;
            try {
              controller.close();
            } catch {
              // already closed
            }
            closed = true;
          },
        };

        node.streamWriter = writer;
        node.collectedArtifacts = [];
        node.fullResponse = "";
        node.lcMessages = BaseAgentNode.toLangChainMessages(params.messages);

        try {
          await node.runAgent(params);
        } catch (err) {
          const msg = err instanceof Error ? err.message : "Unknown error";
          node.logError("Unhandled error in runAgent:", msg);
          node.emitError(msg);
        } finally {
          writer.close();
        }
      },
    });
  }

  protected abstract runAgent(params: TParams): Promise<void>;
}
