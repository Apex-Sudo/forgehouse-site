"use client";

import { Suspense, useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  IconPlus,
  IconCircleCheck,
  IconClock,
  IconLoader2,
  IconAlertCircle,
  IconX,
  IconCopy,
  IconChevronLeft,
  IconChevronRight,
  IconSearch,
  IconArrowsSort,
} from "@tabler/icons-react";
import type { EnrichedOnboarding, ReadinessStep } from "@/app/api/admin/onboardings/route";
import { AdminTableRowMenu } from "@/components/admin/AdminTableRowMenu";
import MentorOnboardingDetailModal from "@/components/admin/MentorOnboardingDetailModal";

const PAGE_SIZE = 10;

const PHASE_LABELS: Record<string, { label: string; color: string }> = {
  extraction: { label: "Extraction", color: "bg-blue-100 text-blue-700" },
  calibration: { label: "Calibration", color: "bg-amber/10 text-amber" },
  ingestion: { label: "Ingestion", color: "bg-purple-100 text-purple-700" },
  complete: { label: "Complete", color: "bg-green-100 text-green-700" },
};

function PhaseBadge({ phase }: { phase: string }) {
  const cfg = PHASE_LABELS[phase] ?? {
    label: phase,
    color: "bg-gray-100 text-gray-600",
  };
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${cfg.color}`}
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
    <div className="flex items-center gap-2">
      <div className="h-2 w-24 overflow-hidden rounded-full bg-[#F5F5F5]">
        <div
          className="h-2 rounded-full bg-amber transition-all duration-300"
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="text-xs text-[#999]">
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="w-full max-w-lg rounded-xl border border-[#E5E2DC] bg-white p-6 shadow-xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold text-[#1A1A1A]">
            {generatedLink ? "Onboarding Link Created" : "New Mentor Onboarding"}
          </h2>
          <button
            onClick={() => {
              reset();
              onClose();
            }}
            className="rounded-lg p-1 text-[#999] hover:bg-[#F5F3F0] hover:text-[#1A1A1A]"
          >
            <IconX size={20} stroke={1.5} />
          </button>
        </div>

        {error && (
          <div className="mb-4 flex items-center gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-700">
            <IconAlertCircle size={16} stroke={1.5} />
            {error}
          </div>
        )}

        {generatedLink ? (
          <div className="space-y-4">
            <div className="flex items-center gap-2 rounded-lg bg-green-50 p-3 text-sm text-green-700">
              <IconCircleCheck size={16} stroke={1.5} />
              Link generated and invitation email sent to {email}
            </div>
            <div className="rounded-lg border border-[#E5E2DC] bg-[#FAFAF8] p-3">
              <p className="break-all text-sm text-[#737373]">{generatedLink}</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => navigator.clipboard.writeText(generatedLink)}
                className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-amber px-4 py-2.5 text-sm font-semibold text-white hover:opacity-90 transition"
              >
                <IconCopy size={16} stroke={1.5} />
                Copy Link
              </button>
              <button
                onClick={() => {
                  reset();
                  onClose();
                }}
                className="flex-1 rounded-lg border border-[#E5E2DC] px-4 py-2.5 text-sm font-semibold text-[#1A1A1A] hover:bg-[#F5F3F0] transition"
              >
                Done
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-[#1A1A1A]">
                Mentor Name
              </label>
              <input
                type="text"
                value={mentorName}
                onChange={(e) => setMentorName(e.target.value)}
                required
                placeholder="e.g. Ayush Sharma"
                className="w-full rounded-lg border border-[#E5E2DC] px-3 py-2.5 text-sm focus:border-amber/50 focus:outline-none focus:ring-2 focus:ring-amber/20"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-[#1A1A1A]">
                Mentor Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="ayush@example.com"
                className="w-full rounded-lg border border-[#E5E2DC] px-3 py-2.5 text-sm focus:border-amber/50 focus:outline-none focus:ring-2 focus:ring-amber/20"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-amber px-4 py-2.5 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-50"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <IconLoader2 size={16} stroke={1.5} className="animate-spin" />
                  Generating...
                </span>
              ) : (
                "Generate Onboarding Link & Send Email"
              )}
            </button>
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
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-amber" />
      </div>
    );
  }

  return (
    <div className="p-6 sm:p-8">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#1A1A1A]">
            Mentor Onboarding
          </h1>
          <p className="mt-1 text-sm text-[#999]">
            {filteredSorted.length} of {onboardings.length} session
            {onboardings.length !== 1 ? "s" : ""}
            {filteredSorted.length !== onboardings.length ? " (filtered)" : ""}
          </p>
        </div>
        <button
          onClick={() => setNewModalOpen(true)}
          className="flex shrink-0 items-center justify-center gap-2 rounded-lg bg-amber px-4 py-2.5 text-sm font-semibold text-white transition hover:opacity-90"
        >
          <IconPlus size={18} stroke={1.5} />
          New Onboarding
        </button>
      </div>

      <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:flex-wrap lg:items-center">
        <div className="relative min-w-[200px] flex-1 lg:max-w-md">
          <IconSearch
            size={18}
            stroke={1.5}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#B8B3AB]"
          />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search name, email, slug…"
            className="w-full rounded-lg border border-[#E5E2DC] bg-white py-2.5 pl-10 pr-3 text-sm focus:border-amber/50 focus:outline-none focus:ring-2 focus:ring-amber/20"
          />
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <select
            value={phaseFilter}
            onChange={(e) => setPhaseFilter(e.target.value)}
            className="rounded-lg border border-[#E5E2DC] bg-white px-3 py-2.5 text-sm focus:border-amber/50 focus:outline-none focus:ring-2 focus:ring-amber/20"
          >
            <option value="all">All phases</option>
            <option value="extraction">Extraction</option>
            <option value="calibration">Calibration</option>
            <option value="ingestion">Ingestion</option>
            <option value="complete">Complete</option>
          </select>
          <div className="relative flex items-center gap-1.5">
            <IconArrowsSort size={18} stroke={1.5} className="text-[#B8B3AB]" />
            <select
              value={sortKey}
              onChange={(e) => setSortKey(e.target.value as SortKey)}
              className="rounded-lg border border-[#E5E2DC] bg-white px-3 py-2.5 text-sm focus:border-amber/50 focus:outline-none focus:ring-2 focus:ring-amber/20"
            >
              <option value="created_desc">Newest first</option>
              <option value="created_asc">Oldest first</option>
              <option value="name_asc">Name A–Z</option>
              <option value="name_desc">Name Z–A</option>
              <option value="readiness_desc">Readiness high → low</option>
              <option value="readiness_asc">Readiness low → high</option>
            </select>
          </div>
        </div>
      </div>

      {onboardings.length === 0 ? (
        <div className="rounded-xl border border-dashed border-[#E5E2DC] bg-white p-12 text-center">
          <IconClock size={40} stroke={1} className="mx-auto mb-3 text-[#D5D0C8]" />
          <p className="text-[#999]">No onboardings yet. Create one to get started.</p>
        </div>
      ) : filteredSorted.length === 0 ? (
        <div className="rounded-xl border border-dashed border-[#E5E2DC] bg-white p-12 text-center">
          <p className="text-[#999]">No sessions match your filters.</p>
        </div>
      ) : (
        <>
          <div className="rounded-xl border border-[#E5E2DC] bg-white">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[640px] text-left text-sm">
                <thead>
                  <tr className="border-b border-[#E5E2DC] bg-[#FAFAF8]">
                    <th className="px-4 py-3 font-medium text-[#737373]">Mentor</th>
                    <th className="px-4 py-3 font-medium text-[#737373]">Phase</th>
                    <th className="px-4 py-3 font-medium text-[#737373]">Readiness</th>
                    <th className="px-4 py-3 font-medium text-[#737373]">Messages</th>
                    <th className="px-4 py-3 font-medium text-[#737373]">Created</th>
                    <th className="px-4 py-3 font-medium text-[#737373]">Expires</th>
                    <th className="w-12 px-2 py-3" aria-hidden />
                  </tr>
                </thead>
                <tbody>
                  {pageSlice.map((ob) => (
                    <tr
                      key={ob.id}
                      onClick={() => openDetail(ob)}
                      className="cursor-pointer border-b border-[#F5F3F0] transition hover:bg-[#FAFAF8] last:border-b-0"
                    >
                      <td className="px-4 py-3">
                        <div>
                          <p className="font-medium text-[#1A1A1A]">{ob.mentorName}</p>
                          <p className="text-xs text-[#999]">{ob.email}</p>
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
                      <td className="px-4 py-3 text-[#737373]">
                        <span title="Extraction">{ob.extractionMessageCount}</span>
                        {" / "}
                        <span title="Calibration">{ob.calibrationMessageCount}</span>
                      </td>
                      <td className="px-4 py-3 text-[#999]">
                        {new Date(ob.createdAt).toLocaleDateString("en-GB", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </td>
                      <td className="px-4 py-3 text-[#999]">
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
            <p className="text-xs text-[#999]">
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
                className="inline-flex items-center gap-1 rounded-lg border border-[#E5E2DC] px-3 py-2 text-sm font-medium text-[#1A1A1A] hover:bg-[#F5F3F0] disabled:opacity-40"
              >
                <IconChevronLeft size={16} stroke={1.5} />
                Prev
              </button>
              <button
                type="button"
                disabled={pageSafe >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                className="inline-flex items-center gap-1 rounded-lg border border-[#E5E2DC] px-3 py-2 text-sm font-medium text-[#1A1A1A] hover:bg-[#F5F3F0] disabled:opacity-40"
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
          <div className="h-10 w-10 animate-spin rounded-full border-b-2 border-amber" />
        </div>
      }
    >
      <AdminOnboardingPageContent />
    </Suspense>
  );
}