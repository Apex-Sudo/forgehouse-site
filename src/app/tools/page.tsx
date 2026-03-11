"use client";

import Link from "next/link";
import { IconTarget, IconFlame, IconActivityHeartbeat, IconCalendarWeek } from "@tabler/icons-react";

const tools = [
  {
    icon: IconTarget,
    title: "ICP Diagnostic",
    description: "Define your ideal customer profile in 60 seconds using the Jobs-to-be-Done framework.",
    href: "/tools/icp-diagnostic",
    time: "60 seconds",
  },
  {
    icon: IconFlame,
    title: "Cold Email Teardown",
    description: "Get your cold email torn apart line by line and rewritten using Problem-Impact-Proof.",
    href: "/tools/cold-email-teardown",
    time: "30 seconds",
  },
  {
    icon: IconActivityHeartbeat,
    title: "Pipeline Diagnosis",
    description: "Describe your last 3 lost deals. Find the pattern and the one fix that saves the most revenue.",
    href: "/tools/pipeline-diagnosis",
    time: "3 minutes",
  },
  {
    icon: IconCalendarWeek,
    title: "Outbound Week Planner",
    description: "Get a concrete Mon-Fri outbound plan with daily tasks, email templates, and targets.",
    href: "/tools/outbound-planner",
    time: "60 seconds",
  },
];

export default function ToolsPage() {
  return (
    <div className="pt-24 pb-16 px-6">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-14">
          <p className="text-amber text-sm font-medium uppercase tracking-wider mb-3">Free Tools</p>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-3">Sales Tools</h1>
          <p className="text-muted max-w-lg mx-auto">
            Built on real expert frameworks. Free, no login, instant output.
          </p>
        </div>

        <div className="grid gap-4">
          {tools.map((tool) => (
            <Link
              key={tool.href}
              href={tool.href}
              className="glass-card p-6 flex items-start gap-5 hover:border-amber/20 transition group"
            >
              <div className="p-3 rounded-xl bg-amber/10 border border-amber/20 shrink-0">
                <tool.icon size={22} className="text-amber" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-1.5">
                  <h2 className="text-lg font-semibold group-hover:text-amber transition">{tool.title}</h2>
                  <span className="text-xs text-muted/60 bg-white/[0.04] px-2 py-0.5 rounded-md">{tool.time}</span>
                </div>
                <p className="text-muted text-sm">{tool.description}</p>
              </div>
            </Link>
          ))}
        </div>

        <p className="text-center text-muted/40 text-xs mt-10">
          More tools coming. Each built on a specific expert&apos;s methodology.
        </p>
      </div>
    </div>
  );
}
