"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import {
  IconX,
  IconCircleCheck,
  IconChevronDown,
  IconLoader2,
  IconMail,
  IconCopy,
  IconUserPlus,
  IconRocket,
  IconPhoto,
  IconFileText,
  IconMessageCircle,
  IconExternalLink,
  IconCalendarPlus,
  IconShieldCheck,
  IconCalendar,
  IconUser,
  IconLink,
  IconCurrencyDollar,
} from "@tabler/icons-react";
import type { EnrichedOnboarding, ReadinessStep } from "@/app/api/admin/onboardings/route";
import ClipButton from "@/components/ui/ClipButton";

const CHECKLIST_META: {
  key: ReadinessStep;
  title: string;
  short: string;
  Icon: typeof IconMail;
}[] = [
  { key: "link_sent", title: "Invite sent", short: "Link delivered", Icon: IconMail },
  { key: "extraction_complete", title: "Extraction", short: "Knowledge capture", Icon: IconMessageCircle },
  { key: "calibration_complete", title: "Calibration", short: "Voice & tone", Icon: IconMessageCircle },
  { key: "ingestion_complete", title: "Ingestion", short: "KB built", Icon: IconFileText },
  { key: "profile_complete", title: "Profile & pricing", short: "Bio, image URL, monthly price (USD)", Icon: IconPhoto },
  { key: "agent_approved", title: "Agent approval", short: "Quality sign-off before launch", Icon: IconShieldCheck },
  { key: "launch_ready", title: "Live", short: "Public mentor", Icon: IconRocket },
];

function formatShortDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function PhasePill({ phase }: { phase: string }) {
  const styles: Record<string, string> = {
    extraction: "bg-white/8 text-muted",
    calibration: "bg-white/16 text-foreground",
    ingestion: "bg-[#E3B341]/15 text-[#E3B341]",
    complete: "bg-accent/15 text-accent",
  };
  const cls = styles[phase] ?? "bg-white/8 text-muted";
  return (
    <span
      className={`mono inline-flex items-center rounded-sm px-2 py-0.5 text-[10px] uppercase tracking-[0.08em] tabular-nums ${cls}`}
    >
      {phase}
    </span>
  );
}

function SummaryTile({
  icon,
  label,
  children,
  className = "",
}: {
  icon: ReactNode;
  label: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`rounded-md border border-border bg-background p-4 ${className}`}
    >
      <div className="flex gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-surface-light text-muted">
          {icon}
        </div>
        <div className="min-w-0 flex-1">
          <p className="mono text-[10px] uppercase tracking-[0.06em] text-faint">
            {label}
          </p>
          <div className="mt-1 text-sm leading-snug text-foreground">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}

function centsToUsdDisplay(cents: number | null): string {
  if (cents == null || cents <= 0) return "";
  return String(cents / 100);
}

function profileFieldsMeetChecklist(
  bio: string,
  avatar: string,
  priceUsdStr: string
): { complete: boolean; bioOk: boolean; imageOk: boolean; priceOk: boolean } {
  const bioOk = bio.trim().length > 0;
  const av = avatar.trim();
  const imageOk =
    /^https?:\/\//i.test(av) || (av.startsWith("/") && av.length > 1);
  const usd = parseFloat(priceUsdStr);
  const priceOk = !Number.isNaN(usd) && usd > 0;
  return {
    complete: bioOk && imageOk && priceOk,
    bioOk,
    imageOk,
    priceOk,
  };
}

