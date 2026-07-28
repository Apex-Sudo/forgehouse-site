"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import {
  IconCalendarWeek,
  IconCheck,
  IconCopy,
  IconLoader2,
  IconMail,
  IconChartBar,
} from "@tabler/icons-react";

interface Task {
  time: string;
  action: string;
  why: string;
}

interface Day {
  day: string;
  theme: string;
  tasks: Task[];
}

interface PlanResult {
  weekSummary: {
    focus: string;
    targetOutcomes: string;
  };
  days: Day[];
  templates: {
    coldOutreach: string;
    followUp: string;
    breakup: string;
  };
  metrics: {
    dailyTargets: {
      newOutreach: number;
      followUps: number;
      linkedinEngagements: number;
    };
    weeklyTargets: {
      conversationsStarted: number;
      meetingsBooked: number;
      pipelineAdded: number;
    };
  };
}

const dayColors: Record<string, string> = {
  Monday: "border-l-accent/30",
  Tuesday: "border-l-accent/30",
  Wednesday: "border-l-accent/30",
  Thursday: "border-l-accent/30",
  Friday: "border-l-accent/70",
};

function ResultView({ result, onStartOver }: { result: PlanResult; onStartOver: () => void }) {
  const [copied, setCopied] = useState(false);
  const [copiedTemplate, setCopiedTemplate] = useState<string | null>(null);

  const toText = useCallback(() => {
    const r = result;
    let text = `OUTBOUND WEEK PLAN\n==================\n\nFOCUS: ${r.weekSummary.focus}\nTARGET: ${r.weekSummary.targetOutcomes}\n\n`;
    r.days.forEach((d) => {
      text += `${d.day.toUpperCase()} (${d.theme})\n`;
      d.tasks.forEach((t) => {
        text += `  [${t.time}] ${t.action}\n`;
      });
      text += "\n";
    });
    text += `TEMPLATES\n---------\nCold Outreach:\n${r.templates.coldOutreach}\n\nFollow-Up:\n${r.templates.followUp}\n\nBreakup:\n${r.templates.breakup}\n\n`;
    text += `DAILY TARGETS: ${r.metrics.dailyTargets.newOutreach} new outreach, ${r.metrics.dailyTargets.followUps} follow-ups, ${r.metrics.dailyTargets.linkedinEngagements} LinkedIn engagements\n`;
    text += `WEEKLY TARGETS: ${r.metrics.weeklyTargets.conversationsStarted} conversations, ${r.metrics.weeklyTargets.meetingsBooked} meetings, ${r.metrics.weeklyTargets.pipelineAdded} pipeline added\n\n`;
    text += `---\nBuilt on Colin Chapman's sales methodology | forgehouse.io`;
    return text;
  }, [result]);

  const handleCopy = () => {
    navigator.clipboard.writeText(toText());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    if (typeof window !== "undefined" && (window as any).posthog) {
      (window as any).posthog.capture("tool_result_copied", { tool: "outbound-planner" });
    }
  };

  const copyTemplate = (key: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedTemplate(key);
    setTimeout(() => setCopiedTemplate(null), 2000);
  };

  return (
    <div className="space-y-[30px] animate-in fade-in duration-500">
      {/* Week Summary */}
      <div className="bg-surface border border-border rounded-lg p-6 md:p-7">
        <p className="mono text-[11px] tracking-[0.06em] uppercase text-accent mb-3">
          This Week&apos;s Focus
        </p>
        <p className="text-[26px] leading-[1.1] text-foreground mb-3">{result.weekSummary.focus}</p>
        <p className="text-[16px] leading-[1.6] text-muted">{result.weekSummary.targetOutcomes}</p>
      </div>

      {/* Copy all */}
      <div className="flex justify-end">
        <button
          onClick={handleCopy}
          className="mono inline-flex items-center gap-2 text-[12px] tracking-[0.02em] text-muted hover:text-accent transition"
        >
          {copied ? <IconCheck size={14} className="text-accent" /> : <IconCopy size={14} />}
          {copied ? "Copied" : "Copy full plan"}
        </button>
      </div>

      {/* Daily Plans */}
      {result.days.map((day, i) => (
        <div
          key={i}
          className={`bg-surface border border-border rounded-lg p-6 border-l-2 ${dayColors[day.day] || "border-l-accent/30"}`}
        >
          <div className="mb-6">
            <h3 className="mono text-[11px] tracking-[0.06em] uppercase text-accent">{day.day}</h3>
            <p className="text-[22px] leading-[1.15] text-foreground mt-2">{day.theme}</p>
          </div>
          <div className="space-y-6">
            {day.tasks.map((task, j) => (
              <div key={j}>
                <p className="mono text-[11px] tracking-[0.06em] uppercase text-muted mb-1.5">
                  {task.time}
                </p>
                <p className="text-[20px] leading-[1.25] text-foreground">{task.action}</p>
                <p className="mt-1.5 text-[16px] leading-[1.55] text-muted">{task.why}</p>
              </div>
            ))}
          </div>
        </div>
      ))}

      {/* Templates */}
      <div className="bg-surface border border-border rounded-lg p-6 md:p-7">
        <div className="flex items-center gap-3 mb-6">
          <IconMail size={18} className="text-accent" />
          <h3 className="text-[26px] leading-[1.1] text-foreground">Ready-to-Use Templates</h3>
        </div>
        <div className="space-y-7">
          {([
            { key: "coldOutreach", label: "Cold Outreach", text: result.templates.coldOutreach },
            { key: "followUp", label: "Follow-Up (Day 3-4)", text: result.templates.followUp },
            { key: "breakup", label: "Breakup (End of Week)", text: result.templates.breakup },
          ] as const).map((tpl) => (
            <div key={tpl.key}>
              <div className="flex items-center justify-between mb-2">
                <span className="mono text-[11px] tracking-[0.06em] uppercase text-accent">
                  {tpl.label}
                </span>
                <button
                  onClick={() => copyTemplate(tpl.key, tpl.text)}
                  className="mono text-[12px] tracking-[0.02em] text-muted hover:text-accent transition"
                >
                  {copiedTemplate === tpl.key ? "Copied" : "Copy"}
                </button>
              </div>
              <div className="mono text-[13px] leading-[1.6] whitespace-pre-wrap bg-background border border-border rounded-md px-3 py-2 text-foreground">
                {tpl.text}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Metrics */}
      <div className="bg-surface border border-border rounded-lg p-6 md:p-7">
        <div className="flex items-center gap-3 mb-6">
          <IconChartBar size={18} className="text-accent" />
          <h3 className="text-[26px] leading-[1.1] text-foreground">Targets</h3>
        </div>
        <div className="grid grid-cols-2 gap-[30px]">
          <div>
            <span className="mono text-[11px] tracking-[0.06em] uppercase text-accent">Daily</span>
            <div className="space-y-3 mt-4">
              <div className="flex justify-between items-baseline gap-3">
                <span className="text-[16px] text-muted">New outreach</span>
                <span className="mono text-[15px] text-foreground">
                  {result.metrics.dailyTargets.newOutreach}
                </span>
              </div>
              <div className="flex justify-between items-baseline gap-3">
                <span className="text-[16px] text-muted">Follow-ups</span>
                <span className="mono text-[15px] text-foreground">
                  {result.metrics.dailyTargets.followUps}
                </span>
              </div>
              <div className="flex justify-between items-baseline gap-3">
                <span className="text-[16px] text-muted">LinkedIn</span>
                <span className="mono text-[15px] text-foreground">
                  {result.metrics.dailyTargets.linkedinEngagements}
                </span>
              </div>
            </div>
          </div>
          <div>
            <span className="mono text-[11px] tracking-[0.06em] uppercase text-accent">Weekly</span>
            <div className="space-y-3 mt-4">
              <div className="flex justify-between items-baseline gap-3">
                <span className="text-[16px] text-muted">Conversations</span>
                <span className="mono text-[15px] text-foreground">
                  {result.metrics.weeklyTargets.conversationsStarted}
                </span>
              </div>
              <div className="flex justify-between items-baseline gap-3">
                <span className="text-[16px] text-muted">Meetings</span>
                <span className="mono text-[15px] text-foreground">
                  {result.metrics.weeklyTargets.meetingsBooked}
                </span>
              </div>
              <div className="flex justify-between items-baseline gap-3">
                <span className="text-[16px] text-muted">Pipeline added</span>
                <span className="mono text-[15px] text-foreground">
                  {result.metrics.weeklyTargets.pipelineAdded}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="pt-4 pb-8">
        <p className="text-[16px] leading-[1.5] text-muted mb-3">
          This planner uses Colin Chapman&apos;s outbound execution methodology.
        </p>
        <Link
          href="/mentors/colin-chapman"
          className="mono inline-flex items-center gap-2 text-[12px] tracking-[0.02em] text-accent hover:text-foreground transition"
          onClick={() => {
            if (typeof window !== "undefined" && (window as any).posthog) {
              (window as any).posthog.capture("tool_cta_clicked", { tool: "outbound-planner", target: "colin-chapman" });
            }
          }}
        >
          Go deeper with Colin →
        </Link>
      </div>

      <div>
        <button
          onClick={onStartOver}
          className="mono text-[12px] tracking-[0.02em] text-muted hover:text-accent transition"
        >
          ← Plan another week
        </button>
      </div>
    </div>
  );
}

export default function OutboundPlannerPage() {
  const [product, setProduct] = useState("");
  const [icp, setIcp] = useState("");
  const [pipelineState, setPipelineState] = useState("");
  const [result, setResult] = useState<PlanResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canSubmit = product.trim().length > 5 && icp.trim().length > 5 && pipelineState.trim().length > 5;

  const handleSubmit = async () => {
    if (!canSubmit) return;
    setLoading(true);
    setError(null);

    if (typeof window !== "undefined" && (window as any).posthog) {
      (window as any).posthog.capture("tool_started", { tool: "outbound-planner" });
    }

    try {
      const res = await fetch("/api/tools/outbound-planner", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ product, icp, pipelineState }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to generate plan");
      }

      const data = await res.json();
      setResult(data.result);

      if (typeof window !== "undefined" && (window as any).posthog) {
        (window as any).posthog.capture("tool_completed", { tool: "outbound-planner" });
      }
    } catch (err: any) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleStartOver = () => {
    setProduct("");
    setIcp("");
    setPipelineState("");
    setResult(null);
    setError(null);
  };

  if (result) {
    return (
      <div className="pt-16 md:pt-[72px]">
        <section className="px-6 pt-14 md:pt-20 pb-16">
          <div className="max-w-[720px] mx-auto">
            <div className="mb-12">
              <p className="mono text-[13px] text-accent mb-4">Free Tool</p>
              <h1 className="text-[44px] md:text-[60px] leading-[0.92] tracking-[-0.015em]">
                Your Outbound Plan
              </h1>
              <p className="mt-5 text-[17px] leading-[1.5] text-muted max-w-[520px]">
                Execute this Monday morning.
              </p>
            </div>
            <ResultView result={result} onStartOver={handleStartOver} />
          </div>
        </section>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="pt-16 md:pt-[72px]">
        <section className="px-6 pt-14 md:pt-20 pb-16">
          <div className="max-w-[720px] mx-auto">
            <div className="bg-surface border border-border rounded-lg p-10 md:p-12">
              <IconLoader2 size={32} className="text-accent animate-spin mb-5" />
              <h2 className="text-[28px] leading-[1.1] text-foreground mb-2">Building your week</h2>
              <p className="mono text-[11px] tracking-[0.06em] uppercase text-muted">
                Creating a day-by-day action plan...
              </p>
            </div>
          </div>
        </section>
      </div>
    );
  }

  const fields = [
    { label: "What do you sell?", value: product, onChange: setProduct, placeholder: "Describe your product or service in one sentence" },
    { label: "Who do you sell to?", value: icp, onChange: setIcp, placeholder: "Role, company type, industry, size" },
    { label: "Current pipeline state", value: pipelineState, onChange: setPipelineState, placeholder: "How many active deals? Any warm leads? Starting from scratch?" },
  ];

  return (
    <div className="pt-16 md:pt-[72px]">
      <section className="px-6 pt-14 md:pt-20 pb-16">
        <div className="max-w-[720px] mx-auto">
          <div className="mb-12">
            <p className="mono text-[13px] text-accent mb-4">Free Tool</p>
            <h1 className="text-[44px] md:text-[60px] leading-[0.92] tracking-[-0.015em]">
              Outbound Week Planner
            </h1>
            <p className="mt-5 text-[17px] leading-[1.5] text-muted max-w-[520px]">
              Get a concrete Mon-Fri outbound plan with daily tasks, email templates, and targets.
            </p>
          </div>

          <div className="bg-surface border border-border rounded-lg p-6 md:p-7 space-y-6">
            {fields.map((field, i) => (
              <div key={i}>
                <label className="block mono text-[11px] tracking-[0.06em] uppercase text-muted mb-2">
                  {field.label}
                </label>
                <textarea
                  value={field.value}
                  onChange={(e) => field.onChange(e.target.value)}
                  placeholder={field.placeholder}
                  className="w-full rounded-md border border-border bg-background px-4 py-3 text-[16px] leading-[1.6] text-foreground placeholder:text-faint focus:border-accent/60 focus:outline-none transition resize-none min-h-[80px]"
                />
              </div>
            ))}

            <div className="flex justify-end pt-2">
              <button
                onClick={handleSubmit}
                disabled={!canSubmit}
                className="mono inline-flex items-center gap-3 bg-accent text-[#1B1B18] px-6 py-3 rounded-md text-[12px] tracking-[0.02em] hover:bg-accent-dim transition disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <IconCalendarWeek size={16} />
                Plan My Week
              </button>
            </div>

            {error && <p className="text-[14px] text-[#E06C5C] mt-4">{error}</p>}
          </div>

          <p className="mono text-[11px] tracking-[0.06em] uppercase text-faint mt-6">
            No login required. Your data is not stored.
          </p>
        </div>
      </section>
    </div>
  );
}
