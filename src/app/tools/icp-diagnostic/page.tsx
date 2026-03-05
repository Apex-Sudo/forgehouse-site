"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import {
  IconTarget,
  IconBriefcase,
  IconBan,
  IconCompass,
  IconMessage,
  IconCopy,
  IconCheck,
  IconArrowLeft,
  IconLoader2,
  IconAlertTriangle,
} from "@tabler/icons-react";

type Path = "experienced" | "pre-revenue" | null;

interface Answers {
  q1: string;
  q2: string;
  q3: string;
  q4: string;
  q5: string;
}

interface ICPResult {
  icpProfile: {
    industry: string;
    companySize: string;
    buyerRole: string;
    techStackSignals: string[];
    budgetIndicators: string[];
  };
  jtbdMap: {
    functionalJob: string;
    socialJob: string;
    emotionalJob: string;
  };
  disqualificationCriteria: string[];
  whereToFind: {
    linkedinSearchStrings: string[];
    communities: string[];
    events: string[];
    keywords: string[];
  };
  openingMessage: string;
}

const experiencedQuestions = [
  { key: "q1", label: "What do you sell?", placeholder: "Describe your product or service in one sentence", type: "input" as const },
  { key: "q2", label: "Have you sold this before?", placeholder: "", type: "choice" as const },
  { key: "q3", label: "Describe your best 2-3 customers.", placeholder: "Who are they? Industry, size, role of the buyer.", type: "textarea" as const },
  { key: "q4", label: "What problem were they solving when they found you?", placeholder: "What triggered them to look for a solution?", type: "textarea" as const },
  { key: "q5", label: "Why did they pick you over alternatives?", placeholder: "What made you the right choice vs. competitors or doing nothing?", type: "textarea" as const },
];

const preRevenueQuestions = [
  { key: "q1", label: "What do you sell?", placeholder: "Describe your product or service in one sentence", type: "input" as const },
  { key: "q2", label: "Have you sold this before?", placeholder: "", type: "choice" as const },
  { key: "q3", label: "Who do you think needs this most?", placeholder: "Role, company type, situation. Paint the picture.", type: "textarea" as const },
  { key: "q4", label: "What's the painful alternative they use today?", placeholder: "Excel, manual process, outsourced, or nothing at all?", type: "textarea" as const },
  { key: "q5", label: "Why would they switch to you?", placeholder: "What makes your solution worth changing their current behavior?", type: "textarea" as const },
];

