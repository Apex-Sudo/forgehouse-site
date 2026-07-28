"use client";

import Link from "next/link";
import { IconTarget, IconFlame, IconActivityHeartbeat, IconCalendarWeek } from "@tabler/icons-react";

const tools = [
  {
    icon: IconTarget,
    title: "ICP Diagnostic",
    description: "Define your ideal customer profile in 60 seconds using the Jobs-to-be-Done framework.",
    framework: "Colin’s JTBD and ICP qualification methodology",
    href: "/tools/icp-diagnostic",
    time: "60 seconds",
  },
  {
    icon: IconFlame,
    title: "Cold Email Teardown",
    description: "Get your cold email torn apart line by line and rewritten using Problem-Impact-Proof.",
    framework: "Colin’s Problem-Impact-Proof messaging framework",
    href: "/tools/cold-email-teardown",
    time: "30 seconds",
  },
  {
    icon: IconActivityHeartbeat,
    title: "Pipeline Diagnosis",
    description: "Describe your last 3 lost deals. Find the pattern and the one fix that saves the most revenue.",
    framework: "Colin’s deal autopsy and pipeline pattern analysis",
    href: "/tools/pipeline-diagnosis",
    time: "3 minutes",
  },
  {
    icon: IconCalendarWeek,
    title: "Outbound Week Planner",
    description: "Get a concrete Mon-Fri outbound plan with daily tasks, email templates, and targets.",
    framework: "Colin’s outbound execution structure for founder-led sales",
    href: "/tools/outbound-planner",
    time: "60 seconds",
  },
];

export default function ToolsPage() {
  return (
    <div className="pt-16 md:pt-[72px]">
      <section className="px-6 pt-14 md:pt-20 pb-16">
        <div className="max-w-[1008px] mx-auto">
          <p className="mono text-[13px] text-accent mb-4">Built on Colin</p>
          <h1 className="text-[56px] md:text-[80px] leading-[0.92] tracking-[-0.02em] max-w-[820px]">
            Colin’s Free Sales Tools
          </h1>
          <p className="mt-5 text-[17px] leading-[1.5] text-muted max-w-[560px]">
            Each tool is a focused interface to Colin Chapman’s GTM framework. Use a tool for a fast
            answer, then continue with Colin for full context and strategy.
          </p>

          <p className="mono text-[11px] tracking-[0.06em] uppercase text-faint mt-14 mb-5">
            Built on Colin’s methodology
          </p>

          <div className="grid md:grid-cols-2 gap-[30px]">
            {tools.map((tool) => (
              <Link
                key={tool.href}
                href={tool.href}
                className="group bg-surface border border-border rounded-lg p-7 flex flex-col hover:border-accent/25 transition"
              >
                <div className="flex items-center justify-between gap-4">
                  <div className="bg-accent/10 border border-accent/25 rounded-md p-2.5">
                    <tool.icon size={22} className="text-accent" />
                  </div>
                  <span className="mono text-[11px] tracking-[0.06em] uppercase text-muted">
                    {tool.time}
                  </span>
                </div>

                <h2 className="mt-6 text-[26px] leading-[1.1] group-hover:text-accent transition">
                  {tool.title}
                </h2>

                <p className="mt-3 text-[16px] leading-[1.5] text-muted">{tool.description}</p>

                <p className="mono text-[11px] tracking-[0.04em] text-faint mt-4 mb-8">
                  Powered by {tool.framework}
                </p>

                <div className="mt-auto">
                  <div className="clip-corner mono flex items-center justify-between gap-3 w-full px-5 py-3.5 text-[12px] tracking-[0.02em] bg-paper text-[#1B1B18] transition group-hover:bg-white">
                    <span>Need deeper diagnosis? Continue with Colin</span>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
                      <path d="M9 6l6 6-6 6" />
                    </svg>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          <p className="mono text-[11px] tracking-[0.06em] uppercase text-faint mt-12">
            More tools coming. Each built on a specific expert&apos;s methodology.
          </p>
        </div>
      </section>
    </div>
  );
}
