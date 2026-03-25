import { AIMessage, HumanMessage } from "@langchain/core/messages";
import type { AgentStateType } from "../state";
import { checkInjection } from "./injection-patterns";

const REFUSAL =
  "I can't help with that, but I'm happy to assist with your sales question.";

export function inputGuardrailNode(
  state: AgentStateType
): Partial<AgentStateType> {
  const lastMessage = state.messages[state.messages.length - 1];

  if (!(lastMessage instanceof HumanMessage)) {
    return { blocked: false, blockReason: "" };
  }

  const content =
    typeof lastMessage.content === "string"
      ? lastMessage.content
      : JSON.stringify(lastMessage.content);

  const result = checkInjection(content);

  if (result.blocked) {
    return {
      blocked: true,
      blockReason: result.reason,
      messages: [new AIMessage(REFUSAL)],
    };
  }

  return { blocked: false, blockReason: "" };
}