function ResultCard({ result, path }: { result: ICPResult; path: Path }) {
  const [copied, setCopied] = useState(false);

  const toText = useCallback(() => {
    const r = result;
    return `ICP DIAGNOSTIC RESULTS
======================

ICP PROFILE
Industry: ${r.icpProfile.industry}
Company Size: ${r.icpProfile.companySize}
Buyer Role: ${r.icpProfile.buyerRole}
Tech Stack Signals: ${r.icpProfile.techStackSignals.join(", ")}
Budget Indicators: ${r.icpProfile.budgetIndicators.join(", ")}

JOBS TO BE DONE
Functional: ${r.jtbdMap.functionalJob}
Social: ${r.jtbdMap.socialJob}
Emotional: ${r.jtbdMap.emotionalJob}

DISQUALIFICATION CRITERIA
${r.disqualificationCriteria.map((c, i) => `${i + 1}. ${c}`).join("\n")}

WHERE TO FIND THEM
LinkedIn Searches: ${r.whereToFind.linkedinSearchStrings.join(" | ")}
Communities: ${r.whereToFind.communities.join(", ")}
Events: ${r.whereToFind.events.join(", ")}
Keywords: ${r.whereToFind.keywords.join(", ")}

OPENING MESSAGE
${r.openingMessage}

---
Built on Colin Chapman's sales methodology | forgehouse.io`;
  }, [result]);

  const handleCopy = () => {
    navigator.clipboard.writeText(toText());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    if (typeof window !== "undefined" && (window as any).posthog) {
      (window as any).posthog.capture("tool_result_copied", { tool: "icp-diagnostic" });
    }
  };

  const sections = [
    {
      icon: IconTarget,
      title: "ICP Profile",
      content: (
        <div className="space-y-3">
          <div><span className="text-muted text-sm">Industry</span><p className="text-foreground">{result.icpProfile.industry}</p></div>
          <div><span className="text-muted text-sm">Company Size</span><p className="text-foreground">{result.icpProfile.companySize}</p></div>
          <div><span className="text-muted text-sm">Buyer Role</span><p className="text-foreground">{result.icpProfile.buyerRole}</p></div>
          <div>
            <span className="text-muted text-sm">Tech Stack Signals</span>
            <div className="flex flex-wrap gap-2 mt-1">
              {result.icpProfile.techStackSignals.map((s, i) => (
                <span key={i} className="text-sm px-2.5 py-1 rounded-lg bg-white/[0.04] border border-border-light text-foreground">{s}</span>
              ))}
            </div>
          </div>
          <div>
            <span className="text-muted text-sm">Budget Indicators</span>
            <div className="flex flex-wrap gap-2 mt-1">
              {result.icpProfile.budgetIndicators.map((b, i) => (
                <span key={i} className="text-sm px-2.5 py-1 rounded-lg bg-white/[0.04] border border-border-light text-foreground">{b}</span>
              ))}
            </div>
          </div>
        </div>
      ),
    },
    {
      icon: IconBriefcase,
      title: "Jobs to be Done",
      content: (
        <div className="space-y-3">
          <div><span className="text-amber text-xs font-medium uppercase tracking-wider">Functional</span><p className="text-foreground mt-1">{result.jtbdMap.functionalJob}</p></div>
          <div><span className="text-amber text-xs font-medium uppercase tracking-wider">Social</span><p className="text-foreground mt-1">{result.jtbdMap.socialJob}</p></div>
          <div><span className="text-amber text-xs font-medium uppercase tracking-wider">Emotional</span><p className="text-foreground mt-1">{result.jtbdMap.emotionalJob}</p></div>
        </div>
      ),
    },
    {
      icon: IconBan,
      title: "Disqualification Criteria",
      content: (
        <ul className="space-y-2">
          {result.disqualificationCriteria.map((c, i) => (
            <li key={i} className="flex gap-3 text-foreground">
              <span className="text-red-400/80 mt-0.5 shrink-0">✕</span>
              <span>{c}</span>
            </li>
          ))}
        </ul>
      ),
    },
    {
      icon: IconCompass,
      title: "Where to Find Them",
      content: (
        <div className="space-y-4">
          <div>
            <span className="text-muted text-sm">LinkedIn Search Strings</span>
            <div className="space-y-1.5 mt-1.5">
              {result.whereToFind.linkedinSearchStrings.map((s, i) => (
                <code key={i} className="block text-sm px-3 py-2 rounded-lg bg-white/[0.04] border border-border-light text-amber font-mono break-all">{s}</code>
              ))}
            </div>
          </div>
          <div>
            <span className="text-muted text-sm">Communities</span>
            <ul className="mt-1.5 space-y-1">
              {result.whereToFind.communities.map((c, i) => (
                <li key={i} className="text-foreground text-sm">→ {c}</li>
              ))}
            </ul>
          </div>
          <div>
            <span className="text-muted text-sm">Events</span>
            <ul className="mt-1.5 space-y-1">
              {result.whereToFind.events.map((e, i) => (
                <li key={i} className="text-foreground text-sm">→ {e}</li>
              ))}
            </ul>
          </div>
          <div>
            <span className="text-muted text-sm">Keywords They Search</span>
            <div className="flex flex-wrap gap-2 mt-1.5">
              {result.whereToFind.keywords.map((k, i) => (
                <span key={i} className="text-sm px-2.5 py-1 rounded-lg bg-amber/10 border border-amber/20 text-amber">{k}</span>
              ))}
            </div>
          </div>
        </div>
      ),
    },
    {
      icon: IconMessage,
      title: "Opening Message",
      content: (
        <blockquote className="border-l-2 border-amber/40 pl-4 text-foreground italic">
          &ldquo;{result.openingMessage}&rdquo;
        </blockquote>
      ),
    },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {path === "pre-revenue" && (
        <div className="flex items-start gap-3 px-4 py-3 rounded-xl bg-amber/5 border border-amber/10">
          <IconAlertTriangle size={18} className="text-amber mt-0.5 shrink-0" />
          <p className="text-sm text-muted">Based on your hypothesis. Validate by talking to 5 people who match this profile.</p>
        </div>
      )}

      <div className="flex justify-end">
        <button
          onClick={handleCopy}
          className="flex items-center gap-2 text-sm text-muted hover:text-foreground transition px-3 py-1.5 rounded-lg hover:bg-white/[0.04]"
        >
          {copied ? <IconCheck size={16} className="text-green-400" /> : <IconCopy size={16} />}
          {copied ? "Copied" : "Copy to clipboard"}
        </button>
      </div>

      {sections.map((section, i) => (
        <div key={i} className="glass-card p-6">
          <div className="flex items-center gap-3 mb-4">
            <section.icon size={20} className="text-amber" />
            <h3 className="text-lg font-semibold text-foreground">{section.title}</h3>
          </div>
          {section.content}
        </div>
      ))}

      {/* CTA */}
      <div className="text-center pt-4 pb-8">
        <p className="text-muted text-sm mb-3">
          This diagnostic was built on Colin Chapman&apos;s sales methodology.
        </p>
        <Link
          href="/mentors/colin-chapman"
          className="inline-flex items-center gap-2 text-amber hover:text-amber-dark transition font-medium"
          onClick={() => {
            if (typeof window !== "undefined" && (window as any).posthog) {
              (window as any).posthog.capture("tool_cta_clicked", { tool: "icp-diagnostic", target: "colin-chapman" });
            }
          }}
        >
          Go deeper with Colin →
        </Link>
      </div>
    </div>
  );
}

