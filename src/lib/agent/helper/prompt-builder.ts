import { getScenario } from "@/lib/scenarios";

type UserProfile = {
  company_description?: string | null;
  target_audience?: string | null;
  company_stage?: string | null;
  team_size?: string | null;
  revenue_range?: string | null;
  biggest_challenge?: string | null;
  sales_process?: string | null;
};

type BuildPromptParams = {
  basePrompt: string;
  userName?: string;
  profile?: UserProfile | null;
  contextMessages?: { role: string; content: string }[];
  scenarioId?: string;
  userMessageCount?: number;
};

export function buildEnrichedPrompt({
  basePrompt,
  userName,
  profile,
  contextMessages,
  scenarioId,
  userMessageCount,
}: BuildPromptParams): string {
  let enriched = basePrompt;

  if (profile) {
    const name = userName ?? "Unknown";
    enriched += `\n\n--- User Profile ---
Name: ${name}
Company: ${profile.company_description ?? "Unknown"}
Target Audience: ${profile.target_audience ?? "Unknown"}
Stage: ${profile.company_stage ?? "Unknown"}
Team Size: ${profile.team_size ?? "Unknown"}
Revenue: ${profile.revenue_range ?? "Unknown"}
Biggest Challenge: ${profile.biggest_challenge ?? "Unknown"}
Sales Process: ${profile.sales_process ?? "Unknown"}
--- End Profile ---
Use the user's first name naturally in conversation. Don't overdo it.`;
  }

  if (contextMessages && contextMessages.length > 0) {
    const contextSummary = contextMessages
      .map((m) => `${m.role}: ${m.content}`)
      .join("\n");
    enriched += `\n\n--- Previous conversation context ---\n${contextSummary}\n--- End of context ---`;
  }

  if (scenarioId) {
    const scenario = getScenario(scenarioId);
    if (scenario && userMessageCount !== undefined) {
      const totalQuestions = scenario.questions.length;
      const isLastQuestion = userMessageCount >= totalQuestions;

      enriched += `\n\n--- SCENARIO MODE ---\n${scenario.systemPromptAddition}\n\nThe user is on answer ${userMessageCount} of ${totalQuestions} questions.`;

      if (isLastQuestion) {
        enriched += `\nAll questions have been answered. Deliver the structured output NOW. Do not ask more questions.`;
      } else {
        const nextQuestion = scenario.questions[userMessageCount];
        enriched += `\nAcknowledge their answer briefly, then ask this next question:\n"${nextQuestion}"\nDo NOT deliver the final structured output yet.`;
      }
    }
  }

  return enriched;
}
