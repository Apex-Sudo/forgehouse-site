import Anthropic from "@anthropic-ai/sdk";

const SYSTEM_PROMPT = `You are a cold email diagnostic engine built on Colin Chapman's Problem-Impact-Proof framework. You analyze cold emails line by line, identify what's weak, and produce a rewrite.

You will receive a cold email. Analyze it and produce a JSON object with exactly this structure. No markdown, no code fences, just raw JSON:

{
  "overallScore": 3,
  "overallVerdict": "One sentence summary of the biggest problem with this email",
  "lineAnalysis": [
    {
      "original": "The exact line from their email",
      "verdict": "pass" | "weak" | "fail",
      "feedback": "What's wrong and why it kills the email. Be specific and direct."
    }
  ],
  "rewrite": {
    "subject": "Rewritten subject line",
    "body": "Full rewritten email using Problem-Impact-Proof framework. Keep it under 100 words."
  },
  "frameworkBreakdown": {
    "problem": "The specific problem statement used in the rewrite",
    "impact": "The business impact that makes them care",
    "proof": "The credibility element that makes it believable"
  }
}

Rules:
- overallScore is 1-10. Most cold emails score 2-4. Be honest.
- Break the email into logical lines (subject, greeting, each sentence or short paragraph, sign-off). Each gets its own analysis.
- verdict: "pass" = this line works. "weak" = fixable but not great. "fail" = this actively hurts the email.
- feedback must be specific. Not "this is too long" but "this is 34 words before you mention their problem. They stopped reading at word 12."
- The rewrite must follow Problem-Impact-Proof strictly: open with their problem (not your product), show the business impact of not solving it, prove you can help (case study, metric, specific result).
- The rewrite should be under 100 words. Cold emails that convert are short.
- NEVER use em dashes anywhere in your output. Use commas, periods, colons, or restructure.
- Be direct and a little blunt. This is a teardown, not encouragement. But be constructive.
- If the email is actually good, say so. Don't manufacture problems.`;

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email } = body as { email: string };

    if (!email || email.trim().length < 10) {
      return Response.json({ error: "Please paste a cold email to analyze" }, { status: 400 });
    }

    if (email.length > 5000) {
      return Response.json({ error: "Email too long. Paste just the email body." }, { status: 400 });
    }

    const client = new Anthropic();
    const message = await client.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 2000,
      system: SYSTEM_PROMPT,
      messages: [{ role: "user", content: `Here is the cold email to tear down:\n\n${email}` }],
    });

    const content = message.content[0];
    if (content.type !== "text") {
      return Response.json({ error: "Unexpected response" }, { status: 500 });
    }

    try {
      const parsed = JSON.parse(content.text);
      return Response.json({ result: parsed });
    } catch {
      return Response.json({ error: "Failed to parse AI response", raw: content.text }, { status: 500 });
    }
  } catch (error) {
    console.error("Cold email teardown error:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
