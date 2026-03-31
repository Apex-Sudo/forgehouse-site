"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

function SignInContent() {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/";
  const [emailValue, setEmailValue] = useState("");
  const [codeValue, setCodeValue] = useState("");
  const [codeSent, setCodeSent] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="bg-white border border-foreground/[0.08] rounded-2xl p-8 sm:p-10 shadow-[0_4px_40px_rgba(0,0,0,0.06)]">
          {/* Icon */}
          <div className="flex justify-center mb-6">
            <div className="w-12 h-12 rounded-xl bg-amber/10 flex items-center justify-center">
              <svg
                className="w-6 h-6 text-amber"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M20.25 8.511c.884.284 1.5 1.128 1.5 2.097v4.286c0 1.136-.847 2.1-1.98 2.193-.34.027-.68.052-1.02.072v3.091l-3-3c-1.354 0-2.694-.055-4.02-.163a2.115 2.115 0 0 1-.825-.242m9.345-8.334a2.126 2.126 0 0 0-.476-.095 48.64 48.64 0 0 0-8.048 0c-1.131.094-1.976 1.057-1.976 2.192v4.286c0 .837.46 1.58 1.155 1.951m9.345-8.334V6.637c0-1.621-1.152-3.026-2.76-3.235A48.455 48.455 0 0 0 11.25 3c-2.115 0-4.198.137-6.24.402-1.608.209-2.76 1.614-2.76 3.235v6.226c0 1.621 1.152 3.026 2.76 3.235.577.075 1.157.14 1.74.194V21l4.155-4.155"
                />
              </svg>
            </div>
          </div>

          {/* Heading */}
          <h1 className="text-2xl font-semibold text-foreground text-center mb-2">
            Expertise on Demand
          </h1>
          <p className="text-muted text-center text-sm leading-relaxed mb-8">
            Sign in to get real expertise, delivered by real experts.
          </p>

          {/* Buttons */}
          <div className="space-y-3">
            <button
              onClick={() => signIn("linkedin", { callbackUrl })}
              className="w-full flex items-center justify-center gap-3 bg-[#0A66C2] hover:bg-[#004182] text-white font-medium py-3 px-4 rounded-xl transition-colors cursor-pointer"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
              </svg>
              Continue with LinkedIn
            </button>
            <p className="text-muted text-xs text-center -mt-1 mb-1">
              Personalized experience with your professional context
            </p>

            <button
              onClick={() => signIn("google", { callbackUrl })}
              className="w-full flex items-center justify-center gap-3 bg-white hover:bg-foreground/[0.03] text-foreground font-medium py-3 px-4 rounded-xl transition-colors border border-foreground/[0.12] cursor-pointer"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              Continue with Google
            </button>

            {/* Divider */}
            <div className="flex items-center gap-3 my-2">
              <div className="flex-1 h-px bg-foreground/[0.1]" />
              <span className="text-muted text-xs">or</span>
              <div className="flex-1 h-px bg-foreground/[0.1]" />
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
              }} className="space-y-2">
                <input type="email" placeholder="Enter your email" value={emailValue} onChange={(e) => setEmailValue(e.target.value)} required className="w-full bg-white border border-foreground/[0.12] text-foreground px-4 py-3 rounded-xl text-sm placeholder:text-muted focus:outline-none focus:border-amber/40" />
                <button type="submit" disabled={sending} className="w-full bg-white hover:bg-foreground/[0.03] text-foreground font-medium py-3 px-4 rounded-xl transition-colors border border-foreground/[0.12] cursor-pointer text-sm disabled:opacity-50">
                  {sending ? "Sending..." : "Continue with Email"}
                </button>
                {error && <p className="text-red-400 text-xs text-center">{error}</p>}
              </form>
            ) : (
              <form onSubmit={async (e) => { e.preventDefault(); setError(""); const res = await signIn("credentials", { email: emailValue, code: codeValue, redirect: false }); if (res?.error) { setError("Invalid or expired code. Try again."); } else if (res?.ok) { window.location.href = callbackUrl; } }} className="space-y-2">
                <p className="text-muted text-xs text-center">We sent a 6-digit code to <span className="text-foreground font-semibold">{emailValue}</span></p>
                <input type="text" inputMode="numeric" pattern="[0-9]{6}" maxLength={6} placeholder="Enter 6-digit code" value={codeValue} onChange={(e) => setCodeValue(e.target.value.replace(/\D/g, ""))} required className="w-full bg-white border border-foreground/[0.12] text-foreground px-4 py-3 rounded-xl text-sm placeholder:text-muted focus:outline-none focus:border-amber/40 text-center tracking-[0.3em] text-lg" />
                <button type="submit" className="w-full bg-white hover:bg-foreground/[0.03] text-foreground font-medium py-3 px-4 rounded-xl transition-colors border border-foreground/[0.12] cursor-pointer text-sm">Verify & Sign In</button>
                <button type="button" onClick={() => { setCodeSent(false); setCodeValue(""); setError(""); }} className="w-full text-muted text-xs hover:text-foreground transition cursor-pointer">Use a different email</button>
                {error && <p className="text-red-400 text-xs text-center">{error}</p>}
              </form>
            )}
          </div>

          {/* Footer */}
          <p className="text-muted/60 text-xs text-center mt-6">
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
