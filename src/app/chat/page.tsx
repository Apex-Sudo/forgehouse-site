"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { ChatCircleDots } from "@phosphor-icons/react";

type Mentor = {
  slug: string;
  name: string;
  tagline: string;
  avatar_url: string;
};

export default function ChatLandingPage() {
  const [mentors, setMentors] = useState<Mentor[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch("/api/mentors");
        if (res.ok) {
          const data = await res.json();
          setMentors(data?.mentors ?? []);
        }
      } catch {
        // silent
      }
      setLoading(false);
    };
    load();
  }, []);

  return (
    <div className="h-full overflow-y-auto">
      <div className="max-w-5xl mx-auto px-6 py-10">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-foreground mb-1">Start a chat</h1>
          <p className="text-muted text-sm">Pick a mentor to begin a new conversation.</p>
        </div>

        {loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[1, 2].map((i) => (
              <div key={i} className="glass-card p-6 border border-foreground/[0.08] animate-pulse space-y-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-foreground/5" />
                  <div className="space-y-2 flex-1">
                    <div className="h-3 w-32 bg-foreground/5 rounded" />
                    <div className="h-3 w-40 bg-foreground/5 rounded" />
                  </div>
                </div>
                <div className="h-3 w-full bg-foreground/5 rounded" />
                <div className="h-3 w-3/4 bg-foreground/5 rounded" />
              </div>
            ))}
          </div>
        )}

        {!loading && mentors.length === 0 && (
          <div className="glass-card p-8 border border-foreground/[0.08] text-center">
            <p className="text-lg font-semibold mb-2">No mentors available</p>
            <p className="text-muted text-sm">We&apos;re onboarding new experts. Check back soon.</p>
          </div>
        )}

        {!loading && mentors.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {mentors.map((m) => (
              <div key={m.slug} className="glass-card p-6 border border-foreground/[0.08] flex flex-col gap-4">
                <div className="flex items-start gap-3">
                  <Image
                    src={m.avatar_url || "/mentors/default-avatar.svg"}
                    alt={m.name}
                    width={52}
                    height={52}
                    className="rounded-xl object-cover shrink-0"
                  />
                  <div className="min-w-0">
                    <h2 className="text-lg font-semibold text-foreground leading-tight">{m.name}</h2>
                    <p className="text-muted text-xs">{m.tagline}</p>
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row gap-2">
                  <Link
                    href={`/chat/${m.slug}?new=true`}
                    className="flex-1 flex items-center justify-center gap-2 bg-amber text-background py-2.5 rounded-lg font-semibold hover:opacity-90 transition cursor-pointer text-sm"
                  >
                    <ChatCircleDots size={16} weight="bold" />
                    Start chat
                  </Link>
                  <Link
                    href={`/mentors/${m.slug}`}
                    target="_blank"
                    className="flex-1 flex items-center justify-center gap-2 border border-foreground/[0.1] text-muted py-2.5 rounded-lg font-medium hover:text-foreground hover:border-foreground/[0.2] transition cursor-pointer text-sm"
                  >
                    View profile
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
