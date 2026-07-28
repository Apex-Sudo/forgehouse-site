"use client";
import Link from "next/link";
import Image from "next/image";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Wordmark from "@/components/brand/Wordmark";
import ClipButton from "@/components/ui/ClipButton";
import ExpertPhoto from "@/components/ui/ExpertPhoto";
import { getExpertProfile, firstName } from "@/lib/expert-profile";

type Mentor = {
  slug: string;
  name: string;
  tagline: string;
  avatar_url: string;
};

/* Opening exchange previewed in the hero card, per expert. */
const HERO_PREVIEW: Record<string, { agent: string; user: string; placeholder: string }> = {
  "colin-chapman": {
    agent: "Tell me where deals are stalling, I'll help you find the leak in your sales process.",
    user: "Outbound gets responses, but discovery calls rarely turn into qualified pipeline.",
    placeholder: "My outbound gets replies, but discovery calls go nowhere…",
  },
  "kyle-parratt": {
    agent: "Tell me the workflow, bottleneck, or idea you want to evaluate, and I'll help you scope the right AI move.",
    user: "We want to use AI, but I'm not sure if we need automation, an agent, or no AI at all.",
    placeholder: "Should we build this with AI, automation, or not at all?…",
  },
  "leon-freier": {
    agent: "Tell me where bookings, guest experience, or revenue feel weak, and I'll help you diagnose it.",
    user: "Occupancy is decent, but guest experience and repeatability still feel inconsistent.",
    placeholder: "Our rentals are booked, but guest experience still feels inconsistent…",
  },
};

const BOTTLENECKS = [
  {
    situation: "You need founder-led sales that actually turns into pipeline.",
    broken:
      "Your outreach, qualification, or discovery flow is leaking revenue before deals even get serious.",
    cta: "Chat with B2B Sales Trained Expert",
    slug: "colin-chapman",
  },
  {
    situation: "You are deciding whether AI is a real advantage or just noise.",
    broken:
      "The bottleneck is not tooling, it is knowing what to build, how to scope it, and whether it should exist at all.",
    cta: "Chat with AI Trained Expert",
    slug: "kyle-parratt",
  },
  {
    situation: "Your rental portfolio has bookings, but the operation still feels scattered.",
    broken:
      "Guest experience, pricing, and property selection are not aligned, so revenue keeps happening without compounding.",
    cta: "Chat with STR Trained Expert",
    slug: "leon-freier",
  },
];

const STEPS = [
  {
    num: "01.",
    title: "Dump your real problem",
    desc: "Stop sugar-coating it. 'Pipeline's broken,' 'outbound isn't working,' 'we're bleeding cash.' The messier, the better.",
  },
  {
    num: "02.",
    title: "Get battle-tested answers",
    desc: "No theory, no fluff. Just frameworks that actually worked when someone's livelihood was on the line.",
  },
  {
    num: "03.",
    title: "Walk away with a plan",
    desc: "Everything's saved so you can stop spinning your wheels and start executing. Come back when you hit the next wall.",
  },
];

const FAQS = [
  {
    q: "How is this different from ChatGPT with a persona?",
    a: "We extract actual frameworks and mental models from real experts through structured conversations, not just their bio. Each expert thinks through problems using their specific methodology rather than generic AI responses.",
  },
  {
    q: "Will the advice actually be relevant to my situation?",
    a: "The experts are trained to diagnose before prescribing and ask follow-up questions about your context. They'll qualify your situation the same way the real expert would, rather than giving cookie-cutter advice.",
  },
  {
    q: "What happens after my 5 free messages?",
    a: "You'll hit a signup gate where you create an account, then a subscription for unlimited conversations with that expert. No per-message charges or hidden fees.",
  },
  {
    q: "How do I know these experts actually know what they're talking about?",
    a: "Every expert page shows their real credentials and track record. We only work with people who have verifiable, measurable success in their domain.",
  },
  {
    q: "What if the expert doesn't understand my industry?",
    a: "The experts will tell you when something is outside their expertise rather than fake it. They stay in their lane and redirect you when needed.",
  },
  {
    q: "Can I trust this with sensitive business information?",
    a: "Each expert understands business context and confidentiality. That said, don't share anything you wouldn't discuss with an external consultant.",
  },
];

