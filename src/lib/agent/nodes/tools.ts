import { ToolNode } from "@langchain/langgraph/prebuilt";
import type { StructuredToolInterface } from "@langchain/core/tools";
import { generatePdfTool } from "../tools/generate-pdf";

export type AgentType = "mentor" | "onboarding";

const MENTOR_TOOLS: StructuredToolInterface[] = [generatePdfTool];
const ONBOARDING_TOOLS: StructuredToolInterface[] = [];

const TOOL_REGISTRY: Record<AgentType, StructuredToolInterface[]> = {
  mentor: MENTOR_TOOLS,
  onboarding: ONBOARDING_TOOLS,
};

export function getToolsForAgent(agentType: AgentType): StructuredToolInterface[] {
  return TOOL_REGISTRY[agentType];
}

const ALL_TOOLS: StructuredToolInterface[] = [
  ...MENTOR_TOOLS,
  ...ONBOARDING_TOOLS,
];

export const toolNode = new ToolNode(ALL_TOOLS);
