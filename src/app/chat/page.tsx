"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import ClipButton from "@/components/ui/ClipButton";
import { getExpertProfile } from "@/lib/expert-profile";

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
    <div className="h-full overflow-y-auto fh-scroll bg-background">
      <div className="max-w-5xl mx-auto px-6 py-10">
        <div className="mb-8 flex items-start justify-between gap-6">
          <div>
            <h1 className="text-[44px] leading-none text-foreground mb-2">Start a chat</h1>
            <p className="text-[18px] italic text-accent">Pick a mentor to begin a new conversation.</p>
          </div>
          <span className="mono text-[12px] tracking-[0.1em] uppercase text-muted shrink-0 pt-2">
            Trained Experts
          </span>
        </div>

        {loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[1, 2].map((i) => (
              <div key={i} className="bg-surface border border-border rounded-lg p-6 animate-pulse space-y-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-surface-light" />
                  <div className="space-y-2 flex-1">
                    <div className="h-3 w-32 bg-surface-light rounded" />
                    <div className="h-3 w-40 bg-surface-light rounded" />
                  </div>
                </div>
                <div className="h-3 w-full bg-surface-light rounded" />
                <div className="h-3 w-3/4 bg-surface-light rounded" />
              </div>
            ))}
          </div>
        )}

        {!loading && mentors.length === 0 && (
          <div className="bg-surface border border-border rounded-lg p-10 text-center">
            <p className="text-[28px] leading-none text-foreground mb-3">No mentors available</p>
            <p className="mono text-[11px] tracking-[0.04em] text-muted">
              We&apos;re onboarding new experts. Check back soon.
            </p>
          </div>
        )}

        {!loading && mentors.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {mentors.map((m) => {
              const profile = getExpertProfile(m.slug, m.tagline);
              return (
                <div
                  key={m.slug}
                  className="bg-surface border border-border rounded-lg p-6 flex flex-col gap-5 hover:border-accent/50 transition"
                >
                  <div className="flex items-start gap-4">
                    <Image
                      src={m.avatar_url || "/mentors/default-avatar.svg"}
                      alt={m.name}
                      width={52}
                      height={52}
                      className="rounded-full object-cover shrink-0"
                    />
                    <div className="min-w-0">
                      <h2 className="text-[26px] leading-none uppercase text-foreground">{m.name}</h2>
                      <p className="text-[16px] italic text-accent mt-1.5">{profile.specialty}</p>
                    </div>
                  </div>

                  {profile.highlights.length > 0 && (
                    <ul className="mono text-[11px] leading-[1.7] text-muted">
                      {profile.highlights.slice(0, 4).map((h) => (
                        <li key={h}>{h}</li>
                      ))}
                    </ul>
                  )}

                  <div className="mt-auto flex flex-col sm:flex-row gap-2">
                    <div className="flex-1">
                      <ClipButton href={`/chat/${m.slug}?new=true`} variant="accent">
                        START CHAT
                      </ClipButton>
                    </div>
                    <Link
                      href={`/mentors/${m.slug}`}
                      target="_blank"
                      className="mono flex-1 flex items-center justify-center gap-2 border border-border text-muted py-3.5 rounded-md text-[12px] tracking-[0.02em] uppercase hover:text-accent hover:border-accent/60 transition cursor-pointer"
                    >
                      View profile
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
