import { NextResponse, after } from "next/server";
import { Resend } from "resend";
import { generateCode, storeCode, checkRateLimit, getExistingCode } from "@/lib/verification";
import { captureServerEvent } from "@/lib/posthog";

const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

export async function POST(req: Request) {
  try {
    const { email } = await req.json();
    if (!email || typeof email !== "string") {
      return NextResponse.json({ error: "Email required" }, { status: 400 });
    }

    const emailLower = email.toLowerCase().trim();

    after(async () => {
      await captureServerEvent(emailLower, "signup_started", {
        method: "email_code",
      });
    });

    // Rate limit
    const allowed = await checkRateLimit(emailLower);
    if (!allowed) {
      return NextResponse.json(
        { error: "Please wait before requesting another code" },
        { status: 429 }
      );
    }

    if (!resend) {
      console.error("RESEND_API_KEY not configured");
      return NextResponse.json(
        { error: "Email service not configured" },
        { status: 500 }
      );
    }

    // Reuse existing valid code instead of overwriting
    const existing = await getExistingCode(emailLower);
    if (existing) {
      return NextResponse.json({ success: true, reused: true });
    }

    const code = generateCode();
    await storeCode(emailLower, code);

    await resend.emails.send({
      from: "ForgeHouse <onboarding@resend.dev>",
      to: emailLower,
      subject: "Your ForgeHouse verification code",
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 400px; margin: 0 auto; padding: 40px 20px;">
          <h2 style="color: #18181b; font-size: 20px; margin-bottom: 8px;">Your verification code</h2>
          <p style="color: #71717a; font-size: 14px; margin-bottom: 24px;">Enter this code to sign in to ForgeHouse:</p>
          <div style="background: #f4f4f5; border-radius: 12px; padding: 20px; text-align: center; margin-bottom: 24px;">
            <span style="font-size: 32px; font-weight: 700; letter-spacing: 8px; color: #18181b;">${code}</span>
          </div>
          <p style="color: #a1a1aa; font-size: 12px;">This code expires in 10 minutes. If you didn't request this, you can ignore this email.</p>
        </div>
      `,
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("send-code error:", err);
    return NextResponse.json({ error: "Failed to send code" }, { status: 500 });
  }
}
