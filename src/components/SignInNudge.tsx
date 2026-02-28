"use client";
import { useState } from "react";
import Link from "next/link";

export default function SignInNudge() {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  return (
    <div className="bg-white/[0.03] border border-[#3B82F6]/20 rounded-lg px-4 py-3 mx-6 mt-2 flex items-center justify-between text-xs animate-in fade-in slide-in-from-top-2 duration-300">
      <span className="text-muted">
        💡 Sign in to save this conversation and pick up where you left off.{" "}
        <Link
          href="/sign-in"
          className="text-[#3B82F6] hover:text-[#60A5FA] transition underline underline-offset-2"
        >
          Sign in
        </Link>
      </span>
      <button
        onClick={() => setDismissed(true)}
        className="text-muted hover:text-foreground transition ml-3 text-base leading-none cursor-pointer"
        aria-label="Dismiss"
      >
        ×
      </button>
    </div>
  );
}