function ProfileInlineFields({
  record,
  onSaved,
  showToast,
}: {
  record: EnrichedOnboarding;
  onSaved: () => void;
  showToast: (msg: string, durationMs?: number) => void;
}) {
  const [bio, setBio] = useState(record.mentorBio ?? "");
  const [avatarUrl, setAvatarUrl] = useState(record.mentorAvatarUrl ?? "");
  const [priceUsd, setPriceUsd] = useState(() =>
    centsToUsdDisplay(record.mentorMonthlyPrice)
  );
  const [saving, setSaving] = useState(false);
  const [saveBanner, setSaveBanner] = useState<"success" | "pending_checklist" | null>(
    null
  );

  useEffect(() => {
    setBio(record.mentorBio ?? "");
    setAvatarUrl(record.mentorAvatarUrl ?? "");
    setPriceUsd(centsToUsdDisplay(record.mentorMonthlyPrice));
  }, [record.id, record.mentorBio, record.mentorAvatarUrl, record.mentorMonthlyPrice]);

  useEffect(() => {
    setSaveBanner(null);
  }, [record.id]);

  useEffect(() => {
    if (!saveBanner) return;
    const t = window.setTimeout(() => setSaveBanner(null), 8000);
    return () => window.clearTimeout(t);
  }, [saveBanner]);

  if (!record.mentorFound) {
    return (
      <p className="mt-2 text-xs leading-relaxed text-muted">
        The mentor profile row is created when ingestion runs. Then you can set bio, a public image URL (e.g. LinkedIn CDN or any https link), and monthly price in USD.
      </p>
    );
  }

  const save = async () => {
    const usd = parseFloat(priceUsd);
    if (Number.isNaN(usd) || usd < 0) {
      showToast("Enter a valid monthly price (USD)");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/mentors/${record.slug}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bio,
          avatar_url: avatarUrl,
          monthly_price_usd: usd,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(
          typeof data.error === "string" ? data.error : "Save failed"
        );
      }
      const checklist = profileFieldsMeetChecklist(bio, avatarUrl, priceUsd);
      setSaveBanner(checklist.complete ? "success" : "pending_checklist");
      showToast(
        checklist.complete
          ? "Profile saved — checklist updated"
          : "Profile saved — see what’s still needed below",
        4500
      );
      onSaved();
    } catch (e) {
      showToast(e instanceof Error ? e.message : "Save failed");
    } finally {
      setSaving(false);
    }
  };

  const checklistFromServer = record.completedSteps.includes("profile_complete");
  const draftCheck = profileFieldsMeetChecklist(bio, avatarUrl, priceUsd);

  return (
    <div className="mt-3 space-y-3 rounded-md border border-border bg-surface p-3">
      {checklistFromServer ? (
        <div className="mono flex items-center gap-2 rounded-md bg-accent/15 px-3 py-2 text-[12px] text-accent">
          <IconCircleCheck size={18} stroke={2} className="shrink-0 text-accent" />
          Checklist step complete — bio, image, and price are set
        </div>
      ) : null}
      {saveBanner === "pending_checklist" || (saveBanner === "success" && !checklistFromServer) ? (
        <div className="rounded-md border border-[#E3B341]/25 bg-[#E3B341]/12 px-3 py-2 text-xs text-muted">
          <p className="mono text-[11px] uppercase tracking-[0.06em] text-[#E3B341]">Saved to database</p>
          <p className="mt-1">
            This step turns green when all of the following are true:
          </p>
          <ul className="mt-1.5 list-inside list-disc space-y-0.5">
            <li className={draftCheck.bioOk ? "text-accent" : ""}>
              Bio not empty {draftCheck.bioOk ? "✓" : ""}
            </li>
            <li className={draftCheck.imageOk ? "text-accent" : ""}>
              Image: https URL or site path (e.g. /mentors/photo.png){" "}
              {draftCheck.imageOk ? "✓" : ""}
            </li>
            <li className={draftCheck.priceOk ? "text-accent" : ""}>
              Monthly price greater than $0 {draftCheck.priceOk ? "✓" : ""}
            </li>
          </ul>
        </div>
      ) : null}
      <div>
        <label
          htmlFor={`onboard-bio-${record.id}`}
          className="mono mb-1 block text-[11px] uppercase tracking-[0.06em] text-faint"
        >
          Bio
        </label>
        <textarea
          id={`onboard-bio-${record.id}`}
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          rows={4}
          placeholder="Short mentor bio for their public profile…"
          className="fh-scroll w-full resize-y rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground transition placeholder:text-faint focus:border-accent/60 focus:outline-none"
        />
      </div>
      <div>
        <label
          htmlFor={`onboard-avatar-${record.id}`}
          className="mono mb-1 block text-[11px] uppercase tracking-[0.06em] text-faint"
        >
          Profile image URL
        </label>
        <input
          id={`onboard-avatar-${record.id}`}
          type="text"
          inputMode="url"
          value={avatarUrl}
          onChange={(e) => setAvatarUrl(e.target.value)}
          placeholder="https://… or /mentors/your-slug.png"
          className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground transition placeholder:text-faint focus:border-accent/60 focus:outline-none"
        />
        <p className="mt-1 text-[11px] leading-snug text-faint">
          Use a full https image URL (LinkedIn, CDN, etc.) or a site path starting with / (e.g. /mentors/kyle-parratt.png).
        </p>
      </div>
      <div>
        <label
          htmlFor={`onboard-price-${record.id}`}
          className="mono mb-1 block text-[11px] uppercase tracking-[0.06em] text-faint"
        >
          Monthly price (USD)
        </label>
        <input
          id={`onboard-price-${record.id}`}
          type="number"
          min={0}
          step={1}
          value={priceUsd}
          onChange={(e) => setPriceUsd(e.target.value)}
          placeholder="299"
          className="mono w-full max-w-[200px] rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground transition placeholder:text-faint focus:border-accent/60 focus:outline-none"
        />
        <p className="mt-1 text-[11px] text-faint">
          Whole dollars; stored as cents for billing. Stripe product mapping is separate.
        </p>
      </div>
      <div className="w-full max-w-[200px]">
        {saving ? (
          <div className="clip-corner mono flex w-full items-center gap-2 bg-white/8 px-5 py-3.5 text-[11px] leading-[1.4] tracking-[0.01em] text-faint">
            <IconLoader2 size={14} className="animate-spin" />
            Saving…
          </div>
        ) : (
          <ClipButton variant="paper" onClick={() => void save()}>
            Save profile
          </ClipButton>
        )}
      </div>
    </div>
  );
}

