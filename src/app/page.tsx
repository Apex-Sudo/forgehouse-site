"use client";
import Link from "next/link";
import InlineChat from "@/components/InlineChat";
import Image from "next/image";
import { ChatCircleDots, PlugsConnected } from "@phosphor-icons/react";

export default function Home() {
  return (
    <div className="pt-16">
      {/* Hero: Chat first */}
      <section className="px-6 pt-20 md:pt-28 pb-6">
        <div className="max-w-[840px] mx-auto mb-10">
          <InlineChat />
        </div>
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold tracking-tight leading-[1.08] mb-4">
            Talk to a sales expert.{" "}
            <span className="text-amber">Right now.</span>
          </h1>
          <p className="text-muted text-lg md:text-xl max-w-2xl mx-auto leading-relaxed">
            26 years of B2B sales expertise, distilled into an AI agent. Ask anything.
          </p>
        </div>
      </section>

      {/* Divider */}
      <div className="max-w-[600px] mx-auto h-px bg-gradient-to-r from-transparent via-amber/[0.12] to-transparent" />

      {/* What ForgeHouse does */}
      <section className="px-6 py-24">
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-xs font-semibold text-amber uppercase tracking-widest mb-3">How it works</p>
          <h2 className="text-2xl md:text-3xl font-bold mb-6">Real mentors. Not a chatbot.</h2>
          <p className="text-muted text-[16px] md:text-lg leading-relaxed max-w-2xl mx-auto mb-8">
            Colin Chapman has spent 26 years closing B2B deals, training sales teams, and building outbound systems for companies like IBM, Siemens, and BMW. He&apos;s a 4.92-rated mentor on GrowthMentor. We extracted everything he knows so you can get his advice anytime, or plug it directly into your workflow.
          </p>
          <Link href="/mentors/colin-chapman" className="text-amber text-[15px] hover:text-foreground transition">
            Learn more about Colin &rarr;
          </Link>
        </div>
      </section>

      {/* Divider */}
      <div className="max-w-[600px] mx-auto h-px bg-gradient-to-r from-transparent via-amber/[0.12] to-transparent" />

      {/* Two ways to use it */}
      <section className="px-6 py-24">
        <div className="max-w-5xl mx-auto">
          <p className="text-xs font-semibold text-amber uppercase tracking-widest text-center mb-3">Two ways to use it</p>
          <h2 className="text-2xl md:text-3xl font-bold mb-12 text-center">Use it yourself. Or let your agent.</h2>
          <div className="grid md:grid-cols-2 gap-5">
            <div className="glass-card p-8">
              <ChatCircleDots size={28} weight="regular" className="text-amber mb-4" />
              <h3 className="text-lg font-bold mb-2">Talk to Colin&apos;s agent</h3>
              <p className="text-muted text-[15px] leading-relaxed mb-5">Ask questions, get actionable advice, save insights. It&apos;s a conversation, not a course. Your history and takeaways are saved automatically.</p>
              <ul className="text-muted text-[15px] space-y-1.5 mb-5">
                <li className="flex items-center gap-2"><span className="text-amber text-xs">→</span> No setup required</li>
                <li className="flex items-center gap-2"><span className="text-amber text-xs">→</span> Conversation history across sessions</li>
                <li className="flex items-center gap-2"><span className="text-amber text-xs">→</span> Save key insights for later</li>
                <li className="flex items-center gap-2"><span className="text-amber text-xs">→</span> 5 free messages to try it</li>
              </ul>
              <p className="text-xs font-semibold text-amber uppercase tracking-wider mb-5">Best for: founders who want answers now</p>
              <Link href="/chat/colin-chapman" className="bg-amber text-background px-5 py-2.5 rounded-lg font-semibold text-sm hover:bg-amber-dark transition inline-block">Try it free →</Link>
            </div>
            <div className="glass-card p-8">
              <PlugsConnected size={28} weight="regular" className="text-amber mb-4" />
              <h3 className="text-lg font-bold mb-2">Add it to your AI tools</h3>
              <p className="text-muted text-[15px] leading-relaxed mb-5">Already using Claude, Cursor, or another AI assistant? Add Colin&apos;s expertise directly. Your tools get sales knowledge without you doing anything.</p>
              <ul className="text-muted text-[15px] space-y-1.5 mb-5">
                <li className="flex items-center gap-2"><span className="text-amber text-xs">→</span> 3 lines of config, that&apos;s it</li>
                <li className="flex items-center gap-2"><span className="text-amber text-xs">→</span> Ongoing conversations, fully automatic</li>
                <li className="flex items-center gap-2"><span className="text-amber text-xs">→</span> Works in the background, no extra effort</li>
                <li className="flex items-center gap-2"><span className="text-amber text-xs">→</span> API key from your account page</li>
              </ul>
              <p className="text-xs font-semibold text-amber uppercase tracking-wider mb-5">Best for: founders already using AI tools daily</p>
              <Link href="/account" className="bg-amber text-background px-5 py-2.5 rounded-lg font-semibold text-sm hover:bg-amber-dark transition inline-block">Get API key →</Link>
            </div>
          </div>
        </div>
      </section>

      {/* Divider */}
      <div className="max-w-[600px] mx-auto h-px bg-gradient-to-r from-transparent via-amber/[0.12] to-transparent" />

      {/* Testimonials */}
      <section className="px-6 py-24">
        <div className="max-w-3xl mx-auto space-y-16">
          <div className="text-center">
            <p className="text-lg md:text-xl text-muted/90 leading-relaxed italic mb-6">&ldquo;I just add it and boom, my agent has the sales stuff. It&apos;s a shortcut to knowledge I&apos;d spend months acquiring. Everyone is trying to reduce work, and this does exactly that.&rdquo;</p>
            <div className="flex items-center justify-center gap-3">
              <div className="w-9 h-9 rounded-[10px] bg-amber text-background flex items-center justify-center font-bold text-sm">R</div>
              <div className="text-left">
                <p className="text-sm font-semibold">Richard Okonicha</p>
                <p className="text-xs text-muted">Founder, Fugoku</p>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* Divider */}
      <div className="max-w-[600px] mx-auto h-px bg-gradient-to-r from-transparent via-amber/[0.12] to-transparent" />

      {/* CTA */}
      <section className="px-6 py-24">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Get expert advice whenever you need it.</h2>
          <p className="text-muted text-lg mb-8 max-w-xl mx-auto">
            No scheduling. No hourly rates. Just answers.
          </p>
          <Link href="/chat/colin-chapman" className="bg-amber text-white px-8 py-3.5 rounded-xl font-semibold hover:bg-amber-dark transition inline-block">
            Talk to Colin — free to try →
          </Link>
        </div>
      </section>
    </div>
  );
}
