"use client";
import Link from "next/link";
import { ChatCircleDots, Star, LinkedinLogo } from "@phosphor-icons/react";

const FALLBACK_AVATAR = "/mentors/default-avatar.svg";
function safeAvatar(url: string | undefined | null): string {
  if (!url || url.includes("default-avatar.png")) return FALLBACK_AVATAR;
  return url;
}

interface MentorRow {
  slug: string;
  name: string;
  tagline: string;
  avatar_url: string;
  bio: string | null;
  default_starters: string[];
}

interface Highlight {
  label: string;
}

interface Session {
  num: string;
  title: string;
  desc: string;
}

interface Review {
  quote: string;
  author: string;
  role: string;
  featured?: boolean;
}

interface Company {
  src: string;
  alt: string;
  h: string;
}

interface Pillar {
  title: string;
  desc: string;
}

interface MarketingExtra {
  heroDescription: string;
  heroQuote: string;
  highlights: Highlight[];
  sessions: Session[];
  problemSubtitle: string;
  pillars: Pillar[];
  pillarSubtitle: string;
  tryItHeading: string;
  reviews?: Review[];
  reviewRating?: string;
  reviewSource?: { label: string; url: string };
  companies?: Company[];
  externalLink?: { label: string; url: string };
}

const MARKETING_EXTRAS: Record<string, MarketingExtra> = {
  "colin-chapman": {
    heroDescription:
      "An AI agent built from 26 years of B2B deal-making. It diagnoses your outbound, maps your buyer psychology, and builds the playbook. Available now, not in 3 weeks when a calendar slot opens.",
    heroQuote:
      "The message has to be about the buyer\u2019s problem, not the seller\u2019s solution.",
    highlights: [
      { label: "26 years in B2B sales" },
      { label: "15 years in business development" },
      { label: "Built from real session transcripts" },
      { label: "4.92 on GrowthMentor" },
    ],
    sessions: [
      {
        num: "01",
        title: "Your outbound isn\u2019t converting",
        desc: "It\u2019s usually a process problem, not a sales problem. Colin starts with your market position, ICP clarity, and current activity before prescribing anything. Most founders skip this step entirely.",
      },
      {
        num: "02",
        title: "Your messaging is about your product",
        desc: "That\u2019s the problem. The Jobs-to-be-Done framework maps what buyers actually care about across three layers: functional, social, and emotional. Most founders only address the first.",
      },
      {
        num: "03",
        title: "Your knowledge is in your head, not a system",
        desc: "The founder closes deals because they\u2019ve lived every problem the product solves. The rep can\u2019t. Colin translates that knowledge into a playbook your team runs without you.",
      },
    ],
    problemSubtitle:
      "Founders come in with a territory. They leave with a system their team runs without them.",
    pillars: [
      {
        title: "Diagnoses first",
        desc: "Assesses commoditization, ICP clarity, and current process before giving advice. Won\u2019t give advice until he understands your situation.",
      },
      {
        title: "Pushes back",
        desc: "If your ICP is \"anyone,\" he\u2019ll tell you. If your sequence is too long, he\u2019ll cut it. Consultative means prepared to challenge your thinking.",
      },
      {
        title: "Buyer psychology, not templates",
        desc: "Uses the Jobs-to-be-Done framework across functional, social, and emotional layers. Maps what buyers care about before a word of copy gets written.",
      },
    ],
    pillarSubtitle:
      "Built from structured extraction sessions and 26 years of closed deals. Not a chatbot with a sales prompt. A system that reasons the way Colin does.",
    tryItHeading: "Find out what\u2019s blocking your pipeline",
    reviews: [
      {
        quote:
          "Colin gave direct, practical advice and adapted quickly to my context. What I valued most was his focus on trigger-based outreach, low-friction CTAs, and earning the right to ask for a meeting instead of forcing it in message one.",
        author: "Leon Freier",
        role: "Founder, ApexAlpha",
        featured: true,
      },
      {
        quote:
          "Covered a LOT of ground. Improved my cold call opener to giving more context, and opening with a qualifying question. Went overtime quite a bit, and he was gracious and keen to continue.",
        author: "Liam",
        role: "GrowthMentor session",
      },
      {
        quote:
          "Colin gave concrete, actionable advice on how to improve my outbound sales, especially around cold outreach, refining my ICP, and aligning my messaging to real client problems. I left feeling like he was genuinely invested in my success.",
        author: "Luis Cinza",
        role: "GrowthMentor session",
      },
      {
        quote:
          "Colin galvanised me to pick up the phone and start calling prospects. He gave me very actionable tips to solve the outreach challenge my startup is going through. Highly recommend.",
        author: "Nimit B",
        role: "GrowthMentor session",
      },
    ],
    reviewRating: "4.92",
    reviewSource: {
      label: "on GrowthMentor",
      url: "https://www.growthmentor.com/mentors/colin-chapman/",
    },
    companies: [
      { src: "/companies/ibm.svg", alt: "IBM", h: "h-7" },
      { src: "/companies/siemens.svg", alt: "Siemens", h: "h-10" },
      { src: "/companies/bmw.svg", alt: "BMW", h: "h-9" },
      { src: "/companies/unifi.svg", alt: "UNIFI", h: "h-6" },
      { src: "/companies/rain-group.png", alt: "RAIN Group", h: "h-7" },
      { src: "/companies/x-idian.svg", alt: "X-idian", h: "h-6" },
      {
        src: "/companies/smart-freight.svg",
        alt: "Smart Freight Centre",
        h: "h-7",
      },
      {
        src: "/companies/tq-therapeutics.png",
        alt: "TQ Therapeutics",
        h: "h-7",
      },
    ],
    externalLink: {
      label: "View LinkedIn Profile",
      url: "https://www.linkedin.com/in/colinchapmanza/",
    },
  },
  "leon-freier": {
    heroDescription:
      "An AI agent trained on 10 years of building a luxury villa portfolio in Vietnam from scratch. From $20/night rooms to $1,000+/night beachfront villas, with 350+ five-star reviews. Covers guest experience, property evaluation, partner management, and the hustle it takes to go from budget to luxury.",
    heroQuote:
      "Optimize for the guest experience and the review. You will build your business on positive reviews of you.",
    highlights: [
      { label: "10 years in short-term rentals" },
      { label: "Luxury villas in Vietnam" },
      { label: "350+ five-star reviews" },
      { label: "Built from real operator experience" },
    ],
    sessions: [
      {
        num: "01",
        title: "You\u2019re stuck at budget-tier properties",
        desc: "The jump from $20/night to $1,000/night isn\u2019t about getting better properties. It\u2019s about applying budget-level hustle to a luxury market where operators got complacent.",
      },
      {
        num: "02",
        title: "Your guests keep haggling on price",
        desc: "You\u2019re attracting the wrong guests. Price-focused guests reveal themselves in the first message. Filter by communication style, geography, and booking behavior.",
      },
      {
        num: "03",
        title: "Your partner keeps cutting corners",
        desc: "You can\u2019t tell upfront. Test with small deals and watch behavior. When philosophy mismatches, cut ties clean. No slow fade.",
      },
    ],
    problemSubtitle:
      "Operators come in with properties. They leave with a system that attracts the right guests and protects their reputation.",
    pillars: [
      {
        title: "Reviews over margin",
        desc: "Will sacrifice short-term profit for a five-star review every time. Reviews compound. A single bad review costs more than the margin you saved.",
      },
      {
        title: "Diagnoses your situation",
        desc: "Asks about your properties, your guests, and your current setup before giving any advice. Won\u2019t prescribe before understanding.",
      },
      {
        title: "Operator, not consultant",
        desc: "Speaks from 10 years of doing, not teaching. Knows what works because he\u2019s tried what doesn\u2019t. Honest about what he hasn\u2019t figured out yet.",
      },
    ],
    pillarSubtitle:
      "Built from structured extraction sessions and a decade of operating in Vietnam. Not a chatbot with a hospitality prompt. A system that reasons from real experience.",
    tryItHeading: "Get advice from a real operator",
    externalLink: {
      label: "View Airbnb Profile",
      url: "https://www.airbnb.com/users/profile/1462809375056842073",
    },
  },
  "kyle-parratt": {
    heroDescription:
      "An AI agent built from 9+ years of production AI engineering. It validates your AI idea, designs the architecture, and helps you ship without wasting time or budget on the wrong approach. Not theory. Real experience building agent systems, RAG pipelines, and production ML at scale.",
    heroQuote:
      "Is it solving a real business problem, or is it a vanity project so you can say you use AI?",
    highlights: [
      { label: "9+ years in software engineering" },
      { label: "Production AI systems specialist" },
      { label: "Built from real engineering experience" },
      { label: "Founded RouteLinks SaaS" },
    ],
    sessions: [
      {
        num: "01",
        title: "You want to add AI but don\u2019t know where to start",
        desc: "Build or buy? Which model? What architecture? Kyle starts with whether AI is even the right solution for your problem. Most founders skip this step and burn budget on the wrong approach.",
      },
      {
        num: "02",
        title: "Your AI project scope keeps spiraling",
        desc: "The spec looked simple until edge cases appeared. Kyle helps you define what the MVP actually looks like, cut scope to what matters, and iterate instead of trying to ship perfection on day one.",
      },
      {
        num: "03",
        title: "Your RAG system is returning garbage",
        desc: "It\u2019s almost always a data quality or chunking problem, not a model problem. Kyle walks through your retrieval pipeline, embedding strategy, and evaluation setup to find the real bottleneck.",
      },
    ],
    problemSubtitle:
      "Engineers come in with an AI idea. They leave with a validated approach and a clear path to production.",
    pillars: [
      {
        title: "Validates before building",
        desc: "Asks whether the problem actually needs AI, whether a tool already exists, and what the cheapest way to test the idea is. Won\u2019t let you over-invest before validating.",
      },
      {
        title: "Production-first mindset",
        desc: "Treats AI code like any production system. Fault tolerance, observability, testing. A demo that works in a notebook is not a product.",
      },
      {
        title: "Practical, not theoretical",
        desc: "Has built agent systems, RAG pipelines, and custom models in production. Gives advice from experience, not from reading papers. Honest about what he hasn\u2019t solved yet.",
      },
    ],
    pillarSubtitle:
      "Built from structured extraction sessions and 9+ years of shipping AI in production. Not a chatbot with a generic AI prompt. A system that reasons the way Kyle does.",
    tryItHeading: "Get your AI approach validated",
    externalLink: {
      label: "View LinkedIn Profile",
      url: "https://www.linkedin.com/in/kyle-parratt-619a09b7/",
    },
  },
};

