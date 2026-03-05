"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import {
  IconFlame,
  IconCheck,
  IconAlertTriangle,
  IconX,
  IconCopy,
  IconLoader2,
  IconRefresh,
  IconMail,
  IconArrowRight,
} from "@tabler/icons-react";

interface LineAnalysis {
  original: string;
  verdict: "pass" | "weak" | "fail";
  feedback: string;
}

interface TeardownResult {
  overallScore: number;
  overallVerdict: string;
  lineAnalysis: LineAnalysis[];
  rewrite: {
    subject: string;
    body: string;
  };
  frameworkBreakdown: {
    problem: string;
    impact: string;
    proof: string;
  };
}

function ScoreBadge({ score }: { score: number }) {
  const color = score >= 7 ? "text-green-400" : score >= 4 ? "text-yellow-400" : "text-red-400";
  const bg = score >= 7 ? "bg-green-400/10 border-green-400/20" : score >= 4 ? "bg-yellow-400/10 border-yellow-400/20" : "bg-red-400/10 border-red-400/20";
  return (
    <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl border ${bg}`}>
      <span className={`text-2xl font-bold ${color}`}>{score}</span>
      <span className="text-muted text-sm">/10</span>
    </div>
  );
}

function VerdictIcon({ verdict }: { verdict: string }) {
  if (verdict === "pass") return <IconCheck size={16} className="text-green-400 shrink-0 mt-0.5" />;
  if (verdict === "weak") return <IconAlertTriangle size={16} className="text-yellow-400 shrink-0 mt-0.5" />;
  return <IconX size={16} className="text-red-400 shrink-0 mt-0.5" />;
}

function verdictBorder(verdict: string) {
  if (verdict === "pass") return "border-green-400/20";
  if (verdict === "weak") return "border-yellow-400/20";
  return "border-red-400/20";
}

function ResultView({ result, onStartOver }: { result: TeardownResult; onStartOver: () => void }) {
  const [copied, setCopied] = useState(false);

  const copyRewrite = useCallback(() => {
    const text = `Subject: ${result.rewrite.subject}\n\n${result.rewrite.body}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    if (typeof window !== "undefined" && (window as any).posthog) {
      (window as any).posthog.capture("tool_result_copied", { tool: "cold-email-teardown" });
    }
  }, [result]);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Score + Verdict */}
      <div className="glass-card p-6 text-center">
        <ScoreBadge score={result.overallScore} />
        <p className="text-muted mt-3">{result.overallVerdict}</p>
      </div>

      {/* Line-by-line */}
      <div className="glass-card p-6">
        <div className="flex items-center gap-3 mb-5">
          <IconFlame size={20} className="text-amber" />
          <h3 className="text-lg font-semibold">Line-by-Line Teardown</h3>
        </div>
        <div className="space-y-4">
          {result.lineAnalysis.map((line, i) => (
            <div key={i} className={`border-l-2 ${verdictBorder(line.verdict)} pl-4 space-y-1.5`}>
              <div className="flex items-start gap-2">
                <VerdictIcon verdict={line.verdict} />
                <p className="text-foreground text-sm font-mono bg-white/[0.03] px-2 py-1 rounded break-all">
                  {line.original}
                </p>
              </div>
              <p className="text-muted text-sm ml-6">{line.feedback}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Rewrite */}
      <div className="glass-card p-6">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <IconMail size={20} className="text-amber" />
            <h3 className="text-lg font-semibold">The Rewrite</h3>
          </div>
          <button
            onClick={copyRewrite}
            className="flex items-center gap-2 text-sm text-muted hover:text-foreground transition px-3 py-1.5 rounded-lg hover:bg-white/[0.04]"
          >
            {copied ? <IconCheck size={16} className="text-green-400" /> : <IconCopy size={16} />}
            {copied ? "Copied" : "Copy"}
          </button>
        </div>
        <div className="space-y-3">
          <div>
            <span className="text-muted text-xs uppercase tracking-wider">Subject</span>
            <p className="text-foreground font-medium mt-1">{result.rewrite.subject}</p>
          </div>
          <div>
            <span className="text-muted text-xs uppercase tracking-wider">Body</span>
            <div className="mt-1 text-foreground whitespace-pre-wrap bg-white/[0.03] rounded-xl p-4 border border-border-light text-sm leading-relaxed">
              {result.rewrite.body}
            </div>
          </div>
        </div>
      </div>

      {/* Framework Breakdown */}
      <div className="glass-card p-6">
        <div className="flex items-center gap-3 mb-5">
          <IconArrowRight size={20} className="text-amber" />
          <h3 className="text-lg font-semibold">Problem-Impact-Proof Breakdown</h3>
        </div>
        <div className="space-y-3">
          <div>
            <span className="text-amber text-xs font-medium uppercase tracking-wider">Problem</span>
            <p className="text-foreground mt-1">{result.frameworkBreakdown.problem}</p>
          </div>
          <div>
            <span className="text-amber text-xs font-medium uppercase tracking-wider">Impact</span>
            <p className="text-foreground mt-1">{result.frameworkBreakdown.impact}</p>
          </div>
          <div>
            <span className="text-amber text-xs font-medium uppercase tracking-wider">Proof</span>
            <p className="text-foreground mt-1">{result.frameworkBreakdown.proof}</p>
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="text-center pt-4 pb-8">
        <p className="text-muted text-sm mb-3">
          This teardown uses Colin Chapman&apos;s Problem-Impact-Proof framework.
        </p>
        <Link
          href="/mentors/colin-chapman"
          className="inline-flex items-center gap-2 text-amber hover:text-amber-dark transition font-medium"
          onClick={() => {
            if (typeof window !== "undefined" && (window as any).posthog) {
              (window as any).posthog.capture("tool_cta_clicked", { tool: "cold-email-teardown", target: "colin-chapman" });
            }
          }}
        >
          Go deeper with Colin →
        </Link>
      </div>

      <div className="text-center">
        <button
          onClick={onStartOver}
          className="text-sm text-muted hover:text-foreground transition"
        >
          ← Tear apart another email
        </button>
      </div>
    </div>
  );
}

