"use client";
import { useState } from "react";
import Image from "next/image";
import { IconArrowRight, IconMicrophone, IconEyeCheck, IconShare, IconCash, IconCpu, IconCode, IconHeadset, IconReceipt } from "@tabler/icons-react";

// export const metadata moved to layout.tsx (can't use in client component)

const steps = [
  { num: "01", title: "You teach.", desc: "Few conversations, nothing formal. Share how you approach problems, what you've learned. We're listening for your frameworks, not taking notes.", icon: IconMicrophone },
  { num: "02", title: "We translate.", desc: "Your expertise becomes something that scales. We build it, you test it, we refine it until it sounds like you would handle the conversation.", icon: IconCode },
  { num: "03", title: "You scale.", desc: "Founders get your thinking when they need it. You get inquiries from people who've already experienced your approach and want the real thing.", icon: IconShare },
];

function RevenueCalculator() {
  const [price, setPrice] = useState(150);
  const mentorCut = 0.75;
  const scenarios = [
    { count: 10, label: "Starting" },
    { count: 25, label: "Growing" },
    { count: 50, label: "Established" },
  ];

  return (
    <div>
      <div className="mentors-card-elevated p-8 md:p-10 flex flex-col items-center gap-4 mb-14 max-w-md mx-auto">
        <label className="mono text-[11px] tracking-[0.06em] uppercase text-muted">What would you charge per month?</label>
        <div className="flex items-baseline gap-2">
          <span className="mono text-[26px] text-muted">$</span>
          <input
            type="number"
            value={price}
            onChange={(e) => setPrice(Math.max(0, parseInt(e.target.value) || 0))}
            className="mono text-[44px] bg-transparent border-b border-border-light focus:border-accent outline-none w-44 text-center text-foreground transition"
          />
          <span className="mono text-[13px] text-muted">/mo</span>
        </div>
        <p className="mono text-[11px] tracking-[0.06em] uppercase text-faint mt-1">You keep 75%.</p>
      </div>

      <div className="grid sm:grid-cols-3 gap-[30px] text-center items-end">
        {scenarios.map(({ count, label }, i) => {
          const monthly = Math.round(price * mentorCut * count);
          const isLast = i === 2;
          const isMiddle = i === 1;
          return (
            <div
              key={count}
              className={`mentors-card-elevated text-center transition-all ${
                isLast ? "p-9" : isMiddle ? "p-8" : "p-7 opacity-80"
              }`}
              style={isLast ? { borderColor: "rgba(202, 237, 87, 0.35)" } : undefined}
            >
              <p className="mono text-[11px] tracking-[0.06em] uppercase text-faint mb-3">{label}</p>
              <p className="mono text-[20px] text-accent mb-1">{count}</p>
              <p className="mono text-[11px] tracking-[0.06em] uppercase text-faint mb-5">subscribers</p>
              <p className={`leading-[0.92] tracking-[-0.015em] text-foreground mb-1 ${isLast ? "text-[56px]" : isMiddle ? "text-[46px]" : "text-[38px]"}`}>
                ${monthly.toLocaleString()}
              </p>
              <p className="mono text-[11px] tracking-[0.06em] uppercase text-faint mt-2">/month to you</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function ForMentorsPage() {
  return (
    <div className="mentors-light pt-16 md:pt-[72px]">
      {/* ═══════════════════════════════════════════
          1. HERO
          ═══════════════════════════════════════════ */}
      <section className="mentors-hero px-6 pt-20 md:pt-28 pb-16 md:pb-24">
        <div className="max-w-[1008px] mx-auto">
          <p className="mono text-[13px] tracking-[0.06em] uppercase text-accent mb-5">The Opportunity</p>
          <h1 className="text-[48px] md:text-[68px] lg:text-[80px] leading-[0.92] tracking-[-0.015em] max-w-[900px]">
            A generation that won&apos;t book a call{" "}
            <span className="mentors-accent">still needs your expertise.</span>
          </h1>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          2. THE DATA — Gen Z stats
          ═══════════════════════════════════════════ */}
      <section className="mentors-cream-section px-6 py-20 md:py-24">
        <div className="max-w-[1008px] mx-auto">
          <p className="mono text-[13px] tracking-[0.06em] uppercase text-accent mb-10">The Data</p>

          <div className="grid md:grid-cols-2 gap-[30px]">
            <div>
              <p className="text-[52px] md:text-[64px] leading-[0.92] tracking-[-0.015em] text-accent">9 out of 10</p>
              <p className="mt-4 text-[17px] leading-[1.5] text-muted max-w-[380px]">
                Gen Zers would rather text than pick up the phone.
              </p>
              <p className="mono text-[11px] tracking-[0.06em] uppercase text-faint mt-4">(CommBank, 2023)</p>
            </div>
            <div>
              <p className="text-[52px] md:text-[64px] leading-[0.92] tracking-[-0.015em] text-accent">70%</p>
              <p className="mt-4 text-[17px] leading-[1.5] text-muted max-w-[380px]">
                of 18-34 year olds prefer text over calls. 23% never answer their phone at all.
              </p>
              <p className="mono text-[11px] tracking-[0.06em] uppercase text-faint mt-4">(BBC/Uswitch, 2024)</p>
            </div>
          </div>

          <p className="mt-14 text-[24px] md:text-[30px] leading-[1.25] tracking-[-0.01em] max-w-[760px] text-foreground">
            This is the generation starting companies right now. They need mentorship. They{" "}
            <span className="mentors-accent">won&apos;t book a Calendly link</span> to get it.
          </p>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          3. HOW IT WORKS
          ═══════════════════════════════════════════ */}
      <section className="px-6 py-20 md:py-24">
        <div className="max-w-[1008px] mx-auto">
          <h2 className="text-[44px] md:text-[56px] leading-[0.92] tracking-[-0.015em] mb-14 max-w-[720px]">
            Here&apos;s what we do together.
          </h2>
          <div className="grid md:grid-cols-3 gap-x-16 gap-y-12">
            {steps.map((s) => (
              <div key={s.num}>
                <s.icon size={24} className="mentors-icon mb-5" stroke={1.5} />
                <p className="mono text-[22px] text-accent mb-3">{s.num}</p>
                <h3 className="text-[28px] mb-3">{s.title}</h3>
                <p className="text-[16px] leading-[1.45] text-muted max-w-[380px]">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* IP protection inline */}
      <section className="px-6 pb-16 md:pb-20">
        <div className="max-w-[1008px] mx-auto">
          <p className="text-[17px] leading-[1.6] text-muted max-w-[720px]">
            Your frameworks stay yours. We license, never own. You can pull your agent anytime.{" "}
            <strong className="text-foreground">Delaware LLC. Formal contract.</strong>
          </p>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          4. COLIN TESTIMONIAL
          ═══════════════════════════════════════════ */}
      <section className="mentors-dark-section sparkle-field px-6 py-24 md:py-32">
        <div className="max-w-[820px] mx-auto">
          <div className="text-center mb-8">
            <span className="mentors-accent text-[64px] leading-none">&ldquo;</span>
          </div>
          <p className="text-[24px] md:text-[32px] leading-[1.25] tracking-[-0.01em] text-center text-foreground mb-4">
            It forced me to articulate things I&apos;d been doing on autopilot for decades, and{" "}
            <span className="mentors-accent">the output captured my thinking better than I anticipated</span>.
          </p>
          <p className="text-[24px] md:text-[32px] leading-[1.25] tracking-[-0.01em] text-center text-foreground mb-12">
            I&apos;m happy to put my name on it.
          </p>
          <div className="flex items-center justify-center gap-3">
            <Image src="/mentors/colin-chapman.png" alt="Colin Chapman" width={48} height={48} className="w-12 h-12 rounded-full object-cover" />
            <div>
              <p className="mono text-[12px] tracking-[0.04em] text-foreground">Colin Chapman</p>
              <p className="mono text-[11px] tracking-[0.04em] text-faint mt-1">GTM &amp; Outbound Sales · 26 years · First ForgeHouse Mentor</p>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          5. YOUR PART / OUR PART
          ═══════════════════════════════════════════ */}
      <section className="px-6 py-20 md:py-24">
        <div className="max-w-[1008px] mx-auto">
          <h2 className="text-[44px] md:text-[56px] leading-[0.92] tracking-[-0.015em] mb-12">
            Collaborative Partnership
          </h2>
          <div className="grid md:grid-cols-2 gap-0 rounded-lg overflow-hidden border border-border">
            {/* Your part — paper */}
            <div className="bg-paper text-[#1B1B18] p-9 md:p-10">
              <h3 className="text-[28px] mb-8 text-[#1B1B18]">You</h3>
              <ul className="space-y-5">
                {[
                  { icon: IconMicrophone, text: "A few conversations" },
                  { icon: IconEyeCheck, text: "Review until it feels right" },
                  { icon: IconShare, text: "Share when you're ready" },
                  { icon: IconCash, text: "Collect checks", accent: true },
                ].map((item) => (
                  <li key={item.text} className="flex items-start gap-4">
                    <item.icon size={18} className="shrink-0 mt-1 text-[#1B1B18]" stroke={1.5} />
                    {item.accent ? (
                      <span className="text-[16px] leading-[1.45] bg-accent text-[#1B1B18] px-1.5">{item.text}</span>
                    ) : (
                      <span className="text-[16px] leading-[1.45] text-[#38352F]">{item.text}</span>
                    )}
                  </li>
                ))}
              </ul>
            </div>
            {/* Our part — surface */}
            <div className="bg-surface p-9 md:p-10 border-t border-border md:border-t-0 md:border-l">
              <h3 className="text-[28px] mb-8 text-paper">We</h3>
              <ul className="space-y-5">
                {[
                  { icon: IconCpu, text: "Build the agent" },
                  { icon: IconCode, text: "Handle all tech" },
                  { icon: IconHeadset, text: "Support subscribers" },
                  { icon: IconReceipt, text: "Manage billing & admin" },
                ].map((item) => (
                  <li key={item.text} className="flex items-start gap-4">
                    <item.icon size={18} className="mentors-check mt-1" stroke={1.5} />
                    <span className="text-[16px] leading-[1.45] text-muted">{item.text}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          6. THE MATH — interactive calculator
          ═══════════════════════════════════════════ */}
      <section className="mentors-cream-section px-6 py-20 md:py-24">
        <div className="max-w-[1008px] mx-auto">
          <h2 className="text-[44px] md:text-[56px] leading-[0.92] tracking-[-0.015em] mb-5">The math</h2>
          <p className="text-[17px] leading-[1.5] text-muted max-w-[560px] mb-14">
            You set your own monthly subscription fee. Founders pay to access your expertise. You keep 75%.
          </p>
          <RevenueCalculator />
        </div>
      </section>

      {/* 75% / 100% callouts */}
      <section className="px-6 py-16 md:py-20">
        <div className="max-w-[1008px] mx-auto grid md:grid-cols-2 gap-[30px]">
          <p className="text-[17px] leading-[1.6] text-muted">
            <span className="mentors-accent">75% revenue</span> is yours. You set the price. We handle billing, tech, and support.
          </p>
          <p className="text-[17px] leading-[1.6] text-muted">
            <span className="mentors-accent">100% IP</span> stays yours. Full ownership. Pull your agent anytime. No lock-in.
          </p>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          7. CUSTOMER PROOF
          ═══════════════════════════════════════════ */}
      <section className="mentors-dark-section px-6 py-20 md:py-24">
        <div className="max-w-[820px] mx-auto text-center">
          <p className="text-[24px] md:text-[30px] leading-[1.3] tracking-[-0.01em] text-foreground mb-5">
            &ldquo;I prefer the agent. It&apos;s a shortcut to the knowledge I need, available when I need it.&rdquo;
          </p>
          <p className="mono text-[12px] tracking-[0.04em] text-faint">
            When offered direct access to the human mentor behind the agent, he declined.
          </p>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          8. CTA — lime band
          ═══════════════════════════════════════════ */}
      <section className="px-6 py-20 md:py-24 pb-28 md:pb-32">
        <div className="max-w-[1008px] mx-auto">
          <div className="mentors-cta-card px-8 md:px-12 py-14 md:py-16 text-center">
            <h2 className="text-[40px] md:text-[52px] leading-[0.92] tracking-[-0.015em] mb-5 text-[#1B1B18]">
              Ready to start?
            </h2>
            <p className="text-[17px] leading-[1.5] mentors-muted max-w-[540px] mx-auto mb-4">
              Book a quick call. We&apos;ll map your expertise, set your boundaries, and get your agent live within the week.
            </p>
            <p className="mono text-[11px] tracking-[0.06em] uppercase mentors-faint mb-10">
              Your frameworks, your rules. Walk away anytime.
            </p>
            <a
              href="https://calendly.com/leon-apexalpha/27min"
              target="_blank"
              rel="noopener noreferrer"
              className="mentors-cta mono inline-flex items-center gap-3 px-8 py-3.5 text-[12px] tracking-[0.08em] transition"
            >
              Book a Call <IconArrowRight size={16} stroke={1.5} />
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
