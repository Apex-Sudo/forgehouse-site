"use client";
import Link from "next/link";

export default function MemoryBanner() {
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
