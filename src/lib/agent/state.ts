import { Annotation, MessagesAnnotation } from "@langchain/langgraph";
import type { AgentType } from "./nodes/tools";

export const AgentState = Annotation.Root({
  ...MessagesAnnotation.spec,
  systemPrompt: Annotation<string>,
  agentType: Annotation<AgentType>,
  blocked: Annotation<boolean>,
  blockReason: Annotation<string>,
});

export type AgentStateType = typeof AgentState.State;
