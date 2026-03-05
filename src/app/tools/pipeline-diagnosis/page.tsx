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
  const color = score >= 7 ? "text-green-400" : score >= 4 ? "text-yellow-400" : "text-red-400";
  const bg = score >= 7 ? "bg-green-400/10 border-green-400/20" : score >= 4 ? "bg-yellow-400/10 border-yellow-400/20" : "bg-red-400/10 border-red-400/20";
  return (
    <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl border ${bg}`}>
      <span className={`text-2xl font-bold ${color}`}>{score}</span>
      <span className="text-muted text-sm">/10</span>
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
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Health Score */}
      <div className="glass-card p-6 text-center">
        <p className="text-muted text-sm mb-3">Pipeline Health</p>
        <HealthScore score={result.pipelineHealth.score} />
      </div>

      {/* Copy button */}
      <div className="flex justify-end">
        <button
          onClick={handleCopy}
          className="flex items-center gap-2 text-sm text-muted hover:text-foreground transition px-3 py-1.5 rounded-lg hover:bg-white/[0.04]"
        >
          {copied ? <IconCheck size={16} className="text-green-400" /> : <IconCopy size={16} />}
          {copied ? "Copied" : "Copy to clipboard"}
        </button>
      </div>

      {/* Deal Analysis */}
      <div className="glass-card p-6">
        <div className="flex items-center gap-3 mb-5">
          <IconSkull size={20} className="text-amber" />
          <h3 className="text-lg font-semibold">Deal Autopsies</h3>
        </div>
        <div className="space-y-5">
          {result.deals.map((deal, i) => (
            <div key={i} className="border-l-2 border-red-400/20 pl-4 space-y-2">
              <p className="text-foreground font-medium">{deal.label}</p>
              <p className="text-muted text-sm">{deal.summary}</p>
              <div className="flex flex-wrap gap-4 text-sm">
                <div>
                  <span className="text-muted/60 text-xs uppercase tracking-wider">Died at</span>
                  <p className="text-red-400/80">{deal.deathPoint}</p>
                </div>
                <div className="flex-1 min-w-[200px]">
                  <span className="text-muted/60 text-xs uppercase tracking-wider">Root cause</span>
                  <p className="text-foreground">{deal.rootCause}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* The Pattern */}
      <div className="glass-card p-6 border-amber/20">
        <div className="flex items-center gap-3 mb-4">
          <IconActivityHeartbeat size={20} className="text-amber" />
          <h3 className="text-lg font-semibold">The Pattern: {result.pattern.title}</h3>
        </div>
        <p className="text-foreground mb-2">{result.pattern.description}</p>
        <p className="text-muted text-sm italic">{result.pattern.frequency}</p>
      </div>

      {/* The Big Fix */}
      <div className="glass-card p-6 bg-amber/[0.03] border-amber/15">
        <div className="flex items-center gap-3 mb-4">
          <IconBulb size={20} className="text-amber" />
          <h3 className="text-lg font-semibold">The One Fix</h3>
        </div>
        <p className="text-foreground font-medium text-lg mb-3">{result.theBigFix.action}</p>
        <p className="text-muted text-sm mb-4">{result.theBigFix.why}</p>
        <div>
          <span className="text-amber text-xs font-medium uppercase tracking-wider">7-Day Implementation</span>
          <p className="text-foreground mt-1.5 text-sm whitespace-pre-wrap">{result.theBigFix.implementation}</p>
        </div>
      </div>

      {/* Deal Salvage */}
      <div className="glass-card p-6">
        <div className="flex items-center gap-3 mb-5">
          <IconRefresh size={20} className="text-amber" />
          <h3 className="text-lg font-semibold">Deal Salvage</h3>
        </div>
        <div className="space-y-3">
          {result.dealSalvage.map((deal, i) => (
            <div key={i} className="flex items-start gap-3">
              {deal.canRevive ? (
                <IconTrendingUp size={16} className="text-green-400 mt-0.5 shrink-0" />
              ) : (
                <IconSkull size={16} className="text-red-400/60 mt-0.5 shrink-0" />
              )}
              <div>
                <span className="text-foreground text-sm font-medium">{deal.deal}</span>
                <span className={`text-xs ml-2 px-2 py-0.5 rounded ${deal.canRevive ? "bg-green-400/10 text-green-400" : "bg-red-400/10 text-red-400/60"}`}>
                  {deal.canRevive ? "Revivable" : "Dead"}
                </span>
                <p className="text-muted text-sm mt-1">{deal.how}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Risks & Strengths */}
      <div className="glass-card p-6">
        <div className="flex items-center gap-3 mb-5">
          <IconShieldCheck size={20} className="text-amber" />
          <h3 className="text-lg font-semibold">Pipeline Risks & Strengths</h3>
        </div>
        <div className="space-y-4">
          <div>
            <span className="text-red-400/80 text-xs font-medium uppercase tracking-wider">Risks</span>
            <ul className="mt-2 space-y-1.5">
              {result.pipelineHealth.risks.map((r, i) => (
                <li key={i} className="flex gap-2 text-sm text-foreground">
                  <IconAlertTriangle size={14} className="text-red-400/60 mt-0.5 shrink-0" />
                  {r}
                </li>
              ))}
            </ul>
          </div>
          {result.pipelineHealth.strengths.length > 0 && (
            <div>
              <span className="text-green-400 text-xs font-medium uppercase tracking-wider">Strengths</span>
              <ul className="mt-2 space-y-1.5">
                {result.pipelineHealth.strengths.map((s, i) => (
                  <li key={i} className="flex gap-2 text-sm text-foreground">
                    <IconCheck size={14} className="text-green-400 mt-0.5 shrink-0" />
                    {s}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>

      {/* CTA */}
      <div className="text-center pt-4 pb-8">
        <p className="text-muted text-sm mb-3">
          This diagnosis uses Colin Chapman&apos;s deal analysis methodology.
        </p>
        <Link
          href="/mentors/colin-chapman"
          className="inline-flex items-center gap-2 text-amber hover:text-amber-dark transition font-medium"
          onClick={() => {
            if (typeof window !== "undefined" && (window as any).posthog) {
              (window as any).posthog.capture("tool_cta_clicked", { tool: "pipeline-diagnosis", target: "colin-chapman" });
            }
          }}
        >
          Go deeper with Colin →
        </Link>
      </div>

      <div className="text-center">
        <button onClick={onStartOver} className="text-sm text-muted hover:text-foreground transition">
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
      <div className="pt-24 pb-16 px-6">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-10">
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-3">Your Pipeline Diagnosis</h1>
            <p className="text-muted">Here&apos;s what&apos;s killing your deals.</p>
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
            <h2 className="text-xl font-semibold mb-2">Diagnosing your pipeline</h2>
            <p className="text-muted text-sm">Finding the pattern across your lost deals...</p>
          </div>
        </div>
      </div>
    );
  }

  const dealFields = [
    { key: "deal1" as const, num: 1, placeholder: "Who was the buyer? What were you selling? What happened? Where did it die?" },
    { key: "deal2" as const, num: 2, placeholder: "Different deal, same questions. Who, what, where it stalled or died." },
    { key: "deal3" as const, num: 3, placeholder: "Third deal. The more specific you are, the better the diagnosis." },
  ];

  return (
    <div className="pt-24 pb-16 px-6">
      <div className="max-w-xl mx-auto">
        <div className="text-center mb-12">
          <p className="text-amber text-sm font-medium uppercase tracking-wider mb-3">Free Tool</p>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-3">Pipeline Diagnosis</h1>
          <p className="text-muted max-w-md mx-auto">
            Describe your last 3 lost deals. Find the pattern and the one fix that saves the most revenue.
          </p>
        </div>

        <div className="space-y-4">
          {dealFields.map((field) => (
            <div key={field.key} className="glass-card p-6">
              <label className="block text-sm font-medium text-foreground mb-3">
                Lost Deal {field.num}
              </label>
              <textarea
                value={deals[field.key]}
                onChange={(e) => setDeals((d) => ({ ...d, [field.key]: e.target.value }))}
                placeholder={field.placeholder}
                className="w-full bg-white/[0.03] border border-border-light focus:border-amber/40 rounded-xl outline-none text-sm p-4 text-foreground placeholder:text-muted/40 transition resize-none min-h-[100px]"
              />
            </div>
          ))}
        </div>

        <div className="flex justify-end mt-6">
          <button
            onClick={handleSubmit}
            disabled={!canSubmit}
            className="bg-amber text-white px-6 py-2.5 rounded-xl font-medium hover:bg-amber-dark transition disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <IconActivityHeartbeat size={18} />
            Diagnose My Pipeline
          </button>
        </div>

        {error && (
          <p className="text-red-400 text-sm mt-4 text-center">{error}</p>
        )}

        <p className="text-center text-muted/50 text-xs mt-6">
          No login required. Your data is not stored.
        </p>
      </div>
    </div>
  );
}
