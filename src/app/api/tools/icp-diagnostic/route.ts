import Anthropic from "@anthropic-ai/sdk";
import { toolLimiter } from "@/lib/rate-limit";

const SYSTEM_PROMPT = `You are an ICP (Ideal Customer Profile) diagnostic engine built on the Jobs-to-be-Done framework. You analyze a founder's product and customer data to produce a precise, actionable ICP definition.

You will receive 5 answers from a guided questionnaire, along with whether the user has existing customers ("experienced") or is pre-revenue ("pre-revenue").

Produce a JSON object with exactly this structure. No markdown, no code fences, just raw JSON:

{
  "icpProfile": {
    "industry": "specific industry or vertical",
    "companySize": "employee range and/or revenue range",
    "buyerRole": "specific title(s) who make or influence the purchase decision",
    "techStackSignals": ["3-4 technologies or tools that indicate fit"],
    "budgetIndicators": ["2-3 signals that they can afford this"]
  },
  "jtbdMap": {
    "functionalJob": "the core task they need done — be specific to their product",
    "socialJob": "how buying/using this makes them look to peers, boss, team",
    "emotionalJob": "how it makes them feel — relief, confidence, control"
  },
  "disqualificationCriteria": [
    "type 1: specific description of who to avoid and why",
    "type 2: specific description",
    "type 3: specific description",
    "type 4: specific description"
  ],
  "whereToFind": {
    "linkedinSearchStrings": ["2-3 actual LinkedIn search queries they can paste"],
    "communities": ["2-3 specific communities, forums, or Slack groups"],
    "events": ["1-2 relevant conferences or meetups"],
    "keywords": ["3-4 search terms these buyers use when looking for solutions"]
  },
  "openingMessage": "A single cold outreach opening line that references the functional job and speaks to the emotional job. Under 30 words."
}

Rules:
- Be extremely specific. "SaaS companies" is too vague. "B2B SaaS companies with 20-100 employees selling to mid-market, post-Series A" is right.
- The JTBD map must connect directly to what the user told you about their product and customers.
- Disqualification criteria should save them real time. Describe the prospects that look good but waste cycles.
- LinkedIn search strings should be copy-pasteable.
- The opening message should NOT sound like a template. It should feel like someone who understands their problem.
- For pre-revenue users, base everything on their hypotheses but keep it grounded.
- NEVER use em dashes (—) anywhere in your output. Use commas, periods, colons, or restructure the sentence instead.`;

export async function POST(req: Request) {
  try {
    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      req.headers.get("x-real-ip") ||
      "unknown";

    const { success } = await toolLimiter().limit(ip);
    if (!success) {
      return Response.json({ error: "Rate limit exceeded. Try again later." }, { status: 429 });
    }

    const body = await req.json();
    const { answers, path } = body as {
      answers: {
        q1: string;
        q2: string;
        q3: string;
        q4: string;
        q5: string;
      };
      path: "experienced" | "pre-revenue";
    };

    if (!answers?.q1 || !answers?.q3 || !answers?.q4 || !answers?.q5) {
      return Response.json({ error: "Missing answers" }, { status: 400 });
    }

    const userMessage = path === "experienced"
      ? `Product: ${answers.q1}
Has existing customers: Yes
Best customers: ${answers.q3}
Problem they were solving: ${answers.q4}
Why they chose this over alternatives: ${answers.q5}`
      : `Product: ${answers.q1}
Has existing customers: Not yet (pre-revenue)
Who they think needs this most: ${answers.q3}
Painful alternative prospects use today: ${answers.q4}
Why prospects would switch: ${answers.q5}`;

    const client = new Anthropic();
    const message = await client.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 2000,
      system: SYSTEM_PROMPT,
      messages: [{ role: "user", content: userMessage }],
    });

    const content = message.content[0];
    if (content.type !== "text") {
      return Response.json({ error: "Unexpected response" }, { status: 500 });
    }

    try {
      const parsed = JSON.parse(content.text);
      return Response.json({ result: parsed, path });
    } catch {
      return Response.json({ error: "Failed to parse AI response", raw: content.text }, { status: 500 });
    }
  } catch (error) {
    console.error("ICP diagnostic error:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
