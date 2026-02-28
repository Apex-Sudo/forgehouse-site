"use client";
import { useState } from "react";

interface UpgradePromptProps {
  mentorSlug: string;
  mentorName: string;
  mentorPrice?: number;
}

export default function UpgradePrompt({
  mentorSlug,
  mentorName,
  mentorPrice = 150,
}: UpgradePromptProps) {
  const [loading, setLoading] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const total = 47 + mentorPrice;

  if (dismissed) return null;

  const handleSubscribe = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mentorSlug }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        setLoading(false);
      }
    } catch {
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

        <div className="text-xs text-muted mb-4 space-y-0.5">
          <div className="flex justify-between">
            <span>ForgeHouse Platform</span>
            <span>$47/mo</span>
          </div>
          <div className="flex justify-between">
            <span>{mentorName}</span>
            <span>${mentorPrice}/mo</span>
          </div>
          <div className="flex justify-between pt-1.5 border-t border-white/[0.06] text-foreground/80 font-medium">
            <span>Total</span>
            <span>${total}/mo</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleSubscribe}
            disabled={loading}
            className="flex-1 bg-amber text-white py-2.5 rounded-xl font-semibold text-sm hover:bg-amber-dark transition disabled:opacity-50 cursor-pointer"
          >
            {loading ? "Loading..." : `Subscribe — $${total}/mo`}
          </button>
          <button
            onClick={() => setDismissed(true)}
            className="text-muted hover:text-foreground transition text-xs cursor-pointer"
          >
            Not now
          </button>
        </div>
      </div>
    </div>
  );
}