export default function ICPDiagnosticPage() {
  const [step, setStep] = useState(0);
  const [path, setPath] = useState<Path>(null);
  const [answers, setAnswers] = useState<Answers>({ q1: "", q2: "", q3: "", q4: "", q5: "" });
  const [result, setResult] = useState<ICPResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const questions = path === "pre-revenue" ? preRevenueQuestions : experiencedQuestions;
  const currentQuestion = questions[step];
  const totalSteps = 5;

  const canProceed = () => {
    if (step === 1) return false; // choice buttons handle this
    const key = currentQuestion?.key as keyof Answers;
    return (answers[key] || "").trim().length > 0;
  };

  const handleNext = () => {
    if (step < totalSteps - 1) {
      setStep(step + 1);
    }
  };

  const handleBack = () => {
    if (step > 0) {
      if (step === 2) {
        setPath(null);
      }
      setStep(step - 1);
    }
  };

  const handleChoice = (choice: "experienced" | "pre-revenue") => {
    setPath(choice);
    setAnswers((a) => ({ ...a, q2: choice }));
    setStep(2);
    if (typeof window !== "undefined" && (window as any).posthog) {
      (window as any).posthog.capture("tool_path_selected", { tool: "icp-diagnostic", path: choice });
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);

    if (typeof window !== "undefined" && (window as any).posthog) {
      (window as any).posthog.capture("tool_started", { tool: "icp-diagnostic", path });
    }

    try {
      const res = await fetch("/api/tools/icp-diagnostic", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers, path }),
      });

      if (!res.ok) {
        throw new Error("Failed to generate diagnostic");
      }

      const data = await res.json();
      setResult(data.result);

      if (typeof window !== "undefined" && (window as any).posthog) {
        (window as any).posthog.capture("tool_completed", { tool: "icp-diagnostic", path });
      }
    } catch (err) {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleStartOver = () => {
    setStep(0);
    setPath(null);
    setAnswers({ q1: "", q2: "", q3: "", q4: "", q5: "" });
    setResult(null);
    setError(null);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey && currentQuestion?.type === "input" && canProceed()) {
      e.preventDefault();
      handleNext();
    }
  };

  // Result view
  if (result) {
    return (
      <div className="pt-24 pb-16 px-6">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-10">
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-3">Your ICP Diagnostic</h1>
            <p className="text-muted">Here&apos;s who you should be selling to.</p>
          </div>
          <ResultCard result={result} path={path} />
          <div className="text-center mt-8">
            <button
              onClick={handleStartOver}
              className="text-sm text-muted hover:text-foreground transition"
            >
              ← Start over
            </button>
          </div>
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
            <h2 className="text-xl font-semibold mb-2">Analyzing your inputs</h2>
            <p className="text-muted text-sm">Building your ICP using the JTBD framework...</p>
          </div>
        </div>
      </div>
    );
  }

  // Questionnaire view
  return (
    <div className="pt-24 pb-16 px-6">
      <div className="max-w-xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <p className="text-amber text-sm font-medium uppercase tracking-wider mb-3">Free Tool</p>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-3">ICP Diagnostic</h1>
          <p className="text-muted max-w-md mx-auto">
            Define your ideal customer in 60 seconds. Built on the Jobs-to-be-Done framework.
          </p>
        </div>

        {/* Progress */}
        <div className="flex gap-1.5 mb-10 max-w-xs mx-auto">
          {Array.from({ length: totalSteps }).map((_, i) => (
            <div
              key={i}
              className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                i < step ? "bg-amber" : i === step ? "bg-amber/60" : "bg-border-light"
              }`}
            />
          ))}
        </div>

        {/* Question Card */}
        <div className="glass-card p-8 md:p-10">
          <div className="min-h-[200px] flex flex-col justify-between">
            <div>
              <p className="text-xs text-muted mb-2 uppercase tracking-wider">
                Question {step + 1} of {totalSteps}
              </p>
              <h2 className="text-xl md:text-2xl font-semibold mb-6 leading-snug">
                {currentQuestion?.label}
              </h2>

              {/* Input types */}
              {currentQuestion?.type === "input" && (
                <input
                  type="text"
                  value={answers[currentQuestion.key as keyof Answers]}
                  onChange={(e) =>
                    setAnswers((a) => ({ ...a, [currentQuestion.key]: e.target.value }))
                  }
                  onKeyDown={handleKeyDown}
                  placeholder={currentQuestion.placeholder}
                  className="w-full bg-transparent border-b border-border-light focus:border-amber outline-none text-lg py-3 text-foreground placeholder:text-muted/50 transition"
                  autoFocus
                />
              )}

              {currentQuestion?.type === "textarea" && (
                <textarea
                  value={answers[currentQuestion.key as keyof Answers]}
                  onChange={(e) =>
                    setAnswers((a) => ({ ...a, [currentQuestion.key]: e.target.value }))
                  }
                  placeholder={currentQuestion.placeholder}
                  className="w-full bg-white/[0.03] border border-border-light focus:border-amber/40 rounded-xl outline-none text-base p-4 text-foreground placeholder:text-muted/50 transition resize-none min-h-[120px]"
                  autoFocus
                />
              )}

              {currentQuestion?.type === "choice" && (
                <div className="flex gap-4 mt-2">
                  <button
                    onClick={() => handleChoice("experienced")}
                    className="flex-1 py-4 px-6 rounded-xl border border-border-light hover:border-amber/40 hover:bg-amber/5 transition text-center font-medium"
                  >
                    Yes
                  </button>
                  <button
                    onClick={() => handleChoice("pre-revenue")}
                    className="flex-1 py-4 px-6 rounded-xl border border-border-light hover:border-amber/40 hover:bg-amber/5 transition text-center font-medium"
                  >
                    Not yet
                  </button>
                </div>
              )}
            </div>

            {/* Navigation */}
            {currentQuestion?.type !== "choice" && (
              <div className="flex justify-between items-center mt-8 pt-4">
                <button
                  onClick={handleBack}
                  className={`flex items-center gap-1.5 text-sm text-muted hover:text-foreground transition ${
                    step === 0 ? "invisible" : ""
                  }`}
                >
                  <IconArrowLeft size={16} />
                  Back
                </button>

                {step < totalSteps - 1 ? (
                  <button
                    onClick={handleNext}
                    disabled={!canProceed()}
                    className="bg-amber text-white px-6 py-2.5 rounded-xl font-medium hover:bg-amber-dark transition disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    Continue
                  </button>
                ) : (
                  <button
                    onClick={handleSubmit}
                    disabled={!canProceed()}
                    className="bg-amber text-white px-6 py-2.5 rounded-xl font-medium hover:bg-amber-dark transition disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    Generate Your ICP
                  </button>
                )}
              </div>
            )}

            {error && (
              <p className="text-red-400 text-sm mt-4 text-center">{error}</p>
            )}
          </div>
        </div>

        {/* Footer note */}
        <p className="text-center text-muted/50 text-xs mt-6">
          No login required. Your data is not stored.
        </p>
      </div>
    </div>
  );
}
