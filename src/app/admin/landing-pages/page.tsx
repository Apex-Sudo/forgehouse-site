"use client";

import { Suspense, useCallback, useEffect, useMemo, useState } from "react";
import {
  IconPlus,
  IconLoader2,
  IconSearch,
  IconChevronLeft,
  IconChevronRight,
} from "@tabler/icons-react";
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
      className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${
        published
          ? "bg-emerald-50 text-emerald-800 ring-1 ring-emerald-200/80"
          : "bg-[#F5F3F0] text-[#6b6560] ring-1 ring-[#E5E2DC]"
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
        `Delete landing page "${slug}"? This cannot be undone.`
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
      <div className="flex h-full items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-b-2 border-amber" />
      </div>
    );
  }

  return (
    <div className="p-6 sm:p-8">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#1A1A1A]">
            Mentor landing pages
          </h1>
          <p className="mt-1 text-sm text-[#999]">
            {filtered.length} of {rows.length} page{rows.length !== 1 ? "s" : ""}
            {filtered.length !== rows.length ? " (filtered)" : ""}
          </p>
        </div>
        <button
          type="button"
          onClick={openCreate}
          className="flex shrink-0 items-center justify-center gap-2 rounded-lg bg-amber px-4 py-2.5 text-sm font-semibold text-white transition hover:opacity-90"
        >
          <IconPlus size={18} stroke={1.5} />
          New landing page
        </button>
      </div>

      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
        <div className="relative min-w-[200px] flex-1 sm:max-w-md">
          <IconSearch
            size={18}
            stroke={1.5}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#B8B3AB]"
          />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search slug…"
            className="w-full rounded-lg border border-[#E5E2DC] bg-white py-2.5 pl-10 pr-3 text-sm focus:border-amber/50 focus:outline-none focus:ring-2 focus:ring-amber/20"
          />
        </div>
        <select
          value={publishedFilter}
          onChange={(e) =>
            setPublishedFilter(e.target.value as "all" | "yes" | "no")
          }
          className="rounded-lg border border-[#E5E2DC] bg-white px-3 py-2.5 text-sm focus:border-amber/50 focus:outline-none focus:ring-2 focus:ring-amber/20"
        >
          <option value="all">All statuses</option>
          <option value="yes">Published only</option>
          <option value="no">Drafts only</option>
        </select>
      </div>

      {rows.length === 0 ? (
        <div className="rounded-xl border border-dashed border-[#E5E2DC] bg-white p-12 text-center">
          <p className="text-[#999]">
            No landing pages yet. Create one or run the migration seed for
            Colin.
          </p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-xl border border-dashed border-[#E5E2DC] bg-white p-12 text-center">
          <p className="text-[#999]">No pages match your filters.</p>
        </div>
      ) : (
        <>
          <div className="rounded-xl border border-[#E5E2DC] bg-white">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[520px] text-left text-sm">
                <thead>
                  <tr className="border-b border-[#E5E2DC] bg-[#FAFAF8]">
                    <th className="px-4 py-3 font-medium text-[#737373]">
                      Slug
                    </th>
                    <th className="px-4 py-3 font-medium text-[#737373]">
                      Status
                    </th>
                    <th className="px-4 py-3 font-medium text-[#737373]">
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
                      className="cursor-pointer border-b border-[#F5F3F0] transition hover:bg-[#FAFAF8] last:border-b-0"
                    >
                      <td className="px-4 py-3 font-mono text-sm font-medium text-[#1A1A1A]">
                        {r.slug}
                      </td>
                      <td className="px-4 py-3">
                        <PublishedBadge published={r.published} />
                      </td>
                      <td className="px-4 py-3 text-[#999]">
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
            <p className="text-xs text-[#999]">
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
        <div className="flex h-full min-h-[40vh] items-center justify-center">
          <div className="h-10 w-10 animate-spin rounded-full border-b-2 border-amber" />
        </div>
      }
    >
      <AdminLandingPagesContent />
    </Suspense>
  );
}
