import { BaseAgentNode, type AgentRunParams } from "./BaseAgentNode";
import { supabase } from "@/lib/supabase";

export interface CalibrationRunParams extends AgentRunParams {
  mentorSlug?: string;
}

export class CalibrationAgentNode extends BaseAgentNode<CalibrationRunParams> {
  constructor() {
    super("CalibrationAgent");
  }

  protected async runAgent(params: CalibrationRunParams): Promise<void> {
    if (this.checkGuardrail()) return;
    await this.streamWithToolLoop(params.systemPrompt, this.lcMessages, []);

    const { mentorSlug, messages } = params;
    if (mentorSlug && this.fullResponse.length > 0) {
      try {
        const allMessages = [
          ...messages,
          { role: "assistant" as const, content: this.fullResponse },
        ];
        const exchangeCount = allMessages.filter((m) => m.role === "user").length;

        const { error } = await supabase
          .from("fh_sessions")
          .upsert(
            {
              slug: mentorSlug,
              type: "calibration",
              messages: allMessages,
              exchange_count: exchangeCount,
              updated_at: new Date().toISOString(),
            },
            { onConflict: "slug,type" },
          );

        if (error) {
          this.logError("Supabase upsert error:", error.message);
        }
      } catch (err) {
        this.logError(
          "Failed to save calibration session:",
          err instanceof Error ? err.message : String(err),
        );
      }
    }
  }
}
