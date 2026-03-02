"use client";
import Link from "next/link";
import { ChatCircleDots, Lightning, Target, Handshake, Star, LinkedinLogo, Globe } from "@phosphor-icons/react";

const highlights = [
  { icon: Target, label: "26 years in B2B sales" },
  { icon: Globe, label: "6 continents, always in English" },
  { icon: Lightning, label: "66% win rate at peak" },
  { icon: Star, label: "4.92 from 80+ reviews" },
];

const sessions = [
  {
    num: "01",
    title: "Why isn't my outbound converting?",
    desc: "Diagnose the real problem. Most founders think they have a sales problem when they have a process problem. Colin starts with your commoditization level, ICP clarity, and current activity before prescribing anything.",
  },
  {
    num: "02",
    title: "What does my buyer actually care about?",
    desc: "Map the Jobs-to-be-Done framework across all three layers: functional, social, and emotional. Most founders only address the functional job. The other two are where differentiation lives.",
  },
  {
    num: "03",
    title: "How do I build a playbook my team can run?",
    desc: "Translate what makes your product valuable into language buyers recognise as being about them. The knowledge is in the founder's head. Colin turns it into a system that works without you in every conversation.",
  },
];

const reviews = [
  {
    quote: "Colin gave direct, practical advice and adapted quickly to my context. What I valued most was his focus on trigger-based outreach, low-friction CTAs, and earning the right to ask for a meeting instead of forcing it in message one.",
    author: "Leon Freier",
    role: "Founder, ApexAlpha",
  },
  {
    quote: "Covered a LOT of ground. Improved my cold call opener to giving more context, and opening with a qualifying question. Went overtime quite a bit, and he was gracious and keen to continue.",
    author: "Liam",
    role: "GrowthMentor session",
  },
  {
    quote: "Colin gave concrete, actionable advice on how to improve my outbound sales, especially around cold outreach, refining my ICP, and aligning my messaging to real client problems. I left feeling like he was genuinely invested in my success.",
    author: "Luis Cinza",
    role: "GrowthMentor session",
  },
  {
    quote: "Colin galvanised me to pick up the phone and start calling prospects. He gave me very actionable tips to solve the outreach challenge my startup is going through. Highly recommend.",
    author: "Nimit B",
    role: "GrowthMentor session",
  },
];

const starters = [
  "My pipeline is stalled. Where do I start?",
  "How do I define my ICP when my product is new?",
  "What should my first outreach sequence look like?",
  "I hired a sales rep and nothing changed. What now?",
];

