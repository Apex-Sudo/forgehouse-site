import { END, START, StateGraph } from "@langchain/langgraph";
import { toolsCondition } from "@langchain/langgraph/prebuilt";
import { AgentState } from "./state";
import { inputGuardrailNode } from "./nodes/input-guardrail";
import { agentNode } from "./nodes/agent";
import { toolNode } from "./nodes/tools";

function routeAfterGuardrail(
  state: typeof AgentState.State
): typeof END | "agent" {
  if (state.blocked) return END;
  return "agent";
}

function routeAfterAgent(
  state: typeof AgentState.State
): typeof END | "tools" {
  return toolsCondition(state);
}

const workflow = new StateGraph(AgentState)
  .addNode("inputGuardrail", inputGuardrailNode)
  .addNode("agent", agentNode)
  .addNode("tools", toolNode)
  .addEdge(START, "inputGuardrail")
  .addConditionalEdges("inputGuardrail", routeAfterGuardrail, [
    "agent",
    END,
  ])
  .addConditionalEdges("agent", routeAfterAgent, ["tools", END])
  .addEdge("tools", "agent");

export const agentGraph = workflow.compile();
