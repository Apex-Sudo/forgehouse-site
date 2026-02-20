import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { email, name } = await req.json();

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;

    if (botToken && chatId) {
      const text = `🔔 *New ForgeHouse Waitlist Signup*\n\n*Email:* ${email.replace(/[_*[\]()~`>#+\-=|{}.!]/g, "\\$&")}${name ? `\n*Name:* ${name.replace(/[_*[\]()~`>#+\-=|{}.!]/g, "\\$&")}` : ""}\n\n_${new Date().toISOString()}_`;

      await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: chatId,
          text,
          parse_mode: "Markdown",
        }),
      }).catch((err) => console.error("[waitlist-telegram-error]", err));
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