export default function ColinChapmanPage() {
  return (
    <div className="pt-16">
      {/* Hero */}
      <section className="gradient-hero px-6 py-20 md:py-28">
        <div className="max-w-4xl mx-auto">
          <div className="flex flex-col md:flex-row gap-8 md:gap-12 items-start">
            <img
              src="/mentors/colin-chapman.png"
              alt="Colin Chapman"
              className="w-24 h-24 md:w-32 md:h-32 rounded-full object-cover border border-border-light shrink-0"
            />
            <div className="flex-1">
              <p className="text-amber text-sm font-semibold mb-2 tracking-wide uppercase">ForgeHouse Mentor</p>
              <h1 className="text-3xl md:text-5xl font-bold mb-3">Colin Chapman</h1>
              <p className="text-muted text-lg md:text-xl leading-relaxed mb-2">
                GTM & Outbound for B2B Tech Founders
              </p>
              <p className="text-muted text-base leading-relaxed mb-6">
                Most B2B tech founders are still closing the majority of their own deals.
                The first sales hire arrives, three months pass, and the pipeline hasn&apos;t moved.
                The rep inherited a territory, not a playbook. Nobody ever translated the founder&apos;s
                knowledge into a system. That&apos;s the specific problem Colin solves.
              </p>
              <div className="flex flex-wrap gap-3 mb-8">
                {highlights.map((h) => (
                  <div key={h.label} className="flex items-center gap-2 text-sm text-muted border border-glass-border rounded-full px-3.5 py-1.5">
                    <h.icon size={16} className="text-amber" />
                    {h.label}
                  </div>
                ))}
              </div>
              <div className="flex flex-col sm:flex-row gap-3">
                <Link
                  href="https://forgehouse.io/chat/colin-chapman"
                  className="bg-amber text-white px-8 py-3.5 rounded-xl font-semibold hover:bg-amber-dark transition text-center inline-flex items-center justify-center gap-2"
                >
                  <ChatCircleDots size={20} />
                  Diagnose your pipeline
                </Link>
                <a
                  href="https://www.linkedin.com/in/colinchapmanza/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="border border-glass-border text-muted px-5 py-3.5 rounded-xl font-semibold hover:text-foreground hover:border-white/20 transition text-center inline-flex items-center justify-center gap-2 text-sm"
                >
                  <LinkedinLogo size={18} />
                  View LinkedIn Profile
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Philosophy quote */}
      <section className="px-6 py-10">
        <div className="max-w-4xl mx-auto">
          <div className="pl-6 border-l-2 border-amber/20">
            <p className="text-foreground/40 italic text-[15px] leading-relaxed">
              &ldquo;The message has to be about the buyer&apos;s problem, not the seller&apos;s solution.
              The outreach usually reads like it was written by someone who knows the product extremely well,
              which sounds like a compliment until you think about it.&rdquo;
            </p>
            <p className="text-foreground/25 text-[11px] mt-2">Colin Chapman</p>
          </div>
        </div>
      </section>

      {/* What a session covers */}
      <section className="px-6 py-14">
        <div className="max-w-4xl mx-auto">
          <p className="text-[11px] uppercase tracking-widest text-muted mb-3">Sessions</p>
          <h2 className="text-2xl md:text-3xl font-bold mb-3">What a session covers</h2>
          <p className="text-muted text-base mb-10 max-w-2xl">
            Sessions typically focus on one of three things. The agent handles all of them.
          </p>
          <div className="grid md:grid-cols-3 gap-6">
            {sessions.map((s) => (
              <div key={s.num} className="flex flex-col gap-3">
                <span className="font-mono text-[13px] text-amber/60">{s.num}</span>
                <p className="font-semibold text-base">{s.title}</p>
                <p className="text-muted text-sm leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How the agent thinks */}
      <section className="px-6 py-14 gradient-blue">
        <div className="max-w-4xl mx-auto">
          <p className="text-[11px] uppercase tracking-widest text-muted mb-3">The agent</p>
          <h2 className="text-xl md:text-2xl font-bold mb-3">How Colin&apos;s agent thinks</h2>
          <p className="text-muted text-base mb-10 max-w-2xl">
            Built from structured extraction sessions, live calibration, and deep dives into 26 years of deal-making.
            Not a chatbot with a sales prompt. A system that reasons the way Colin does.
          </p>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="glass-card p-6">
              <p className="text-amber font-semibold mb-2 text-sm">Diagnoses first</p>
              <p className="text-muted text-sm">Assesses commoditization, ICP clarity, and current process before giving advice. Won&apos;t prescribe without understanding your situation.</p>
            </div>
            <div className="glass-card p-6">
              <p className="text-amber font-semibold mb-2 text-sm">Pushes back</p>
              <p className="text-muted text-sm">If your ICP is &quot;anyone,&quot; he&apos;ll tell you. If your sequence is too long, he&apos;ll cut it. Consultative means prepared to challenge your thinking.</p>
            </div>
            <div className="glass-card p-6">
              <p className="text-amber font-semibold mb-2 text-sm">Buyer psychology, not templates</p>
              <p className="text-muted text-sm">Uses the Jobs-to-be-Done framework across functional, social, and emotional layers. Maps what buyers care about before a word of copy gets written.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Reviews */}
      <section className="px-6 py-14">
        <div className="max-w-4xl mx-auto">
          <p className="text-[11px] uppercase tracking-widest text-muted mb-3">Reviews</p>
          <div className="flex items-center gap-3 mb-10">
            <h2 className="text-xl md:text-2xl font-bold">What people say</h2>
            <div className="flex items-center gap-1.5 text-amber">
              <Star size={16} weight="fill" />
              <span className="font-semibold">4.92</span>
              <a href="https://www.growthmentor.com/mentors/colin-chapman/" target="_blank" rel="noopener noreferrer" className="text-muted text-xs hover:text-foreground transition ml-1">on GrowthMentor</a>
            </div>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            {reviews.map((r) => (
              <div key={r.author} className="glass-card p-6 md:p-8">
                <p className="text-foreground/90 text-base leading-relaxed mb-5 italic">
                  &ldquo;{r.quote}&rdquo;
                </p>
                <div>
                  <p className="font-semibold text-sm">{r.author}</p>
                  <p className="text-muted text-xs">{r.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Try it */}
      <section className="px-6 py-14 gradient-blue">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-[11px] uppercase tracking-widest text-muted mb-3">Try it</p>
          <h2 className="text-xl md:text-2xl font-bold mb-3">Find out what&apos;s blocking your pipeline</h2>
          <p className="text-muted text-base mb-10 max-w-xl mx-auto">
            Pick one, or ask whatever&apos;s on your mind.
          </p>
          <div className="grid sm:grid-cols-2 gap-3 max-w-2xl mx-auto mb-10">
            {starters.map((s) => (
              <Link
                key={s}
                href={`https://forgehouse.io/chat/colin-chapman?q=${encodeURIComponent(s)}`}
                className="glass-card p-4 text-sm text-left hover:border-amber/20 transition text-muted hover:text-foreground"
              >
                {s}
              </Link>
            ))}
          </div>
          <Link
            href="https://forgehouse.io/chat/colin-chapman"
            className="bg-amber text-white px-8 py-3.5 rounded-xl font-semibold hover:bg-amber-dark transition inline-flex items-center gap-2"
          >
            <ChatCircleDots size={20} />
            Diagnose your pipeline
          </Link>
        </div>
      </section>
    </div>
  );
}
