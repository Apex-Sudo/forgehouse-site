import { ChatAnthropic } from "@langchain/anthropic";
import { SystemMessage } from "@langchain/core/messages";
import type { AgentStateType } from "../state";
import { getToolsForAgent } from "./tools";

const model = new ChatAnthropic({
  model: "claude-sonnet-4-20250514",
  maxTokens: 1024,
  anthropicApiKey: process.env.ANTHROPIC_API_KEY,
});

export async function agentNode(
  state: AgentStateType
): Promise<Partial<AgentStateType>> {
  const tools = getToolsForAgent(state.agentType);
  const boundModel = tools.length > 0 ? model.bindTools(tools) : model;

  const response = await boundModel.invoke([
    new SystemMessage(state.systemPrompt),
    ...state.messages,
  ]);

  return { messages: [response] };
}
