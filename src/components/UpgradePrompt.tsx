"use client";
import { useState } from "react";

interface UpgradePromptProps {
  mentorSlug: string;
  mentorName: string;
  /** Stored amount in cents (same as `mentors.monthly_price`). */
  mentorMonthlyPriceCents: number;
}

function formatUsd(amount: number): string {
  return amount.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });
}

export default function UpgradePrompt({
  mentorSlug,
  mentorName,
  mentorMonthlyPriceCents,
}: UpgradePromptProps) {
  const [loading, setLoading] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [error, setError] = useState("");
  const mentorMonthlyUsd = mentorMonthlyPriceCents / 100;

  if (dismissed) return null;

  const handleSubscribe = async () => {
    setLoading(true);
    setError("");
    window.posthog?.capture("checkout_started", {
      mentor: mentorSlug,
      mentor_name: mentorName,
      price_usd: mentorMonthlyUsd,
    });
    window.posthog?.capture("subscription_started", {
      mentor: mentorSlug,
      mentor_name: mentorName,
      price_usd: mentorMonthlyUsd,
    });
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mentorSlug }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else if (res.status === 401) {
        // Session expired, redirect to sign-in
        window.location.href = `/sign-in?callbackUrl=/chat/${mentorSlug}`;
        return;
      } else {
        setError(data.error || "Something went wrong. Please try again.");
        setLoading(false);
      }
    } catch {
      setError("Connection failed. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="mx-6 my-4 animate-in fade-in slide-in-from-bottom-2 duration-500">
      <div className="bg-white/[0.03] border border-amber/20 rounded-2xl px-6 py-5">
        <p className="text-sm text-foreground/90 mb-3 leading-relaxed">
          Want to go deeper? Subscribe to unlock full mentor access and keep
          your conversations forever.
        </p>

        <div className="text-sm text-muted mb-4">
          <div className="flex justify-between items-center">
            <span>{mentorName} Subscription</span>
            <span className="font-semibold">{formatUsd(mentorMonthlyUsd)}/mo</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleSubscribe}
            disabled={loading}
            className="flex-1 bg-amber text-white py-2.5 rounded-xl font-semibold text-sm hover:bg-amber-dark transition disabled:opacity-50 cursor-pointer"
          >
            {loading ? "Loading..." : `Subscribe — ${formatUsd(mentorMonthlyUsd)}/mo`}
          </button>
          <button
            onClick={() => setDismissed(true)}
            className="text-muted hover:text-foreground transition text-xs cursor-pointer"
          >
            Not now
          </button>
        </div>
        {error && (
          <p className="text-red-400 text-xs text-center mt-2">{error}</p>
        )}
      </div>
    </div>
  );
}