export default function Home() {
  const router = useRouter();
  const [input, setInput] = useState("");
  const [mentors, setMentors] = useState<Mentor[]>([]);
  const [selected, setSelected] = useState<Mentor | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch("/api/mentors")
      .then((res) => res.json())
      .then((data) => {
        if (data.mentors?.length) {
          setMentors(data.mentors);
          setSelected(data.mentors[0]);
        }
      })
      .catch(console.error);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const expert = selected ?? mentors[0] ?? null;
  const preview =
    (expert && HERO_PREVIEW[expert.slug]) || {
      agent: "Tell me the bottleneck you want to work through, and I'll help you find the fastest path forward.",
      user: "I know where I want to grow, but I need clearer direction on what to fix first.",
      placeholder: "Describe the problem you want help solving…",
    };

  const startChat = (text: string) => {
    if (!text.trim() || !expert) return;
    router.push(`/chat/${expert.slug}?q=${encodeURIComponent(text.trim())}`);
  };

  return (
    <div className="pt-16 md:pt-[72px]">
      {/* ═══════════════════════════════════════════
          HERO
          ═══════════════════════════════════════════ */}
      <section className="relative overflow-hidden bg-[#2E2820]">
        {/* Engraving plate, exported from the Figma hero. The warm gradient is a
            fallback so the section still reads if the asset is ever missing. */}
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage:
              "url('/hero-engraving.jpg'), radial-gradient(ellipse 90% 70% at 32% 38%, #6E5E45 0%, #493E2E 46%, #29231A 100%)",
          }}
        />
        {/* Flat 28% black, matching the fill stacked over the plate in Figma */}
        <div className="absolute inset-0 bg-black/[0.28]" />
        {/* Extra falloff behind the headline so the white type stays legible */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#141210]/75 via-[#141210]/35 to-[#141210]/55" />

        <div className="relative max-w-[1008px] mx-auto px-6 py-16 md:py-20 grid lg:grid-cols-[1fr_auto] gap-12 lg:gap-10 items-center min-h-[560px] md:min-h-[600px]">
          {/* Left — headline */}
          <div>
            <h1 className="text-[64px] sm:text-[84px] lg:text-[104px] leading-[0.86] tracking-[-0.02em] text-paper">
              TR<span className="text-accent">AI</span>NED
              <br />
              EXPERTS
            </h1>

            <p className="mt-8 text-[30px] md:text-[40px] font-medium leading-[0.98] tracking-[0.02em] text-paper">
              Real Mentors.
              <br />
              Real Frameworks.
              <br />
              <span className="text-accent">Available Now.</span>
            </p>

            <div className="mt-9 flex flex-wrap items-center gap-3">
              <Link
                href={expert ? `/chat/${expert.slug}` : "/mentors"}
                className="mono inline-flex items-center gap-3 bg-accent text-[#1B1B18] px-6 py-3 rounded-md text-[12px] tracking-[0.02em] hover:bg-accent-dim transition"
              >
                Chat with an Expert
                <span aria-hidden="true">›</span>
              </Link>
              <a
                href="#how-it-works"
                className="mono inline-flex items-center gap-3 bg-[#1B1B18]/80 text-paper px-6 py-3 rounded-md text-[12px] tracking-[0.02em] hover:bg-[#1B1B18] transition"
              >
                See how it works
                <span aria-hidden="true">›</span>
              </a>
            </div>
          </div>

          {/* Right — Get Started card */}
          <div className="w-full lg:w-[530px] bg-surface/95 backdrop-blur-sm rounded-xl p-6 md:p-7">
            <div className="flex items-baseline justify-between gap-4 mb-4">
              <h2 className="text-[26px] text-paper">Get Started</h2>
              <p className="text-[15px] text-muted">Choose one of our Trained Experts</p>
            </div>

            {/* Expert selector */}
            <div ref={dropdownRef} className="relative mb-3">
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-md border border-accent/70 text-left hover:border-accent transition"
              >
                {expert ? (
                  <>
                    <Image
                      src={expert.avatar_url || "/mentors/default-avatar.svg"}
                      alt=""
                      width={32}
                      height={32}
                      className="w-8 h-8 rounded-full object-cover shrink-0"
                    />
                    <span className="flex-1 min-w-0 text-[19px] text-paper truncate">
                      {expert.name}
                      <span className="text-muted"> · </span>
                      <span className="italic text-accent">
                        {getExpertProfile(expert.slug, expert.tagline).specialty}
                      </span>
                    </span>
                  </>
                ) : (
                  <span className="flex-1 text-[19px] text-muted">Loading experts…</span>
                )}
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  className={`text-muted shrink-0 transition-transform ${dropdownOpen ? "rotate-180" : ""}`}
                  aria-hidden="true"
                >
                  <path d="M6 9l6 6 6-6" />
                </svg>
              </button>

              {dropdownOpen && (
                <div className="absolute left-0 right-0 mt-2 rounded-md border border-border bg-surface-light shadow-2xl z-20 overflow-hidden">
                  {mentors.map((m) => (
                    <button
                      key={m.slug}
                      onClick={() => {
                        setSelected(m);
                        setDropdownOpen(false);
                      }}
                      className="w-full flex items-center gap-3 px-4 py-3 hover:bg-white/5 transition text-left"
                    >
                      <Image
                        src={m.avatar_url || "/mentors/default-avatar.svg"}
                        alt=""
                        width={28}
                        height={28}
                        className="w-7 h-7 rounded-full object-cover shrink-0"
                      />
                      <span className="text-[17px] text-paper truncate">
                        {m.name}
                        <span className="text-muted"> · </span>
                        <span className="italic text-accent">
                          {getExpertProfile(m.slug, m.tagline).specialty}
                        </span>
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Transcript preview */}
            <div className="rounded-md border border-border p-4 mb-3 min-h-[190px] flex flex-col gap-3">
              <div className="bg-accent text-[#1B1B18] rounded-lg rounded-bl-sm px-4 py-2.5 text-[16px] leading-snug max-w-[88%]">
                {preview.agent}
              </div>
              <div className="self-end border border-border rounded-lg rounded-br-sm px-4 py-2.5 text-[16px] leading-snug text-paper max-w-[88%] text-right">
                {preview.user}
              </div>
              <div className="flex gap-1.5 mt-auto pt-1">
                <span className="w-1.5 h-1.5 rounded-full bg-accent fh-dot" />
                <span className="w-1.5 h-1.5 rounded-full bg-accent fh-dot [animation-delay:200ms]" />
                <span className="w-1.5 h-1.5 rounded-full bg-accent fh-dot [animation-delay:400ms]" />
              </div>
            </div>

            {/* Composer */}
            <div className="flex items-stretch gap-2.5">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    startChat(input);
                  }
                }}
                rows={2}
                placeholder={preview.placeholder}
                className="flex-1 resize-none rounded-md border border-border bg-transparent px-4 py-3 text-[16px] text-paper placeholder:text-faint focus:border-accent/60 focus:outline-none transition"
              />
              <button
                onClick={() => startChat(input)}
                disabled={!input.trim() || !expert}
                className="mono shrink-0 px-5 rounded-md border border-accent/70 text-accent text-[12px] hover:bg-accent hover:text-[#1B1B18] transition disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:text-accent"
              >
                Start Chat
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          PICK YOUR BOTTLENECK
          ═══════════════════════════════════════════ */}
      <section className="px-6 pt-20 md:pt-28 pb-16 md:pb-20">
        <div className="max-w-[1008px] mx-auto">
          <p className="mono text-[13px] text-accent mb-4">If this is you, start here</p>
          <h2 className="text-[44px] md:text-[64px] leading-[0.92] tracking-[-0.015em] max-w-[820px]">
            Pick your bottleneck and get unstuck fast.
          </h2>
          <p className="mt-5 text-[17px] text-muted max-w-[560px]">
            No theory dump, just the right mentor path for your current stage.
          </p>

          <div className="mt-12 grid md:grid-cols-3 gap-[30px]">
            {BOTTLENECKS.map((card) => (
              <article
                key={card.slug}
                className="bg-paper text-[#1B1B18] rounded-lg p-7 flex flex-col"
              >
                <h3 className="text-[23px] leading-[1.15]">{card.situation}</h3>
                <div className="w-10 h-px bg-tan my-6" />
                <p className="mono text-[11px] tracking-[0.04em] text-[#7A7368] mb-3">
                  What is actually broken
                </p>
                <p className="text-[16px] leading-[1.35] text-[#38352F] mb-8">{card.broken}</p>
                <div className="mt-auto">
                  <ClipButton href={`/chat/${card.slug}`} variant="tan">
                    {card.cta}
                  </ClipButton>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          HOW IT WORKS
          ═══════════════════════════════════════════ */}
      <section id="how-it-works" className="px-6 py-16 md:py-20 scroll-mt-24">
        <div className="max-w-[1008px] mx-auto">
          <h2 className="text-[52px] md:text-[72px] leading-[0.95] tracking-[-0.015em] mb-14">
            How It Works
          </h2>
          <div className="grid md:grid-cols-2 gap-x-16 gap-y-14">
            {STEPS.map((step) => (
              <div key={step.num}>
                <p className="mono text-[22px] text-accent mb-3">{step.num}</p>
                <h3 className="text-[28px] mb-3">{step.title}</h3>
                <p className="text-[16px] leading-[1.45] text-muted max-w-[380px]">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          BRAND BLOCK
          ═══════════════════════════════════════════ */}
      <section className="sparkle-field px-6 py-24 md:py-32">
        <div className="max-w-[1008px] mx-auto flex flex-wrap items-start justify-center gap-x-7 gap-y-4">
          <Wordmark size={96} className="text-paper" />
          <div className="pt-3">
            <p className="text-[24px] leading-tight text-paper">Real Experts,</p>
            <p className="mono text-[21px] text-accent">AI Trained</p>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          ADVISORY BOARD
          ═══════════════════════════════════════════ */}
      <section className="px-6 py-16 md:py-20">
        <div className="max-w-[1008px] mx-auto">
          <h2 className="text-[44px] md:text-[56px] leading-[1] text-center">
            Meet Your New Advisory Board
          </h2>
          <p className="mono text-[12px] text-muted text-center mt-4 mb-14">
            Get direct access to founders, operators, and experts who&apos;ve built what you&apos;re building.
          </p>

          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-[30px]">
            {mentors.map((m) => {
              const profile = getExpertProfile(m.slug, m.tagline);
              return (
                <article key={m.slug} className="flex flex-col">
                  <div className="relative aspect-[4/5] w-full overflow-hidden bg-surface">
                    <ExpertPhoto
                      src={m.avatar_url}
                      name={m.name}
                      sizes="(max-width: 768px) 100vw, 316px"
                      className="absolute inset-0"
                    />
                  </div>
                  <h3 className="mt-5 text-[28px] uppercase leading-none tracking-[0.01em] text-paper">
                    {m.name}
                  </h3>
                  <p className="text-[19px] italic text-accent mt-1">{profile.specialty}</p>
                  <ul className="mt-4 mb-6 space-y-0.5">
                    {profile.highlights.map((h) => (
                      <li key={h} className="mono text-[11px] tracking-[0.04em] text-muted">
                        {h}
                      </li>
                    ))}
                  </ul>
                  <div className="mt-auto">
                    <ClipButton href={`/chat/${m.slug}`} variant="paper">
                      Chat with {firstName(m.name)}
                    </ClipButton>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          BECOME A TRAINED EXPERT
          ═══════════════════════════════════════════ */}
      <section className="px-6 py-10 md:py-14">
        <div className="max-w-[1008px] mx-auto bg-accent text-[#1B1B18] px-8 md:px-12 py-7 flex flex-col sm:flex-row items-center justify-between gap-6">
          <p className="text-[30px] md:text-[36px] uppercase leading-none tracking-[0.01em] text-center sm:text-left">
            Become a Trained Expert
          </p>
          <Link
            href="/apply"
            className="mono shrink-0 bg-[#1B1B18] text-paper px-8 py-3.5 text-[12px] tracking-[0.08em] hover:bg-[#2A2A26] transition"
          >
            APPLY NOW
          </Link>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          QUESTIONS
          ═══════════════════════════════════════════ */}
      <section id="faq" className="sparkle-field px-6 py-16 md:py-24 scroll-mt-24">
        <div className="max-w-[1008px] mx-auto grid md:grid-cols-2 gap-10 md:gap-16 items-start">
          <div className="md:pt-10">
            <h2 className="text-[64px] md:text-[80px] leading-[0.9]">Questions</h2>
            <p className="text-[20px] italic text-accent mt-1 md:pl-16">
              Before you ask Colin, ask us.
            </p>
          </div>
          <div>
            {FAQS.map((faq) => (
              <FaqRow key={faq.q} q={faq.q} a={faq.a} />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

function FaqRow({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-border">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-start justify-between gap-6 py-4 text-left cursor-pointer group"
      >
        <span className="mono text-[12px] leading-[1.6] text-paper group-hover:text-accent transition">
          {q}
        </span>
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          className={`shrink-0 mt-0.5 text-muted transition-transform duration-300 ${open ? "rotate-180" : ""}`}
          aria-hidden="true"
        >
          <path d="M6 9l6 6 6-6" />
        </svg>
      </button>
      <div className={`overflow-hidden transition-all duration-300 ${open ? "max-h-64 pb-5 opacity-100" : "max-h-0 opacity-0"}`}>
        <p className="text-[16px] leading-[1.5] text-muted pr-10">{a}</p>
      </div>
    </div>
  );
}
