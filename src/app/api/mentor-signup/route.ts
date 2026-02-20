import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { name, email, linkedin, role, expertise, whyForgeHouse, contentLink } = await req.json();

    if (!name || !email || !linkedin || !role || !expertise || !whyForgeHouse) {
      return NextResponse.json({ error: "All required fields must be filled" }, { status: 400 });
    }

    const ts = new Date().toISOString();
    console.log("[mentor-application]", { name, email, linkedin, role, expertise, whyForgeHouse, contentLink, ts });

    // Send Telegram notification
    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;

    if (botToken && chatId) {
      const text = [
        `🔧 *New ForgeHouse Mentor Application*`,
        ``,
        `*Name:* ${escapeMarkdown(name)}`,
        `*Email:* ${escapeMarkdown(email)}`,
        `*LinkedIn:* ${escapeMarkdown(linkedin)}`,
        `*Role:* ${escapeMarkdown(role)}`,
        ``,
        `*Expertise:*`,
        escapeMarkdown(expertise),
        ``,
        `*Why ForgeHouse:*`,
        escapeMarkdown(whyForgeHouse),
        contentLink ? `\n*Content Link:* ${escapeMarkdown(contentLink)}` : ``,
        ``,
        `_${ts}_`,
      ].join("\n");

      await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: chatId,
          text,
          parse_mode: "Markdown",
          disable_web_page_preview: true,
        }),
      }).catch((err) => console.error("[telegram-notify-error]", err));
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}

function escapeMarkdown(text: string): string {
  return text.replace(/[_*\[\]()~`>#+\-=|{}.!]/g, "\\$&");
}
