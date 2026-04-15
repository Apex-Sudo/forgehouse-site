"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import Link from "next/link";
import {
  IconX,
  IconLoader2,
  IconExternalLink,
  IconTrash,
  IconPlus,
  IconSparkles,
  IconEye,
  IconChevronDown,
  IconLayoutNavbar,
  IconList,
  IconLayoutGrid,
  IconBuilding,
  IconColumns,
  IconStar,
  IconClick,
  IconForms,
  IconCode,
  IconMessages,
  IconPhoto,
} from "@tabler/icons-react";
import MentorMarketingClient from "@/app/mentors/[slug]/MentorMarketingClient";
import type { MentorRow } from "@/app/mentors/[slug]/MentorMarketingClient";
import {
  emptyMentorLandingContent,
  MENTOR_LANDING_COMPANY_LOGO_HEIGHTS,
  mentorLandingContentSchema,
  mentorLandingSlugSchema,
  type MentorLandingContent,
} from "@/types/mentor-landing";

type LandingRow = {
  id: string;
  slug: string;
  published: boolean;
  content: unknown;
  created_at: string;
  updated_at: string;
};

function syntheticMentor(slug: string): MentorRow {
  const name = slug
    .split("-")
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
  return {
    slug,
    name: name || slug,
    tagline: "",
    avatar_url: "/mentors/default-avatar.svg",
    bio: null,
  };
}

function normalizeMentorApiRow(m: {
  slug: string;
  name: string;
  tagline: string | null;
  avatar_url: string | null;
  bio: string | null;
}): MentorRow {
  return {
    slug: m.slug,
    name: m.name,
    tagline: m.tagline ?? "",
    avatar_url: m.avatar_url ?? "/mentors/default-avatar.svg",
    bio: m.bio,
  };
}

function normalizeFeaturedReviews(c: MentorLandingContent): MentorLandingContent {
  if (!c.reviews?.length) {
    const { reviews: _r, ...rest } = c;
    return rest;
  }
  const idx = c.reviews.findIndex((r) => r.featured);
  const reviews = c.reviews.map((r, i) =>
    i === idx && idx >= 0 ? { ...r, featured: true } : { ...r, featured: false }
  );
  return { ...c, reviews };
}

function parseStoredContent(raw: unknown): MentorLandingContent {
  const p = mentorLandingContentSchema.safeParse(raw);
  return p.success ? normalizeFeaturedReviews(p.data) : emptyMentorLandingContent();
}

const accordionIconClass = "flex shrink-0 items-center justify-center text-amber";

