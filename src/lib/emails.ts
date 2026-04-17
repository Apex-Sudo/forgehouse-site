import { Resend } from "resend";

const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

const FROM_ADDRESS = "ForgeHouse <onboarding@forgehouse.io>";

export type SendOnboardingInvitationResult =
  | { ok: true }
  | { ok: false; error: string; httpStatus: number };

function getBaseUrl(): string {
  return process.env.NEXT_PUBLIC_BASE_URL ?? "https://forgehouse.io";
}

export async function sendOnboardingInvitation({
  to,
  mentorName,
  onboardingLink,
}: {
  to: string;
  mentorName: string;
  onboardingLink: string;
}): Promise<SendOnboardingInvitationResult> {
  // #region agent log
  fetch("http://127.0.0.1:7860/ingest/169d6f74-3402-4aca-8edc-53cea3641ed2", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Debug-Session-Id": "12fde0",
    },
    body: JSON.stringify({
      sessionId: "12fde0",
      hypothesisId: "H1",
      location: "emails.ts:sendOnboardingInvitation:entry",
      message: "invite email path entered",
      data: {
        hasResendClient: Boolean(resend),
        envKeyLength: process.env.RESEND_API_KEY?.length ?? 0,
        toLooksLikeEmail: /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(to),
      },
      timestamp: Date.now(),
    }),
  }).catch(() => {});
  // #endregion

  if (!resend) {
    console.error("RESEND_API_KEY not configured — skipping invitation email");
    // #region agent log
    fetch("http://127.0.0.1:7860/ingest/169d6f74-3402-4aca-8edc-53cea3641ed2", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Debug-Session-Id": "12fde0",
      },
      body: JSON.stringify({
        sessionId: "12fde0",
        hypothesisId: "H1",
        location: "emails.ts:sendOnboardingInvitation:skipped",
        message: "no Resend client — email not sent",
        data: {},
        timestamp: Date.now(),
      }),
    }).catch(() => {});
    // #endregion
    return {
      ok: false,
      error:
        "Email delivery is not configured (RESEND_API_KEY is missing or empty).",
      httpStatus: 503,
    };
  }

  const inviteSendResult = await resend.emails.send({
    from: FROM_ADDRESS,
    to,
    subject: `ForgeHouse — Begin your mentor onboarding`,
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 520px; margin: 0 auto; padding: 40px 20px;">
        <h2 style="color: #1A1A1A; font-size: 22px; margin-bottom: 8px;">Hi ${mentorName.split(" ")[0]},</h2>
        <p style="color: #737373; font-size: 15px; line-height: 1.6; margin-bottom: 24px;">
          You've been invited to onboard as a mentor on ForgeHouse. This process captures your expertise and builds an AI coaching agent that thinks and communicates like you.
        </p>
        <p style="color: #737373; font-size: 15px; line-height: 1.6; margin-bottom: 24px;">
          It takes about 1–2 hours, and your progress is saved automatically so you can return at any time.
        </p>
        <a href="${onboardingLink}" style="display: inline-block; background: #B8916A; color: #fff; text-decoration: none; padding: 14px 28px; border-radius: 10px; font-weight: 600; font-size: 15px; margin-bottom: 24px;">
          Start Onboarding →
        </a>
        <p style="color: #A1A1AA; font-size: 12px; margin-top: 32px;">This link expires in 7 days. If you have questions, reply to this email.</p>
      </div>
    `,
  });

  // #region agent log
  fetch("http://127.0.0.1:7860/ingest/169d6f74-3402-4aca-8edc-53cea3641ed2", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Debug-Session-Id": "12fde0",
    },
    body: JSON.stringify({
      sessionId: "12fde0",
      hypothesisId: "H2",
      location: "emails.ts:sendOnboardingInvitation:afterSend",
      message: "Resend send returned",
      data: {
        hasEmailId: Boolean(inviteSendResult.data?.id),
        resendError: inviteSendResult.error
          ? {
              name: inviteSendResult.error.name,
              message: inviteSendResult.error.message,
              statusCode: inviteSendResult.error.statusCode,
            }
          : null,
      },
      timestamp: Date.now(),
    }),
  }).catch(() => {});
  // #endregion

  if (inviteSendResult.error) {
    const sc = inviteSendResult.error.statusCode;
    let httpStatus: number;
    if (typeof sc === "number" && sc >= 400 && sc < 600) {
      httpStatus = sc;
    } else {
      httpStatus = 502;
    }
    return {
      ok: false,
      error: inviteSendResult.error.message,
      httpStatus,
    };
  }

  return { ok: true };
}

export async function sendMentorAccountReady({
  to,
  mentorName,
}: {
  to: string;
  mentorName: string;
}) {
  if (!resend) {
    console.error("RESEND_API_KEY not configured — skipping account ready email");
    return;
  }

  const signInUrl = `${getBaseUrl()}/sign-in`;

  await resend.emails.send({
    from: FROM_ADDRESS,
    to,
    subject: `ForgeHouse — Your mentor account is ready`,
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 520px; margin: 0 auto; padding: 40px 20px;">
        <h2 style="color: #1A1A1A; font-size: 22px; margin-bottom: 8px;">Hi ${mentorName.split(" ")[0]},</h2>
        <p style="color: #737373; font-size: 15px; line-height: 1.6; margin-bottom: 24px;">
          Your ForgeHouse mentor account has been created. You now have unlimited access to test your AI coaching agent and refine its responses.
        </p>
        <p style="color: #737373; font-size: 15px; line-height: 1.6; margin-bottom: 24px;">
          Sign in to chat with your agent, review its performance, and complete your profile (bio, photo, pricing).
        </p>
        <a href="${signInUrl}" style="display: inline-block; background: #B8916A; color: #fff; text-decoration: none; padding: 14px 28px; border-radius: 10px; font-weight: 600; font-size: 15px; margin-bottom: 24px;">
          Sign In to ForgeHouse →
        </a>
        <p style="color: #A1A1AA; font-size: 12px; margin-top: 32px;">If you have questions, reply to this email.</p>
      </div>
    `,
  });
}
