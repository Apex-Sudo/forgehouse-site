import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(req: Request) {
  try {
    const { slug, messages } = await req.json();

    if (!slug || !messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }

    // Persist to Supabase (upsert on slug + type)
    const { error: dbError } = await supabase
      .from("fh_sessions")
      .upsert(
        {
          slug,
          type: "extraction",
          messages,
          exchange_count: messages.filter((m: { role: string }) => m.role === "user").length,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "slug,type" }
      );

    if (dbError) {
      console.error("[contribute-save] Supabase error:", dbError);
    }

    // Telegram backup (best-effort)
    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;

    if (botToken && chatId) {
      const userCount = messages.filter((m: { role: string }) => m.role === "user").length;
      const ts = new Date().toISOString().slice(0, 19).replace("T", " ");

      const doc = messages
        .map((m: { role: string; content: string }) => `[${m.role.toUpperCase()}]\n${m.content}`)
        .join("\n\n---\n\n");

      const header = `ForgeHouse Extraction - ${slug}\nSaved: ${ts}\nExchanges: ${userCount}\n${"=".repeat(40)}\n\n`;
      const fullDoc = header + doc;

      const blob = new Blob([fullDoc], { type: "text/plain" });
      const formData = new FormData();
      formData.append("chat_id", chatId);
      formData.append("document", blob, `extraction-${slug}-${ts.slice(0, 10)}.txt`);
      formData.append("caption", `📝 Extraction backup: ${slug} (${userCount} exchanges)`);

      await fetch(`https://api.telegram.org/bot${botToken}/sendDocument`, {
        method: "POST",
        body: formData,
      }).catch((e) => console.error("[contribute-save] Telegram error:", e));
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[contribute-save]", err);
    return NextResponse.json({ error: "Save failed" }, { status: 500 });
  }
}
