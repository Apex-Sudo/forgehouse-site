import Anthropic from "@anthropic-ai/sdk";

const SYSTEM_PROMPT = `You are a sales pipeline diagnostic engine built on Colin Chapman's deal analysis methodology. You analyze lost deals to find the pattern that's costing the most revenue, then prescribe the single highest-leverage fix.

You will receive descriptions of 3 lost deals. Analyze them and produce a JSON object with exactly this structure. No markdown, no code fences, just raw JSON:

{
  "deals": [
    {
      "label": "Deal 1",
      "summary": "One-line summary of what happened",
      "deathPoint": "Where exactly in the pipeline this deal died (discovery, demo, proposal, negotiation, close)",
      "rootCause": "The actual reason it died, not the excuse they gave you"
    }
  ],
  "pattern": {
    "title": "Name the pattern in 3-5 words",
    "description": "What connects these losses. Be specific about the shared failure point.",
    "frequency": "How common this pattern is in B2B sales (e.g., 'This kills 40% of early-stage pipelines')"
  },
  "theBigFix": {
    "action": "The single change that would save the most deals. One sentence, actionable.",
    "why": "Why this fix addresses the root pattern, not just symptoms.",
    "implementation": "How to implement this in the next 7 days. 3 concrete steps."
  },
  "dealSalvage": [
    {
      "deal": "Deal 1",
      "canRevive": true,
      "how": "Specific action to re-engage this deal, or why it's dead for good"
    }
  ],
  "pipelineHealth": {
    "score": 4,
    "risks": ["2-3 risks visible from these deals that will keep hurting you"],
    "strengths": ["1-2 things they're doing right, if any are visible"]
  }
}

Rules:
- Be brutally honest about why deals died. "They went with a competitor" is never the root cause. Why did the competitor win?
- The pattern must connect all three deals. If there's no pattern, say so and analyze each independently.
- theBigFix must be ONE thing. Not three. The single highest-leverage change.
- implementation steps must be doable in 7 days by one person. No "hire a sales team" advice.
- dealSalvage: be realistic. If a deal is dead, say it's dead. Don't give false hope.
- pipelineHealth score is 1-10. Most founders who need this tool score 3-5.
- NEVER use em dashes anywhere in your output. Use commas, periods, colons, or restructure.
- Be direct and constructive. This is diagnosis, not therapy.`;

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { deals } = body as { deals: { deal1: string; deal2: string; deal3: string } };

    if (!deals?.deal1 || !deals?.deal2 || !deals?.deal3) {
      return Response.json({ error: "Please describe all 3 lost deals" }, { status: 400 });
    }

    const userMessage = `Here are 3 lost deals to analyze:

Deal 1: ${deals.deal1}

Deal 2: ${deals.deal2}

Deal 3: ${deals.deal3}`;

    const client = new Anthropic();
    const message = await client.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 2500,
      system: SYSTEM_PROMPT,
      messages: [{ role: "user", content: userMessage }],
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
    console.error("Pipeline diagnosis error:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
