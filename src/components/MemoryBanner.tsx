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
      <div className="bg-white/[0.02] border border-white/[0.06] rounded-lg px-4 py-2.5 mx-6 mt-2 flex items-center justify-between text-xs">
        <span className="text-muted">
          ✓ Your conversations are saved permanently.
        </span>
      </div>
    );
  }

  return (
    <div className="bg-white/[0.02] border border-white/[0.06] rounded-lg px-4 py-2.5 mx-6 mt-2 flex items-center justify-between text-xs">
      <span className="text-muted">
        Your conversation history is saved for 7 days.{" "}
        <Link href="/pricing" className="text-amber hover:text-amber-dark transition underline underline-offset-2">
          Subscribe to keep it forever.
        </Link>
      </span>
    </div>
  );
}
