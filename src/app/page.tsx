"use client";
import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { IconArrowRight, IconCheck, IconMessageCircle, IconBulb, IconBookmark, IconChevronDown } from "@tabler/icons-react";
import { useEffect, useRef, useCallback } from "react";

type Mentor = {
  slug: string;
  name: string;
  tagline: string;
  avatar_url: string;
};

export default function Home() {
  const router = useRouter();
  const [input, setInput] = useState("");
  const [mentors, setMentors] = useState<Mentor[]>([]);
  const [selectedMentor, setSelectedMentor] = useState<Mentor | null>(null);
  const [mentorDropdownOpen, setMentorDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch("/api/mentors")
      .then((res) => res.json())
      .then((data) => {
        if (data.mentors?.length) {
          setMentors(data.mentors);
          setSelectedMentor(data.mentors[0]);
        }
      })
      .catch(console.error);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setMentorDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const mentorForUI = selectedMentor ?? mentors[0] ?? null;

  const handleSubmit = (text: string) => {
    if (!text.trim() || !selectedMentor) return;
    router.push(`/chat/${selectedMentor.slug}?q=${encodeURIComponent(text.trim())}`);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(input);
    }
  };

  return (
    <div className="pt-16">
      {/* ═══════════════════════════════════════════════
          HERO — Strong positioning above the fold
          ═══════════════════════════════════════════════ */}
      <section
        className="px-6 min-h-[90vh] flex items-center justify-center relative overflow-hidden"
        style={{ background: "#1A1A1A" }}
      >
        {/* Animated grid pattern */}
        <div
          className="absolute inset-0 pointer-events-none animate-grid-scroll"
          style={{
            backgroundImage: `
              linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)
            `,
            backgroundSize: '48px 48px',
          }}
        />
        {/* Warm radial glow */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: 'radial-gradient(ellipse at 50% 40%, rgba(184,145,106,0.08) 0%, transparent 50%)',
          }}
        />
        {/* Bottom fade to solid dark */}
        <div
          className="absolute inset-x-0 bottom-0 h-[40%] pointer-events-none"
          style={{
            background: 'linear-gradient(to bottom, transparent 0%, #1A1A1A 100%)',
          }}
        />
        <div className="max-w-6xl w-full mx-auto grid md:grid-cols-2 gap-12 md:gap-16 items-center relative">
          {/* Left column — hero copy */}
          <div>
            <p className="text-sm md:text-base font-semibold text-amber uppercase tracking-[0.2em] mb-8">
              Expert Knowledge, On Demand
            </p>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight leading-[1.08] text-white mb-6">
              Real Mentors.<br />
              Real Frameworks.<br />
              <span className="text-amber">Available Now.</span>
            </h1>

            <p className="text-lg md:text-xl text-[#999] leading-relaxed max-w-[480px] mb-10">
              Domain experts distilled into AI mentors you can talk to anytime. Not scraped content. Actual practitioner thinking, available 24/7.
            </p>

            <div className="flex flex-col sm:flex-row items-start gap-4 mb-10">
              <Link
                href="/chat/colin-chapman"
                className="inline-flex items-center gap-2 bg-amber text-white px-8 py-3.5 rounded-xl text-[15px] font-semibold hover:opacity-90 transition shadow-sm"
              >
                Talk to a Mentor <IconArrowRight size={18} stroke={2} />
              </Link>
              <a
                href="#how-it-works"
                className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl text-[15px] font-semibold text-[#999] border border-[#333] hover:border-amber hover:text-amber transition bg-transparent"
              >
                See How It Works
              </a>
            </div>

            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-[13px] text-[#666]">
              <span className="flex items-center gap-1.5"><IconCheck size={15} className="text-amber" stroke={2.5} /> 5 free messages</span>
              <span className="flex items-center gap-1.5"><IconCheck size={15} className="text-amber" stroke={2.5} /> No signup required</span>
              <span className="flex items-center gap-1.5"><IconCheck size={15} className="text-amber" stroke={2.5} /> Real expert frameworks</span>
            </div>
          </div>

          {/* Right column — chat CTA card with mentor selector */}
          <div className="rounded-2xl border border-[#E5E2DC] bg-white p-7 md:p-8 shadow-2xl min-h-[520px] flex flex-col">
            <p className="text-xs font-semibold text-amber uppercase tracking-[0.18em] mb-2">Get Started</p>
            <h2 className="text-xl md:text-2xl font-bold text-[#1A1A1A] mb-3">What&apos;s your biggest GTM blocker right now?</h2>


            {/* Mentor Selector */}
            <div className="mb-4 border-b border-[#F1EFEA] pb-4">
              <div ref={dropdownRef} className="relative">
                <button
                  onClick={() => setMentorDropdownOpen(!mentorDropdownOpen)}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl border border-[#E5E2DC] bg-[#FAFAF8] hover:border-amber/40 transition text-left"
                >
                  {mentorForUI ? (
                    <>
                      <Image src={mentorForUI.avatar_url} alt={mentorForUI.name} width={32} height={32} className="w-8 h-8 rounded-full object-cover flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-[14px] font-semibold text-[#1A1A1A] leading-tight">{mentorForUI.name}</p>
                        <p className="text-[11px] text-[#999] truncate">{mentorForUI.tagline}</p>
                      </div>
                    </>
                  ) : (
                    <div className="flex-1 min-w-0">
                      <p className="text-[14px] font-semibold text-[#1A1A1A] leading-tight">Loading mentors...</p>
                    </div>
                  )}
                  <IconChevronDown
                    size={16}
                    className={`text-[#999] transition-transform duration-200 ${mentorDropdownOpen ? "rotate-180" : ""}`}
                    stroke={2}
                  />
                </button>

                {mentorDropdownOpen && (
                  <div className="absolute left-0 right-0 mt-2 rounded-xl border border-[#E5E2DC] bg-white shadow-lg z-20 overflow-hidden">
                    {mentors.map((m) => (
                      <button
                        key={m.slug}
                        onClick={() => { setSelectedMentor(m); setMentorDropdownOpen(false); }}
                        className={`w-full flex items-center gap-3 px-4 py-3.5 hover:bg-[#FAFAF8] transition text-left ${
                          m.slug === mentorForUI?.slug ? "bg-amber/5" : ""
                        }`}
                      >
                        <Image src={m.avatar_url} alt={m.name} width={32} height={32} className="w-8 h-8 rounded-full object-cover flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-[14px] font-semibold text-[#1A1A1A] leading-tight">{m.name}</p>
                          <p className="text-[11px] text-[#999] truncate">{m.tagline}</p>
                        </div>
                        {m.slug === mentorForUI?.slug && (
                          <IconCheck size={16} className="text-amber flex-shrink-0" stroke={2.5} />
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Fake transcript preview */}
            <div className="flex-1 mb-4 rounded-xl border border-[#F1EFEA] bg-[#FCFCFB] p-4 space-y-3">
              <div className="flex justify-start">
                <div className="max-w-[85%] rounded-2xl rounded-bl-md bg-white border border-[#EAE7E1] px-3.5 py-2.5 text-[13px] text-[#4A4A4A] leading-relaxed">
                  Tell me your SaaS stage and biggest GTM blocker, I&apos;ll give you the fastest fix path.
                </div>
              </div>
              <div className="flex justify-end">
                <div className="max-w-[78%] rounded-2xl rounded-br-md bg-amber/15 border border-amber/20 px-3.5 py-2.5 text-[13px] text-[#3A3327] leading-relaxed">
                  Early-stage B2B SaaS. Outbound gets replies, but pipeline quality is weak.
                </div>
              </div>
              <div className="flex justify-start">
                <div className="inline-flex items-center gap-2 rounded-2xl rounded-bl-md bg-white border border-[#EAE7E1] px-3.5 py-2 text-[12px] text-[#777]">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#B9B2A6] animate-pulse" />
                  <span className="w-1.5 h-1.5 rounded-full bg-[#B9B2A6] animate-pulse [animation-delay:150ms]" />
                  <span className="w-1.5 h-1.5 rounded-full bg-[#B9B2A6] animate-pulse [animation-delay:300ms]" />
                </div>
              </div>
            </div>

            {/* Input Box */}
            <div className="mt-auto">
              <div className="relative">
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  rows={2}
                  placeholder="My outbound stalls after first replies..."
                  className="w-full pr-32 pl-4 py-3 text-[15px] rounded-xl border border-[#E5E2DC] focus:border-amber focus:outline-none focus:ring-2 focus:ring-amber/20 transition resize-none bg-[#FAFAF8] text-[#1A1A1A] placeholder:text-[#999] shadow-sm"
                  style={{ minHeight: '90px' }}
                />
                <button
                  onClick={() => handleSubmit(input)}
                  disabled={!input.trim()}
                  className="absolute right-3 bottom-3 bg-amber text-white h-10 px-3 rounded-lg hover:opacity-90 transition disabled:opacity-40 disabled:cursor-not-allowed inline-flex items-center gap-1 text-[13px] font-semibold"
                >
                  Start chat <IconArrowRight size={14} stroke={2.5} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════
          WHO THIS IS FOR — pain point cards
          ═══════════════════════════════════════════════ */}
      <section className="px-6 py-20" style={{ background: "#F5F5F3" }}>
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-sm md:text-base font-semibold text-amber uppercase tracking-widest mb-3">If this is you, start here</p>
            <h2 className="text-3xl md:text-4xl font-bold text-[#1A1A1A]">Pick your bottleneck and get unstuck fast.</h2>
            <p className="text-[15px] text-[#737373] mt-3">No theory dump, just the right mentor path for your current stage.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {[
              {
                situation: "You get replies, but pipeline quality is weak.",
                broken: "ICP, qualification, or message to market fit is off.",
                start: "Start with GTM Mentor",
                prompt: "My outbound gets replies, but pipeline quality is weak. Where is the breakdown?",
              },
              {
                situation: "Your product is strong, but positioning is fuzzy.",
                broken: "Buyers do not clearly understand why you over alternatives.",
                start: "Start with Positioning Mentor",
                prompt: "My product is solid, but my positioning and ICP are unclear. Help me tighten both.",
              },
              {
                situation: "You are taking calls, but close rates stay low.",
                broken: "Discovery flow, objection handling, or pricing narrative is leaking trust.",
                start: "Start with Sales Process Mentor",
                prompt: "I am taking sales calls but close rates are low. Diagnose my discovery and pricing flow.",
              },
            ].map((card) => (
              <div key={card.start} className="bg-white rounded-2xl border border-[#E5E2DC] p-7 flex flex-col gap-4">
                <p className="text-[17px] font-semibold text-[#1A1A1A] leading-snug">{card.situation}</p>
                <div className="h-px bg-[#E5E2DC]" />
                <div>
                  <p className="text-xs font-semibold text-amber uppercase tracking-wider mb-2">What is actually broken</p>
                  <p className="text-[14px] text-[#737373] leading-relaxed">{card.broken}</p>
                </div>
                <button
                  onClick={() => handleSubmit(card.prompt)}
                  className="mt-auto inline-flex items-center justify-center bg-[#1A1A1A] text-white px-4 py-2.5 rounded-xl text-[13px] font-semibold hover:bg-[#2A2A2A] transition"
                >
                  {card.start} <span className="ml-1">→</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Divider */}
      <div className="max-w-[600px] mx-auto h-px bg-gradient-to-r from-transparent via-amber/[0.12] to-transparent" />

      {/* ═══════════════════════════════════════════════
          HOW IT WORKS — scroll-driven steps
          ═══════════════════════════════════════════════ */}
      <HowItWorks />

      {/* ═══════════════════════════════════════════════
          MEET THE MENTORS
          ═══════════════════════════════════════════════ */}
      <section className="px-6 py-28" style={{ background: "#FAFAF8" }}>
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-[#1A1A1A] text-center mb-3">Meet Your New Advisory Board</h2>
          <p className="text-[15px] text-[#737373] text-center mb-4">Get direct access to founders, operators, and experts who&apos;ve built what you&apos;re building.</p>
          <div className="w-10 h-1 bg-amber mx-auto rounded-full mb-14"></div>

          {/* Pricing-style 3-card grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">

            {/* Kyle Parratt - left */}
            <Link href="/mentors/kyle-parratt" className="hidden md:flex group flex-col items-center rounded-2xl border border-[#E5E2DC] bg-white p-10 text-center hover:border-amber/30 hover:shadow-md transition">
              <Image
                src="/mentors/kyle-parratt.png"
                alt="Kyle Parratt"
                width={160}
                height={160}
                className="w-20 h-20 rounded-full object-cover group-hover:opacity-90 transition mb-5"
              />
              <p className="text-xl font-bold text-[#1A1A1A] mb-0.5">Kyle Parratt</p>
              <p className="text-xs font-semibold text-amber uppercase tracking-wider mb-3">Production AI & Systems</p>
              <p className="text-sm text-[#666] leading-relaxed mb-4">Validates whether AI fits, then helps you architect and ship without wasting budget on the wrong bet.</p>
              <p className="text-[12px] text-[#999] mb-5">9+ yrs · Production AI · RouteLinks</p>
              <div className="flex flex-wrap justify-center gap-2 mb-6">
                <span className="text-xs px-3 py-1.5 rounded-full border border-[#E5E2DC] text-[#666] font-medium">AI Strategy</span>
                <span className="text-xs px-3 py-1.5 rounded-full border border-[#E5E2DC] text-[#666] font-medium">RAG & Retrieval</span>
                <span className="text-xs px-3 py-1.5 rounded-full border border-[#E5E2DC] text-[#666] font-medium">MVP Scoping</span>
                <span className="text-xs px-3 py-1.5 rounded-full border border-[#E5E2DC] text-[#666] font-medium">Production ML</span>
                <span className="text-xs px-3 py-1.5 rounded-full border border-[#E5E2DC] text-[#666] font-medium">Agent Systems</span>
              </div>
              <span className="inline-block bg-amber text-white px-6 py-2.5 rounded-xl text-sm font-semibold group-hover:opacity-90 transition w-full">Talk to Kyle →</span>
            </Link>

            {/* Colin - featured center card */}
            <Link href="/mentors/colin-chapman" className="group flex flex-col items-center rounded-2xl border-2 border-amber/30 bg-white p-10 text-center shadow-sm hover:shadow-md hover:border-amber/50 transition relative">
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-amber text-white text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full">Available Now</span>
              <Image
                src="/mentors/colin-chapman.png"
                alt="Colin Chapman"
                width={160}
                height={160}
                className="w-20 h-20 rounded-full object-cover group-hover:opacity-90 transition mb-5"
              />
              <p className="text-xl font-bold text-[#1A1A1A] mb-0.5">Colin Chapman</p>
              <p className="text-xs font-semibold text-amber uppercase tracking-wider mb-3">B2B Sales & GTM</p>
              <p className="text-sm text-[#666] leading-relaxed mb-4">Helps first-time founders build repeatable sales processes from zero.</p>
              <p className="text-[12px] text-[#999] mb-5">26 yrs · IBM, Siemens, BMW · 4.92★ GrowthMentor</p>
              <div className="flex flex-wrap justify-center gap-2 mb-6">
                <span className="text-xs px-3 py-1.5 rounded-full border border-[#E5E2DC] text-[#666] font-medium">Cold Outreach</span>
                <span className="text-xs px-3 py-1.5 rounded-full border border-[#E5E2DC] text-[#666] font-medium">Discovery Calls</span>
                <span className="text-xs px-3 py-1.5 rounded-full border border-[#E5E2DC] text-[#666] font-medium">Pipeline</span>
                <span className="text-xs px-3 py-1.5 rounded-full border border-[#E5E2DC] text-[#666] font-medium">Objection Handling</span>
                <span className="text-xs px-3 py-1.5 rounded-full border border-[#E5E2DC] text-[#666] font-medium">Founder-Led Sales</span>
              </div>
              <span className="inline-block bg-amber text-white px-6 py-2.5 rounded-xl text-sm font-semibold group-hover:opacity-90 transition w-full">Talk to Colin →</span>
            </Link>

            {/* Leon Freier card - right */}
            <Link href="/mentors/leon-freier" className="hidden md:flex group flex-col items-center rounded-2xl border border-[#E5E2DC] bg-white p-10 text-center hover:border-amber/30 hover:shadow-md transition">
              <Image
                src="/mentors/leon-freier.png"
                alt="Leon Freier"
                width={160}
                height={160}
                className="w-20 h-20 rounded-full object-cover group-hover:opacity-90 transition mb-5"
              />
              <p className="text-xl font-bold text-[#1A1A1A] mb-0.5">Leon Freier</p>
              <p className="text-xs font-semibold text-amber uppercase tracking-wider mb-3">Luxury STR & Guest Experience</p>
              <p className="text-sm text-[#666] leading-relaxed mb-4">10 years building a luxury villa portfolio in Vietnam from scratch.</p>
              <p className="text-[12px] text-[#999] mb-5">350+ reviews · $20 to $1K+/night · Da Nang Beach Villas</p>
              <div className="flex flex-wrap justify-center gap-2 mb-6">
                <span className="text-xs px-3 py-1.5 rounded-full border border-[#E5E2DC] text-[#666] font-medium">Guest Experience</span>
                <span className="text-xs px-3 py-1.5 rounded-full border border-[#E5E2DC] text-[#666] font-medium">Property Evaluation</span>
                <span className="text-xs px-3 py-1.5 rounded-full border border-[#E5E2DC] text-[#666] font-medium">Revenue Optimization</span>
              </div>
              <span className="inline-block bg-amber text-white px-6 py-2.5 rounded-xl text-sm font-semibold group-hover:opacity-90 transition w-full">Talk to Leon →</span>
            </Link>

          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════
          FAQ
          ═══════════════════════════════════════════════ */}
      <section className="px-6 py-24">
        <div className="max-w-3xl mx-auto">
          <p className="text-sm font-semibold text-amber uppercase tracking-widest text-center mb-4">Questions</p>
          <h2 className="text-3xl md:text-4xl font-bold text-[#1A1A1A] text-center mb-12">Before you ask Colin, ask us.</h2>
          <div className="space-y-3">
            {[
              {
                q: "How is this different from ChatGPT with a persona?",
                a: "We extract actual frameworks and mental models from real experts through structured conversations, not just their bio. Each mentor thinks through problems using their specific methodology rather than generic AI responses."
              },
              {
                q: "Will the advice actually be relevant to my situation?",
                a: "The mentors are trained to diagnose before prescribing and ask follow-up questions about your context. They\u2019ll qualify your situation the same way the real expert would, rather than giving cookie-cutter advice."
              },
              {
                q: "What happens after my 5 free messages?",
                a: "You\u2019ll hit a signup gate where you create an account, then a paywall at $47/month for unlimited conversations across all mentors. No per-message charges or hidden fees."
              },
              {
                q: "How do I know these experts actually know what they\u2019re talking about?",
                a: "Every mentor page shows their real credentials and track record. We only work with people who have verifiable, measurable success in their domain."
              },
              {
                q: "What if the mentor doesn\u2019t understand my industry?",
                a: "The mentors will tell you when something is outside their expertise rather than fake it. They stay in their lane and redirect you when needed."
              },
              {
                q: "Can I trust this with sensitive business information?",
                a: "Each mentor understands business context and confidentiality. That said, don\u2019t share anything you wouldn\u2019t discuss with an external consultant."
              },
            ].map((faq) => (
              <FaqItem key={faq.q} q={faq.q} a={faq.a} />
            ))}
          </div>
        </div>
      </section>



    </div>
  );
}

/* ═══════════════════════════════════════════════
   HOW IT WORKS — scroll-driven component
   ═══════════════════════════════════════════════ */

/* FAQ accordion item */
function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div
      className="rounded-xl border border-[#E5E2DC] bg-white overflow-hidden transition-all"
    >
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-6 py-5 text-left"
      >
        <span className="text-[15px] font-semibold text-[#1A1A1A] pr-4">{q}</span>
        <IconChevronDown
          size={18}
          className={`text-[#999] flex-shrink-0 transition-transform duration-300 ${open ? "rotate-180" : ""}`}
          stroke={2}
        />
      </button>
      <div
        className={`px-6 overflow-hidden transition-all duration-300 ${
          open ? "pb-5 max-h-[200px] opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <p className="text-[14px] text-[#737373] leading-relaxed">{a}</p>
      </div>
    </div>
  );
}

/* Animated mockup components */

function Step1Mockup() {
  return (
    <div className="bg-white rounded-2xl shadow-lg border border-[#E5E2DC] p-6 w-full max-w-[340px]">
      <div className="flex items-center gap-3 mb-5">
        <div className="w-10 h-10 rounded-full bg-amber/20 flex items-center justify-center text-amber font-bold text-sm">C</div>
        <div>
          <p className="text-sm font-bold text-[#1A1A1A]">Colin Chapman</p>
          <p className="text-[11px] text-[#999]">B2B Sales & GTM</p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <div className="flex-1 h-11 rounded-xl border border-[#E5E2DC] bg-white px-4 flex items-center overflow-hidden">
          <span className="text-[13px] text-[#555] hiw-typing">
            My cold emails aren&apos;t getting replies
          </span>
        </div>
        <div className="w-10 h-10 rounded-xl bg-amber flex items-center justify-center text-white font-bold hiw-send-pulse">→</div>
      </div>
    </div>
  );
}

function Step2Mockup() {
  return (
    <div className="bg-white rounded-2xl shadow-lg border border-[#E5E2DC] p-6 w-full max-w-[340px]">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-full bg-amber/20 flex items-center justify-center text-amber font-bold text-sm">C</div>
        <div>
          <p className="text-sm font-bold text-[#1A1A1A]">Colin Chapman</p>
          <p className="text-[11px] text-[#999]">B2B Sales & GTM</p>
        </div>
      </div>
      <div className="space-y-3">
        <div className="bg-[#F8F7F4] rounded-xl px-4 py-3 text-right hiw-fade-in-1">
          <p className="text-[13px] text-[#555]">My cold emails aren&apos;t getting replies</p>
        </div>
        <div className="hiw-fade-in-2">
          <div className="flex items-start gap-2 mb-2">
            <div className="w-6 h-6 rounded-full bg-amber/20 flex-shrink-0 flex items-center justify-center text-amber font-bold text-[9px] mt-0.5">C</div>
            <div className="rounded-xl px-4 py-3 bg-amber/10 border border-amber/20 flex-1">
              <p className="text-[13px] text-[#1A1A1A] leading-relaxed hiw-reply-reveal">Before we fix the emails, let&apos;s check the fundamentals. Who exactly are you sending to, and what trigger event made you reach out to each one?</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Step3Mockup() {
  return (
    <div className="bg-white rounded-2xl shadow-lg border border-[#E5E2DC] p-6 w-full max-w-[340px]">
      {/* Header with session count */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-amber/20 flex items-center justify-center text-amber font-bold text-sm">C</div>
          <div>
            <p className="text-sm font-bold text-[#1A1A1A]">Colin Chapman</p>
            <p className="text-[11px] text-[#999]">B2B Sales & GTM</p>
          </div>
        </div>
        <div className="text-right hiw-fade-in-1">
          <p className="text-[10px] text-amber font-semibold">4 sessions</p>
          <p className="text-[10px] text-[#C5C0B8]">12 insights</p>
        </div>
      </div>

      {/* Time gap indicator */}
      <div className="flex items-center gap-2 mb-4 hiw-fade-in-1">
        <div className="flex-1 h-px bg-[#E5E2DC]" />
        <span className="text-[10px] text-[#C5C0B8] font-medium px-2">3 days later</span>
        <div className="flex-1 h-px bg-[#E5E2DC]" />
      </div>

      {/* Colin remembers */}
      <div className="space-y-3">
        <div className="hiw-fade-in-2">
          <div className="flex items-start gap-2">
            <div className="w-6 h-6 rounded-full bg-amber/20 flex-shrink-0 flex items-center justify-center text-amber font-bold text-[9px] mt-0.5">C</div>
            <div className="rounded-xl px-4 py-3 bg-amber/10 border border-amber/20 flex-1">
              <p className="text-[13px] text-[#1A1A1A] leading-relaxed">Last time we nailed your ICP and built the sequence. How did the first outbound batch go?</p>
            </div>
          </div>
        </div>

        {/* User typing */}
        <div className="hiw-fade-in-3">
          <div className="bg-[#F8F7F4] rounded-xl px-4 py-3 text-right">
            <span className="text-[13px] text-[#555] hiw-typing-short">Got 3 replies from 40 emails</span>
          </div>
        </div>
      </div>
    </div>
  );
}

const STEPS = [
  {
    num: "01",
    title: "Dump your real problem",
    desc: "Stop sugar-coating it. 'Pipeline's broken,' 'outbound isn't working,' 'we're bleeding cash.' The messier, the better.",
    bg: "#FAFAF8",
    accent: "#B8916A",
    icon: IconMessageCircle,
    mockup: <Step1Mockup />,
  },
  {
    num: "02",
    title: "Get battle-tested answers",
    desc: "No theory, no fluff. Just frameworks that actually worked when someone's livelihood was on the line.",
    bg: "#F3EDE6",
    accent: "#B8916A",
    icon: IconBulb,
    mockup: <Step2Mockup />,
  },
  {
    num: "03",
    title: "Walk away with a plan",
    desc: "Everything's saved so you can stop spinning your wheels and start executing. Come back when you hit the next wall.",
    bg: "#EDE5DA",
    accent: "#B8916A",
    icon: IconBookmark,
    mockup: <Step3Mockup />,
  },
];

function HowItWorks() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [activeStep, setActiveStep] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      if (!sectionRef.current) return;
      const section = sectionRef.current;
      const rect = section.getBoundingClientRect();
      const sectionHeight = section.offsetHeight;
      const viewportHeight = window.innerHeight;

      // Calculate progress through the section (0 to 1)
      const scrolled = -rect.top + viewportHeight * 0.4;
      const progress = Math.max(0, Math.min(1, scrolled / (sectionHeight - viewportHeight * 0.5)));

      const step = Math.min(2, Math.floor(progress * 3));
      setActiveStep(step);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const current = STEPS[activeStep];

  return (
    <section
      id="how-it-works"
      ref={sectionRef}
      className="relative transition-colors duration-700"
      style={{ background: current.bg }}
    >
      {/* Section header */}
      {/* Sticky container */}
      <div className="min-h-[200vh]">
        <div className="sticky top-0 min-h-screen flex flex-col justify-center">
          <div className="px-6 pt-8 pb-6">
            <p className="text-sm md:text-base font-semibold text-amber uppercase tracking-widest text-center">How It Works</p>
          </div>
          <div className="max-w-5xl mx-auto w-full px-6 grid md:grid-cols-2 gap-12 md:gap-20 items-center">
            {/* Left: Text steps */}
            <div className="space-y-16">
              {STEPS.map((step, i) => (
                <div
                  key={step.num}
                  className={`transition-all duration-500 ${
                    i === activeStep
                      ? "opacity-100 translate-y-0"
                      : i < activeStep
                      ? "opacity-20 -translate-y-4"
                      : "opacity-20 translate-y-4"
                  }`}
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors duration-500 ${
                      i === activeStep ? "bg-amber/15" : "bg-[#E5E2DC]/50"
                    }`}>
                      <step.icon size={20} className={`transition-colors duration-500 ${i === activeStep ? "text-amber" : "text-[#C5C0B8]"}`} stroke={1.5} />
                    </div>
                    <span className={`font-mono text-xs font-bold transition-colors duration-500 ${i === activeStep ? "text-amber" : "text-[#C5C0B8]"}`}>{step.num}</span>
                  </div>
                  <h3 className="text-2xl md:text-3xl font-bold text-[#1A1A1A] mb-3">{step.title}</h3>
                  <p className="text-[#737373] text-[16px] leading-relaxed max-w-[400px]">{step.desc}</p>
                </div>
              ))}
            </div>

            {/* Right: Mockup with amber blob */}
            <div className="hidden md:flex items-center justify-center relative">
              {/* Amber accent blob */}
              <div
                className="absolute w-[280px] h-[360px] rounded-[40px] transition-all duration-700"
                style={{
                  background: `linear-gradient(135deg, ${current.accent}40 0%, ${current.accent}20 100%)`,
                  transform: `rotate(${activeStep * 5 - 5}deg) translateY(${activeStep * 10}px)`,
                  right: '10%',
                }}
              />
              {/* Mockup card */}
              <div className="relative z-10 w-full min-h-[400px]">
                {STEPS.map((step, i) => (
                  <div
                    key={step.num}
                    className={`transition-all duration-500 absolute inset-0 flex items-center justify-center ${
                      i === activeStep ? "opacity-100 scale-100" : "opacity-0 scale-95 pointer-events-none"
                    }`}
                  >
                    {step.mockup}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