function AccordionSection({
  title,
  subtitle,
  icon,
  children,
  onExpand,
}: {
  title: string;
  subtitle?: string;
  icon: ReactNode;
  children: React.ReactNode;
  onExpand?: () => void;
}) {
  return (
    <details
      className="group overflow-hidden rounded-xl border border-solid border-[#b8926b] bg-white shadow-[0_1px_2px_rgba(26,26,26,0.04)]"
      onToggle={(e) => {
        if (e.currentTarget.open && onExpand) {
          onExpand();
        }
      }}
    >
      <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-4 py-3 hover:bg-[#FAFAF8] [&::-webkit-details-marker]:hidden">
        <div className="flex min-w-0 flex-1 items-center gap-3">
          <span className={accordionIconClass} aria-hidden>
            {icon}
          </span>
          <div className="min-w-0">
            <span className="text-sm font-semibold text-[#1A1A1A]">{title}</span>
            {subtitle ? (
              <p className="mt-0.5 text-xs text-[#8a847c]">{subtitle}</p>
            ) : null}
          </div>
        </div>
        <IconChevronDown
          className="shrink-0 text-[#9c958c] transition-transform group-open:rotate-180"
          size={20}
          stroke={1.5}
          aria-hidden
        />
      </summary>
      <div className="border-t border-[#F0EDE6] px-4 py-4">{children}</div>
    </details>
  );
}

const inputClass =
  "w-full rounded-lg border border-[#E5E2DC] bg-white px-3 py-2 text-sm text-[#1A1A1A] focus:border-amber/50 focus:outline-none focus:ring-2 focus:ring-amber/20";

const labelClass = "mb-1 block text-xs font-medium text-[#5c564c]";

const PREVIEW_FALLBACK_AVATAR = "/mentors/default-avatar.svg";

function profileImagePreviewSrc(
  raw: string | null | undefined
): string | null {
  const t = raw?.trim();
  if (!t) return null;
  if (t.includes("default-avatar.png")) return PREVIEW_FALLBACK_AVATAR;
  return t;
}

export default function MentorLandingDetailModal({
  open,
  mode,
  slug,
  onClose,
  onSaved,
}: {
  open: boolean;
  mode: "create" | "edit";
  slug: string | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [slugInput, setSlugInput] = useState("");
  const [content, setContent] = useState<MentorLandingContent>(() =>
    emptyMentorLandingContent()
  );
  const [published, setPublished] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [aiNotes, setAiNotes] = useState("");
  const [aiPromptModalOpen, setAiPromptModalOpen] = useState(false);
  const [aiDraftModalError, setAiDraftModalError] = useState<string | null>(
    null
  );
  const [aiLoading, setAiLoading] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewMentor, setPreviewMentor] = useState<MentorRow | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [rawJsonText, setRawJsonText] = useState("");
  const [rawJsonError, setRawJsonError] = useState<string | null>(null);
  const [editorTab, setEditorTab] = useState<"form" | "json">("form");
  const [originalSlug, setOriginalSlug] = useState<string | null>(null);
  const actionsMenuRef = useRef<HTMLDetailsElement>(null);

  const closeActionsMenu = () => {
    actionsMenuRef.current?.removeAttribute("open");
  };

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: PointerEvent) => {
      const el = actionsMenuRef.current;
      if (!el?.open) return;
      const t = e.target;
      if (t instanceof Node && !el.contains(t)) {
        el.removeAttribute("open");
      }
    };
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [open]);

  useEffect(() => {
    if (!open) {
      setAiPromptModalOpen(false);
      setAiDraftModalError(null);
      return;
    }

    setSaveError(null);
    setLoadError(null);
    setAiNotes("");
    setAiPromptModalOpen(false);
    setAiDraftModalError(null);
    setPreviewOpen(false);
    setPreviewMentor(null);
    setRawJsonError(null);
    setEditorTab("form");

    if (mode === "create") {
      setOriginalSlug(null);
      setSlugInput("");
      setPublished(false);
      setContent(emptyMentorLandingContent());
      setLoading(false);
      return;
    }

    if (mode === "edit" && slug) {
      setLoading(true);
      setOriginalSlug(null);
      fetch(`/api/admin/mentor-landing-pages/${encodeURIComponent(slug)}`)
        .then(async (res) => {
          const data = await res.json().catch(() => ({}));
          if (!res.ok) {
            throw new Error(data.error ?? "Failed to load");
          }
          const row = data.landing as LandingRow;
          setOriginalSlug(row.slug);
          setSlugInput(row.slug);
          setPublished(row.published);
          setContent(parseStoredContent(row.content));
        })
        .catch((e) => {
          setLoadError(e instanceof Error ? e.message : "Load failed");
          setContent(emptyMentorLandingContent());
        })
        .finally(() => setLoading(false));
    }
  }, [open, mode, slug]);

  const trimmedSlugInput = slugInput.trim();
  const slugParse = mentorLandingSlugSchema.safeParse(trimmedSlugInput);
  const resolvedSlug = slugParse.success ? slugParse.data : "";

  const openPreview = useCallback(async (): Promise<boolean> => {
    const s = resolvedSlug;
    if (!s) {
      setSaveError("Enter a valid URL slug before preview.");
      return false;
    }
    setPreviewOpen(true);
    setPreviewLoading(true);
    setPreviewMentor(null);
    try {
      const res = await fetch(
        `/api/admin/mentors/${encodeURIComponent(s)}`
      );
      if (res.ok) {
        const data = await res.json();
        setPreviewMentor(normalizeMentorApiRow(data.mentor));
      } else {
        setPreviewMentor(syntheticMentor(s));
      }
    } catch {
      setPreviewMentor(syntheticMentor(s));
    } finally {
      setPreviewLoading(false);
    }
    return true;
  }, [resolvedSlug]);

  const handleAiDraft = async (): Promise<boolean> => {
    const s = resolvedSlug;
    if (!s) {
      setAiDraftModalError(
        "Enter a valid URL slug under Basics (or close and reopen after fixing)."
      );
      return false;
    }
    if (aiNotes.trim().length < 20) {
      setAiDraftModalError("Add at least 20 characters.");
      return false;
    }
    setAiDraftModalError(null);
    setAiLoading(true);
    try {
      const res = await fetch("/api/admin/mentor-landing-pages/ai-draft", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          slug: s,
          notes: aiNotes.trim(),
          currentContent: content,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        const msg =
          typeof data.error === "string"
            ? data.error
            : JSON.stringify(data.details ?? data.error ?? "AI failed");
        throw new Error(msg.slice(0, 1500));
      }
      setContent(normalizeFeaturedReviews(data.content as MentorLandingContent));
      setAiNotes("");
      return true;
    } catch (e) {
      setAiDraftModalError(
        e instanceof Error ? e.message : "AI fill failed"
      );
      return false;
    } finally {
      setAiLoading(false);
    }
  };

  const openAiPromptModal = () => {
    if (!resolvedSlug) {
      setSaveError("Enter a valid URL slug in Basics first.");
      return;
    }
    setAiDraftModalError(null);
    setAiNotes("");
    closeActionsMenu();
    setAiPromptModalOpen(true);
  };

  const handleApplyRawJson = () => {
    setRawJsonError(null);
    try {
      const raw = JSON.parse(rawJsonText) as unknown;
      const p = mentorLandingContentSchema.safeParse(raw);
      if (!p.success) {
        setRawJsonError(JSON.stringify(p.error.flatten(), null, 2).slice(0, 2000));
        return;
      }
      setContent(normalizeFeaturedReviews(p.data));
      setSaveError(null);
      setEditorTab("form");
    } catch {
      setRawJsonError("Invalid JSON syntax.");
    }
  };

  const handleSave = async () => {
    setSaveError(null);
    const toSave = normalizeFeaturedReviews(content);
    const finalCheck = mentorLandingContentSchema.safeParse(toSave);
    if (!finalCheck.success) {
      setSaveError(
        JSON.stringify(finalCheck.error.flatten(), null, 2).slice(0, 2000)
      );
      return;
    }

    setSaving(true);
    try {
      if (mode === "create") {
        const slugCheck = mentorLandingSlugSchema.safeParse(slugInput.trim());
        if (!slugCheck.success) {
          setSaveError(slugCheck.error.flatten().formErrors.join(", "));
          setSaving(false);
          return;
        }
        const res = await fetch("/api/admin/mentor-landing-pages", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            slug: slugCheck.data,
            content: finalCheck.data,
            published,
          }),
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
          throw new Error(data.error ?? "Save failed");
        }
        onSaved();
        onClose();
      } else {
        const rowSlug = originalSlug ?? slug;
        if (!rowSlug) {
          setSaveError("Missing landing page slug.");
          setSaving(false);
          return;
        }
        const slugCheck = mentorLandingSlugSchema.safeParse(slugInput.trim());
        if (!slugCheck.success) {
          setSaveError(slugCheck.error.flatten().formErrors.join(", "));
          setSaving(false);
          return;
        }
        const patchBody: {
          content: typeof finalCheck.data;
          published: boolean;
          slug?: string;
        } = { content: finalCheck.data, published };
        if (slugCheck.data !== rowSlug) {
          patchBody.slug = slugCheck.data;
        }
        const res = await fetch(
          `/api/admin/mentor-landing-pages/${encodeURIComponent(rowSlug)}`,
          {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(patchBody),
          }
        );
        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
          throw new Error(data.error ?? "Save failed");
        }
        onSaved();
        onClose();
      }
    } catch (e) {
      setSaveError(e instanceof Error ? e.message : "Save failed");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    const targetSlug = originalSlug ?? slug;
    if (!targetSlug || mode !== "edit") return;
    if (
      !window.confirm(
        "Delete this landing page permanently? Public /mentors/… will lose rich content for this slug."
      )
    ) {
      return;
    }
    setDeleting(true);
    setSaveError(null);
    try {
      const res = await fetch(
        `/api/admin/mentor-landing-pages/${encodeURIComponent(targetSlug)}`,
        { method: "DELETE" }
      );
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.error ?? "Delete failed");
      }
      onSaved();
      onClose();
    } catch (e) {
      setSaveError(e instanceof Error ? e.message : "Delete failed");
    } finally {
      setDeleting(false);
    }
  };

  if (!open) return null;

  return (
    <>
      <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/45 p-4">
        <div className="relative flex max-h-[min(92dvh,calc(100dvh-2rem))] w-full max-w-4xl flex-col overflow-hidden rounded-2xl border border-[#E0DCD4] bg-[#FAFAF8] shadow-[0_25px_50px_-12px_rgba(26,26,26,0.18)]">
          <header className="shrink-0 border-b border-[#E5E2DC] bg-white px-6 py-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-lg font-bold text-[#1A1A1A]">
                  {mode === "create"
                    ? "New mentor landing page"
                    : "Edit mentor landing page"}
                </h2>
                <p className="mt-1 text-xs text-[#999]">
                  Manage the content for a mentor landing page.
                </p>
              </div>
              <div className="flex shrink-0 flex-wrap items-center justify-end gap-2">
                <details
                  ref={actionsMenuRef}
                  className="group relative"
                >
                  <summary className="flex cursor-pointer list-none items-center gap-1.5 rounded-lg border border-[#E5E2DC] bg-white px-3 py-2 text-xs font-semibold text-[#1A1A1A] hover:bg-[#FAFAF8] [&::-webkit-details-marker]:hidden">
                    Actions
                    <IconChevronDown
                      size={14}
                      stroke={1.5}
                      className="text-[#8a847c] transition-transform group-open:rotate-180"
                      aria-hidden
                    />
                  </summary>
                  <div
                    className="absolute right-0 z-[70] mt-1 min-w-[12.5rem] rounded-lg border border-[#E5E2DC] bg-white py-1 shadow-[0_8px_24px_rgba(26,26,26,0.12)]"
                    role="menu"
                  >
                    {resolvedSlug ? (
                      <Link
                        href={`/mentors/${resolvedSlug}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        role="menuitem"
                        className="flex items-center gap-2 px-3 py-2.5 text-sm font-medium text-[#1A1A1A] hover:bg-[#F5F3F0]"
                        onClick={closeActionsMenu}
                      >
                        <IconExternalLink size={16} stroke={1.5} />
                        Live site
                      </Link>
                    ) : (
                      <span
                        className="flex cursor-not-allowed items-center gap-2 px-3 py-2.5 text-sm text-[#b5aea4]"
                        title="Enter a valid URL slug in Basics first"
                      >
                        <IconExternalLink size={16} stroke={1.5} />
                        Live site
                      </span>
                    )}
                    <button
                      type="button"
                      role="menuitem"
                      disabled={!resolvedSlug}
                      title={
                        resolvedSlug
                          ? undefined
                          : "Enter a valid URL slug in Basics first"
                      }
                      className="flex w-full items-center gap-2 px-3 py-2.5 text-left text-sm font-medium text-[#1A1A1A] hover:bg-[#F5F3F0] disabled:cursor-not-allowed disabled:text-[#b5aea4] disabled:hover:bg-transparent"
                      onClick={async () => {
                        const started = await openPreview();
                        if (started) closeActionsMenu();
                      }}
                    >
                      <IconEye size={16} stroke={1.5} />
                      Preview
                    </button>
                    <button
                      type="button"
                      role="menuitem"
                      disabled={aiLoading || !resolvedSlug}
                      title={
                        resolvedSlug
                          ? undefined
                          : "Enter a valid URL slug in Basics first"
                      }
                      className="flex w-full items-center gap-2 px-3 py-2.5 text-left text-sm font-medium text-[#1A1A1A] hover:bg-[#F5F3F0] disabled:cursor-not-allowed disabled:text-[#b5aea4] disabled:hover:bg-transparent"
                      onClick={() => {
                        openAiPromptModal();
                      }}
                    >
                      <IconSparkles size={16} stroke={1.5} />
                      Fill with AI
                    </button>
                  </div>
                </details>
                {aiLoading ? (
                  <span
                    className="inline-flex items-center gap-1.5 text-xs font-medium text-[#8a847c]"
                    aria-live="polite"
                  >
                    <IconLoader2 size={16} className="animate-spin" />
                    AI draft…
                  </span>
                ) : null}
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
          </header>

          <div className="min-h-0 flex-1 overflow-y-auto px-6 py-4">
            {loadError && (
              <div className="mb-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
                {loadError}
              </div>
            )}
            {saveError && (
              <div className="mb-3 max-h-40 overflow-y-auto rounded-lg border border-red-200 bg-red-50 px-3 py-2 font-mono text-xs text-red-800 whitespace-pre-wrap">
                {saveError}
              </div>
            )}

            {loading ? (
              <div className="flex justify-center py-16">
                <IconLoader2 className="animate-spin text-amber" size={32} />
              </div>
            ) : (
              <>
                <div
                  className="mb-4 flex rounded-xl border border-[#E5E2DC] bg-[#EFEBE4] p-1"
                  role="tablist"
                  aria-label="Landing editor mode"
                >
                  <button
                    type="button"
                    role="tab"
                    aria-selected={editorTab === "form"}
                    onClick={() => setEditorTab("form")}
                    className={`flex flex-1 items-center justify-center gap-2 rounded-lg px-3 py-2.5 text-sm font-semibold transition ${
                      editorTab === "form"
                        ? "bg-white text-[#1A1A1A] shadow-sm"
                        : "text-[#6b6560] hover:text-[#1A1A1A]"
                    }`}
                  >
                    <IconForms size={18} stroke={1.5} aria-hidden />
                    Form
                  </button>
                  <button
                    type="button"
                    role="tab"
                    aria-selected={editorTab === "json"}
                    onClick={() => {
                      setEditorTab("json");
                      setRawJsonText(JSON.stringify(content, null, 2));
                      setRawJsonError(null);
                    }}
                    className={`flex flex-1 items-center justify-center gap-2 rounded-lg px-3 py-2.5 text-sm font-semibold transition ${
                      editorTab === "json"
                        ? "bg-white text-[#1A1A1A] shadow-sm"
                        : "text-[#6b6560] hover:text-[#1A1A1A]"
                    }`}
                  >
                    <IconCode size={18} stroke={1.5} aria-hidden />
                    Raw JSON
                  </button>
                </div>

                {editorTab === "form" ? (
              <div className="space-y-2.5">
                <AccordionSection
                  title="Basics"
                  subtitle="Slug, profile image, publishing, and top-of-page hero copy"
                  icon={
                    <IconLayoutNavbar size={20} stroke={1.5} aria-hidden />
                  }
                >
                  <label className={labelClass}>URL slug</label>
                  <input
                    type="text"
                    value={slugInput}
                    onChange={(e) =>
                      setSlugInput(
                        e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "")
                      )
                    }
                    placeholder="e.g. colin-chapman"
                    className={`${inputClass} mb-3 font-mono`}
                    spellCheck={false}
                  />
                  <p className="mb-3 text-xs text-[#8a847c]">
                    Lowercase letters, numbers, and hyphens only. Changing the slug
                    updates the row URL; ensure the mentor profile uses the same
                    slug.
                  </p>
                  <label className={labelClass}>Profile image URL</label>
                  <p className="mb-3 text-[11px] leading-relaxed text-[#9c958c]">
                    Optional. Full <code className="text-[#6b6560]">https://</code>{" "}
                    image URL or a path served from{" "}
                    <code className="text-[#6b6560]">/public</code> (e.g.{" "}
                    <code className="text-[#6b6560]">/mentors/colin.jpg</code>
                    ). When empty, the mentor record&apos;s avatar is used.
                  </p>
                  <div className="mb-3 flex flex-col gap-4 sm:flex-row sm:items-stretch sm:gap-0">
                    <div className="flex min-h-0 min-w-0 flex-1 items-center sm:pr-5">
                      <input
                        type="text"
                        value={content.profileImageUrl ?? ""}
                        onChange={(e) =>
                          setContent((c) => ({
                            ...c,
                            profileImageUrl: e.target.value,
                          }))
                        }
                        placeholder="https://… or /mentors/photo.jpg"
                        className={`${inputClass} w-full`}
                        spellCheck={false}
                      />
                    </div>
                    <div
                      className="flex shrink-0 flex-col items-center justify-start gap-2 sm:w-[5.75rem] sm:justify-center sm:border-l sm:border-[#F0EDE6] sm:pl-5 sm:py-1"
                      aria-label="Profile image preview"
                    >
                      <span className="text-[10px] font-semibold uppercase tracking-[0.08em] text-[#9c958c]">
                        Preview
                      </span>
                      <div className="relative h-[72px] w-[72px] shrink-0 overflow-hidden rounded-full border border-[#E5E2DC] bg-[#FAFAF8] shadow-[0_1px_2px_rgba(26,26,26,0.06)]">
                        {(() => {
                          const src = profileImagePreviewSrc(
                            content.profileImageUrl
                          );
                          if (!src) {
                            return (
                              <div className="flex h-full w-full flex-col items-center justify-center gap-0.5 px-1 text-center">
                                <IconPhoto
                                  size={20}
                                  stroke={1.25}
                                  className="text-[#c9c4bc]"
                                  aria-hidden
                                />
                                <span className="text-[9px] font-medium leading-tight text-[#b5aea4]">
                                  No URL
                                </span>
                              </div>
                            );
                          }
                          return (
                            <img
                              key={src}
                              src={src}
                              alt=""
                              className="h-full w-full object-cover"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src =
                                  PREVIEW_FALLBACK_AVATAR;
                              }}
                            />
                          );
                        })()}
                      </div>
                    </div>
                  </div>
                  <label className="flex cursor-pointer items-center gap-2 text-sm font-medium text-[#1A1A1A]">
                    <input
                      type="checkbox"
                      checked={published}
                      onChange={(e) => setPublished(e.target.checked)}
                      className="h-4 w-4 rounded border-[#E5E2DC] text-amber focus:ring-amber/30"
                    />
                    Published (live when this is on and the mentor is active)
                  </label>
                  <div className="mt-4 border-t border-[#F0EDE6] pt-4">
                    <p className="mb-3 text-[11px] font-bold uppercase tracking-[0.08em] text-[#9c958c]">
                      Hero
                    </p>
                    <label className={labelClass}>Hero description</label>
                    <textarea
                      value={content.heroDescription}
                      onChange={(e) =>
                        setContent((c) => ({
                          ...c,
                          heroDescription: e.target.value,
                        }))
                      }
                      rows={4}
                      className={`${inputClass} mb-3 resize-y`}
                    />
                    <label className={labelClass}>Hero quote</label>
                    <input
                      type="text"
                      value={content.heroQuote}
                      onChange={(e) =>
                        setContent((c) => ({ ...c, heroQuote: e.target.value }))
                      }
                      className={inputClass}
                    />
                  </div>
                </AccordionSection>

                <AccordionSection
                  title="Highlights"
                  subtitle="Short bullets under the hero"
                  icon={<IconList size={20} stroke={1.5} aria-hidden />}
                >
                  {content.highlights.map((h, i) => (
                    <div key={i} className="mb-2 flex gap-2">
                      <input
                        type="text"
                        value={h.label}
                        onChange={(e) => {
                          const next = [...content.highlights];
                          next[i] = { label: e.target.value };
                          setContent((c) => ({ ...c, highlights: next }));
                        }}
                        className={inputClass}
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setContent((c) => ({
                            ...c,
                            highlights: c.highlights.filter((_, j) => j !== i),
                          }))
                        }
                        className="shrink-0 rounded-lg border border-[#E5E2DC] px-2 text-[#999] hover:bg-red-50 hover:text-red-600"
                        aria-label="Remove highlight"
                      >
                        <IconTrash size={16} stroke={1.5} />
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() =>
                      setContent((c) => ({
                        ...c,
                        highlights: [...c.highlights, { label: "" }],
                      }))
                    }
                    className="mt-1 inline-flex items-center gap-1 text-xs font-semibold text-amber"
                  >
                    <IconPlus size={14} /> Add highlight
                  </button>
                </AccordionSection>

                <AccordionSection
                  title="Problems"
                  subtitle="Three-card problem section"
                  icon={
                    <IconLayoutGrid size={20} stroke={1.5} aria-hidden />
                  }
                >
                  <label className={labelClass}>Section subtitle</label>
                  <textarea
                    value={content.problemSubtitle}
                    onChange={(e) =>
                      setContent((c) => ({
                        ...c,
                        problemSubtitle: e.target.value,
                      }))
                    }
                    rows={2}
                    className={`${inputClass} mb-3 resize-y`}
                  />
                  {content.sessions.map((s, i) => (
                    <div
                      key={i}
                      className="mb-3 rounded-lg border border-[#F0EDE8] bg-[#FAFAF8] p-3"
                    >
                      <div className="mb-2 flex gap-2">
                        <input
                          type="text"
                          value={s.num}
                          onChange={(e) => {
                            const next = [...content.sessions];
                            next[i] = { ...next[i], num: e.target.value };
                            setContent((c) => ({ ...c, sessions: next }));
                          }}
                          className={`${inputClass} w-20 shrink-0 font-mono`}
                          placeholder="01"
                        />
                        <input
                          type="text"
                          value={s.title}
                          onChange={(e) => {
                            const next = [...content.sessions];
                            next[i] = { ...next[i], title: e.target.value };
                            setContent((c) => ({ ...c, sessions: next }));
                          }}
                          className={inputClass}
                          placeholder="Title"
                        />
                      </div>
                      <textarea
                        value={s.desc}
                        onChange={(e) => {
                          const next = [...content.sessions];
                          next[i] = { ...next[i], desc: e.target.value };
                          setContent((c) => ({ ...c, sessions: next }));
                        }}
                        rows={2}
                        className={`${inputClass} mb-2 resize-y`}
                        placeholder="Description"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setContent((c) => ({
                            ...c,
                            sessions: c.sessions.filter((_, j) => j !== i),
                          }))
                        }
                        className="text-xs font-medium text-red-600 hover:underline"
                      >
                        Remove card
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() =>
                      setContent((c) => ({
                        ...c,
                        sessions: [
                          ...c.sessions,
                          { num: String(c.sessions.length + 1).padStart(2, "0"), title: "", desc: "" },
                        ],
                      }))
                    }
                    className="inline-flex items-center gap-1 text-xs font-semibold text-amber"
                  >
                    <IconPlus size={14} /> Add problem card
                  </button>
                </AccordionSection>

                <AccordionSection
                  title="Companies (optional)"
                  subtitle="Logo strip"
                  icon={<IconBuilding size={20} stroke={1.5} aria-hidden />}
                >
                  <p className="mb-3 text-xs leading-relaxed text-[#737373]">
                    Logos in the &quot;Companies worked with&quot; strip. Use a
                    path under <code className="text-[#5c564c]">/public</code>{" "}
                    (e.g. <code className="text-[#5c564c]">/companies/ibm.svg</code>)
                    or a full <strong>https://</strong> image URL. Each row needs a
                    unique alt label. Height is a preset (Tailwind); width follows
                    the image aspect ratio on the live page.
                  </p>
                  {(content.companies ?? []).map((co, i) => (
                    <div
                      key={i}
                      className="mb-4 rounded-lg border border-[#F0EDE8] bg-[#FAFAF8] p-3"
                    >
                      <div className="mb-3">
                        <label className={labelClass}>Image URL</label>
                        <p className="mb-1 text-[11px] text-[#9c958c]">
                          Local file path or hosted image URL (
                          <code className="text-[#6b6560]">https://…</code>).
                        </p>
                        <input
                          type="text"
                          value={co.src}
                          onChange={(e) => {
                            const list = [...(content.companies ?? [])];
                            list[i] = { ...list[i], src: e.target.value };
                            setContent((c) => ({ ...c, companies: list }));
                          }}
                          placeholder="https://example.com/logo.png or /companies/ibm.svg"
                          className={inputClass}
                        />
                      </div>
                      <div className="mb-3">
                        <label className={labelClass}>Alt text</label>
                        <p className="mb-1 text-[11px] text-[#9c958c]">
                          Short description for screen readers; use a distinct
                          value per logo.
                        </p>
                        <input
                          type="text"
                          value={co.alt}
                          onChange={(e) => {
                            const list = [...(content.companies ?? [])];
                            list[i] = { ...list[i], alt: e.target.value };
                            setContent((c) => ({ ...c, companies: list }));
                          }}
                          placeholder="IBM"
                          className={inputClass}
                        />
                      </div>
                      <div className="mb-2 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                        <div className="min-w-0 flex-1">
                          <label className={labelClass}>Logo height</label>
                          <p className="mb-1 text-[11px] text-[#9c958c]">
                            Taller presets suit wide wordmarks; the site keeps
                            width automatic.
                          </p>
                          <select
                            value={
                              MENTOR_LANDING_COMPANY_LOGO_HEIGHTS.includes(
                                co.h as (typeof MENTOR_LANDING_COMPANY_LOGO_HEIGHTS)[number]
                              )
                                ? co.h
                                : "h-7"
                            }
                            onChange={(e) => {
                              const list = [...(content.companies ?? [])];
                              list[i] = { ...list[i], h: e.target.value };
                              setContent((c) => ({ ...c, companies: list }));
                            }}
                            className={inputClass}
                          >
                            {MENTOR_LANDING_COMPANY_LOGO_HEIGHTS.map((opt) => (
                              <option key={opt} value={opt}>
                                {opt} (preset)
                              </option>
                            ))}
                          </select>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            const list = [...(content.companies ?? [])];
                            list.splice(i, 1);
                            setContent((c) => ({
                              ...c,
                              companies: list.length ? list : undefined,
                            }));
                          }}
                          className="inline-flex shrink-0 items-center gap-1 rounded-lg border border-[#E5E2DC] bg-white px-3 py-2 text-xs font-medium text-red-700 hover:bg-red-50"
                        >
                          <IconTrash size={14} />
                          Remove
                        </button>
                      </div>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() =>
                      setContent((c) => ({
                        ...c,
                        companies: [
                          ...(c.companies ?? []),
                          { src: "", alt: "", h: "h-7" },
                        ],
                      }))
                    }
                    className="inline-flex items-center gap-1 text-xs font-semibold text-amber"
                  >
                    <IconPlus size={14} /> Add company
                  </button>
                </AccordionSection>

                <AccordionSection
                  title="Agent Pillars"
                  subtitle="How the mentor works with you"
                  icon={<IconColumns size={20} stroke={1.5} aria-hidden />}
                >
                  <label className={labelClass}>Section subtitle</label>
                  <textarea
                    value={content.pillarSubtitle}
                    onChange={(e) =>
                      setContent((c) => ({
                        ...c,
                        pillarSubtitle: e.target.value,
                      }))
                    }
                    rows={3}
                    className={`${inputClass} mb-3 resize-y`}
                  />
                  {content.pillars.map((p, i) => (
                    <div
                      key={i}
                      className="mb-3 rounded-lg border border-[#F0EDE8] bg-[#FAFAF8] p-3"
                    >
                      <input
                        type="text"
                        value={p.title}
                        onChange={(e) => {
                          const next = [...content.pillars];
                          next[i] = { ...next[i], title: e.target.value };
                          setContent((c) => ({ ...c, pillars: next }));
                        }}
                        className={`${inputClass} mb-2`}
                        placeholder="Title"
                      />
                      <textarea
                        value={p.desc}
                        onChange={(e) => {
                          const next = [...content.pillars];
                          next[i] = { ...next[i], desc: e.target.value };
                          setContent((c) => ({ ...c, pillars: next }));
                        }}
                        rows={2}
                        className={`${inputClass} resize-y`}
                        placeholder="Description"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setContent((c) => ({
                            ...c,
                            pillars: c.pillars.filter((_, j) => j !== i),
                          }))
                        }
                        className="mt-2 text-xs font-medium text-red-600 hover:underline"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() =>
                      setContent((c) => ({
                        ...c,
                        pillars: [...c.pillars, { title: "", desc: "" }],
                      }))
                    }
                    className="inline-flex items-center gap-1 text-xs font-semibold text-amber"
                  >
                    <IconPlus size={14} /> Add pillar
                  </button>
                </AccordionSection>

                <AccordionSection
                  title="Reviews (optional)"
                  subtitle="Testimonials carousel"
                  icon={<IconStar size={20} stroke={1.5} aria-hidden />}
                >
                  <div className="mb-3 grid gap-2 sm:grid-cols-2">
                    <div>
                      <label className={labelClass}>Rating text</label>
                      <input
                        type="text"
                        value={content.reviewRating ?? ""}
                        onChange={(e) =>
                          setContent((c) => ({
                            ...c,
                            reviewRating: e.target.value || undefined,
                          }))
                        }
                        placeholder="4.92"
                        className={inputClass}
                      />
                    </div>
                    <div>
                      <label className={labelClass}>Rating attribution</label>
                      <input
                        type="text"
                        value={content.reviewSource?.label ?? ""}
                        onChange={(e) =>
                          setContent((c) => {
                            const label = e.target.value;
                            return {
                              ...c,
                              reviewSource:
                                label.trim().length > 0
                                  ? { label }
                                  : undefined,
                            };
                          })
                        }
                        placeholder="e.g. on GrowthMentor"
                        className={inputClass}
                      />
                    </div>
                  </div>
                  {(content.reviews ?? []).map((r, i) => (
                    <div
                      key={i}
                      className="mb-3 rounded-lg border border-[#F0EDE8] bg-[#FAFAF8] p-3"
                    >
                      <label className="mb-1 flex items-center gap-2 text-xs text-[#737373]">
                        <input
                          type="radio"
                          name="featuredReview"
                          checked={Boolean(r.featured)}
                          onChange={() => {
                            const list = (content.reviews ?? []).map((x, j) => ({
                              ...x,
                              featured: j === i,
                            }));
                            setContent((c) => ({ ...c, reviews: list }));
                          }}
                        />
                        Featured (lead quote)
                      </label>
                      <textarea
                        value={r.quote}
                        onChange={(e) => {
                          const list = [...(content.reviews ?? [])];
                          list[i] = { ...list[i], quote: e.target.value };
                          setContent((c) => ({ ...c, reviews: list }));
                        }}
                        rows={2}
                        className={`${inputClass} mb-2 resize-y`}
                        placeholder="Quote"
                      />
                      <div className="grid gap-2 sm:grid-cols-2">
                        <input
                          type="text"
                          value={r.author}
                          onChange={(e) => {
                            const list = [...(content.reviews ?? [])];
                            list[i] = { ...list[i], author: e.target.value };
                            setContent((c) => ({ ...c, reviews: list }));
                          }}
                          className={inputClass}
                          placeholder="Author"
                        />
                        <input
                          type="text"
                          value={r.role}
                          onChange={(e) => {
                            const list = [...(content.reviews ?? [])];
                            list[i] = { ...list[i], role: e.target.value };
                            setContent((c) => ({ ...c, reviews: list }));
                          }}
                          className={inputClass}
                          placeholder="Role / context"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          const list = [...(content.reviews ?? [])];
                          list.splice(i, 1);
                          setContent((c) => ({
                            ...c,
                            reviews: list.length ? list : undefined,
                          }));
                        }}
                        className="mt-2 text-xs text-red-600 hover:underline"
                      >
                        Remove review
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() =>
                      setContent((c) => ({
                        ...c,
                        reviews: [
                          ...(c.reviews ?? []),
                          { quote: "", author: "", role: "", featured: false },
                        ],
                      }))
                    }
                    className="inline-flex items-center gap-1 text-xs font-semibold text-amber"
                  >
                    <IconPlus size={14} /> Add review
                  </button>
                </AccordionSection>

                <AccordionSection
                  title="Starters"
                  icon={<IconMessages size={20} stroke={1.5} aria-hidden />}
                >
                  {content.chatStarters.length === 0 ? (
                    <p className="mb-3 text-sm text-[#8a847c]">
                      No starters yet. Add one to show suggestion chips on the
                      marketing page.
                    </p>
                  ) : null}
                  {content.chatStarters.map((line, i) => (
                    <div key={i} className="mb-2 flex gap-2">
                      <span className="flex w-7 shrink-0 items-start justify-end pt-2.5 font-mono text-[11px] text-[#b5aea4]">
                        {i + 1}.
                      </span>
                      <input
                        type="text"
                        value={line}
                        onChange={(e) => {
                          const next = [...content.chatStarters];
                          next[i] = e.target.value;
                          setContent((c) => ({ ...c, chatStarters: next }));
                        }}
                        className={inputClass}
                        placeholder="e.g. How do I prioritize a messy roadmap?"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setContent((c) => ({
                            ...c,
                            chatStarters: c.chatStarters.filter((_, j) => j !== i),
                          }))
                        }
                        className="shrink-0 rounded-lg border border-[#E5E2DC] px-2 text-[#999] hover:bg-red-50 hover:text-red-600"
                        aria-label="Remove starter"
                      >
                        <IconTrash size={16} stroke={1.5} />
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() =>
                      setContent((c) => ({
                        ...c,
                        chatStarters: [...c.chatStarters, ""],
                      }))
                    }
                    className="inline-flex items-center gap-1 text-xs font-semibold text-amber"
                  >
                    <IconPlus size={14} /> Add starter
                  </button>
                </AccordionSection>

                <AccordionSection
                  title="CTA"
                  subtitle="Try it heading (above starters) and optional hero CTA link"
                  icon={<IconClick size={20} stroke={1.5} aria-hidden />}
                >
                  <label className={labelClass}>Try it heading</label>
                  <input
                    type="text"
                    value={content.tryItHeading}
                    onChange={(e) =>
                      setContent((c) => ({
                        ...c,
                        tryItHeading: e.target.value,
                      }))
                    }
                    className={`${inputClass} mb-3`}
                  />
                  <p className="mb-3 text-xs text-[#737373]">
                    Shown above the conversation starter chips. Leave blank to
                    use the site default (&quot;Ask [first name] anything&quot;).
                  </p>
                  <label className={labelClass}>External CTA label</label>
                  <input
                    type="text"
                    value={content.externalLink?.label ?? ""}
                    onChange={(e) =>
                      setContent((c) => ({
                        ...c,
                        externalLink: {
                          label: e.target.value,
                          url: c.externalLink?.url ?? "",
                        },
                      }))
                    }
                    className={`${inputClass} mb-2`}
                    placeholder="View LinkedIn Profile"
                  />
                  <label className={labelClass}>External CTA URL</label>
                  <input
                    type="url"
                    value={content.externalLink?.url ?? ""}
                    onChange={(e) =>
                      setContent((c) => ({
                        ...c,
                        externalLink: {
                          label: c.externalLink?.label ?? "",
                          url: e.target.value,
                        },
                      }))
                    }
                    className={inputClass}
                  />
                </AccordionSection>
              </div>
                ) : (
                  <div className="flex flex-col gap-3">
                    <p className="text-xs text-[#737373]">
                      Edit the full landing content object. Apply runs schema
                      validation and replaces the form fields.
                    </p>
                    <textarea
                      value={rawJsonText}
                      onChange={(e) => setRawJsonText(e.target.value)}
                      spellCheck={false}
                      className={`${inputClass} min-h-[min(55vh,22rem)] flex-1 resize-y font-mono text-xs leading-relaxed`}
                    />
                    {rawJsonError ? (
                      <p className="max-h-40 overflow-y-auto rounded-lg border border-red-200 bg-red-50 px-3 py-2 font-mono text-xs text-red-800 whitespace-pre-wrap">
                        {rawJsonError}
                      </p>
                    ) : null}
                    <button
                      type="button"
                      onClick={handleApplyRawJson}
                      className="inline-flex w-fit items-center gap-2 rounded-lg border border-[#E5E2DC] bg-white px-4 py-2.5 text-sm font-semibold text-[#1A1A1A] hover:bg-[#F5F3F0]"
                    >
                      <IconCode size={18} stroke={1.5} aria-hidden />
                      Apply JSON to form
                    </button>
                  </div>
                )}
              </>
            )}
          </div>

          <footer className="shrink-0 border-t border-[#E5E2DC] bg-white px-6 py-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                {mode === "edit" && (originalSlug ?? slug) && !loading && (
                  <button
                    type="button"
                    onClick={handleDelete}
                    disabled={deleting || saving}
                    className="inline-flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm font-semibold text-red-800 hover:bg-red-100 disabled:opacity-50"
                  >
                    {deleting ? (
                      <IconLoader2 size={16} className="animate-spin" />
                    ) : (
                      <IconTrash size={16} stroke={1.5} />
                    )}
                    Delete
                  </button>
                )}
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-lg border border-[#E5E2DC] px-4 py-2.5 text-sm font-semibold text-[#1A1A1A] hover:bg-[#F5F3F0]"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={saving || loading || deleting || aiLoading}
                  className="rounded-lg bg-amber px-4 py-2.5 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-50"
                >
                  {saving ? (
                    <span className="flex items-center gap-2">
                      <IconLoader2 size={16} className="animate-spin" />
                      Saving…
                    </span>
                  ) : (
                    "Save"
                  )}
                </button>
              </div>
            </div>
          </footer>
        </div>
      </div>

      {aiPromptModalOpen && (
        <div
          className="fixed inset-0 z-[75] flex items-center justify-center bg-black/50 p-4"
          role="presentation"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget && !aiLoading) {
              setAiPromptModalOpen(false);
              setAiDraftModalError(null);
            }
          }}
        >
          <div
            className="w-full max-w-lg rounded-2xl border border-[#E0DCD4] bg-[#FAFAF8] shadow-[0_25px_50px_-12px_rgba(26,26,26,0.18)]"
            role="dialog"
            aria-modal="true"
            aria-labelledby="ai-draft-modal-title"
            onMouseDown={(e) => e.stopPropagation()}
          >
            <div className="border-b border-[#E5E2DC] bg-white px-5 py-4">
              <h3
                id="ai-draft-modal-title"
                className="text-base font-bold text-[#1A1A1A]"
              >
                Fill with AI
              </h3>
              <p className="mt-1 text-xs text-[#737373]">
                Paste positioning notes, bio bullets, testimonials, or links. The
                mentor slug in Basics is sent with this request.
              </p>
            </div>
            <div className="px-5 py-4">
              <label className={labelClass} htmlFor="ai-draft-notes">
                Prompt
              </label>
              <textarea
                id="ai-draft-notes"
                value={aiNotes}
                onChange={(e) => setAiNotes(e.target.value)}
                rows={10}
                placeholder="Minimum 20 characters…"
                disabled={aiLoading}
                className={`${inputClass} resize-y font-mono text-xs`}
                spellCheck={true}
              />
              <p className="mt-1 text-xs text-[#8a847c]">
                {aiNotes.trim().length} / 20+ characters
              </p>
              {aiDraftModalError ? (
                <p className="mt-2 max-h-32 overflow-y-auto rounded-lg border border-red-200 bg-red-50 px-3 py-2 font-mono text-xs text-red-800 whitespace-pre-wrap">
                  {aiDraftModalError}
                </p>
              ) : null}
            </div>
            <div className="flex flex-wrap justify-end gap-2 border-t border-[#E5E2DC] bg-white px-5 py-4">
              <button
                type="button"
                disabled={aiLoading}
                onClick={() => {
                  setAiPromptModalOpen(false);
                  setAiDraftModalError(null);
                }}
                className="rounded-lg border border-[#E5E2DC] px-4 py-2.5 text-sm font-semibold text-[#1A1A1A] hover:bg-[#F5F3F0] disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={aiLoading}
                onClick={async () => {
                  const ok = await handleAiDraft();
                  if (ok) setAiPromptModalOpen(false);
                }}
                className="inline-flex items-center gap-2 rounded-lg bg-amber px-4 py-2.5 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-50"
              >
                {aiLoading ? (
                  <IconLoader2 size={18} className="animate-spin" />
                ) : (
                  <IconSparkles size={18} stroke={1.5} />
                )}
                Generate draft
              </button>
            </div>
          </div>
        </div>
      )}

      {previewOpen && (
        <div className="fixed inset-0 z-[70] flex flex-col bg-black/50 p-2 sm:p-4">
          <div className="flex shrink-0 items-center justify-between gap-2 rounded-t-xl border border-b-0 border-[#E5E2DC] bg-white px-4 py-3">
            <p className="text-sm font-semibold text-[#1A1A1A]">
              Preview (draft — not saved to live until you publish and save)
            </p>
            <button
              type="button"
              onClick={() => setPreviewOpen(false)}
              className="rounded-lg border border-[#E5E2DC] px-3 py-1.5 text-sm font-medium text-[#1A1A1A] hover:bg-[#F5F3F0]"
            >
              Close preview
            </button>
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto rounded-b-xl border border-[#E5E2DC] bg-[#F7F5F2]">
            {previewLoading || !previewMentor ? (
              <div className="flex justify-center py-24">
                <IconLoader2 className="animate-spin text-amber" size={36} />
              </div>
            ) : (
              <MentorMarketingClient
                mentor={previewMentor}
                marketing={normalizeFeaturedReviews(content)}
              />
            )}
          </div>
        </div>
      )}
    </>
  );
}
