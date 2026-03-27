import Anthropic from "@anthropic-ai/sdk";
import { auth } from "@/lib/auth";
import { supabase } from "@/lib/supabase";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const mentor = searchParams.get("mentor") || "colin-chapman";

  const { data: mentorRow } = await supabase
    .from("mentors")
    .select("default_starters, starters_hint, name")
    .eq("slug", mentor)
    .eq("active", true)
    .single();

  const defaultStarters: string[] = mentorRow?.default_starters ?? [
    "What should I focus on first?",
    "Help me think through my current situation",
    "What questions should I be asking myself?",
    "I have a specific problem I need help with",
  ];

  const session = await auth();
  const user = session?.user as { id?: string } | undefined;

  if (!user?.id) {
    return Response.json({ starters: defaultStarters });
  }

  try {
    const { data: profile } = await supabase
      .from("user_profiles")
      .select("*")
      .eq("user_id", user.id)
      .eq("profile_complete", true)
      .single();

    if (!profile) {
      return Response.json({ starters: defaultStarters });
    }

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

    const hint = mentorRow?.starters_hint ?? `a mentor named ${mentorRow?.name ?? mentor}`;

    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

    const response = await client.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 300,
      system: `Generate 4 conversation starter questions for a user talking to ${hint}. Each starter should be specific to the user's business and current challenges. Make them actionable and varied. Do NOT repeat topics from their recent conversations. Output ONLY a JSON array of 4 strings, nothing else.`,
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

  return Response.json({ starters: defaultStarters });
}
