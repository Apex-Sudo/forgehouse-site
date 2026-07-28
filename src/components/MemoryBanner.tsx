"use client";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";

export default function MemoryBanner() {
  const { data: session } = useSession();
  const [subscribed, setSubscribed] = useState<boolean | null>(null);

  useEffect(() => {
    if (!session?.user?.email) return;
    fetch("/api/subscription-status")
      .then((r) => r.json())
      .then((d) => setSubscribed(d.subscribed ?? false))
      .catch(() => setSubscribed(false));
  }, [session?.user?.email]);

  // Don't show banner if not signed in (nudge banner handles that) or if subscribed
  if (!session || subscribed === null) return null;
  if (subscribed) {
    return (
      <div className="bg-surface border border-border rounded-md px-4 py-2.5 flex items-center justify-between">
        <span className="mono text-[11px] tracking-[0.02em] text-muted">
          ✓ Your conversations are saved permanently.
        </span>
      </div>
    );
  }

  return (
    <div className="bg-surface border border-border rounded-md px-4 py-2.5 flex items-center justify-between">
      <span className="mono text-[11px] tracking-[0.02em] text-muted">
        Your conversation history is saved for 7 days.{" "}
        <Link href="/pricing" className="text-accent hover:text-foreground transition underline underline-offset-2">
          Subscribe to keep it forever.
        </Link>
      </span>
    </div>
  );
}
