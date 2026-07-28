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
  const color = score >= 7 ? "text-accent" : score >= 4 ? "text-[#E0B341]" : "text-[#E06C5C]";
  const bg =
    score >= 7
      ? "bg-accent/10 border-accent/30"
      : score >= 4
        ? "bg-[#E0B341]/10 border-[#E0B341]/30"
        : "bg-[#E06C5C]/10 border-[#E06C5C]/30";
  return (
    <div className={`inline-flex items-baseline gap-2 px-4 py-2 rounded-md border ${bg}`}>
      <span className={`mono text-[28px] leading-none ${color}`}>{score}</span>
      <span className="mono text-[12px] tracking-[0.02em] text-muted">/10</span>
    </div>
  );
}

function VerdictIcon({ verdict }: { verdict: string }) {
  if (verdict === "pass") return <IconCheck size={16} className="text-accent shrink-0 mt-0.5" />;
  if (verdict === "weak")
    return <IconAlertTriangle size={16} className="text-[#E0B341] shrink-0 mt-0.5" />;
  return <IconX size={16} className="text-[#E06C5C] shrink-0 mt-0.5" />;
}

function verdictBorder(verdict: string) {
  if (verdict === "pass") return "border-accent/30";
  if (verdict === "weak") return "border-[#E0B341]/30";
  return "border-[#E06C5C]/30";
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
      <div className="bg-surface border border-border rounded-lg p-6 md:p-7">
        <ScoreBadge score={result.overallScore} />
        <p className="mt-4 text-[17px] leading-[1.5] text-muted">{result.overallVerdict}</p>
      </div>

      {/* Line-by-line */}
      <div className="bg-surface border border-border rounded-lg p-6 md:p-7">
        <div className="flex items-center gap-3 mb-6">
          <IconFlame size={18} className="text-accent" />
          <h3 className="text-[26px] leading-[1.1]">Line-by-Line Teardown</h3>
        </div>
        <div className="space-y-5">
          {result.lineAnalysis.map((line, i) => (
            <div key={i} className={`border-l-2 ${verdictBorder(line.verdict)} pl-4 space-y-2`}>
              <div className="flex items-start gap-2">
                <VerdictIcon verdict={line.verdict} />
                <p className="flex-1 min-w-0 mono text-[13px] leading-[1.6] bg-background border border-border rounded-md px-3 py-2 text-foreground break-all">
                  {line.original}
                </p>
              </div>
              <p className="text-[16px] leading-[1.5] text-muted ml-6">{line.feedback}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Rewrite */}
      <div className="bg-surface border border-border rounded-lg p-6 md:p-7">
        <div className="flex items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <IconMail size={18} className="text-accent" />
            <h3 className="text-[26px] leading-[1.1]">The Rewrite</h3>
          </div>
          <button
            onClick={copyRewrite}
            className="mono inline-flex items-center gap-2 text-[12px] tracking-[0.02em] text-accent hover:text-foreground transition"
          >
            {copied ? <IconCheck size={16} /> : <IconCopy size={16} />}
            {copied ? "Copied" : "Copy"}
          </button>
        </div>
        <div className="space-y-4">
          <div>
            <p className="mono text-[11px] tracking-[0.06em] uppercase text-muted">Subject</p>
            <p className="mt-1.5 text-[17px] leading-[1.5] text-foreground">
              {result.rewrite.subject}
            </p>
          </div>
          <div>
            <p className="mono text-[11px] tracking-[0.06em] uppercase text-muted">Body</p>
            <div className="mt-1.5 mono text-[13px] leading-[1.6] whitespace-pre-wrap bg-background border border-border rounded-md px-3 py-2 text-foreground">
              {result.rewrite.body}
            </div>
          </div>
        </div>
      </div>

      {/* Framework Breakdown */}
      <div className="bg-surface border border-border rounded-lg p-6 md:p-7">
        <div className="flex items-center gap-3 mb-6">
          <IconArrowRight size={18} className="text-accent" />
          <h3 className="text-[26px] leading-[1.1]">Problem-Impact-Proof Breakdown</h3>
        </div>
        <div className="space-y-4">
          <div>
            <p className="mono text-[11px] tracking-[0.06em] uppercase text-accent">Problem</p>
            <p className="mt-1.5 text-[16px] leading-[1.5] text-foreground">
              {result.frameworkBreakdown.problem}
            </p>
          </div>
          <div>
            <p className="mono text-[11px] tracking-[0.06em] uppercase text-accent">Impact</p>
            <p className="mt-1.5 text-[16px] leading-[1.5] text-foreground">
              {result.frameworkBreakdown.impact}
            </p>
          </div>
          <div>
            <p className="mono text-[11px] tracking-[0.06em] uppercase text-accent">Proof</p>
            <p className="mt-1.5 text-[16px] leading-[1.5] text-foreground">
              {result.frameworkBreakdown.proof}
            </p>
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="pt-4 pb-8">
        <p className="text-[16px] leading-[1.5] text-muted mb-3">
          This teardown uses Colin Chapman&apos;s Problem-Impact-Proof framework.
        </p>
        <Link
          href="/mentors/colin-chapman"
          className="mono inline-flex items-center gap-3 border border-border-light text-foreground px-6 py-3 rounded-md text-[12px] tracking-[0.02em] hover:border-accent hover:text-accent transition"
          onClick={() => {
            if (typeof window !== "undefined" && (window as any).posthog) {
              (window as any).posthog.capture("tool_cta_clicked", { tool: "cold-email-teardown", target: "colin-chapman" });
            }
          }}
        >
          Go deeper with Colin
          <span aria-hidden="true">›</span>
        </Link>
      </div>

      <div>
        <button
          onClick={onStartOver}
          className="mono text-[12px] tracking-[0.02em] text-muted hover:text-accent transition"
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
      <div className="pt-16 md:pt-[72px]">
        <section className="px-6 pt-14 md:pt-20 pb-16">
          <div className="max-w-[720px] mx-auto">
            <div className="mb-10">
              <p className="mono text-[13px] text-accent mb-4">Free Tool</p>
              <h1 className="text-[44px] md:text-[60px] leading-[0.92] tracking-[-0.015em]">
                Your Email Teardown
              </h1>
              <p className="mt-5 text-[17px] leading-[1.5] text-muted max-w-[520px]">
                Here&apos;s what&apos;s killing your reply rate.
              </p>
            </div>
            <ResultView result={result} onStartOver={handleStartOver} />
          </div>
        </section>
      </div>
    );
  }

  // Loading view
  if (loading) {
    return (
      <div className="pt-16 md:pt-[72px]">
        <section className="px-6 pt-14 md:pt-20 pb-16">
          <div className="max-w-[720px] mx-auto">
            <div className="bg-surface border border-border rounded-lg p-10 md:p-12">
              <IconLoader2 size={32} className="text-accent animate-spin mb-5" />
              <h2 className="text-[28px] leading-[1.1] mb-2">Tearing it apart</h2>
              <p className="mono text-[11px] tracking-[0.06em] uppercase text-muted">
                Analyzing every line...
              </p>
            </div>
          </div>
        </section>
      </div>
    );
  }

  // Input view
  return (
    <div className="pt-16 md:pt-[72px]">
      <section className="px-6 pt-14 md:pt-20 pb-16">
        <div className="max-w-[720px] mx-auto">
          {/* Header */}
          <div className="mb-12">
            <p className="mono text-[13px] text-accent mb-4">Free Tool</p>
            <h1 className="text-[44px] md:text-[60px] leading-[0.92] tracking-[-0.015em]">
              Cold Email Teardown
            </h1>
            <p className="mt-5 text-[17px] leading-[1.5] text-muted max-w-[520px]">
              Paste your cold email. Get a line-by-line diagnosis and a rewrite that actually gets
              replies.
            </p>
          </div>

          {/* Input Card */}
          <div className="bg-surface border border-border rounded-lg p-6 md:p-8">
            <label className="mono block text-[11px] tracking-[0.06em] uppercase text-muted mb-3">
              Paste your cold email
            </label>
            <textarea
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={"Subject: Quick question\n\nHi [Name],\n\nI noticed your company..."}
              className="w-full rounded-md border border-border bg-background px-4 py-3 text-foreground placeholder:text-faint focus:border-accent/60 focus:outline-none transition resize-none min-h-[240px] mono text-[14px] leading-[1.6]"
              autoFocus
            />

            <div className="flex items-center justify-between gap-4 mt-6">
              <span className="mono text-[11px] tracking-[0.06em] uppercase text-muted">
                {email.length > 0 ? `${email.length} characters` : "Include the subject line"}
              </span>
              <button
                onClick={handleSubmit}
                disabled={email.trim().length < 10}
                className="mono inline-flex items-center gap-3 bg-accent text-[#1B1B18] px-6 py-3 rounded-md text-[12px] tracking-[0.02em] hover:bg-accent-dim transition disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <IconFlame size={16} />
                Tear it apart
              </button>
            </div>

            {error && <p className="mono text-[12px] text-[#E06C5C] mt-4">{error}</p>}
          </div>

          <p className="mono text-[11px] tracking-[0.06em] uppercase text-faint mt-6">
            No login required. Your email is not stored.
          </p>
        </div>
      </section>
    </div>
  );
}
