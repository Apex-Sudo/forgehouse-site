"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import {
  IconActivityHeartbeat,
  IconBulb,
  IconCheck,
  IconCopy,
  IconLoader2,
  IconRefresh,
  IconSkull,
  IconShieldCheck,
  IconAlertTriangle,
  IconTrendingUp,
} from "@tabler/icons-react";

interface DealAnalysis {
  label: string;
  summary: string;
  deathPoint: string;
  rootCause: string;
}

interface DiagnosisResult {
  deals: DealAnalysis[];
  pattern: {
    title: string;
    description: string;
    frequency: string;
  };
  theBigFix: {
    action: string;
    why: string;
    implementation: string;
  };
  dealSalvage: {
    deal: string;
    canRevive: boolean;
    how: string;
  }[];
  pipelineHealth: {
    score: number;
    risks: string[];
    strengths: string[];
  };
}

function HealthScore({ score }: { score: number }) {
  const color = score >= 7 ? "text-accent" : score >= 4 ? "text-[#E0B341]" : "text-[#E06C5C]";
  const bg =
    score >= 7
      ? "bg-accent/10 border-accent/30"
      : score >= 4
        ? "bg-[#E0B341]/10 border-[#E0B341]/30"
        : "bg-[#E06C5C]/10 border-[#E06C5C]/30";
  return (
    <div className={`inline-flex items-baseline gap-2 px-4 py-2.5 rounded-md border ${bg}`}>
      <span className={`mono text-[28px] leading-none ${color}`}>{score}</span>
      <span className="mono text-[12px] tracking-[0.02em] text-muted">/10</span>
    </div>
  );
}

