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

const FIELD_LABEL = "mono text-[11px] tracking-[0.06em] uppercase text-muted";
const CHIP = "mono text-[12px] tracking-[0.02em] px-2.5 py-1 rounded-md bg-foreground/[0.04] border border-border text-foreground";

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
        <div className="space-y-4">
          <div>
            <p className={FIELD_LABEL}>Industry</p>
            <p className="mt-1.5 text-[16px] leading-[1.5] text-foreground">{result.icpProfile.industry}</p>
          </div>
          <div>
            <p className={FIELD_LABEL}>Company Size</p>
            <p className="mt-1.5 text-[16px] leading-[1.5] text-foreground">{result.icpProfile.companySize}</p>
          </div>
          <div>
            <p className={FIELD_LABEL}>Buyer Role</p>
            <p className="mt-1.5 text-[16px] leading-[1.5] text-foreground">{result.icpProfile.buyerRole}</p>
          </div>
          <div>
            <p className={FIELD_LABEL}>Tech Stack Signals</p>
            <div className="flex flex-wrap gap-2 mt-2">
              {result.icpProfile.techStackSignals.map((s, i) => (
                <span key={i} className={CHIP}>{s}</span>
              ))}
            </div>
          </div>
          <div>
            <p className={FIELD_LABEL}>Budget Indicators</p>
            <div className="flex flex-wrap gap-2 mt-2">
              {result.icpProfile.budgetIndicators.map((b, i) => (
                <span key={i} className={CHIP}>{b}</span>
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
        <div className="space-y-4">
          <div>
            <p className="mono text-[11px] tracking-[0.06em] uppercase text-accent">Functional</p>
            <p className="mt-1.5 text-[16px] leading-[1.5] text-foreground">{result.jtbdMap.functionalJob}</p>
          </div>
          <div>
            <p className="mono text-[11px] tracking-[0.06em] uppercase text-accent">Social</p>
            <p className="mt-1.5 text-[16px] leading-[1.5] text-foreground">{result.jtbdMap.socialJob}</p>
          </div>
          <div>
            <p className="mono text-[11px] tracking-[0.06em] uppercase text-accent">Emotional</p>
            <p className="mt-1.5 text-[16px] leading-[1.5] text-foreground">{result.jtbdMap.emotionalJob}</p>
          </div>
        </div>
      ),
    },
    {
      icon: IconBan,
      title: "Disqualification Criteria",
      content: (
        <ul className="space-y-2.5">
          {result.disqualificationCriteria.map((c, i) => (
            <li key={i} className="flex gap-3 text-[16px] leading-[1.5] text-foreground">
              <span className="text-[#E06C5C] mt-0.5 shrink-0">✕</span>
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
        <div className="space-y-5">
          <div>
            <p className={FIELD_LABEL}>LinkedIn Search Strings</p>
            <div className="space-y-1.5 mt-2">
              {result.whereToFind.linkedinSearchStrings.map((s, i) => (
                <code key={i} className="block mono text-[13px] leading-[1.6] bg-background border border-border rounded-md px-3 py-2 text-accent break-all">{s}</code>
              ))}
            </div>
          </div>
          <div>
            <p className={FIELD_LABEL}>Communities</p>
            <ul className="mt-2 space-y-1">
              {result.whereToFind.communities.map((c, i) => (
                <li key={i} className="text-[16px] leading-[1.5] text-foreground">→ {c}</li>
              ))}
            </ul>
          </div>
          <div>
            <p className={FIELD_LABEL}>Events</p>
            <ul className="mt-2 space-y-1">
              {result.whereToFind.events.map((e, i) => (
                <li key={i} className="text-[16px] leading-[1.5] text-foreground">→ {e}</li>
              ))}
            </ul>
          </div>
          <div>
            <p className={FIELD_LABEL}>Keywords They Search</p>
            <div className="flex flex-wrap gap-2 mt-2">
              {result.whereToFind.keywords.map((k, i) => (
                <span key={i} className="mono text-[12px] tracking-[0.02em] px-2.5 py-1 rounded-md bg-accent/10 border border-accent/25 text-accent">{k}</span>
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
        <blockquote className="border-l-2 border-accent/40 pl-4 text-[17px] leading-[1.6] text-foreground italic">
          &ldquo;{result.openingMessage}&rdquo;
        </blockquote>
      ),
    },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {path === "pre-revenue" && (
        <div className="flex items-start gap-3 px-4 py-3 rounded-md bg-accent/[0.06] border border-accent/20">
          <IconAlertTriangle size={18} className="text-accent mt-0.5 shrink-0" />
          <p className="text-[16px] leading-[1.5] text-muted">Based on your hypothesis. Validate by talking to 5 people who match this profile.</p>
        </div>
      )}

      <div className="flex justify-end">
        <button
          onClick={handleCopy}
          className="mono inline-flex items-center gap-2 text-[12px] tracking-[0.02em] text-accent hover:text-foreground transition"
        >
          {copied ? <IconCheck size={16} /> : <IconCopy size={16} />}
          {copied ? "Copied" : "Copy to clipboard"}
        </button>
      </div>

      {sections.map((section, i) => (
        <div key={i} className="bg-surface border border-border rounded-lg p-6 md:p-7">
          <div className="flex items-center gap-3 mb-5">
            <section.icon size={18} className="text-accent" />
            <h3 className="text-[26px] leading-[1.1] text-foreground">{section.title}</h3>
          </div>
          {section.content}
        </div>
      ))}

      {/* CTA */}
      <div className="pt-4 pb-8">
        <p className="text-[16px] leading-[1.5] text-muted mb-3">
          This diagnostic was built on Colin Chapman&apos;s sales methodology.
        </p>
        <Link
          href="/mentors/colin-chapman"
          className="mono inline-flex items-center gap-3 border border-border-light text-foreground px-6 py-3 rounded-md text-[12px] tracking-[0.02em] hover:border-accent hover:text-accent transition"
          onClick={() => {
            if (typeof window !== "undefined" && (window as any).posthog) {
              (window as any).posthog.capture("tool_cta_clicked", { tool: "icp-diagnostic", target: "colin-chapman" });
            }
          }}
        >
          Go deeper with Colin
          <span aria-hidden="true">›</span>
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
      <div className="pt-16 md:pt-[72px]">
        <section className="px-6 pt-14 md:pt-20 pb-16">
          <div className="max-w-[720px] mx-auto">
            <div className="mb-10">
              <p className="mono text-[13px] text-accent mb-4">Free Tool</p>
              <h1 className="text-[44px] md:text-[60px] leading-[0.92] tracking-[-0.015em]">
                Your ICP Diagnostic
              </h1>
              <p className="mt-5 text-[17px] leading-[1.5] text-muted max-w-[520px]">
                Here&apos;s who you should be selling to.
              </p>
            </div>
            <ResultCard result={result} path={path} />
            <div className="mt-8">
              <button
                onClick={handleStartOver}
                className="mono text-[12px] tracking-[0.02em] text-muted hover:text-accent transition"
              >
                ← Start over
              </button>
            </div>
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
              <h2 className="text-[28px] leading-[1.1] mb-2">Analyzing your inputs</h2>
              <p className="mono text-[11px] tracking-[0.06em] uppercase text-muted">
                Building your ICP using the JTBD framework...
              </p>
            </div>
          </div>
        </section>
      </div>
    );
  }

  // Questionnaire view
  return (
    <div className="pt-16 md:pt-[72px]">
      <section className="px-6 pt-14 md:pt-20 pb-16">
        <div className="max-w-[720px] mx-auto">
          {/* Header */}
          <div className="mb-12">
            <p className="mono text-[13px] text-accent mb-4">Free Tool</p>
            <h1 className="text-[44px] md:text-[60px] leading-[0.92] tracking-[-0.015em]">
              ICP Diagnostic
            </h1>
            <p className="mt-5 text-[17px] leading-[1.5] text-muted max-w-[520px]">
              Define your ideal customer in 60 seconds. Built on the Jobs-to-be-Done framework.
            </p>
          </div>

          {/* Progress */}
          <div className="flex gap-1.5 mb-10">
            {Array.from({ length: totalSteps }).map((_, i) => (
              <div
                key={i}
                className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                  i < step ? "bg-accent" : i === step ? "bg-accent/60" : "bg-border"
                }`}
              />
            ))}
          </div>

          {/* Question Card */}
          <div className="bg-surface border border-border rounded-lg p-6 md:p-8">
            <div className="min-h-[200px] flex flex-col justify-between">
              <div>
                <p className="mono text-[11px] tracking-[0.06em] uppercase text-muted mb-3">
                  Question {step + 1} of {totalSteps}
                </p>
                <h2 className="text-[28px] md:text-[32px] leading-[1.1] tracking-[-0.01em] mb-6">
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
                    className="w-full rounded-md border border-border bg-background px-4 py-3 text-[16px] text-foreground placeholder:text-faint focus:border-accent/60 focus:outline-none transition"
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
                    className="w-full rounded-md border border-border bg-background px-4 py-3 text-[16px] leading-[1.6] text-foreground placeholder:text-faint focus:border-accent/60 focus:outline-none transition resize-none min-h-[240px]"
                    autoFocus
                  />
                )}

                {currentQuestion?.type === "choice" && (
                  <div className="flex gap-4 mt-2">
                    <button
                      onClick={() => handleChoice("experienced")}
                      className="mono flex-1 border border-border-light text-foreground px-6 py-4 rounded-md text-[12px] tracking-[0.02em] hover:border-accent hover:text-accent transition"
                    >
                      Yes
                    </button>
                    <button
                      onClick={() => handleChoice("pre-revenue")}
                      className="mono flex-1 border border-border-light text-foreground px-6 py-4 rounded-md text-[12px] tracking-[0.02em] hover:border-accent hover:text-accent transition"
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
                    className={`mono inline-flex items-center gap-2 text-[12px] tracking-[0.02em] text-muted hover:text-accent transition ${
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
                      className="mono inline-flex items-center gap-3 bg-accent text-[#1B1B18] px-6 py-3 rounded-md text-[12px] tracking-[0.02em] hover:bg-accent-dim transition disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      Continue
                    </button>
                  ) : (
                    <button
                      onClick={handleSubmit}
                      disabled={!canProceed()}
                      className="mono inline-flex items-center gap-3 bg-accent text-[#1B1B18] px-6 py-3 rounded-md text-[12px] tracking-[0.02em] hover:bg-accent-dim transition disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      Generate Your ICP
                    </button>
                  )}
                </div>
              )}

              {error && <p className="mono text-[12px] text-[#E06C5C] mt-4">{error}</p>}
            </div>
          </div>

          {/* Footer note */}
          <p className="mono text-[11px] tracking-[0.06em] uppercase text-faint mt-6">
            No login required. Your data is not stored.
          </p>
        </div>
      </section>
    </div>
  );
}
