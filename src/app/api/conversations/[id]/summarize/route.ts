import Anthropic from "@anthropic-ai/sdk";
import { auth } from "@/lib/auth";
import { supabase } from "@/lib/supabase";

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  const user = session?.user as { id?: string; email?: string } | undefined;
  if (!user?.id || !user?.email) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;

    // Try conversations first, then free tier
    const { data: conv } = await supabase
      .from("conversations")
      .select("summary")
      .eq("id", id)
      .eq("user_id", user.id)
      .single();

    const { data: freeConv } = !conv
      ? await supabase
          .from("free_tier_conversations")
          .select("summary")
          .eq("id", id)
          .eq("user_id", user.id)
          .single()
      : { data: null };

    const conversation = conv || freeConv;
    if (!conversation) {
      return Response.json({ error: "Not found" }, { status: 404 });
    }

    const table = conv ? "conversations" : "free_tier_conversations";

    // Skip if already summarized
    if (conversation.summary) {
      return Response.json({ summary: conversation.summary });
    }

    // Get messages from normalized table
    const { data: messages } = await supabase
      .from("messages")
      .select("role, content")
      .eq("conversation_id", id)
      .order("created_at", { ascending: true });

    if (!messages?.length) {
      return Response.json({ error: "No messages to summarize" }, { status: 400 });
    }

    const userMessageCount = messages.filter((m) => m.role === "user").length;
    if (userMessageCount < 3) {
      return Response.json({ error: "Need at least 3 exchanges to summarize" }, { status: 400 });
    }

    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

    const transcript = messages
      .map((m) => `${m.role === "user" ? "User" : "Colin"}: ${m.content}`)
      .join("\n\n");

    const result = await client.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 300,
      system: "You summarize sales coaching conversations. Output exactly 3 bullet points, no intro text. Use plain dashes (-) not em dashes. Keep each bullet to one sentence.",
      messages: [
        {
          role: "user",
          content: `Summarize this conversation into 3 bullets:\n1. What was asked\n2. What Colin recommended\n3. Key takeaway\n\n${transcript}`,
        },
      ],
    });

    const summary =
      result.content[0].type === "text" ? result.content[0].text : "";

    // Store summary
    await supabase.from(table).update({ summary }).eq("id", id);

    return Response.json({ summary });
  } catch (err) {
    console.error("Summarize error:", err);
    return Response.json({ error: "Internal error" }, { status: 500 });
  }
}
