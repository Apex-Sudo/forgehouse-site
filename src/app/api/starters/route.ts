import Anthropic from "@anthropic-ai/sdk";
import { auth } from "@/lib/auth";
import { supabase } from "@/lib/supabase";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const mentor = searchParams.get("mentor") || "colin-chapman";

  const session = await auth();
  const user = session?.user as { id?: string } | undefined;

  if (!user?.id) {
    return Response.json({ starters: getDefaultStarters(mentor) });
  }

  try {
    // Get user profile
    const { data: profile } = await supabase
      .from("user_profiles")
      .select("*")
      .eq("user_id", user.id)
      .eq("profile_complete", true)
      .single();

    if (!profile) {
      return Response.json({ starters: getDefaultStarters(mentor) });
    }

    // Get recent conversation topics to avoid repeats
    const { data: recentConvos } = await supabase
      .from("conversations")
      .select("summary")
      .eq("user_id", user.id)
      .eq("mentor_slug", mentor)
      .order("created_at", { ascending: false })
      .limit(3);

    const recentTopics = recentConvos
      ?.filter((c) => c.summary)
      .map((c) => c.summary)
      .join("\n") || "None yet";

    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

    const response = await client.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 300,
      system: `Generate 4 conversation starter questions for a user talking to a GTM & outbound sales mentor. Each starter should be specific to the user's business and current challenges. Make them actionable and varied. Do NOT repeat topics from their recent conversations. Output ONLY a JSON array of 4 strings, nothing else.`,
      messages: [
        {
          role: "user",
          content: `User profile:
- Company: ${profile.company_description || "Unknown"}
- Target audience: ${profile.target_audience || "Unknown"}
- Stage: ${profile.company_stage || "Unknown"}
- Team size: ${profile.team_size || "Unknown"}
- Revenue: ${profile.revenue_range || "Unknown"}
- Biggest challenge: ${profile.biggest_challenge || "Unknown"}
- Sales process: ${profile.sales_process || "Unknown"}

Recent conversation topics:
${recentTopics}

Generate 4 fresh, specific conversation starters.`,
        },
      ],
    });

    const text =
      response.content[0].type === "text" ? response.content[0].text : "";

    try {
      const starters = JSON.parse(text);
      if (Array.isArray(starters) && starters.length >= 4) {
        return Response.json({ starters: starters.slice(0, 4), personalized: true });
      }
    } catch {
      // Parse failed, fall through to defaults
    }
  } catch (err) {
    console.error("Starters generation error:", err);
  }

  return Response.json({ starters: getDefaultStarters(mentor) });
}

function getDefaultStarters(mentor: string): string[] {
  if (mentor === "colin-chapman") {
    return [
      "Tear apart my last cold email",
      "Tell me who I should actually be selling to",
      "My last deal died after the first call. Diagnose it",
      "Give me a 5-day outbound plan for this week",
    ];
  }
  return [
    "I'm stuck between two GTM approaches and keep going in circles",
    "I need to set pricing but I have no idea what this is worth",
    "We have traction but I can't tell what's actually driving it",
    "One wrong decision here could cost me 6 months",
  ];
}
