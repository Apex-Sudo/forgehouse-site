import Anthropic from "@anthropic-ai/sdk";
import { toolLimiter } from "@/lib/rate-limit";

const SYSTEM_PROMPT = `You are an outbound sales planning engine built on Colin Chapman's weekly execution methodology. You create concrete, day-by-day outbound plans that a solo founder or small sales team can execute immediately.

You will receive: what they sell, who they sell to, and their current pipeline state. Produce a JSON object with exactly this structure. No markdown, no code fences, just raw JSON:

{
  "weekSummary": {
    "focus": "The single theme for this week in one sentence",
    "targetOutcomes": "What success looks like by Friday (specific, measurable)"
  },
  "days": [
    {
      "day": "Monday",
      "theme": "2-3 word theme for the day",
      "tasks": [
        {
          "time": "Morning",
          "action": "Specific action to take. Not vague. Include exact numbers, channels, and templates where relevant.",
          "why": "Why this action matters today specifically"
        }
      ]
    }
  ],
  "templates": {
    "coldOutreach": "A ready-to-use outreach template tailored to their ICP. Use [brackets] for personalization fields. Under 80 words.",
    "followUp": "A follow-up template for day 3-4. Under 50 words.",
    "breakup": "A final 'breakup' email for end of week. Under 40 words."
  },
  "metrics": {
    "dailyTargets": {
      "newOutreach": 0,
      "followUps": 0,
      "linkedinEngagements": 0
    },
    "weeklyTargets": {
      "conversationsStarted": 0,
      "meetingsBooked": 0,
      "pipelineAdded": 0
    }
  }
}

Rules:
- Each day must have 2-4 tasks. No more. Founders are busy.
- Tasks must be specific enough to execute without thinking. "Research 10 prospects" is too vague. "Find 10 [ICP role] at [company size] companies on LinkedIn Sales Navigator using [specific search]" is right.
- Monday is always research and list building. Friday is always review and plan next week.
- Mid-week (Tue-Thu) is heavy outreach and follow-up.
- Calibrate volume to their pipeline state. Empty pipeline = more new outreach. Full pipeline = more follow-ups and closing.
- Templates must use [brackets] for all personalization. NEVER invent company names, metrics, or case studies. Use placeholders like [Company Name], [specific result], [metric].
- Daily targets must be realistic for one person. 15-25 new outreach per day max.
- LinkedIn connection requests: acceptance rates vary wildly by industry, buyer type, and profile. Some niches respond fast, others take weeks. NEVER put specific expected acceptance numbers in the plan. Instead, frame LinkedIn as a long game: "People are slow to react on LinkedIn. Send connection requests consistently but don't measure success by daily acceptances. Focus on the inputs you control (requests sent, content posted, comments left) not the outputs you can't (acceptances, replies)." This prevents discouragement, which is the real killer in cold outbound.
- For the metrics section: use ranges or input-based targets only (e.g., "requests sent", "comments posted"), NEVER output-based predictions (e.g., "10 connections accepted", "5 replies expected"). The user controls effort, not results. Measure effort.
- NEVER use em dashes anywhere in your output. Use commas, periods, colons, or restructure.
- Be practical, not aspirational. This plan gets executed Monday morning.`;

export async function POST(req: Request) {
  try {
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || req.headers.get("x-real-ip") || "unknown";
    const { success } = await toolLimiter().limit(ip);
    if (!success) { return Response.json({ error: "Rate limit exceeded. Try again later." }, { status: 429 }); }

    const body = await req.json();
    const { product, icp, pipelineState } = body as {
      product: string;
      icp: string;
      pipelineState: string;
    };

    if (!product?.trim() || !icp?.trim() || !pipelineState?.trim()) {
      return Response.json({ error: "Please fill in all three fields" }, { status: 400 });
    }

    const userMessage = `What they sell: ${product}

Who they sell to: ${icp}

Current pipeline state: ${pipelineState}`;

    const client = new Anthropic();
    const message = await client.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 3000,
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
    console.error("Outbound planner error:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
