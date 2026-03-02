"use client";
import Link from "next/link";
import { ChatCircleDots, Lightning, Target, Star, LinkedinLogo, Globe } from "@phosphor-icons/react";

const highlights = [
  { icon: Target, label: "26 years in B2B sales" },
  { icon: Globe, label: "15 years in business development" },
  { icon: Lightning, label: "Trained on real session transcripts" },
  { icon: Star, label: "4.92 on GrowthMentor" },
];

const sessions = [
  {
    num: "01",
    title: "Your outbound isn't converting",
    desc: "It's usually a process problem, not a sales problem. Colin starts with your market position, ICP clarity, and current activity before prescribing anything. Most founders skip this step entirely.",
  },
  {
    num: "02",
    title: "Your messaging is about your product",
    desc: "That's the problem. The Jobs-to-be-Done framework maps what buyers actually care about across three layers: functional, social, and emotional. Most founders only address the first. The other two are why buyers choose you over the alternative.",
  },
  {
    num: "03",
    title: "Your knowledge is in your head, not a system",
    desc: "The founder closes deals because they've lived every problem the product solves. The rep can't. Colin translates that knowledge into a playbook your team runs without you in every conversation.",
  },
];

const reviews = [
  {
    quote: "Colin gave direct, practical advice and adapted quickly to my context. What I valued most was his focus on trigger-based outreach, low-friction CTAs, and earning the right to ask for a meeting instead of forcing it in message one.",
    author: "Leon Freier",
    role: "Founder, ApexAlpha",
    featured: true,
  },
  {
    quote: "Covered a LOT of ground. Improved my cold call opener to giving more context, and opening with a qualifying question. Went overtime quite a bit, and he was gracious and keen to continue.",
    author: "Liam",
    role: "GrowthMentor session",
    featured: false,
  },
  {
    quote: "Colin gave concrete, actionable advice on how to improve my outbound sales, especially around cold outreach, refining my ICP, and aligning my messaging to real client problems. I left feeling like he was genuinely invested in my success.",
    author: "Luis Cinza",
    role: "GrowthMentor session",
    featured: false,
  },
  {
    quote: "Colin galvanised me to pick up the phone and start calling prospects. He gave me very actionable tips to solve the outreach challenge my startup is going through. Highly recommend.",
    author: "Nimit B",
    role: "GrowthMentor session",
    featured: false,
  },
];

const companies = [
  { src: "/companies/ibm.svg", alt: "IBM", h: "h-7" },
  { src: "/companies/siemens.svg", alt: "Siemens", h: "h-10" },
  { src: "/companies/bmw.svg", alt: "BMW", h: "h-9" },
  { src: "/companies/unifi.svg", alt: "UNIFI", h: "h-6" },
  { src: "/companies/rain-group.png", alt: "RAIN Group", h: "h-7" },
  { src: "/companies/x-idian.svg", alt: "X-idian", h: "h-6" },
  { src: "/companies/smart-freight.svg", alt: "Smart Freight Centre", h: "h-7" },
  { src: "/companies/tq-therapeutics.png", alt: "TQ Therapeutics", h: "h-7" },
];

const starters = [
  "I've sent 500 cold emails and booked zero calls.",
  "My sales rep quit after 3 months. What did I get wrong?",
  "I don't know if my ICP is wrong or my messaging is.",
  "I hired a sales rep and nothing changed. What now?",
];