function AgentApprovalInline({
  record,
  onUpdated,
  showToast,
}: {
  record: EnrichedOnboarding;
  onUpdated: () => void;
  showToast: (msg: string) => void;
}) {
  const [loading, setLoading] = useState(false);

  const profileDone = record.completedSteps.includes("profile_complete");
  const ingestionDone = record.currentPhase === "complete";
  const canEnable =
    ingestionDone && profileDone && !record.agentApproved;

  const enable = async () => {
    const ok = window.confirm(
      "Enable agent approval?\n\nThis marks the mentor agent as quality-approved for launch. Continue?"
    );
    if (!ok) return;

    setLoading(true);
    try {
      const res = await fetch(`/api/admin/onboardings/${record.id}/approve`, {
        method: "POST",
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(
          typeof data.error === "string" ? data.error : "Approval failed"
        );
      }
      showToast("Agent approval enabled");
      onUpdated();
    } catch (e) {
      showToast(e instanceof Error ? e.message : "Approval failed");
    } finally {
      setLoading(false);
    }
  };

  if (record.agentApproved) {
    return (
      <div className="mono mt-3 rounded-md bg-accent/15 px-3 py-2.5 text-[12px] text-accent">
        <span className="uppercase tracking-[0.08em]">Approved</span>
        {record.agentApprovedAt ? (
          <span className="text-accent/70">
            {" "}
            · {formatShortDate(record.agentApprovedAt)}
          </span>
        ) : null}
      </div>
    );
  }

  return (
    <div className="mt-3 space-y-2">
      {!ingestionDone && (
        <p className="text-xs text-muted">
          Finish ingestion (launch step) before you can enable approval.
        </p>
      )}
      {ingestionDone && !profileDone && (
        <p className="text-xs text-muted">
          Complete profile & pricing above (bio, https image URL, monthly USD price) first.
        </p>
      )}
      <div className="w-full max-w-[200px]">
        {!canEnable || loading ? (
          <div className="clip-corner mono flex w-full items-center gap-2 bg-white/8 px-5 py-3.5 text-[11px] leading-[1.4] tracking-[0.01em] text-faint">
            {loading ? (
              <>
                <IconLoader2 size={14} className="animate-spin" />
                Enabling…
              </>
            ) : (
              "Enable"
            )}
          </div>
        ) : (
          <ClipButton variant="paper" onClick={() => void enable()}>
            Enable
          </ClipButton>
        )}
      </div>
    </div>
  );
}

export default function MentorOnboardingDetailModal({
  open,
  record,
  onClose,
  onUpdated,
}: {
  open: boolean;
  record: EnrichedOnboarding | null;
  onClose: () => void;
  onUpdated: () => void;
}) {
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [actionsOpen, setActionsOpen] = useState(false);
  const actionsRef = useRef<HTMLDivElement>(null);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    if (!open) {
      setActionsOpen(false);
      setToast(null);
    }
  }, [open]);

  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (!actionsRef.current?.contains(e.target as Node)) {
        setActionsOpen(false);
      }
    }
    if (actionsOpen) {
      document.addEventListener("mousedown", onDocClick);
      return () => document.removeEventListener("mousedown", onDocClick);
    }
  }, [actionsOpen]);

  const showToast = (msg: string, durationMs = 2800) => {
    setToast(msg);
    setTimeout(() => setToast(null), durationMs);
  };

  if (!open || !record) return null;

  const onboardingLink =
    typeof window !== "undefined"
      ? `${window.location.origin}/onboard/${record.id}`
      : "";

  const isDone = (step: ReadinessStep) => record.completedSteps.includes(step);

  const run = async (key: string, fn: () => Promise<void>) => {
    setActionLoading(key);
    try {
      await fn();
      onUpdated();
    } catch (e) {
      showToast(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setActionLoading(null);
      setActionsOpen(false);
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(onboardingLink);
    showToast("Link copied");
    setActionsOpen(false);
  };

  const handleOpenChat = () => {
    window.open(`/chat/${record.slug}`, "_blank");
    setActionsOpen(false);
  };

  const readinessPct = Math.round(
    (record.completedSteps.length / record.totalSteps) * 100
  );

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
      {toast && (
        <div className="mono fixed right-6 top-24 z-[70] max-w-sm rounded-md border border-border border-l-4 border-l-accent bg-surface-light pl-3 pr-4 py-3 text-[12px] leading-snug text-foreground shadow-2xl">
          {toast}
        </div>
      )}

      <div
        className="absolute inset-0"
        aria-hidden
        onClick={onClose}
      />

      <div className="relative flex max-h-[min(90dvh,calc(100dvh-5rem))] w-full max-w-2xl flex-col overflow-hidden rounded-lg border border-border bg-surface shadow-2xl">
        <header className="shrink-0 border-b border-border bg-surface px-6 py-5">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2.5">
                <h2 className="truncate text-[24px] leading-none text-foreground">
                  {record.mentorName}
                </h2>
                <PhasePill phase={record.currentPhase} />
              </div>
              <p className="mono mt-1 truncate text-[12px] text-muted">{record.email}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                <span className="mono inline-flex items-center gap-1.5 rounded-sm border border-border bg-background px-2.5 py-1.5 text-[11px] tracking-[0.04em] text-muted">
                  <IconCalendar size={15} stroke={1.5} className="text-faint" />
                  Created {formatShortDate(record.createdAt)}
                </span>
                <span className="mono inline-flex items-center gap-1.5 rounded-sm border border-border bg-background px-2.5 py-1.5 text-[11px] tracking-[0.04em] text-muted">
                  <IconCalendarPlus size={15} stroke={1.5} className="text-faint" />
                  Expires {formatShortDate(record.expiresAt)}
                </span>
              </div>
            </div>
            <div className="flex shrink-0 items-center gap-1">
              <div className="relative" ref={actionsRef}>
                <button
                  type="button"
                  onClick={() => setActionsOpen((o) => !o)}
                  className="mono inline-flex h-10 items-center gap-1.5 rounded-md border border-border px-3.5 text-[12px] tracking-[0.02em] text-foreground transition hover:border-border-light hover:bg-surface-light"
                >
                  Actions
                  <IconChevronDown
                    size={16}
                    stroke={1.5}
                    className={`transition-transform ${actionsOpen ? "rotate-180" : ""}`}
                  />
                </button>
                {actionsOpen && (
                  <div className="absolute right-0 z-10 mt-1 w-56 overflow-hidden rounded-md border border-border bg-surface-light py-1 shadow-2xl">
                    <button
                      type="button"
                      onClick={handleCopyLink}
                      className="mono flex w-full items-center gap-2 px-3 py-2 text-left text-[12px] text-muted transition hover:bg-white/5 hover:text-foreground"
                    >
                      <IconCopy size={16} stroke={1.5} className="text-faint" />
                      Copy onboarding link
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        run("resend", async () => {
                          const res = await fetch(
                            `/api/admin/onboardings/${record.id}/resend-invite`,
                            { method: "POST" }
                          );
                          const data = await res.json().catch(() => ({}));
                          if (!res.ok) {
                            throw new Error(
                              typeof data.error === "string"
                                ? data.error
                                : "Resend failed"
                            );
                          }
                          showToast("Invitation email sent");
                        })
                      }
                      disabled={actionLoading === "resend"}
                      className="mono flex w-full items-center gap-2 px-3 py-2 text-left text-[12px] text-muted transition hover:bg-white/5 hover:text-foreground disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      {actionLoading === "resend" ? (
                        <IconLoader2 size={16} className="animate-spin" />
                      ) : (
                        <IconMail size={16} stroke={1.5} className="text-faint" />
                      )}
                      Resend invitation email
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        run("extend", async () => {
                          const res = await fetch(
                            `/api/admin/onboardings/${record.id}/extend-expiry`,
                            { method: "POST" }
                          );
                          const data = await res.json().catch(() => ({}));
                          if (!res.ok) {
                            throw new Error(
                              typeof data.error === "string"
                                ? data.error
                                : "Extend failed"
                            );
                          }
                          if (typeof data.expiresAt === "string") {
                            showToast(
                              `Expiry extended to ${formatShortDate(data.expiresAt)}`
                            );
                          } else {
                            showToast("Expiry extended by 7 days");
                          }
                        })
                      }
                      disabled={actionLoading === "extend"}
                      className="mono flex w-full items-center gap-2 px-3 py-2 text-left text-[12px] text-muted transition hover:bg-white/5 hover:text-foreground disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      {actionLoading === "extend" ? (
                        <IconLoader2 size={16} className="animate-spin" />
                      ) : (
                        <IconCalendarPlus size={16} stroke={1.5} className="text-faint" />
                      )}
                      Extend expiry by 7 days
                    </button>
                    <div className="my-1 border-t border-border" />
                    <button
                      type="button"
                      onClick={() =>
                        run("activate", async () => {
                          const res = await fetch(
                            `/api/mentors/${record.slug}/activate`,
                            { method: "POST" }
                          );
                          if (!res.ok) throw new Error("Activate failed");
                          showToast("Mentor activated");
                        })
                      }
                      disabled={
                        !record.mentorFound ||
                        record.mentorActive ||
                        actionLoading === "activate"
                      }
                      className="mono flex w-full items-center gap-2 px-3 py-2 text-left text-[12px] text-muted transition hover:bg-white/5 hover:text-foreground disabled:pointer-events-none disabled:opacity-40"
                    >
                      {actionLoading === "activate" ? (
                        <IconLoader2 size={16} className="animate-spin" />
                      ) : (
                        <IconRocket size={16} stroke={1.5} className="text-faint" />
                      )}
                      Activate mentor
                    </button>
                    <div className="my-1 border-t border-border" />
                    <button
                      type="button"
                      onClick={() =>
                        run("account", async () => {
                          const res = await fetch(
                            `/api/admin/onboardings/${record.id}/create-account`,
                            { method: "POST" }
                          );
                          const result = await res.json();
                          if (!res.ok) throw new Error(result.error ?? "Failed");
                          showToast(result.message ?? "Done");
                        })
                      }
                      disabled={actionLoading === "account"}
                      className="mono flex w-full items-center gap-2 px-3 py-2 text-left text-[12px] text-muted transition hover:bg-white/5 hover:text-foreground disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      {actionLoading === "account" ? (
                        <IconLoader2 size={16} className="animate-spin" />
                      ) : (
                        <IconUserPlus size={16} stroke={1.5} className="text-faint" />
                      )}
                      Create / upgrade mentor account
                    </button>
                    {record.mentorFound && (
                      <button
                        type="button"
                        onClick={handleOpenChat}
                        className="mono flex w-full items-center gap-2 px-3 py-2 text-left text-[12px] text-muted transition hover:bg-white/5 hover:text-foreground"
                      >
                        <IconExternalLink size={16} stroke={1.5} className="text-faint" />
                        Open test chat
                      </button>
                    )}
                  </div>
                )}
              </div>
              <button
                type="button"
                onClick={onClose}
                className="flex h-10 w-10 items-center justify-center rounded-md text-faint transition hover:bg-surface-light hover:text-foreground"
                aria-label="Close"
              >
                <IconX size={22} stroke={1.5} />
              </button>
            </div>
          </div>

          <div className="mt-5 rounded-md bg-background p-3.5 ring-1 ring-inset ring-border">
            <div className="mono mb-2 flex items-center justify-between text-[11px] uppercase tracking-[0.08em] text-faint">
              <span>Launch readiness</span>
              <span className="tabular-nums text-foreground">
                {record.completedSteps.length}/{record.totalSteps} · {readinessPct}%
              </span>
            </div>
            <div className="h-2.5 overflow-hidden rounded-full bg-white/10">
              <div
                className="h-2.5 rounded-full bg-accent transition-all duration-500"
                style={{ width: `${readinessPct}%` }}
              />
            </div>
          </div>
        </header>

        <div className="fh-scroll min-h-0 flex-1 overflow-y-auto px-6 py-5">
          <h3 className="mono mb-3 text-[11px] uppercase tracking-[0.08em] text-faint">
            Launch checklist
          </h3>
          <ol className="space-y-0 overflow-hidden rounded-md border border-border bg-background">
            {CHECKLIST_META.map((item, index) => {
              const done = isDone(item.key);
              const Icon = item.Icon;
              return (
                <li
                  key={item.key}
                  className={`flex gap-3 px-4 py-3.5 ${
                    index > 0 ? "border-t border-border" : ""
                  }`}
                >
                  <div
                    className={`mono mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs ${
                      done
                        ? "bg-accent/15 text-accent"
                        : "bg-white/8 text-faint"
                    }`}
                  >
                    {done ? (
                      <IconCircleCheck size={16} stroke={2} />
                    ) : (
                      index + 1
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <Icon
                        size={16}
                        stroke={1.5}
                        className={`shrink-0 ${done ? "text-accent" : "text-faint"}`}
                      />
                      <span className="text-[17px] text-foreground">
                        {item.title}
                      </span>
                    </div>
                    <p className="mono mt-0.5 text-[11px] tracking-[0.02em] text-faint">{item.short}</p>
                    {item.key === "profile_complete" ? (
                      <ProfileInlineFields
                        record={record}
                        onSaved={onUpdated}
                        showToast={showToast}
                      />
                    ) : item.key === "agent_approved" ? (
                      <AgentApprovalInline
                        record={record}
                        onUpdated={onUpdated}
                        showToast={showToast}
                      />
                    ) : (
                      <ChecklistDetail record={record} stepKey={item.key} />
                    )}
                  </div>
                </li>
              );
            })}
          </ol>

          <div className="mt-6">
            <h3 className="mono mb-3 text-[11px] uppercase tracking-[0.08em] text-faint">
              Session summary
            </h3>
            <div className="grid gap-3 sm:grid-cols-2">
              <SummaryTile
                icon={<IconMessageCircle size={20} stroke={1.5} />}
                label="Messages"
              >
                <span className="mono text-[12px] tabular-nums text-foreground">
                  {record.programVersion >= 2 ? (
                    <>
                      <span className="text-faint">Modules</span>{" "}
                      {record.modulesDone}/{record.modulesTotal}
                      <span className="mx-1.5 text-faint">·</span>
                      <span className="text-faint">Messages</span>{" "}
                      {record.extractionMessageCount}
                    </>
                  ) : (
                    <>
                      <span className="text-faint">Extraction</span>{" "}
                      {record.extractionMessageCount}
                      <span className="mx-1.5 text-faint">·</span>
                      <span className="text-faint">Calibration</span>{" "}
                      {record.calibrationMessageCount}
                    </>
                  )}
                </span>
              </SummaryTile>
              <SummaryTile
                icon={<IconUser size={20} stroke={1.5} />}
                label="Mentor record"
              >
                {record.mentorFound ? (
                  <span className="flex flex-wrap items-center gap-2">
                    <span className="mono text-xs text-foreground">
                      {record.slug}
                    </span>
                    <span
                      className={`mono rounded-sm px-2 py-0.5 text-[10px] uppercase tracking-[0.08em] ${
                        record.mentorActive
                          ? "bg-accent/15 text-accent"
                          : "bg-white/8 text-muted"
                      }`}
                    >
                      {record.mentorActive ? "Active" : "Inactive"}
                    </span>
                  </span>
                ) : (
                  <span className="mono text-[12px] text-faint">Not created yet</span>
                )}
              </SummaryTile>
              <SummaryTile
                icon={<IconLink size={20} stroke={1.5} />}
                label="Onboarding link"
                className="sm:col-span-2"
              >
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
                  <p
                    className="mono min-w-0 flex-1 truncate rounded-md bg-surface px-3 py-2 text-[11px] leading-relaxed text-muted ring-1 ring-border"
                    title={onboardingLink}
                  >
                    {onboardingLink}
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(onboardingLink);
                      showToast("Link copied to clipboard", 3200);
                    }}
                    className="mono inline-flex shrink-0 items-center justify-center gap-1.5 self-start rounded-md border border-border px-3 py-2 text-[12px] tracking-[0.02em] text-foreground transition hover:bg-surface-light sm:self-center"
                  >
                    <IconCopy size={14} stroke={1.5} />
                    Copy
                  </button>
                </div>
              </SummaryTile>
              <SummaryTile
                icon={<IconCurrencyDollar size={20} stroke={1.5} />}
                label="Monthly price"
              >
                {record.mentorMonthlyPrice != null &&
                record.mentorMonthlyPrice > 0 ? (
                  <span className="mono tabular-nums text-foreground">
                    ${(record.mentorMonthlyPrice / 100).toFixed(0)}
                    <span className="ml-1 text-[11px] text-faint">
                      USD / mo
                    </span>
                  </span>
                ) : (
                  <span className="mono text-[12px] text-faint">Not set</span>
                )}
                <p className="mt-2 text-[11px] leading-snug text-faint">
                  Edit in <span className="text-muted">Profile &amp; pricing</span>{" "}
                  above.
                </p>
              </SummaryTile>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ChecklistDetail({
  record,
  stepKey,
}: {
  record: EnrichedOnboarding;
  stepKey: ReadinessStep;
}) {
  switch (stepKey) {
    case "link_sent":
      return null;
    case "extraction_complete":
      return (
        <p className="mono mt-1 text-[11px] tracking-[0.02em] text-muted">
          {record.programVersion >= 2
            ? `${record.modulesDone}/${record.modulesTotal} module sessions · ${record.extractionMessageCount} messages`
            : `${record.extractionMessageCount} messages`}
        </p>
      );
    case "calibration_complete":
      return (
        <p className="mono mt-1 text-[11px] tracking-[0.02em] text-muted">
          {record.calibrationMessageCount} messages
        </p>
      );
    case "ingestion_complete":
      return (
        <p className="mono mt-1 text-[11px] tracking-[0.02em] text-muted">
          {record.ingestionChunks != null
            ? `${record.ingestionChunks} chunks embedded`
            : "Not run yet"}
        </p>
      );
    case "profile_complete":
    case "agent_approved":
      return null;
    case "launch_ready":
      return (
        <p className="mono mt-1 text-[11px] tracking-[0.02em] text-muted">
          {record.mentorActive ? "Mentor is live on the platform." : "Activate when ready (Actions menu)."}
        </p>
      );
    default:
      return null;
  }
}
