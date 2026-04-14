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
    extraction:
      "border-sky-200 bg-sky-50 text-sky-900",
    calibration:
      "border-[rgba(184,145,106,0.35)] bg-[rgba(184,145,106,0.12)] text-[#3a3229]",
    ingestion:
      "border-violet-200 bg-violet-50 text-violet-900",
    complete:
      "border-emerald-200 bg-emerald-50 text-emerald-900",
  };
  const cls =
    styles[phase] ?? "border-[#E5E2DC] bg-[#F5F3F0] text-[#4a4a4a]";
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold capitalize tabular-nums ${cls}`}
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
      className={`rounded-xl border border-[#E8E4DE] bg-white p-4 shadow-[0_1px_2px_rgba(26,26,26,0.04)] ${className}`}
    >
      <div className="flex gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#F5F3F0] text-[#7a7268]">
          {icon}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-semibold uppercase tracking-[0.06em] text-[#9c958c]">
            {label}
          </p>
          <div className="mt-1 text-sm font-medium leading-snug text-[#1A1A1A]">
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
      <p className="mt-2 text-xs leading-relaxed text-[#737373]">
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
    <div className="mt-3 space-y-3 rounded-lg border border-[#EDEAE4] bg-[#FAFAF8] p-3">
      {checklistFromServer ? (
        <div className="flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 px-3 py-2 text-sm font-medium text-green-900">
          <IconCircleCheck size={18} stroke={2} className="shrink-0 text-green-600" />
          Checklist step complete — bio, image, and price are set
        </div>
      ) : null}
      {saveBanner === "pending_checklist" || (saveBanner === "success" && !checklistFromServer) ? (
        <div className="rounded-lg border border-amber/30 bg-amber/5 px-3 py-2 text-xs text-[#735A3A]">
          <p className="font-semibold text-[#1A1A1A]">Saved to database</p>
          <p className="mt-1">
            This step turns green when all of the following are true:
          </p>
          <ul className="mt-1.5 list-inside list-disc space-y-0.5">
            <li className={draftCheck.bioOk ? "text-green-700" : ""}>
              Bio not empty {draftCheck.bioOk ? "✓" : ""}
            </li>
            <li className={draftCheck.imageOk ? "text-green-700" : ""}>
              Image: https URL or site path (e.g. /mentors/photo.png){" "}
              {draftCheck.imageOk ? "✓" : ""}
            </li>
            <li className={draftCheck.priceOk ? "text-green-700" : ""}>
              Monthly price greater than $0 {draftCheck.priceOk ? "✓" : ""}
            </li>
          </ul>
        </div>
      ) : null}
      <div>
        <label
          htmlFor={`onboard-bio-${record.id}`}
          className="mb-1 block text-xs font-medium text-[#737373]"
        >
          Bio
        </label>
        <textarea
          id={`onboard-bio-${record.id}`}
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          rows={4}
          placeholder="Short mentor bio for their public profile…"
          className="w-full resize-y rounded-lg border border-[#E5E2DC] bg-white px-3 py-2 text-sm text-[#1A1A1A] placeholder:text-[#B8B3AB] focus:border-amber/50 focus:outline-none focus:ring-2 focus:ring-amber/20"
        />
      </div>
      <div>
        <label
          htmlFor={`onboard-avatar-${record.id}`}
          className="mb-1 block text-xs font-medium text-[#737373]"
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
          className="w-full rounded-lg border border-[#E5E2DC] bg-white px-3 py-2 text-sm text-[#1A1A1A] placeholder:text-[#B8B3AB] focus:border-amber/50 focus:outline-none focus:ring-2 focus:ring-amber/20"
        />
        <p className="mt-1 text-[11px] leading-snug text-[#999]">
          Use a full https image URL (LinkedIn, CDN, etc.) or a site path starting with / (e.g. /mentors/kyle-parratt.png).
        </p>
      </div>
      <div>
        <label
          htmlFor={`onboard-price-${record.id}`}
          className="mb-1 block text-xs font-medium text-[#737373]"
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
          className="w-full max-w-[200px] rounded-lg border border-[#E5E2DC] bg-white px-3 py-2 text-sm text-[#1A1A1A] placeholder:text-[#B8B3AB] focus:border-amber/50 focus:outline-none focus:ring-2 focus:ring-amber/20"
        />
        <p className="mt-1 text-[11px] text-[#999]">
          Whole dollars; stored as cents for billing. Stripe product mapping is separate.
        </p>
      </div>
      <button
        type="button"
        onClick={() => void save()}
        disabled={saving}
        className="rounded-lg bg-amber px-4 py-2 text-xs font-semibold text-white transition hover:opacity-90 disabled:opacity-50"
      >
        {saving ? (
          <span className="inline-flex items-center gap-1.5">
            <IconLoader2 size={14} className="animate-spin" />
            Saving…
          </span>
        ) : (
          "Save profile"
        )}
      </button>
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
      <div className="mt-3 rounded-lg border border-green-200 bg-green-50/80 px-3 py-2.5 text-sm text-green-900">
        <span className="font-medium">Approved</span>
        {record.agentApprovedAt ? (
          <span className="text-green-800/90">
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
        <p className="text-xs text-[#737373]">
          Finish ingestion (launch step) before you can enable approval.
        </p>
      )}
      {ingestionDone && !profileDone && (
        <p className="text-xs text-[#737373]">
          Complete profile & pricing above (bio, https image URL, monthly USD price) first.
        </p>
      )}
      <button
        type="button"
        onClick={() => void enable()}
        disabled={!canEnable || loading}
        className="rounded-lg border border-amber/40 bg-amber/10 px-4 py-2 text-xs font-semibold text-amber-900 transition hover:bg-amber/20 disabled:pointer-events-none disabled:opacity-40"
      >
        {loading ? (
          <span className="inline-flex items-center gap-1.5">
            <IconLoader2 size={14} className="animate-spin" />
            Enabling…
          </span>
        ) : (
          "Enable"
        )}
      </button>
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
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/45 p-4">
      {toast && (
        <div className="fixed right-6 top-24 z-[70] max-w-sm rounded-xl border border-[#E5E2DC] border-l-4 border-l-amber bg-white pl-3 pr-4 py-3 text-sm font-medium leading-snug text-[#1A1A1A] shadow-[0_8px_30px_rgba(0,0,0,0.08)]">
          {toast}
        </div>
      )}

      <div
        className="absolute inset-0"
        aria-hidden
        onClick={onClose}
      />

      <div className="relative flex max-h-[min(90dvh,calc(100dvh-5rem))] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-[#E0DCD4] bg-[#FAFAF8] shadow-[0_25px_50px_-12px_rgba(26,26,26,0.18)]">
        <header className="shrink-0 border-b border-[#E5E2DC] bg-white px-6 py-5">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2.5">
                <h2 className="truncate text-xl font-bold tracking-tight text-[#1A1A1A]">
                  {record.mentorName}
                </h2>
                <PhasePill phase={record.currentPhase} />
              </div>
              <p className="mt-1 truncate text-sm text-[#5c564c]">{record.email}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-lg border border-[#EDEAE4] bg-[#FAFAF8] px-3 py-1.5 text-xs font-medium text-[#4a4540]">
                  <IconCalendar size={15} stroke={1.5} className="text-[#9c958c]" />
                  Created {formatShortDate(record.createdAt)}
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-lg border border-[#EDEAE4] bg-[#FAFAF8] px-3 py-1.5 text-xs font-medium text-[#4a4540]">
                  <IconCalendarPlus size={15} stroke={1.5} className="text-[#9c958c]" />
                  Expires {formatShortDate(record.expiresAt)}
                </span>
              </div>
            </div>
            <div className="flex shrink-0 items-center gap-1">
              <div className="relative" ref={actionsRef}>
                <button
                  type="button"
                  onClick={() => setActionsOpen((o) => !o)}
                  className="inline-flex h-10 items-center gap-1.5 rounded-lg border border-[#E5E2DC] bg-white px-3.5 text-sm font-semibold text-[#1A1A1A] shadow-[0_1px_2px_rgba(0,0,0,0.04)] transition hover:border-[#dcd7cf] hover:bg-[#FAFAF8]"
                >
                  Actions
                  <IconChevronDown
                    size={16}
                    stroke={1.5}
                    className={`transition-transform ${actionsOpen ? "rotate-180" : ""}`}
                  />
                </button>
                {actionsOpen && (
                  <div className="absolute right-0 z-10 mt-1 w-56 overflow-hidden rounded-xl border border-[#E5E2DC] bg-white py-1 shadow-lg">
                    <button
                      type="button"
                      onClick={handleCopyLink}
                      className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-[#1A1A1A] hover:bg-[#F5F3F0]"
                    >
                      <IconCopy size={16} stroke={1.5} className="text-[#737373]" />
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
                      className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-[#1A1A1A] hover:bg-[#F5F3F0] disabled:opacity-50"
                    >
                      {actionLoading === "resend" ? (
                        <IconLoader2 size={16} className="animate-spin" />
                      ) : (
                        <IconMail size={16} stroke={1.5} className="text-[#737373]" />
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
                      className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-[#1A1A1A] hover:bg-[#F5F3F0] disabled:opacity-50"
                    >
                      {actionLoading === "extend" ? (
                        <IconLoader2 size={16} className="animate-spin" />
                      ) : (
                        <IconCalendarPlus size={16} stroke={1.5} className="text-[#737373]" />
                      )}
                      Extend expiry by 7 days
                    </button>
                    <div className="my-1 border-t border-[#F0EDE8]" />
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
                      className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-[#1A1A1A] hover:bg-[#F5F3F0] disabled:pointer-events-none disabled:opacity-40"
                    >
                      {actionLoading === "activate" ? (
                        <IconLoader2 size={16} className="animate-spin" />
                      ) : (
                        <IconRocket size={16} stroke={1.5} className="text-[#737373]" />
                      )}
                      Activate mentor
                    </button>
                    <div className="my-1 border-t border-[#F0EDE8]" />
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
                      className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-[#1A1A1A] hover:bg-[#F5F3F0] disabled:opacity-50"
                    >
                      {actionLoading === "account" ? (
                        <IconLoader2 size={16} className="animate-spin" />
                      ) : (
                        <IconUserPlus size={16} stroke={1.5} className="text-[#737373]" />
                      )}
                      Create / upgrade mentor account
                    </button>
                    {record.mentorFound && (
                      <button
                        type="button"
                        onClick={handleOpenChat}
                        className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-[#1A1A1A] hover:bg-[#F5F3F0]"
                      >
                        <IconExternalLink size={16} stroke={1.5} className="text-[#737373]" />
                        Open test chat
                      </button>
                    )}
                  </div>
                )}
              </div>
              <button
                type="button"
                onClick={onClose}
                className="flex h-10 w-10 items-center justify-center rounded-lg text-[#8a847c] transition hover:bg-[#F5F3F0] hover:text-[#1A1A1A]"
                aria-label="Close"
              >
                <IconX size={22} stroke={1.5} />
              </button>
            </div>
          </div>

          <div className="mt-5 rounded-xl bg-[#FAFAF8] p-3.5 ring-1 ring-inset ring-[#EDEAE4]">
            <div className="mb-2 flex items-center justify-between text-xs font-semibold text-[#5c564c]">
              <span>Launch readiness</span>
              <span className="tabular-nums text-[#1A1A1A]">
                {record.completedSteps.length}/{record.totalSteps} · {readinessPct}%
              </span>
            </div>
            <div className="h-2.5 overflow-hidden rounded-full bg-[#E5E2DC]">
              <div
                className="h-2.5 rounded-full bg-gradient-to-r from-amber to-[#c49a6c] transition-all duration-500"
                style={{ width: `${readinessPct}%` }}
              />
            </div>
          </div>
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto px-6 py-5">
          <h3 className="mb-3 text-[11px] font-bold uppercase tracking-[0.08em] text-[#9c958c]">
            Launch checklist
          </h3>
          <ol className="space-y-0 overflow-hidden rounded-xl border border-[#E5E2DC] bg-white shadow-[0_1px_3px_rgba(26,26,26,0.04)]">
            {CHECKLIST_META.map((item, index) => {
              const done = isDone(item.key);
              const Icon = item.Icon;
              return (
                <li
                  key={item.key}
                  className={`flex gap-3 px-4 py-3.5 ${
                    index > 0 ? "border-t border-[#F5F3F0]" : ""
                  }`}
                >
                  <div
                    className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                      done
                        ? "bg-green-100 text-green-700"
                        : "bg-[#F5F3F0] text-[#B8B3AB]"
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
                      <Icon size={16} stroke={1.5} className="shrink-0 text-[#B8B3AB]" />
                      <span className="font-semibold text-[#1A1A1A]">
                        {item.title}
                      </span>
                    </div>
                    <p className="mt-0.5 text-xs text-[#999]">{item.short}</p>
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
            <h3 className="mb-3 text-[11px] font-bold uppercase tracking-[0.08em] text-[#9c958c]">
              Session summary
            </h3>
            <div className="grid gap-3 sm:grid-cols-2">
              <SummaryTile
                icon={<IconMessageCircle size={20} stroke={1.5} />}
                label="Messages"
              >
                <span className="text-[#3d3d3d]">
                  <span className="text-[#9c958c]">Extraction</span>{" "}
                  {record.extractionMessageCount}
                  <span className="mx-1.5 text-[#ddd8d0]">·</span>
                  <span className="text-[#9c958c]">Calibration</span>{" "}
                  {record.calibrationMessageCount}
                </span>
              </SummaryTile>
              <SummaryTile
                icon={<IconUser size={20} stroke={1.5} />}
                label="Mentor record"
              >
                {record.mentorFound ? (
                  <span className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-xs text-[#3d3d3d]">
                      {record.slug}
                    </span>
                    <span
                      className={`rounded-md px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide ${
                        record.mentorActive
                          ? "bg-emerald-50 text-emerald-800 ring-1 ring-emerald-200/80"
                          : "bg-[#F5F3F0] text-[#6b6560] ring-1 ring-[#E5E2DC]"
                      }`}
                    >
                      {record.mentorActive ? "Active" : "Inactive"}
                    </span>
                  </span>
                ) : (
                  <span className="text-[#9c958c]">Not created yet</span>
                )}
              </SummaryTile>
              <SummaryTile
                icon={<IconLink size={20} stroke={1.5} />}
                label="Onboarding link"
                className="sm:col-span-2"
              >
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
                  <p
                    className="min-w-0 flex-1 truncate rounded-lg bg-[#F8F6F3] px-3 py-2 font-mono text-[11px] leading-relaxed text-[#5c564c] ring-1 ring-[#EDEAE4]"
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
                    className="inline-flex shrink-0 items-center justify-center gap-1.5 self-start rounded-lg border border-[#E5E2DC] bg-white px-3 py-2 text-xs font-semibold text-[#1A1A1A] transition hover:bg-[#FAFAF8] sm:self-center"
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
                  <span className="tabular-nums">
                    ${(record.mentorMonthlyPrice / 100).toFixed(0)}
                    <span className="ml-1 text-xs font-normal text-[#9c958c]">
                      USD / mo
                    </span>
                  </span>
                ) : (
                  <span className="text-[#9c958c]">Not set</span>
                )}
                <p className="mt-2 text-[11px] font-normal leading-snug text-[#9c958c]">
                  Edit in <span className="font-medium text-[#6b6560]">Profile &amp; pricing</span>{" "}
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
        <p className="mt-1 text-xs text-[#737373]">
          {record.extractionMessageCount} messages
        </p>
      );
    case "calibration_complete":
      return (
        <p className="mt-1 text-xs text-[#737373]">
          {record.calibrationMessageCount} messages
        </p>
      );
    case "ingestion_complete":
      return (
        <p className="mt-1 text-xs text-[#737373]">
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
        <p className="mt-1 text-xs text-[#737373]">
          {record.mentorActive ? "Mentor is live on the platform." : "Activate when ready (Actions menu)."}
        </p>
      );
    default:
      return null;
  }
}