export default function ColinChapmanPage() {
  const featuredReview = reviews.find((r) => r.featured)!;
  const otherReviews = reviews.filter((r) => !r.featured);

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
                An AI agent trained on 26 years of B2B deal-making. It diagnoses your outbound,
                maps your buyer psychology, and builds the playbook. Available now, not in 3 weeks
                when a calendar slot opens.
              </p>
              <div className="flex flex-wrap gap-3 mb-6">
                {highlights.map((h) => (
                  <div key={h.label} className="flex items-center gap-2 text-sm text-muted border border-glass-border rounded-full px-3.5 py-1.5">
                    <h.icon size={16} className="text-amber" />
                    {h.label}
                  </div>
                ))}
              </div>

              {/* Quote in hero */}
              <div className="pl-5 border-l-2 border-amber/20 mb-8">
                <p className="text-foreground/40 italic text-[14px] leading-relaxed">
                  &ldquo;The message has to be about the buyer&apos;s problem, not the seller&apos;s solution.&rdquo;
                </p>
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

      {/* Sound familiar — reduced top spacing */}
      <section className="px-6 pt-10 pb-14">
        <div className="max-w-4xl mx-auto">
          <p className="text-[11px] uppercase tracking-widest text-muted mb-3">The problem</p>
          <h2 className="text-2xl md:text-3xl font-bold mb-3">Sound familiar?</h2>
          <p className="text-muted text-base mb-10 max-w-2xl">
            Founders come in with a territory. They leave with a system their team runs without them.
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
          <div className="mt-8 text-center">
            <Link
              href="https://forgehouse.io/chat/colin-chapman"
              className="text-amber text-[14px] hover:text-foreground transition"
            >
              Start with any of these &rarr;
            </Link>
          </div>
        </div>
      </section>

      {/* Companies worked with */}
      <section className="px-6 py-10">
        <div className="max-w-4xl mx-auto">
          <p className="text-[11px] uppercase tracking-widest text-muted mb-8 text-center">Companies worked with</p>
          <div className="grid grid-cols-4 md:grid-cols-8 gap-6 items-center justify-items-center">
            {companies.map((c) => (
              <img
                key={c.alt}
                src={c.src}
                alt={c.alt}
                className={`${c.h} w-auto object-contain opacity-30 brightness-0 invert`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* How the agent thinks — no gradient-blue, just section */}
      <section className="px-6 py-14">
        <div className="max-w-4xl mx-auto">
          <p className="text-[11px] uppercase tracking-widest text-muted mb-3">The agent</p>
          <h2 className="text-xl md:text-2xl font-bold mb-3">How Colin&apos;s agent thinks</h2>
          <p className="text-muted text-base mb-10 max-w-2xl">
            Built from structured extraction sessions and 26 years of closed deals.
            Not a chatbot with a sales prompt. A system that reasons the way Colin does.
          </p>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="glass-card p-6">
              <p className="font-semibold mb-2 text-sm">Diagnoses first</p>
              <p className="text-muted text-sm">Assesses commoditization, ICP clarity, and current process before giving advice. Won&apos;t give advice until he understands your situation.</p>
            </div>
            <div className="glass-card p-6">
              <p className="font-semibold mb-2 text-sm">Pushes back</p>
              <p className="text-muted text-sm">If your ICP is &quot;anyone,&quot; he&apos;ll tell you. If your sequence is too long, he&apos;ll cut it. Consultative means prepared to challenge your thinking.</p>
            </div>
            <div className="glass-card p-6">
              <p className="font-semibold mb-2 text-sm">Buyer psychology, not templates</p>
              <p className="text-muted text-sm">Uses the Jobs-to-be-Done framework across functional, social, and emotional layers. Maps what buyers care about before a word of copy gets written.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Reviews — featured + grid */}
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

          {/* Featured review */}
          <div className="glass-card p-8 md:p-10 mb-6">
            <p className="text-foreground/90 text-lg leading-relaxed mb-5 italic">
              &ldquo;{featuredReview.quote}&rdquo;
            </p>
            <div>
              <p className="font-semibold text-sm">{featuredReview.author}</p>
              <p className="text-muted text-xs">{featuredReview.role}</p>
            </div>
          </div>

          {/* Other reviews */}
          <div className="grid md:grid-cols-3 gap-4">
            {otherReviews.map((r) => (
              <div key={r.author} className="glass-card p-5">
                <p className="text-foreground/80 text-sm leading-relaxed mb-4 italic">
                  &ldquo;{r.quote}&rdquo;
                </p>
                <div>
                  <p className="font-semibold text-xs">{r.author}</p>
                  <p className="text-muted text-[11px]">{r.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Try it */}
      <section className="px-6 py-14">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-[11px] uppercase tracking-widest text-muted mb-3">Try it</p>
          <h2 className="text-xl md:text-2xl font-bold mb-3">Find out what&apos;s blocking your pipeline</h2>
          <p className="text-muted text-base mb-10 max-w-xl mx-auto">
            Pick one, or describe your situation.
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
