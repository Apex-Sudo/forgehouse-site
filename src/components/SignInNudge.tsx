"use client";
import { useState } from "react";
import Link from "next/link";

export default function SignInNudge() {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  return (
    <div className="bg-surface border border-accent/25 rounded-md px-4 py-3 mx-6 mt-2 flex items-center justify-between animate-in fade-in slide-in-from-top-2 duration-300">
      <span className="mono text-[11px] tracking-[0.02em] text-muted">
        💡 Sign in to save this conversation and pick up where you left off.{" "}
        <Link
          href="/sign-in"
          className="text-accent hover:text-foreground transition underline underline-offset-2"
        >
          Sign in
        </Link>
      </span>
      <button
        onClick={() => setDismissed(true)}
        className="text-muted hover:text-accent transition ml-3 text-base leading-none cursor-pointer"
        aria-label="Dismiss"
      >
        ×
      </button>
    </div>
  );
}
