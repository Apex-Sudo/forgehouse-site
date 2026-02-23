"use client";
import Link from "next/link";
import { IconArrowLeft, IconMessageCircle, IconBrandLinkedin, IconWorld } from "@tabler/icons-react";

/* ── mentor data (will become dynamic/CMS later) ── */
interface Mentor {
  slug: string;
  name: string;
  title: string;
  bio: string;
  videoUrl?: string; // YouTube/Vimeo embed URL
  photoUrl?: string;
  frameworks: { name: string; oneLiner: string }[];
  credentials: string[];
  agentId?: string; // links to /chat?agent=<id>
  linkedin?: string;
  website?: string;
}

const MENTORS: Record<string, Mentor> = {
  "colin-chapman": {
    slug: "colin-chapman",
    name: "Colin Chapman",
    title: "Growth Strategist & Startup Mentor",
    bio: "20+ years helping founders find product-market fit. Built and sold two SaaS companies. Advisor to 50+ startups across B2B and marketplace models. Known for cutting through noise to the one thing that actually moves the needle.",
    frameworks: [
      { name: "Jobs To Be Done", oneLiner: "What job is the customer hiring your product to do?" },
      { name: "The \"Why Now\" Test", oneLiner: "If this idea could have existed 5 years ago, why didn't it?" },
      { name: "9 Boxes", oneLiner: "Map every growth lever before you pick one." },
    ],
    credentials: [
      "2 SaaS exits",
      "50+ startups advised",
      "GrowthMentor Top Mentor",
      "20+ years in B2B growth",
    ],
    agentId: "colin",
    linkedin: "https://linkedin.com/in/colinchapman",
  },
};

/* ── page component ── */
export default function MentorProfile({ params }: { params: { slug: string } }) {
  const mentor = MENTORS[params.slug];

  if (!mentor) {
    return (
      <div className="pt-32 px-6 text-center max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-4">Mentor not found</h1>
        <p className="text-muted mb-8">This mentor profile doesn&apos;t exist yet.</p>
        <Link href="/" className="text-amber hover:underline">← Back to ForgeHouse</Link>
      </div>
    );
  }

  return (
    <div className="pt-20 pb-32 px-6">
      <div className="max-w-4xl mx-auto">
        {/* Back link */}
        <Link href="/" className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-foreground transition mb-10">
          <IconArrowLeft size={16} />
          All mentors
        </Link>

        {/* Header */}
        <div className="flex flex-col md:flex-row gap-8 mb-12">
          {/* Photo placeholder */}
          <div className="w-28 h-28 rounded-2xl bg-card border border-border flex items-center justify-center text-4xl font-bold text-amber shrink-0">
            {mentor.name.split(" ").map(n => n[0]).join("")}
          </div>
          <div>
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-2">{mentor.name}</h1>
            <p className="text-muted text-lg mb-4">{mentor.title}</p>
            <div className="flex gap-3">
              {mentor.linkedin && (
                <a href={mentor.linkedin} target="_blank" rel="noopener noreferrer" className="text-muted hover:text-foreground transition">
                  <IconBrandLinkedin size={20} />
                </a>
              )}
              {mentor.website && (
                <a href={mentor.website} target="_blank" rel="noopener noreferrer" className="text-muted hover:text-foreground transition">
                  <IconWorld size={20} />
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Video */}
        {mentor.videoUrl ? (
          <div className="aspect-video rounded-2xl overflow-hidden bg-card border border-border mb-12">
            <iframe
              src={mentor.videoUrl}
              className="w-full h-full"
              allow="autoplay; fullscreen"
              allowFullScreen
            />
          </div>
        ) : (
          <div className="aspect-video rounded-2xl bg-card border border-border mb-12 flex items-center justify-center">
            <p className="text-muted text-sm">Video intro coming soon</p>
          </div>
        )}

        {/* Bio */}
        <div className="mb-12">
          <h2 className="text-xl font-semibold mb-4">About</h2>
          <p className="text-muted leading-relaxed">{mentor.bio}</p>
        </div>

        {/* Frameworks */}
        <div className="mb-12">
          <h2 className="text-xl font-semibold mb-6">Core Frameworks</h2>
          <div className="grid gap-4">
            {mentor.frameworks.map((fw) => (
              <div key={fw.name} className="p-5 rounded-xl bg-card border border-border">
                <h3 className="font-semibold mb-1">{fw.name}</h3>
                <p className="text-muted text-sm">{fw.oneLiner}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Credentials */}
        <div className="mb-16">
          <h2 className="text-xl font-semibold mb-4">Track Record</h2>
          <div className="flex flex-wrap gap-3">
            {mentor.credentials.map((cred) => (
              <span key={cred} className="px-4 py-2 rounded-full bg-card border border-border text-sm text-muted">
                {cred}
              </span>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="p-8 rounded-2xl bg-card border border-border text-center">
          <h2 className="text-2xl font-bold mb-3">Talk to {mentor.name.split(" ")[0]}&apos;s agent</h2>
          <p className="text-muted mb-6 max-w-lg mx-auto">
            Their frameworks, their instincts, their pattern recognition. Available right now.
          </p>
          <Link
            href={mentor.agentId ? `/chat?agent=${mentor.agentId}` : "/the-forge"}
            className="inline-flex items-center gap-2 px-8 py-3.5 bg-amber text-background font-semibold rounded-xl hover:opacity-90 transition"
          >
            <IconMessageCircle size={20} />
            Start a conversation
          </Link>
        </div>
      </div>
    </div>
  );
}