function ResultView({ result, onStartOver }: { result: DiagnosisResult; onStartOver: () => void }) {
  const [copied, setCopied] = useState(false);

  const toText = useCallback(() => {
    const r = result;
    return `PIPELINE DIAGNOSIS
===================

DEAL ANALYSIS
${r.deals.map((d) => `${d.label}: ${d.summary}\n  Died at: ${d.deathPoint}\n  Root cause: ${d.rootCause}`).join("\n\n")}

THE PATTERN: ${r.pattern.title}
${r.pattern.description}
${r.pattern.frequency}

THE BIG FIX
${r.theBigFix.action}
Why: ${r.theBigFix.why}
How: ${r.theBigFix.implementation}

DEAL SALVAGE
${r.dealSalvage.map((d) => `${d.deal}: ${d.canRevive ? "Revivable" : "Dead"} - ${d.how}`).join("\n")}

PIPELINE HEALTH: ${r.pipelineHealth.score}/10
Risks: ${r.pipelineHealth.risks.join(", ")}
Strengths: ${r.pipelineHealth.strengths.join(", ")}

---
Built on Colin Chapman's sales methodology | forgehouse.io`;
  }, [result]);

  const handleCopy = () => {
    navigator.clipboard.writeText(toText());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    if (typeof window !== "undefined" && (window as any).posthog) {
      (window as any).posthog.capture("tool_result_copied", { tool: "pipeline-diagnosis" });
    }
  };

  return (
    <div className="space-y-[30px] animate-in fade-in duration-500">
      {/* Health Score */}
      <div className="bg-surface border border-border rounded-lg p-6 md:p-7">
        <p className="mono text-[11px] tracking-[0.06em] uppercase text-muted mb-4">Pipeline Health</p>
        <HealthScore score={result.pipelineHealth.score} />
      </div>

      {/* Copy button */}
      <div className="flex justify-end">
        <button
          onClick={handleCopy}
          className="mono inline-flex items-center gap-2 text-[12px] tracking-[0.02em] text-muted hover:text-accent transition"
        >
          {copied ? <IconCheck size={14} className="text-accent" /> : <IconCopy size={14} />}
          {copied ? "Copied" : "Copy to clipboard"}
        </button>
      </div>

      {/* Deal Analysis */}
      <div className="bg-surface border border-border rounded-lg p-6 md:p-7">
        <div className="flex items-center gap-3 mb-6">
          <IconSkull size={18} className="text-accent" />
          <h3 className="text-[26px] leading-[1.1] text-foreground">Deal Autopsies</h3>
        </div>
        <div className="space-y-6">
          {result.deals.map((deal, i) => (
            <div key={i} className="border-l-2 border-[#E06C5C]/30 pl-4 space-y-2">
              <p className="text-[20px] leading-[1.2] text-foreground">{deal.label}</p>
              <p className="text-[16px] leading-[1.55] text-muted">{deal.summary}</p>
              <div className="flex flex-wrap gap-5 pt-1">
                <div>
                  <span className="mono text-[11px] tracking-[0.06em] uppercase text-muted">Died at</span>
                  <p className="text-[16px] leading-[1.5] text-[#E06C5C] mt-1">{deal.deathPoint}</p>
                </div>
                <div className="flex-1 min-w-[200px]">
                  <span className="mono text-[11px] tracking-[0.06em] uppercase text-muted">Root cause</span>
                  <p className="text-[16px] leading-[1.5] text-foreground mt-1">{deal.rootCause}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* The Pattern */}
      <div className="bg-surface border border-accent/25 rounded-lg p-6 md:p-7">
        <div className="flex items-center gap-3 mb-4">
          <IconActivityHeartbeat size={18} className="text-accent" />
          <h3 className="text-[26px] leading-[1.1] text-foreground">
            The Pattern: {result.pattern.title}
          </h3>
        </div>
        <p className="text-[17px] leading-[1.55] text-foreground mb-2">{result.pattern.description}</p>
        <p className="text-[16px] leading-[1.55] italic text-muted">{result.pattern.frequency}</p>
      </div>

      {/* The Big Fix */}
      <div className="bg-accent/[0.05] border border-accent/25 rounded-lg p-6 md:p-7">
        <div className="flex items-center gap-3 mb-4">
          <IconBulb size={18} className="text-accent" />
          <h3 className="text-[26px] leading-[1.1] text-foreground">The One Fix</h3>
        </div>
        <p className="text-[22px] leading-[1.2] text-foreground mb-3">{result.theBigFix.action}</p>
        <p className="text-[16px] leading-[1.6] text-muted mb-5">{result.theBigFix.why}</p>
        <div>
          <span className="mono text-[11px] tracking-[0.06em] uppercase text-accent">
            7-Day Implementation
          </span>
          <p className="text-[16px] leading-[1.6] text-foreground mt-2 whitespace-pre-wrap">
            {result.theBigFix.implementation}
          </p>
        </div>
      </div>

      {/* Deal Salvage */}
      <div className="bg-surface border border-border rounded-lg p-6 md:p-7">
        <div className="flex items-center gap-3 mb-6">
          <IconRefresh size={18} className="text-accent" />
          <h3 className="text-[26px] leading-[1.1] text-foreground">Deal Salvage</h3>
        </div>
        <div className="space-y-4">
          {result.dealSalvage.map((deal, i) => (
            <div key={i} className="flex items-start gap-3">
              {deal.canRevive ? (
                <IconTrendingUp size={16} className="text-accent mt-1 shrink-0" />
              ) : (
                <IconSkull size={16} className="text-[#E06C5C] mt-1 shrink-0" />
              )}
              <div>
                <span className="text-[17px] text-foreground">{deal.deal}</span>
                <span
                  className={`mono text-[10px] tracking-[0.06em] uppercase ml-2 px-2 py-0.5 rounded ${
                    deal.canRevive
                      ? "bg-accent/10 text-accent"
                      : "bg-[#E06C5C]/10 text-[#E06C5C]"
                  }`}
                >
                  {deal.canRevive ? "Revivable" : "Dead"}
                </span>
                <p className="text-[16px] leading-[1.55] text-muted mt-1.5">{deal.how}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Risks & Strengths */}
      <div className="bg-surface border border-border rounded-lg p-6 md:p-7">
        <div className="flex items-center gap-3 mb-6">
          <IconShieldCheck size={18} className="text-accent" />
          <h3 className="text-[26px] leading-[1.1] text-foreground">Pipeline Risks &amp; Strengths</h3>
        </div>
        <div className="space-y-5">
          <div>
            <span className="mono text-[11px] tracking-[0.06em] uppercase text-[#E06C5C]">Risks</span>
            <ul className="mt-3 space-y-2">
              {result.pipelineHealth.risks.map((r, i) => (
                <li key={i} className="flex gap-2.5 text-[16px] leading-[1.55] text-foreground">
                  <IconAlertTriangle size={14} className="text-[#E06C5C] mt-1.5 shrink-0" />
                  {r}
                </li>
              ))}
            </ul>
          </div>
          {result.pipelineHealth.strengths.length > 0 && (
            <div>
              <span className="mono text-[11px] tracking-[0.06em] uppercase text-accent">Strengths</span>
              <ul className="mt-3 space-y-2">
                {result.pipelineHealth.strengths.map((s, i) => (
                  <li key={i} className="flex gap-2.5 text-[16px] leading-[1.55] text-foreground">
                    <IconCheck size={14} className="text-accent mt-1.5 shrink-0" />
                    {s}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>

      {/* CTA */}
      <div className="pt-4 pb-8">
        <p className="text-[16px] leading-[1.5] text-muted mb-3">
          This diagnosis uses Colin Chapman&apos;s deal analysis methodology.
        </p>
        <Link
          href="/mentors/colin-chapman"
          className="mono inline-flex items-center gap-2 text-[12px] tracking-[0.02em] text-accent hover:text-foreground transition"
          onClick={() => {
            if (typeof window !== "undefined" && (window as any).posthog) {
              (window as any).posthog.capture("tool_cta_clicked", { tool: "pipeline-diagnosis", target: "colin-chapman" });
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
          ← Diagnose another pipeline
        </button>
      </div>
    </div>
  );
}

export default function PipelineDiagnosisPage() {
  const [deals, setDeals] = useState({ deal1: "", deal2: "", deal3: "" });
  const [result, setResult] = useState<DiagnosisResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canSubmit = deals.deal1.trim().length > 10 && deals.deal2.trim().length > 10 && deals.deal3.trim().length > 10;

  const handleSubmit = async () => {
    if (!canSubmit) return;
    setLoading(true);
    setError(null);

    if (typeof window !== "undefined" && (window as any).posthog) {
      (window as any).posthog.capture("tool_started", { tool: "pipeline-diagnosis" });
    }

    try {
      const res = await fetch("/api/tools/pipeline-diagnosis", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ deals }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to analyze pipeline");
      }

      const data = await res.json();
      setResult(data.result);

      if (typeof window !== "undefined" && (window as any).posthog) {
        (window as any).posthog.capture("tool_completed", { tool: "pipeline-diagnosis" });
      }
    } catch (err: any) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleStartOver = () => {
    setDeals({ deal1: "", deal2: "", deal3: "" });
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
                Your Pipeline Diagnosis
              </h1>
              <p className="mt-5 text-[17px] leading-[1.5] text-muted max-w-[520px]">
                Here&apos;s what&apos;s killing your deals.
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
              <h2 className="text-[28px] leading-[1.1] text-foreground mb-2">
                Diagnosing your pipeline
              </h2>
              <p className="mono text-[11px] tracking-[0.06em] uppercase text-muted">
                Finding the pattern across your lost deals...
              </p>
            </div>
          </div>
        </section>
      </div>
    );
  }

  const dealFields = [
    { key: "deal1" as const, num: 1, placeholder: "Who was the buyer? What were you selling? What happened? Where did it die?" },
    { key: "deal2" as const, num: 2, placeholder: "Different deal, same questions. Who, what, where it stalled or died." },
    { key: "deal3" as const, num: 3, placeholder: "Third deal. The more specific you are, the better the diagnosis." },
  ];

  return (
    <div className="pt-16 md:pt-[72px]">
      <section className="px-6 pt-14 md:pt-20 pb-16">
        <div className="max-w-[720px] mx-auto">
          <div className="mb-12">
            <p className="mono text-[13px] text-accent mb-4">Free Tool</p>
            <h1 className="text-[44px] md:text-[60px] leading-[0.92] tracking-[-0.015em]">
              Pipeline Diagnosis
            </h1>
            <p className="mt-5 text-[17px] leading-[1.5] text-muted max-w-[520px]">
              Describe your last 3 lost deals. Find the pattern and the one fix that saves the most revenue.
            </p>
          </div>

          <div className="space-y-5">
            {dealFields.map((field) => (
              <div key={field.key} className="bg-surface border border-border rounded-lg p-6">
                <label className="block mono text-[11px] tracking-[0.06em] uppercase text-muted mb-3">
                  Lost Deal {field.num}
                </label>
                <textarea
                  value={deals[field.key]}
                  onChange={(e) => setDeals((d) => ({ ...d, [field.key]: e.target.value }))}
                  placeholder={field.placeholder}
                  className="w-full rounded-md border border-border bg-background px-4 py-3 text-[16px] leading-[1.6] text-foreground placeholder:text-faint focus:border-accent/60 focus:outline-none transition resize-none min-h-[100px]"
                />
              </div>
            ))}
          </div>

          <div className="flex justify-end mt-6">
            <button
              onClick={handleSubmit}
              disabled={!canSubmit}
              className="mono inline-flex items-center gap-3 bg-accent text-[#1B1B18] px-6 py-3 rounded-md text-[12px] tracking-[0.02em] hover:bg-accent-dim transition disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <IconActivityHeartbeat size={16} />
              Diagnose My Pipeline
            </button>
          </div>

          {error && <p className="text-[14px] text-[#E06C5C] mt-4">{error}</p>}

          <p className="mono text-[11px] tracking-[0.06em] uppercase text-faint mt-6">
            No login required. Your data is not stored.
          </p>
        </div>
      </section>
    </div>
  );
}
