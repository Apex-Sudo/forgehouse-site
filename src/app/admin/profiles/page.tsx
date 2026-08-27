"use client";

import { Suspense, useCallback, useEffect, useMemo, useState } from "react";
import {
  IconSearch,
  IconChevronLeft,
  IconChevronRight,
} from "@tabler/icons-react";
import ClipButton from "@/components/ui/ClipButton";
import { AdminTableRowMenu } from "@/components/admin/AdminTableRowMenu";
import MentorLandingDetailModal from "@/components/admin/MentorLandingDetailModal";

const PAGE_SIZE = 12;

type LandingListRow = {
  id: string;
  slug: string;
  published: boolean;
  updated_at: string;
};

function PublishedBadge({ published }: { published: boolean }) {
  return (
    <span
      className={`mono inline-flex rounded-sm px-2 py-0.5 text-[10px] uppercase tracking-[0.08em] ${
        published ? "bg-accent/15 text-accent" : "bg-white/8 text-muted"
      }`}
    >
      {published ? "Published" : "Draft"}
    </span>
  );
}

function AdminLandingPagesContent() {
  const [rows, setRows] = useState<LandingListRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [publishedFilter, setPublishedFilter] = useState<"all" | "yes" | "no">(
    "all"
  );
  const [page, setPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"create" | "edit">("create");
  const [editSlug, setEditSlug] = useState<string | null>(null);
  const [deletingSlug, setDeletingSlug] = useState<string | null>(null);

  const fetchRows = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/mentor-landing-pages");
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error ?? "Failed to load");
      setRows((data.landings ?? []) as LandingListRow[]);
    } catch {
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRows();
  }, [fetchRows]);

  const filtered = useMemo(() => {
    let list = [...rows];
    const q = search.trim().toLowerCase();
    if (q) {
      list = list.filter((r) => r.slug.toLowerCase().includes(q));
    }
    if (publishedFilter === "yes") {
      list = list.filter((r) => r.published);
    } else if (publishedFilter === "no") {
      list = list.filter((r) => !r.published);
    }
    return list;
  }, [rows, search, publishedFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageSafe = Math.min(page, totalPages);
  const pageSlice = filtered.slice(
    (pageSafe - 1) * PAGE_SIZE,
    pageSafe * PAGE_SIZE
  );

  useEffect(() => {
    setPage(1);
  }, [search, publishedFilter]);

  const openCreate = () => {
    setModalMode("create");
    setEditSlug(null);
    setModalOpen(true);
  };

  const openEdit = (slug: string) => {
    setModalMode("edit");
    setEditSlug(slug);
    setModalOpen(true);
  };

  const deleteRow = async (slug: string) => {
    if (
      !window.confirm(
        `Delete profile "${slug}"? This cannot be undone.`
      )
    ) {
      return;
    }
    setDeletingSlug(slug);
    try {
      const res = await fetch(
        `/api/admin/mentor-landing-pages/${encodeURIComponent(slug)}`,
        { method: "DELETE" }
      );
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error ?? "Delete failed");
      if (editSlug === slug) {
        setModalOpen(false);
        setEditSlug(null);
      }
      fetchRows();
    } catch (e) {
      alert(e instanceof Error ? e.message : "Delete failed");
    } finally {
      setDeletingSlug(null);
    }
  };

  if (loading && rows.length === 0) {
    return (
      <div className="flex h-full items-center justify-center bg-background">
        <div className="h-10 w-10 animate-spin rounded-full border-b-2 border-accent" />
      </div>
    );
  }

  return (
    <div className="min-h-full bg-background p-6 sm:p-8">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-[32px] leading-none text-foreground">
            Mentor profiles
          </h1>
          <p className="mono mt-2 text-[11px] uppercase tracking-[0.08em] text-faint">
            {filtered.length} of {rows.length} page{rows.length !== 1 ? "s" : ""}
            {filtered.length !== rows.length ? " (filtered)" : ""}
          </p>
        </div>
        <div className="w-full shrink-0 sm:w-[220px]">
          <ClipButton variant="paper" onClick={openCreate}>
            New profile
          </ClipButton>
        </div>
      </div>

      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
        <div className="relative min-w-[200px] flex-1 sm:max-w-md">
          <IconSearch
            size={18}
            stroke={1.5}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-faint"
          />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search slug…"
            className="mono w-full rounded-md border border-border bg-surface py-2.5 pl-10 pr-3 text-[13px] text-foreground transition placeholder:text-faint focus:border-accent/60 focus:outline-none"
          />
        </div>
        <select
          value={publishedFilter}
          onChange={(e) =>
            setPublishedFilter(e.target.value as "all" | "yes" | "no")
          }
          className="mono rounded-md border border-border bg-surface px-3 py-2.5 text-[13px] text-foreground transition focus:border-accent/60 focus:outline-none"
        >
          <option value="all" className="bg-surface text-foreground">
            All statuses
          </option>
          <option value="yes" className="bg-surface text-foreground">
            Published only
          </option>
          <option value="no" className="bg-surface text-foreground">
            Drafts only
          </option>
        </select>
      </div>

      {rows.length === 0 ? (
        <div className="rounded-md border border-dashed border-border bg-surface p-12 text-center">
          <p className="text-muted">
            No profiles yet. Create one or run the migration seed for
            Colin.
          </p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-md border border-dashed border-border bg-surface p-12 text-center">
          <p className="text-muted">No pages match your filters.</p>
        </div>
      ) : (
        <>
          <div className="rounded-md border border-border bg-surface">
            <div className="fh-scroll overflow-x-auto">
              <table className="w-full min-w-[520px] text-left text-sm">
                <thead>
                  <tr className="border-b border-border bg-surface-light">
                    <th className="mono px-4 py-3 text-[11px] font-normal uppercase tracking-[0.08em] text-faint">
                      Slug
                    </th>
                    <th className="mono px-4 py-3 text-[11px] font-normal uppercase tracking-[0.08em] text-faint">
                      Status
                    </th>
                    <th className="mono px-4 py-3 text-[11px] font-normal uppercase tracking-[0.08em] text-faint">
                      Updated
                    </th>
                    <th className="w-12 px-2 py-3" aria-hidden />
                  </tr>
                </thead>
                <tbody>
                  {pageSlice.map((r) => (
                    <tr
                      key={r.id}
                      onClick={() => openEdit(r.slug)}
                      className="cursor-pointer border-b border-border transition last:border-b-0 hover:bg-surface-light"
                    >
                      <td className="mono px-4 py-3 text-[13px] text-foreground">
                        {r.slug}
                      </td>
                      <td className="px-4 py-3">
                        <PublishedBadge published={r.published} />
                      </td>
                      <td className="mono px-4 py-3 text-[12px] text-faint">
                        {new Date(r.updated_at).toLocaleString("en-GB", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </td>
                      <td
                        className="px-2 py-3 text-right"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <AdminTableRowMenu
                          onEdit={() => openEdit(r.slug)}
                          onDelete={() => deleteRow(r.slug)}
                          deleting={deletingSlug === r.slug}
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
              {Math.min(pageSafe * PAGE_SIZE, filtered.length)} of{" "}
              {filtered.length}
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

      <MentorLandingDetailModal
        open={modalOpen}
        mode={modalMode}
        slug={editSlug}
        onClose={() => {
          setModalOpen(false);
          setEditSlug(null);
        }}
        onSaved={fetchRows}
      />
    </div>
  );
}

export default function AdminLandingPagesPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-full min-h-[40vh] items-center justify-center bg-background">
          <div className="h-10 w-10 animate-spin rounded-full border-b-2 border-accent" />
        </div>
      }
    >
      <AdminLandingPagesContent />
    </Suspense>
  );
}
