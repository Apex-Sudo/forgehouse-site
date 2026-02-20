import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { slug, messages } = await req.json();

    if (!slug || !messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }

    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;

    if (!botToken || !chatId) {
      console.error("[contribute-save] Missing Telegram credentials");
      return NextResponse.json({ error: "Server config error" }, { status: 500 });
    }

    const userCount = messages.filter((m: { role: string }) => m.role === "user").length;
    const ts = new Date().toISOString().slice(0, 19).replace("T", " ");

    // Format as readable text document
    const doc = messages
      .map((m: { role: string; content: string }) => `[${m.role.toUpperCase()}]\n${m.content}`)
      .join("\n\n---\n\n");

    const header = `ForgeHouse Extraction - ${slug}\nSaved: ${ts}\nExchanges: ${userCount}\n${"=".repeat(40)}\n\n`;
    const fullDoc = header + doc;

    // Send as document via Telegram
    const blob = new Blob([fullDoc], { type: "text/plain" });
    const formData = new FormData();
    formData.append("chat_id", chatId);
    formData.append("document", blob, `extraction-${slug}-${ts.slice(0, 10)}.txt`);
    formData.append("caption", `📝 Extraction backup: ${slug} (${userCount} exchanges)`);

    await fetch(`https://api.telegram.org/bot${botToken}/sendDocument`, {
      method: "POST",
      body: formData,
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[contribute-save]", err);
    return NextResponse.json({ error: "Save failed" }, { status: 500 });
  }
}
