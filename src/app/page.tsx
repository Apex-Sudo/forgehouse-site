"use client";
import Link from "next/link";
import InlineChat from "@/components/InlineChat";
import { ChatCircleDots, PlugsConnected } from "@phosphor-icons/react";

export default function Home() {
  return (
    <div className="pt-16">
      {/* Hero */}
      <section className="gradient-hero px-6 py-32 md:py-44 max-w-4xl mx-auto text-center">
        <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.08] mb-6">
          Expert knowledge{" "}
          <span className="text-amber">for your agent.</span>
        </h1>
        <p className="text-muted text-lg md:text-xl max-w-2xl mx-auto leading-relaxed">
          Plug in a module. Your agent knows sales.
        </p>
      </section>

      {/* Chat Demo */}
      <section className="px-6 pb-24">
        <div className="max-w-[840px] mx-auto">
          <InlineChat />
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
              <h3 className="text-lg font-bold mb-2">Chat on ForgeHouse</h3>
              <p className="text-muted text-sm leading-relaxed mb-5">Talk to Colin directly in your browser. Ask questions, get frameworks, save insights. Conversation history, saved takeaways, all built in.</p>
              <ul className="text-muted text-sm space-y-1 mb-5">
                <li className="flex items-center gap-2"><span className="text-amber text-xs">→</span> No setup required</li>
                <li className="flex items-center gap-2"><span className="text-amber text-xs">→</span> Conversation history across sessions</li>
                <li className="flex items-center gap-2"><span className="text-amber text-xs">→</span> Save key insights for later</li>
                <li className="flex items-center gap-2"><span className="text-amber text-xs">→</span> 5 free messages to try it</li>
              </ul>
              <p className="text-xs font-semibold text-amber uppercase tracking-wider">Best for: founders who want answers now</p>
            </div>
            <div className="glass-card p-8">
              <PlugsConnected size={28} weight="regular" className="text-amber mb-4" />
              <h3 className="text-lg font-bold mb-2">Connect via MCP or API</h3>
              <p className="text-muted text-sm leading-relaxed mb-5">Your agent talks to our modules directly. Add Colin as a skill to OpenClaw, Claude Code, Cursor, or any agent. Your agent gets sales expertise without you doing anything.</p>
              <ul className="text-muted text-sm space-y-1 mb-5">
                <li className="flex items-center gap-2"><span className="text-amber text-xs">→</span> 3 lines of config, that&apos;s it</li>
                <li className="flex items-center gap-2"><span className="text-amber text-xs">→</span> Multi-turn conversations, automatic</li>
                <li className="flex items-center gap-2"><span className="text-amber text-xs">→</span> Agent-to-agent, no human in the loop</li>
                <li className="flex items-center gap-2"><span className="text-amber text-xs">→</span> API key from your account page</li>
              </ul>
              <p className="text-xs font-semibold text-amber uppercase tracking-wider">Best for: builders who want their agent to be more effective</p>
            </div>
          </div>
        </div>
      </section>

      {/* Divider */}
      <div className="max-w-[600px] mx-auto h-px bg-gradient-to-r from-transparent via-amber/[0.12] to-transparent" />

      {/* MCP Code Block + one-liner */}
      <section className="px-6 py-24">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold mb-12 text-center">You just add it. That&apos;s it.</h2>
          <div className="max-w-[680px] mx-auto mb-6">
            <div className="glass-card p-6 overflow-x-auto">
              <pre className="font-mono text-sm leading-7 text-muted">
<span className="text-muted/50">{"// Add to your agent's MCP config"}</span>{"\n"}
{"{"}{"\n"}
{"  "}<span className="text-amber">&quot;mcpServers&quot;</span>: {"{"}{"\n"}
{"    "}<span className="text-amber">&quot;forgehouse&quot;</span>: {"{"}{"\n"}
{"      "}<span className="text-amber">&quot;command&quot;</span>: <span className="text-green-400">&quot;npx&quot;</span>,{"\n"}
{"      "}<span className="text-amber">&quot;args&quot;</span>: [<span className="text-green-400">&quot;-y&quot;</span>, <span className="text-green-400">&quot;@forgehouseio/mcp-server&quot;</span>],{"\n"}
{"      "}<span className="text-amber">&quot;env&quot;</span>: {"{"}{"\n"}
{"        "}<span className="text-amber">&quot;FORGEHOUSE_API_KEY&quot;</span>: <span className="text-green-400">&quot;fh_your_key&quot;</span>{"\n"}
{"      }"}{"\n"}
{"    }"}{"\n"}
{"  }"}{"\n"}
{"}"}
              </pre>
            </div>
          </div>
          <p className="text-center text-sm text-muted">Works with OpenClaw, Claude Code, Cursor, and any MCP-compatible agent.</p>
        </div>
      </section>

      {/* Divider */}
      <div className="max-w-[600px] mx-auto h-px bg-gradient-to-r from-transparent via-amber/[0.12] to-transparent" />

      {/* Testimonials */}
      <section className="px-6 py-24">
        <div className="max-w-5xl mx-auto">
          <div className="grid md:grid-cols-2 gap-5">
            <div className="glass-card p-8 flex flex-col justify-between">
              <p className="text-[15px] text-muted leading-relaxed italic mb-6">&ldquo;I just add it and boom, my agent has the sales stuff. It&apos;s a shortcut to knowledge I&apos;d spend months acquiring. Everyone is trying to reduce work, and this does exactly that.&rdquo;</p>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-[10px] bg-amber text-background flex items-center justify-center font-bold text-sm">R</div>
                <div>
                  <p className="text-sm font-semibold">Richard O.</p>
                  <p className="text-xs text-muted">Founder, Fugoku</p>
                </div>
              </div>
            </div>
            <div className="glass-card p-8 flex flex-col justify-between">
              <p className="text-[15px] text-muted leading-relaxed italic mb-6">&ldquo;26 years of sales expertise, fully integrated into my agent&apos;s workflow with one click. I stopped reading sales books. Colin handles it.&rdquo;</p>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-[10px] bg-amber text-background flex items-center justify-center font-bold text-sm">L</div>
                <div>
                  <p className="text-sm font-semibold">Leon F.</p>
                  <p className="text-xs text-muted">Founder, ApexAlpha (& ForgeHouse)</p>
                </div>
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
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Make your agent more effective.</h2>
          <p className="text-muted text-lg mb-8 max-w-xl mx-auto">
            Reduce the work. Not the expertise.
          </p>
          <Link href="/pricing" className="bg-amber text-white px-8 py-3.5 rounded-xl font-semibold hover:bg-amber-dark transition inline-block">
            Get Started — $48/mo →
          </Link>
        </div>
      </section>
    </div>
  );
}
