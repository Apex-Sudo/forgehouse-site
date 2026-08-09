"use client";

import { Suspense, useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  IconCircleCheck,
  IconClock,
  IconLoader2,
  IconAlertCircle,
  IconX,
  IconChevronLeft,
  IconChevronRight,
  IconSearch,
  IconArrowsSort,
} from "@tabler/icons-react";
import type { EnrichedOnboarding, ReadinessStep } from "@/app/api/admin/onboardings/route";
import ClipButton from "@/components/ui/ClipButton";
import { AdminTableRowMenu } from "@/components/admin/AdminTableRowMenu";
import MentorOnboardingDetailModal from "@/components/admin/MentorOnboardingDetailModal";

const PAGE_SIZE = 10;

const PHASE_LABELS: Record<string, { label: string; color: string }> = {
  extraction: {
    label: "Extraction",
    color: "bg-white/8 text-muted",
  },
  calibration: {
    label: "Calibration",
    color: "bg-white/16 text-foreground",
  },
  ingestion: {
    label: "Ingestion",
    color: "bg-[#E3B341]/15 text-[#E3B341]",
  },
  complete: {
    label: "Complete",
    color: "bg-accent/15 text-accent",
  },
};

function PhaseBadge({ phase }: { phase: string }) {
  const cfg = PHASE_LABELS[phase] ?? {
    label: phase,
    color: "bg-white/8 text-muted",
  };
  return (
    <span
      className={`mono inline-flex items-center rounded-sm px-2 py-0.5 text-[10px] uppercase tracking-[0.08em] ${cfg.color}`}
    >
      {cfg.label}
    </span>
  );
}

function ReadinessBar({
  completedSteps,
  totalSteps,
}: {
  completedSteps: ReadinessStep[];
  totalSteps: number;
}) {
  const pct = Math.round((completedSteps.length / totalSteps) * 100);
  return (
    <div className="flex items-center gap-2.5">
      <div className="h-1.5 w-24 overflow-hidden rounded-full bg-white/10">
        <div
          className="h-1.5 rounded-full bg-accent transition-all duration-300"
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="mono text-[11px] text-muted">
        {completedSteps.length}/{totalSteps}
      </span>
    </div>
  );
}

function NewOnboardingModal({
  open,
  onClose,
  onCreated,
}: {
  open: boolean;
  onClose: () => void;
  onCreated: () => void;
}) {
  const [mentorName, setMentorName] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [generatedLink, setGeneratedLink] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/onboarding/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mentorName, email }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "Failed to generate link");
      }

      const data = await res.json();
      setGeneratedLink(data.onboardingLink);
      onCreated();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setMentorName("");
    setEmail("");
    setGeneratedLink(null);
    setError(null);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
      <div className="fh-scroll max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-lg border border-border bg-surface p-6 shadow-2xl">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-[24px] leading-none text-foreground">
            {generatedLink ? "Onboarding Link Created" : "New Mentor Onboarding"}
          </h2>
          <button
            onClick={() => {
              reset();
              onClose();
            }}
            className="rounded-sm p-1 text-muted transition hover:bg-surface-light hover:text-foreground"
          >
            <IconX size={20} stroke={1.5} />
          </button>
        </div>

        {error && (
          <div className="mono mb-4 flex items-center gap-2 rounded-md border border-[#F2777A]/25 bg-[#F2777A]/12 p-3 text-[12px] text-[#F2777A]">
            <IconAlertCircle size={16} stroke={1.5} className="shrink-0" />
            {error}
          </div>
        )}

        {generatedLink ? (
          <div className="space-y-4">
            <div className="mono flex items-center gap-2 rounded-md bg-accent/15 p-3 text-[12px] leading-[1.5] text-accent">
              <IconCircleCheck size={16} stroke={1.5} className="shrink-0" />
              Link generated and invitation email sent to {email}
            </div>
            <div className="rounded-md border border-border bg-background p-3">
              <p className="mono break-all text-[12px] leading-[1.6] text-muted">
                {generatedLink}
              </p>
            </div>
            <div className="flex gap-3">
              <div className="flex-1">
                <ClipButton
                  variant="paper"
                  showChevron={false}
                  onClick={() => navigator.clipboard.writeText(generatedLink)}
                >
                  Copy Link
                </ClipButton>
              </div>
              <div className="flex-1">
                <ClipButton
                  variant="tan"
                  showChevron={false}
                  onClick={() => {
                    reset();
                    onClose();
                  }}
                >
                  Done
                </ClipButton>
              </div>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="mono mb-2 block text-[11px] uppercase tracking-[0.06em] text-faint">
                Mentor Name
              </label>
              <input
                type="text"
                value={mentorName}
                onChange={(e) => setMentorName(e.target.value)}
                required
                placeholder="e.g. Ayush Sharma"
                className="w-full rounded-md border border-border bg-background px-3 py-2.5 text-[15px] text-foreground transition placeholder:text-faint focus:border-accent/60 focus:outline-none"
              />
            </div>
            <div>
              <label className="mono mb-2 block text-[11px] uppercase tracking-[0.06em] text-faint">
                Mentor Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="ayush@example.com"
                className="w-full rounded-md border border-border bg-background px-3 py-2.5 text-[15px] text-foreground transition placeholder:text-faint focus:border-accent/60 focus:outline-none"
              />
            </div>
            {loading ? (
              <div className="clip-corner mono flex w-full items-center gap-2 bg-white/8 px-5 py-3.5 text-[11px] leading-[1.4] tracking-[0.01em] text-faint">
                <IconLoader2 size={16} stroke={1.5} className="animate-spin" />
                Generating...
              </div>
            ) : (
              <ClipButton type="submit" variant="paper">
                Generate Onboarding Link &amp; Send Email
              </ClipButton>
            )}
          </form>
        )}
      </div>
    </div>
  );
}

