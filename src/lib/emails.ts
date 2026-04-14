import { Resend } from "resend";

const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

const FROM_ADDRESS = "ForgeHouse <onboarding@resend.dev>";

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
}) {
  if (!resend) {
    console.error("RESEND_API_KEY not configured — skipping invitation email");
    return;
  }

  await resend.emails.send({
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
