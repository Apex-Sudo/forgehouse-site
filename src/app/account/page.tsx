"use client";
import { useEffect, useState } from "react";
import { useSession, signOut } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";

export default function AccountPage() {
  const { data: session, status } = useSession();
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") {
      window.location.href = "/sign-in?callbackUrl=/account";
      return;
    }
    if (!session?.user) return;
    fetch("/api/insights?mentor=colin-chapman")
      .then(async (r) => {
        if (r.ok) {
          const data = await r.json();
          setIsSubscribed(data.isSubscribed);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [session, status]);

  if (status === "loading" || status === "unauthenticated" || loading) {
    return (
      <div className="flex items-center justify-center h-full pt-20">
        <span className="animate-pulse text-muted text-sm">Loading...</span>
      </div>
    );
  }

  return (
    <div className="pt-4 h-full overflow-y-auto">
      <div className="max-w-xl mx-auto px-4 py-8">
        <h1 className="text-xl font-bold mb-8">Account</h1>

        {/* Profile */}
        <div className="glass-card px-6 py-5 mb-4">
          <div className="flex items-center gap-4">
            {session?.user?.image ? (
              <Image
                src={session.user.image}
                alt=""
                width={48}
                height={48}
                className="rounded-full"
              />
            ) : (
              <div className="w-12 h-12 rounded-full bg-white/[0.1] flex items-center justify-center text-lg font-semibold">
                {session?.user?.name?.[0] ?? "?"}
              </div>
            )}
            <div>
              <p className="font-medium">{session?.user?.name}</p>
              <p className="text-sm text-muted">{session?.user?.email}</p>
            </div>
          </div>
        </div>

        {/* Subscription */}
        <div className="glass-card px-6 py-5 mb-4">
          <h2 className="text-sm font-semibold mb-3">Subscription</h2>
          {isSubscribed ? (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-2 h-2 rounded-full bg-green-500" />
                <p className="text-sm text-foreground">Active subscription</p>
              </div>
              <p className="text-xs text-muted mb-4">
                Subscribed mentors: Colin Chapman
              </p>
              <button
                onClick={async () => {
                  try {
                    const res = await fetch("/api/portal", { method: "POST" });
                    const data = await res.json();
                    if (data.url) window.location.href = data.url;
                  } catch { /* silent */ }
                }}
                className="bg-white/[0.06] border border-white/[0.08] text-sm px-4 py-2 rounded-lg text-foreground hover:bg-white/[0.1] transition cursor-pointer"
              >
                Manage billing
              </button>
            </div>
          ) : (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-2 h-2 rounded-full bg-muted" />
                <p className="text-sm text-muted">Free tier</p>
              </div>
              <p className="text-xs text-muted mb-4">
                Upgrade to get unlimited conversations, saved insights, and full access to all mentors.
              </p>
              <Link
                href="/pricing"
                className="inline-block bg-amber text-white text-sm px-5 py-2 rounded-lg font-semibold hover:bg-amber-dark transition"
              >
                View pricing
              </Link>
            </div>
          )}
        </div>

        {/* Sign out */}
        <button
          onClick={() => signOut({ callbackUrl: "/" })}
          className="text-sm text-muted hover:text-foreground transition cursor-pointer"
        >
          Sign out
        </button>
      </div>
    </div>
  );
}
