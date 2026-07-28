"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import Wordmark from "@/components/brand/Wordmark";
import ClipButton from "@/components/ui/ClipButton";

const SECONDARY_BTN =
  "mono w-full inline-flex items-center justify-center gap-3 border border-border-light text-foreground px-6 py-3 rounded-md text-[12px] tracking-[0.02em] hover:border-accent hover:text-accent transition cursor-pointer";

const INPUT =
  "w-full rounded-md border border-border bg-background px-4 py-3 text-[16px] text-foreground placeholder:text-faint focus:border-accent/60 focus:outline-none transition";

const LABEL = "mono text-[11px] tracking-[0.06em] uppercase text-muted mb-2 block";

function SignInContent() {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/";
  const [emailValue, setEmailValue] = useState("");
  const [codeValue, setCodeValue] = useState("");
  const [codeSent, setCodeSent] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");

  return (
    <div className="sparkle-field min-h-screen flex items-center justify-center px-6 pt-28 pb-20">
      <div className="w-full max-w-[420px] mx-auto">
        <div className="flex justify-center mb-8">
          <Wordmark size={56} className="text-paper" />
        </div>

        <div className="bg-surface border border-border rounded-lg p-8">
          {/* Heading */}
          <h1 className="text-[36px] leading-[1] tracking-[-0.015em] text-paper text-center">
            Expertise on Demand
          </h1>
          <p className="text-[16px] leading-[1.5] text-muted text-center mt-3 mb-8">
            Sign in to get real expertise, delivered by real experts.
          </p>

          {/* Buttons */}
          <div className="space-y-3">
            <button onClick={() => signIn("linkedin", { callbackUrl })} className={SECONDARY_BTN}>
              <svg className="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
              </svg>
              Continue with LinkedIn
            </button>
            <p className="mono text-[11px] tracking-[0.04em] text-muted text-center -mt-1 mb-1">
              Personalized experience with your professional context
            </p>

            <button onClick={() => signIn("google", { callbackUrl })} className={SECONDARY_BTN}>
              <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" aria-hidden="true">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              Continue with Google
            </button>

            {/* Divider */}
            <div className="flex items-center gap-3 py-3">
              <div className="flex-1 h-px bg-border" />
              <span className="mono text-[11px] tracking-[0.06em] uppercase text-faint">or</span>
              <div className="flex-1 h-px bg-border" />
            </div>

            {/* Email with verification */}
            {!codeSent ? (
              <form onSubmit={async (e) => {
                e.preventDefault();
                setError("");
                setSending(true);
                try {
                  const res = await fetch("/api/auth/send-code", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ email: emailValue }),
                  });
                  if (res.ok) {
                    setCodeSent(true);
                  } else {
                    const data = await res.json();
                    setError(data.error || "Failed to send code");
                  }
                } catch { setError("Failed to send code"); }
                setSending(false);
              }} className="space-y-3">
                <div>
                  <label htmlFor="signin-email" className={LABEL}>Email</label>
                  <input id="signin-email" type="email" placeholder="you@company.com" value={emailValue} onChange={(e) => setEmailValue(e.target.value)} required className={INPUT} />
                </div>
                <fieldset disabled={sending} className="block min-w-0">
                  <ClipButton
                    type="submit"
                    variant="accent"
                    className="disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    {sending ? "Sending..." : "Continue with Email"}
                  </ClipButton>
                </fieldset>
                {error && <p className="mono text-[11px] tracking-[0.04em] text-[#E06C5C] text-center">{error}</p>}
              </form>
            ) : (
              <form onSubmit={async (e) => { e.preventDefault(); setError(""); const res = await signIn("credentials", { email: emailValue, code: codeValue, redirect: false }); if (res?.error) { setError("Invalid or expired code. Try again."); } else if (res?.ok) { window.location.href = callbackUrl; } }} className="space-y-3">
                <p className="mono text-[11px] tracking-[0.04em] text-muted text-center">
                  We sent a 6-digit code to <span className="text-accent">{emailValue}</span>
                </p>
                <div>
                  <label htmlFor="signin-code" className={LABEL}>Verification code</label>
                  <input id="signin-code" type="text" inputMode="numeric" pattern="[0-9]{6}" maxLength={6} placeholder="000000" value={codeValue} onChange={(e) => setCodeValue(e.target.value.replace(/\D/g, ""))} required className="mono w-full rounded-md border border-border bg-background px-4 py-3 text-[20px] tracking-[0.4em] text-center text-foreground placeholder:text-faint placeholder:tracking-[0.4em] focus:border-accent/60 focus:outline-none transition" />
                </div>
                <ClipButton type="submit" variant="accent">
                  Verify &amp; Sign In
                </ClipButton>
                <button type="button" onClick={() => { setCodeSent(false); setCodeValue(""); setError(""); }} className="mono w-full text-center text-[12px] tracking-[0.02em] text-accent hover:text-foreground transition cursor-pointer pt-1">
                  Use a different email
                </button>
                {error && <p className="mono text-[11px] tracking-[0.04em] text-[#E06C5C] text-center">{error}</p>}
              </form>
            )}
          </div>

          {/* Footer */}
          <p className="mono text-[11px] tracking-[0.04em] text-faint text-center mt-8">
            By signing in, you agree to our terms of service and privacy policy.
          </p>
        </div>
      </div>
    </div>
  );
}

export default function SignInPage() {
  return (
    <Suspense>
      <SignInContent />
    </Suspense>
  );
}
