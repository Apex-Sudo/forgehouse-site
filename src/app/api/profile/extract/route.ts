import Anthropic from "@anthropic-ai/sdk";
import { auth } from "@/lib/auth";
import { supabase } from "@/lib/supabase";

export async function POST(req: Request) {
  try {
    const session = await auth();
    const user = session?.user as { id?: string } | undefined;
    if (!user?.id) {
      return Response.json({ error: "Sign in required." }, { status: 401 });
    }

    const { transcript } = await req.json();
    if (!transcript?.length) {
      return Response.json({ error: "No transcript provided" }, { status: 400 });
    }

    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

    const conversationText = transcript
      .map((m: { role: string; content: string }) => `${m.role}: ${m.content}`)
      .join("\n");

    const response = await client.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1024,
      system: `Extract structured business profile data from this onboarding conversation. Return ONLY valid JSON with these exact keys: company_description, target_audience, company_stage, team_size, revenue_range, biggest_challenge, sales_process. Each value should be a concise string (1-3 sentences max). If a field wasn't discussed, use null.`,
      messages: [{ role: "user", content: conversationText }],
    });

    const text = response.content[0].type === "text" ? response.content[0].text : "";
    // Extract JSON from response (handle markdown code blocks)
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return Response.json({ error: "Failed to extract profile" }, { status: 500 });
    }

    const profile = JSON.parse(jsonMatch[0]);

    // Upsert to user_profiles
    const { error } = await supabase
      .from("user_profiles")
      .upsert(
        {
          user_id: user.id,
          company_description: profile.company_description,
          target_audience: profile.target_audience,
          company_stage: profile.company_stage,
          team_size: profile.team_size,
          revenue_range: profile.revenue_range,
          biggest_challenge: profile.biggest_challenge,
          sales_process: profile.sales_process,
          raw_transcript: transcript,
          profile_complete: true,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "user_id" }
      );

    if (error) {
      console.error("Profile upsert error:", error);
      return Response.json({ error: "Failed to save profile" }, { status: 500 });
    }

    return Response.json({ profile, saved: true });
  } catch (err) {
    console.error("Profile extract error:", err);
    return Response.json({ error: "Internal error" }, { status: 500 });
  }
}