export default function MentorMarketingClient({
  mentor,
}: {
  mentor: MentorRow;
}) {
  const extra = MARKETING_EXTRAS[mentor.slug];
  const firstName = mentor.name.split(" ")[0];
  const starters = mentor.default_starters;

  const heroDescription = extra?.heroDescription ?? mentor.bio ?? "";
  const heroQuote = extra?.heroQuote;
  const highlights = extra?.highlights ?? [];
  const sessions = extra?.sessions ?? [];
  const problemSubtitle = extra?.problemSubtitle ?? "";
  const pillars = extra?.pillars ?? [];
  const pillarSubtitle = extra?.pillarSubtitle ?? "";
  const tryItHeading = extra?.tryItHeading ?? `Ask ${firstName} anything`;
  const reviews = extra?.reviews;
  const companies = extra?.companies;
  const externalLink = extra?.externalLink;

  const featuredReview = reviews?.find((r) => r.featured);
  const otherReviews = reviews?.filter((r) => !r.featured) ?? [];

  return (
    <div className="pt-16">
      <section className="gradient-hero px-6 py-20 md:py-28">
        <div className="max-w-4xl mx-auto">
          <div className="flex flex-col md:flex-row gap-8 md:gap-12 items-start">
            <img
              src={safeAvatar(mentor.avatar_url)}
              alt={mentor.name}
              className="w-24 h-24 md:w-32 md:h-32 rounded-full object-cover border border-border-light shrink-0"
              onError={(e) => { (e.target as HTMLImageElement).src = FALLBACK_AVATAR; }}
            />
            <div className="flex-1">
              <p className="text-amber text-sm font-semibold mb-2 tracking-wide uppercase">
                ForgeHouse Expert
              </p>
              <h1 className="text-3xl md:text-5xl font-bold mb-3">
                {mentor.name}
              </h1>
              <p className="text-muted text-lg md:text-xl leading-relaxed mb-2">
                {mentor.tagline}
              </p>
              <p className="text-muted text-base leading-relaxed mb-6">
                {heroDescription}
              </p>
              {highlights.length > 0 && (
                <div className="flex flex-wrap gap-3 mb-6">
                  {highlights.map((h) => (
                    <div
                      key={h.label}
                      className="flex items-center gap-2 text-sm text-muted border border-glass-border rounded-full px-3.5 py-1.5"
                    >
                      {h.label}
                    </div>
                  ))}
                </div>
              )}
              {heroQuote && (
                <div className="pl-5 border-l-2 border-amber/20 mb-8">
                  <p className="text-foreground/40 italic text-[14px] leading-relaxed">
                    &ldquo;{heroQuote}&rdquo;
                  </p>
                </div>
              )}
              <div className="flex flex-col sm:flex-row gap-3">
                <Link
                  href={`/chat/${mentor.slug}`}
                  className="bg-amber text-white px-8 py-3.5 rounded-xl font-semibold hover:bg-amber-dark transition text-center inline-flex items-center justify-center gap-2"
                >
                  <ChatCircleDots size={20} />
                  Chat with the agent
                </Link>
                {externalLink && (
                  <a
                    href={externalLink.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="border border-glass-border text-muted px-5 py-3.5 rounded-xl font-semibold hover:text-foreground hover:border-white/20 transition text-center inline-flex items-center justify-center gap-2 text-sm"
                  >
                    {externalLink.url.includes("linkedin") && (
                      <LinkedinLogo size={18} />
                    )}
                    {externalLink.url.includes("airbnb") && (
                      <Star size={18} />
                    )}
                    {externalLink.label}
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {sessions.length > 0 && (
        <section className="px-6 pt-10 pb-14">
          <div className="max-w-4xl mx-auto">
            <p className="text-[11px] uppercase tracking-widest text-muted mb-3">
              The problem
            </p>
            <h2 className="text-2xl md:text-3xl font-bold mb-3">
              Sound familiar?
            </h2>
            <p className="text-muted text-base mb-10 max-w-2xl">
              {problemSubtitle}
            </p>
            <div className="grid md:grid-cols-3 gap-6">
              {sessions.map((s) => (
                <div key={s.num} className="flex flex-col gap-3">
                  <span className="font-mono text-[13px] text-amber/60">
                    {s.num}
                  </span>
                  <p className="font-semibold text-base">{s.title}</p>
                  <p className="text-muted text-sm leading-relaxed">
                    {s.desc}
                  </p>
                </div>
              ))}
            </div>
            <div className="mt-8 text-center">
              <Link
                href={`/chat/${mentor.slug}`}
                className="text-amber text-[14px] hover:text-foreground transition"
              >
                Start with any of these &rarr;
              </Link>
            </div>
          </div>
        </section>
      )}

      {companies && companies.length > 0 && (
        <section className="px-6 py-10">
          <div className="max-w-4xl mx-auto">
            <p className="text-[11px] uppercase tracking-widest text-muted mb-8 text-center">
              Companies worked with
            </p>
            <div className="grid grid-cols-4 md:grid-cols-8 gap-6 items-center justify-items-center">
              {companies.map((c) => (
                <img
                  key={c.alt}
                  src={c.src}
                  alt={c.alt}
                  className={`${c.h} w-auto object-contain opacity-40 brightness-0`}
                />
              ))}
            </div>
          </div>
        </section>
      )}

      {pillars.length > 0 && (
        <section className="px-6 py-14">
          <div className="max-w-4xl mx-auto">
            <p className="text-[11px] uppercase tracking-widest text-muted mb-3">
              The agent
            </p>
            <h2 className="text-xl md:text-2xl font-bold mb-3">
              How {firstName}&apos;s agent thinks
            </h2>
            <p className="text-muted text-base mb-10 max-w-2xl">
              {pillarSubtitle}
            </p>
            <div className="grid md:grid-cols-3 gap-6">
              {pillars.map((p) => (
                <div key={p.title} className="glass-card p-6">
                  <p className="font-semibold mb-2 text-sm">{p.title}</p>
                  <p className="text-muted text-sm">{p.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {reviews && reviews.length > 0 && (
        <section className="px-6 py-14">
          <div className="max-w-4xl mx-auto">
            <p className="text-[11px] uppercase tracking-widest text-muted mb-3">
              Reviews
            </p>
            <div className="flex items-center gap-3 mb-10">
              <h2 className="text-xl md:text-2xl font-bold">
                What people say
              </h2>
              {extra?.reviewRating && (
                <div className="flex items-center gap-1.5 text-amber">
                  <Star size={16} weight="fill" />
                  <span className="font-semibold">{extra.reviewRating}</span>
                  {extra.reviewSource && (
                    <a
                      href={extra.reviewSource.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-muted text-xs hover:text-foreground transition ml-1"
                    >
                      {extra.reviewSource.label}
                    </a>
                  )}
                </div>
              )}
            </div>
            {featuredReview && (
              <div className="glass-card p-8 md:p-10 mb-6">
                <p className="text-foreground/90 text-lg leading-relaxed mb-5 italic">
                  &ldquo;{featuredReview.quote}&rdquo;
                </p>
                <div>
                  <p className="font-semibold text-sm">
                    {featuredReview.author}
                  </p>
                  <p className="text-muted text-xs">{featuredReview.role}</p>
                </div>
              </div>
            )}
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
      )}

      <section className="px-6 py-14">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-[11px] uppercase tracking-widest text-muted mb-3">
            Try it
          </p>
          <h2 className="text-xl md:text-2xl font-bold mb-3">
            {tryItHeading}
          </h2>
          <p className="text-muted text-base mb-10 max-w-xl mx-auto">
            Pick one, or describe your situation.
          </p>
          <div className="grid sm:grid-cols-2 gap-3 max-w-2xl mx-auto mb-10">
            {starters.map((s) => (
              <Link
                key={s}
                href={`/chat/${mentor.slug}?q=${encodeURIComponent(s)}`}
                className="glass-card p-4 text-sm text-left hover:border-amber/20 transition text-muted hover:text-foreground"
              >
                {s}
              </Link>
            ))}
          </div>
          <Link
            href={`/chat/${mentor.slug}`}
            className="bg-amber text-white px-8 py-3.5 rounded-xl font-semibold hover:bg-amber-dark transition inline-flex items-center gap-2"
          >
            <ChatCircleDots size={20} />
            Chat with the agent
          </Link>
          <p className="text-[11px] text-zinc-600 text-center mt-4">
            Your conversations are private. We don&apos;t sell or share your
            data.
          </p>
        </div>
      </section>
    </div>
  );
}
