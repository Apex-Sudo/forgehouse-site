"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import {
  IconCalendarWeek,
  IconCheck,
  IconCopy,
  IconLoader2,
  IconMail,
  IconTarget,
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
  Monday: "border-blue-400/30",
  Tuesday: "border-amber/30",
  Wednesday: "border-amber/30",
  Thursday: "border-amber/30",
  Friday: "border-green-400/30",
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
    <div className="space-y-10 animate-in fade-in duration-500">
      {/* Week Summary */}
      <div className="glass-card p-8 text-center">
        <p className="text-amber text-xs font-medium uppercase tracking-wider mb-3">This Week&apos;s Focus</p>
        <p className="text-foreground text-xl font-semibold mb-3 leading-snug">{result.weekSummary.focus}</p>
        <p className="text-muted text-sm">{result.weekSummary.targetOutcomes}</p>
      </div>

      {/* Copy all */}
      <div className="flex justify-end">
        <button
          onClick={handleCopy}
          className="flex items-center gap-2 text-sm text-muted hover:text-foreground transition px-3 py-1.5 rounded-lg hover:bg-white/[0.04]"
        >
          {copied ? <IconCheck size={16} className="text-green-400" /> : <IconCopy size={16} />}
          {copied ? "Copied" : "Copy full plan"}
        </button>
      </div>

      {/* Daily Plans */}
      {result.days.map((day, i) => (
        <div key={i} className={`glass-card p-8 border-l-2 ${dayColors[day.day] || "border-amber/30"}`}>
          <div className="mb-6">
            <h3 className="text-xl font-semibold">{day.day}</h3>
            <p className="text-muted text-sm mt-1">{day.theme}</p>
          </div>
          <div className="space-y-6">
            {day.tasks.map((task, j) => (
              <div key={j}>
                <div className="flex items-baseline gap-3 mb-1">
                  <span className="text-xs text-amber/60 uppercase tracking-wider shrink-0">{task.time}</span>
                  <p className="text-foreground text-sm leading-relaxed">{task.action}</p>
                </div>
                <p className="text-muted/40 text-xs ml-[calc(theme(spacing.3)+3.5rem)] leading-relaxed">{task.why}</p>
              </div>
            ))}
          </div>
        </div>
      ))}

      {/* Templates */}
      <div className="glass-card p-8">
        <div className="flex items-center gap-3 mb-8">
          <IconMail size={20} className="text-amber" />
          <h3 className="text-lg font-semibold">Ready-to-Use Templates</h3>
        </div>
        <div className="space-y-8">
          {([
            { key: "coldOutreach", label: "Cold Outreach", text: result.templates.coldOutreach },
            { key: "followUp", label: "Follow-Up (Day 3-4)", text: result.templates.followUp },
            { key: "breakup", label: "Breakup (End of Week)", text: result.templates.breakup },
          ] as const).map((tpl) => (
            <div key={tpl.key}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-amber text-xs font-medium uppercase tracking-wider">{tpl.label}</span>
                <button
                  onClick={() => copyTemplate(tpl.key, tpl.text)}
                  className="text-xs text-muted hover:text-foreground transition"
                >
                  {copiedTemplate === tpl.key ? "Copied" : "Copy"}
                </button>
              </div>
              <div className="text-sm text-foreground whitespace-pre-wrap bg-white/[0.02] rounded-xl p-5 border border-border-light font-mono leading-loose">
                {tpl.text}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Metrics */}
      <div className="glass-card p-8">
        <div className="flex items-center gap-3 mb-8">
          <IconChartBar size={20} className="text-amber" />
          <h3 className="text-lg font-semibold">Targets</h3>
        </div>
        <div className="grid grid-cols-2 gap-10">
          <div>
            <span className="text-muted text-xs uppercase tracking-wider">Daily</span>
            <div className="space-y-3 mt-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted">New outreach</span>
                <span className="text-foreground font-medium">{result.metrics.dailyTargets.newOutreach}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted">Follow-ups</span>
                <span className="text-foreground font-medium">{result.metrics.dailyTargets.followUps}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted">LinkedIn</span>
                <span className="text-foreground font-medium">{result.metrics.dailyTargets.linkedinEngagements}</span>
              </div>
            </div>
          </div>
          <div>
            <span className="text-muted text-xs uppercase tracking-wider">Weekly</span>
            <div className="space-y-3 mt-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted">Conversations</span>
                <span className="text-foreground font-medium">{result.metrics.weeklyTargets.conversationsStarted}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted">Meetings</span>
                <span className="text-foreground font-medium">{result.metrics.weeklyTargets.meetingsBooked}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted">Pipeline added</span>
                <span className="text-foreground font-medium">{result.metrics.weeklyTargets.pipelineAdded}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="text-center pt-4 pb-8">
        <p className="text-muted text-sm mb-3">
          This planner uses Colin Chapman&apos;s outbound execution methodology.
        </p>
        <Link
          href="/mentors/colin-chapman"
          className="inline-flex items-center gap-2 text-amber hover:text-amber-dark transition font-medium"
          onClick={() => {
            if (typeof window !== "undefined" && (window as any).posthog) {
              (window as any).posthog.capture("tool_cta_clicked", { tool: "outbound-planner", target: "colin-chapman" });
            }
          }}
        >
          Go deeper with Colin →
        </Link>
      </div>

      <div className="text-center">
        <button onClick={onStartOver} className="text-sm text-muted hover:text-foreground transition">
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
      <div className="pt-24 pb-16 px-6">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-10">
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-3">Your Outbound Plan</h1>
            <p className="text-muted">Execute this Monday morning.</p>
          </div>
          <ResultView result={result} onStartOver={handleStartOver} />
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="pt-24 pb-16 px-6">
        <div className="max-w-xl mx-auto text-center">
          <div className="glass-card p-12">
            <IconLoader2 size={32} className="text-amber animate-spin mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Building your week</h2>
            <p className="text-muted text-sm">Creating a day-by-day action plan...</p>
          </div>
        </div>
      </div>
    );
  }

  const fields = [
    { label: "What do you sell?", value: product, onChange: setProduct, placeholder: "Describe your product or service in one sentence" },
    { label: "Who do you sell to?", value: icp, onChange: setIcp, placeholder: "Role, company type, industry, size" },
    { label: "Current pipeline state", value: pipelineState, onChange: setPipelineState, placeholder: "How many active deals? Any warm leads? Starting from scratch?" },
  ];

  return (
    <div className="pt-24 pb-16 px-6">
      <div className="max-w-xl mx-auto">
        <div className="text-center mb-12">
          <p className="text-amber text-sm font-medium uppercase tracking-wider mb-3">Free Tool</p>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-3">Outbound Week Planner</h1>
          <p className="text-muted max-w-md mx-auto">
            Get a concrete Mon-Fri outbound plan with daily tasks, email templates, and targets.
          </p>
        </div>

        <div className="glass-card p-8 md:p-10 space-y-6">
          {fields.map((field, i) => (
            <div key={i}>
              <label className="block text-sm font-medium text-foreground mb-2">{field.label}</label>
              <textarea
                value={field.value}
                onChange={(e) => field.onChange(e.target.value)}
                placeholder={field.placeholder}
                className="w-full bg-white/[0.03] border border-border-light focus:border-amber/40 rounded-xl outline-none text-sm p-4 text-foreground placeholder:text-muted/40 transition resize-none min-h-[80px]"
              />
            </div>
          ))}

          <div className="flex justify-end pt-2">
            <button
              onClick={handleSubmit}
              disabled={!canSubmit}
              className="bg-amber text-white px-6 py-2.5 rounded-xl font-medium hover:bg-amber-dark transition disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <IconCalendarWeek size={18} />
              Plan My Week
            </button>
          </div>

          {error && (
            <p className="text-red-400 text-sm mt-4 text-center">{error}</p>
          )}
        </div>

        <p className="text-center text-muted/50 text-xs mt-6">
          No login required. Your data is not stored.
        </p>
      </div>
    </div>
  );
}
