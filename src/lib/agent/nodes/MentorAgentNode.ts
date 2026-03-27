import { BaseAgentNode, type AgentRunParams } from "./BaseAgentNode";
import { generatePdfTool } from "../tools/generate-pdf";
import { createRetrieveKnowledgeTool } from "../tools/retrieve-knowledge";
import { buildEnrichedPrompt, type ScenarioData } from "../helper/prompt-builder";
import { appendMessages } from "@/lib/conversations";
import { embedArtifacts } from "../helper/stream";

type UserProfile = {
  company_description?: string | null;
  target_audience?: string | null;
  company_stage?: string | null;
  team_size?: string | null;
  revenue_range?: string | null;
  biggest_challenge?: string | null;
  sales_process?: string | null;
};

export interface MentorRunParams extends AgentRunParams {
  mentorSlug: string;
  conversationId?: string;
  userId?: string;
  userEmail?: string;
  userName?: string;
  profile?: UserProfile | null;
  contextMessages?: { role: string; content: string }[];
  scenario?: ScenarioData | null;
  userMessageCount?: number;
  lastUserMessage: { role: "user" | "assistant"; content: string };
}

export class MentorAgentNode extends BaseAgentNode<MentorRunParams> {
  constructor() {
    super("MentorAgent");
  }

  protected async runAgent(params: MentorRunParams): Promise<void> {
    const {
      systemPrompt,
      mentorSlug,
      conversationId,
      userId,
      userEmail,
      userName,
      profile,
      contextMessages,
      scenario,
      userMessageCount,
      lastUserMessage,
    } = params;

    if (this.checkGuardrail()) return;

    const tools = [
      createRetrieveKnowledgeTool(mentorSlug),
      generatePdfTool,
    ];

    const enrichedPrompt = buildEnrichedPrompt({
      basePrompt: systemPrompt,
      userName,
      profile,
      contextMessages,
      scenario,
      userMessageCount,
    });

    await this.streamWithToolLoop(enrichedPrompt, this.lcMessages, tools);

    if (userId && userEmail && conversationId && this.fullResponse.length > 0) {
      try {
        const contentToSave = embedArtifacts(
          this.fullResponse,
          this.collectedArtifacts,
        );
        await appendMessages(conversationId, userId, userEmail, [
          lastUserMessage,
          { role: "assistant", content: contentToSave },
        ]);
        this.log(
          "Messages saved. Artifacts embedded:",
          this.collectedArtifacts.length,
        );
      } catch (err) {
        this.logError(
          "Failed to save messages:",
          err instanceof Error ? err.message : String(err),
        );
      }
    }
  }
}