type SortKey = "created_desc" | "created_asc" | "name_asc" | "name_desc" | "readiness_desc" | "readiness_asc";

function AdminOnboardingPageContent() {
  const searchParams = useSearchParams();
  const [onboardings, setOnboardings] = useState<EnrichedOnboarding[]>([]);
  const [loading, setLoading] = useState(true);
  const [newModalOpen, setNewModalOpen] = useState(false);
  const [detailRecord, setDetailRecord] = useState<EnrichedOnboarding | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [phaseFilter, setPhaseFilter] = useState<string>("all");
  const [sortKey, setSortKey] = useState<SortKey>("created_desc");
  const [page, setPage] = useState(1);

  const fetchOnboardings = useCallback((opts?: { silent?: boolean }) => {
    if (!opts?.silent) setLoading(true);
    fetch("/api/admin/onboardings")
      .then((res) => res.json())
      .then((data) => setOnboardings(data.onboardings ?? []))
      .catch(console.error)
      .finally(() => {
        if (!opts?.silent) setLoading(false);
      });
  }, []);

  useEffect(() => {
    fetchOnboardings();
  }, [fetchOnboardings]);

  const sessionFromUrl = searchParams.get("session");
  useEffect(() => {
    if (!sessionFromUrl || onboardings.length === 0) return;
    const match = onboardings.find((o) => o.id === sessionFromUrl);
    if (match) {
      setDetailRecord(match);
      setDetailOpen(true);
    }
  }, [sessionFromUrl, onboardings]);

  const filteredSorted = useMemo(() => {
    let list = [...onboardings];
    const q = search.trim().toLowerCase();
    if (q) {
      list = list.filter(
        (o) =>
          o.mentorName.toLowerCase().includes(q) ||
          o.email.toLowerCase().includes(q) ||
          o.slug.toLowerCase().includes(q)
      );
    }
    if (phaseFilter !== "all") {
      list = list.filter((o) => o.currentPhase === phaseFilter);
    }
    list.sort((a, b) => {
      switch (sortKey) {
        case "created_asc":
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        case "created_desc":
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case "name_asc":
          return a.mentorName.localeCompare(b.mentorName);
        case "name_desc":
          return b.mentorName.localeCompare(a.mentorName);
        case "readiness_asc":
          return a.completedSteps.length - b.completedSteps.length;
        case "readiness_desc":
          return b.completedSteps.length - a.completedSteps.length;
        default:
          return 0;
      }
    });
    return list;
  }, [onboardings, search, phaseFilter, sortKey]);

  useEffect(() => {
    setPage(1);
  }, [search, phaseFilter, sortKey]);

  const totalPages = Math.max(1, Math.ceil(filteredSorted.length / PAGE_SIZE));
  const pageSafe = Math.min(page, totalPages);
  const pageSlice = useMemo(() => {
    const start = (pageSafe - 1) * PAGE_SIZE;
    return filteredSorted.slice(start, start + PAGE_SIZE);
  }, [filteredSorted, pageSafe]);

  useEffect(() => {
    if (page !== pageSafe) setPage(pageSafe);
  }, [page, pageSafe]);

  const handleListUpdated = useCallback(() => {
    fetch("/api/admin/onboardings")
      .then((res) => res.json())
      .then((data) => {
        const list = (data.onboardings ?? []) as EnrichedOnboarding[];
        setOnboardings(list);
        setDetailRecord((prev) => {
          if (!prev) return null;
          const next = list.find((o: EnrichedOnboarding) => o.id === prev.id);
          if (!next) {
            setDetailOpen(false);
            return null;
          }
          return next;
        });
      })
      .catch(console.error);
  }, []);

  const openDetail = (ob: EnrichedOnboarding) => {
    setDetailRecord(ob);
    setDetailOpen(true);
    const url = new URL(window.location.href);
    url.searchParams.set("session", ob.id);
    window.history.replaceState({}, "", url.toString());
  };

  const closeDetail = () => {
    setDetailOpen(false);
    setDetailRecord(null);
    const url = new URL(window.location.href);
    url.searchParams.delete("session");
    window.history.replaceState({}, "", url.pathname + url.search);
  };

  const deleteRecord = async (id: string) => {
    if (
      !window.confirm(
        "Delete this onboarding session permanently? This cannot be undone."
      )
    ) {
      return;
    }
    setDeletingId(id);
    try {
      const res = await fetch(`/api/admin/onboardings/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? "Delete failed");
      }
      if (detailRecord?.id === id) closeDetail();
      fetchOnboardings({ silent: true });
    } catch (e) {
      alert(e instanceof Error ? e.message : "Delete failed");
    } finally {
      setDeletingId(null);
    }
  };

  if (loading && onboardings.length === 0) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-accent" />
      </div>
    );
  }

  return (
    <div className="p-6 sm:p-8">
      <div className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-[32px] leading-none text-foreground">
            Mentor Onboarding
          </h1>
          <p className="mono mt-2.5 text-[11px] uppercase tracking-[0.08em] text-faint">
            {filteredSorted.length} of {onboardings.length} session
            {onboardings.length !== 1 ? "s" : ""}
            {filteredSorted.length !== onboardings.length ? " (filtered)" : ""}
          </p>
        </div>
        <div className="w-full shrink-0 sm:w-[220px]">
          <ClipButton variant="paper" onClick={() => setNewModalOpen(true)}>
            New Onboarding
          </ClipButton>
        </div>
      </div>

      <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:flex-wrap lg:items-center">
        <div className="relative min-w-[200px] flex-1 lg:max-w-md">
          <IconSearch
            size={16}
            stroke={1.5}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-faint"
          />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search name, email, slug…"
            className="mono w-full rounded-md border border-border bg-surface py-2.5 pl-9 pr-3 text-[12px] text-foreground transition placeholder:text-faint focus:border-accent/60 focus:outline-none"
          />
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <select
            value={phaseFilter}
            onChange={(e) => setPhaseFilter(e.target.value)}
            className="mono rounded-md border border-border bg-surface px-3 py-2.5 text-[12px] text-foreground transition focus:border-accent/60 focus:outline-none"
          >
            <option value="all" className="bg-surface text-foreground">All phases</option>
            <option value="extraction" className="bg-surface text-foreground">Extraction</option>
            <option value="calibration" className="bg-surface text-foreground">Calibration</option>
            <option value="ingestion" className="bg-surface text-foreground">Ingestion</option>
            <option value="complete" className="bg-surface text-foreground">Complete</option>
          </select>
          <div className="relative flex items-center gap-1.5">
            <IconArrowsSort size={16} stroke={1.5} className="text-faint" />
            <select
              value={sortKey}
              onChange={(e) => setSortKey(e.target.value as SortKey)}
              className="mono rounded-md border border-border bg-surface px-3 py-2.5 text-[12px] text-foreground transition focus:border-accent/60 focus:outline-none"
            >
              <option value="created_desc" className="bg-surface text-foreground">Newest first</option>
              <option value="created_asc" className="bg-surface text-foreground">Oldest first</option>
              <option value="name_asc" className="bg-surface text-foreground">Name A–Z</option>
              <option value="name_desc" className="bg-surface text-foreground">Name Z–A</option>
              <option value="readiness_desc" className="bg-surface text-foreground">Readiness high → low</option>
              <option value="readiness_asc" className="bg-surface text-foreground">Readiness low → high</option>
            </select>
          </div>
        </div>
      </div>

      {onboardings.length === 0 ? (
        <div className="rounded-md border border-dashed border-border bg-surface p-12 text-center">
          <IconClock size={40} stroke={1} className="mx-auto mb-4 text-faint" />
          <p className="text-muted">No onboardings yet. Create one to get started.</p>
        </div>
      ) : filteredSorted.length === 0 ? (
        <div className="rounded-md border border-dashed border-border bg-surface p-12 text-center">
          <p className="text-muted">No sessions match your filters.</p>
        </div>
      ) : (
        <>
          <div className="overflow-hidden rounded-md border border-border bg-surface">
            <div className="fh-scroll overflow-x-auto">
              <table className="w-full min-w-[640px] text-left">
                <thead>
                  <tr className="border-b border-border bg-surface-light">
                    <th className="mono px-4 py-3 text-[11px] font-normal uppercase tracking-[0.08em] text-faint">
                      Mentor
                    </th>
                    <th className="mono px-4 py-3 text-[11px] font-normal uppercase tracking-[0.08em] text-faint">
                      Phase
                    </th>
                    <th className="mono px-4 py-3 text-[11px] font-normal uppercase tracking-[0.08em] text-faint">
                      Readiness
                    </th>
                    <th className="mono px-4 py-3 text-[11px] font-normal uppercase tracking-[0.08em] text-faint">
                      Messages
                    </th>
                    <th className="mono px-4 py-3 text-[11px] font-normal uppercase tracking-[0.08em] text-faint">
                      Created
                    </th>
                    <th className="mono px-4 py-3 text-[11px] font-normal uppercase tracking-[0.08em] text-faint">
                      Expires
                    </th>
                    <th className="w-12 px-2 py-3" aria-hidden />
                  </tr>
                </thead>
                <tbody>
                  {pageSlice.map((ob) => (
                    <tr
                      key={ob.id}
                      onClick={() => openDetail(ob)}
                      className="cursor-pointer border-b border-border transition hover:bg-surface-light last:border-b-0"
                    >
                      <td className="px-4 py-3">
                        <div>
                          <p className="text-[15px] leading-tight text-foreground">
                            {ob.mentorName}
                          </p>
                          <p className="mono mt-1 text-[11px] text-faint">{ob.email}</p>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <PhaseBadge phase={ob.currentPhase} />
                      </td>
                      <td className="px-4 py-3">
                        <ReadinessBar
                          completedSteps={ob.completedSteps}
                          totalSteps={ob.totalSteps}
                        />
                      </td>
                      <td className="mono px-4 py-3 text-[12px] text-muted">
                        <span title="Extraction">{ob.extractionMessageCount}</span>
                        {" / "}
                        <span title="Calibration">{ob.calibrationMessageCount}</span>
                      </td>
                      <td className="mono px-4 py-3 text-[12px] text-faint">
                        {new Date(ob.createdAt).toLocaleDateString("en-GB", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </td>
                      <td className="mono px-4 py-3 text-[12px] text-faint">
                        {new Date(ob.expiresAt).toLocaleDateString("en-GB", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </td>
                      <td
                        className="px-2 py-3 text-right"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <AdminTableRowMenu
                          onDelete={() => deleteRecord(ob.id)}
                          deleting={deletingId === ob.id}
                          deleteLabel="Delete record"
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="mt-4 flex flex-col items-center justify-between gap-3 sm:flex-row">
            <p className="mono text-[11px] tracking-[0.04em] text-faint">
              Page {pageSafe} of {totalPages} · Showing{" "}
              {(pageSafe - 1) * PAGE_SIZE + 1}–
              {Math.min(pageSafe * PAGE_SIZE, filteredSorted.length)} of{" "}
              {filteredSorted.length}
            </p>
            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={pageSafe <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="mono inline-flex items-center gap-1 rounded-md border border-border px-3 py-2 text-[12px] tracking-[0.02em] text-foreground transition hover:bg-surface-light disabled:cursor-not-allowed disabled:opacity-40"
              >
                <IconChevronLeft size={16} stroke={1.5} />
                Prev
              </button>
              <button
                type="button"
                disabled={pageSafe >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                className="mono inline-flex items-center gap-1 rounded-md border border-border px-3 py-2 text-[12px] tracking-[0.02em] text-foreground transition hover:bg-surface-light disabled:cursor-not-allowed disabled:opacity-40"
              >
                Next
                <IconChevronRight size={16} stroke={1.5} />
              </button>
            </div>
          </div>
        </>
      )}

      <NewOnboardingModal
        open={newModalOpen}
        onClose={() => setNewModalOpen(false)}
        onCreated={fetchOnboardings}
      />

      <MentorOnboardingDetailModal
        open={detailOpen}
        record={detailRecord}
        onClose={closeDetail}
        onUpdated={handleListUpdated}
      />
    </div>
  );
}

export default function AdminOnboardingPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-full min-h-[40vh] items-center justify-center">
          <div className="h-10 w-10 animate-spin rounded-full border-b-2 border-accent" />
        </div>
      }
    >
      <AdminOnboardingPageContent />
    </Suspense>
  );
}