export default function ColdEmailTeardownPage() {
  const [email, setEmail] = useState("");
  const [result, setResult] = useState<TeardownResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (email.trim().length < 10) return;

    setLoading(true);
    setError(null);

    if (typeof window !== "undefined" && (window as any).posthog) {
      (window as any).posthog.capture("tool_started", { tool: "cold-email-teardown" });
    }

    try {
      const res = await fetch("/api/tools/cold-email-teardown", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to analyze email");
      }

      const data = await res.json();
      setResult(data.result);

      if (typeof window !== "undefined" && (window as any).posthog) {
        (window as any).posthog.capture("tool_completed", { tool: "cold-email-teardown" });
      }
    } catch (err: any) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleStartOver = () => {
    setEmail("");
    setResult(null);
    setError(null);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && e.metaKey && email.trim().length >= 10) {
      handleSubmit();
    }
  };

  // Result view
  if (result) {
    return (
      <div className="pt-24 pb-16 px-6">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-10">
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-3">Your Email Teardown</h1>
            <p className="text-muted">Here&apos;s what&apos;s killing your reply rate.</p>
          </div>
          <ResultView result={result} onStartOver={handleStartOver} />
        </div>
      </div>
    );
  }

  // Loading view
  if (loading) {
    return (
      <div className="pt-24 pb-16 px-6">
        <div className="max-w-xl mx-auto text-center">
          <div className="glass-card p-12">
            <IconLoader2 size={32} className="text-amber animate-spin mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Tearing it apart</h2>
            <p className="text-muted text-sm">Analyzing every line...</p>
          </div>
        </div>
      </div>
    );
  }

  // Input view
  return (
    <div className="pt-24 pb-16 px-6">
      <div className="max-w-xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <p className="text-amber text-sm font-medium uppercase tracking-wider mb-3">Free Tool</p>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-3">Cold Email Teardown</h1>
          <p className="text-muted max-w-md mx-auto">
            Paste your cold email. Get a line-by-line diagnosis and a rewrite that actually gets replies.
          </p>
        </div>

        {/* Input Card */}
        <div className="glass-card p-8 md:p-10">
          <label className="block text-sm text-muted mb-3">Paste your cold email</label>
          <textarea
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={"Subject: Quick question\n\nHi [Name],\n\nI noticed your company..."}
            className="w-full bg-white/[0.03] border border-border-light focus:border-amber/40 rounded-xl outline-none text-sm p-4 text-foreground placeholder:text-muted/40 transition resize-none min-h-[240px] font-mono leading-relaxed"
            autoFocus
          />

          <div className="flex items-center justify-between mt-6">
            <span className="text-xs text-muted/50">
              {email.length > 0 ? `${email.length} characters` : "Include the subject line"}
            </span>
            <button
              onClick={handleSubmit}
              disabled={email.trim().length < 10}
              className="bg-amber text-white px-6 py-2.5 rounded-xl font-medium hover:bg-amber-dark transition disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <IconFlame size={18} />
              Tear it apart
            </button>
          </div>

          {error && (
            <p className="text-red-400 text-sm mt-4 text-center">{error}</p>
          )}
        </div>

        <p className="text-center text-muted/50 text-xs mt-6">
          No login required. Your email is not stored.
        </p>
      </div>
    </div>
  );
}
