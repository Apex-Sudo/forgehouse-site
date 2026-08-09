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
import ClipButton from "@/components/ui/ClipButton";
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

const accordionIconClass = "flex shrink-0 items-center justify-center text-accent";

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
      className="group overflow-hidden rounded-md border border-border bg-surface"
      onToggle={(e) => {
        if (e.currentTarget.open && onExpand) {
          onExpand();
        }
      }}
    >
      <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-4 py-3 transition hover:bg-surface-light [&::-webkit-details-marker]:hidden">
        <div className="flex min-w-0 flex-1 items-center gap-3">
          <span className={accordionIconClass} aria-hidden>
            {icon}
          </span>
          <div className="min-w-0">
            <span className="text-[16px] text-foreground">{title}</span>
            {subtitle ? (
              <p className="mono mt-0.5 text-[11px] leading-relaxed text-muted">
                {subtitle}
              </p>
            ) : null}
          </div>
        </div>
        <IconChevronDown
          className="shrink-0 text-faint transition-transform group-open:rotate-180"
          size={20}
          stroke={1.5}
          aria-hidden
        />
      </summary>
      <div className="border-t border-border px-4 py-4">{children}</div>
    </details>
  );
}

const inputClass =
  "w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-faint transition focus:border-accent/60 focus:outline-none disabled:cursor-not-allowed disabled:opacity-40";

const labelClass =
  "mono mb-1 block text-[11px] uppercase tracking-[0.06em] text-faint";

const addButtonClass =
  "mono inline-flex items-center gap-1 text-[11px] uppercase tracking-[0.06em] text-accent transition hover:text-accent-dim";

const removeTextButtonClass =
  "mono text-[11px] uppercase tracking-[0.06em] text-[#F2777A] transition hover:underline";

const iconRemoveButtonClass =
  "shrink-0 rounded-md border border-border px-2 text-faint transition hover:border-[#F2777A]/25 hover:bg-[#F2777A]/10 hover:text-[#F2777A]";

const nestedCardClass = "rounded-md border border-border bg-surface-light p-3";

const errorBoxClass =
  "rounded-md border border-[#F2777A]/25 bg-[#F2777A]/12 px-3 py-2 text-sm text-[#F2777A]";

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
      <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
        <div className="relative flex max-h-[min(92dvh,calc(100dvh-2rem))] w-full max-w-4xl flex-col overflow-hidden rounded-lg border border-border bg-surface shadow-2xl">
          <header className="shrink-0 border-b border-border bg-surface px-6 py-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-[24px] leading-tight text-foreground">
                  {mode === "create"
                    ? "New mentor landing page"
                    : "Edit mentor landing page"}
                </h2>
                <p className="mono mt-1.5 text-[11px] tracking-[0.02em] text-muted">
                  Manage the content for a mentor landing page.
                </p>
              </div>
              <div className="flex shrink-0 flex-wrap items-center justify-end gap-2">
                <details
                  ref={actionsMenuRef}
                  className="group relative"
                >
                  <summary className="mono flex cursor-pointer list-none items-center gap-1.5 rounded-md border border-border px-3 py-2 text-[12px] uppercase tracking-[0.06em] text-foreground transition hover:bg-surface-light [&::-webkit-details-marker]:hidden">
                    Actions
                    <IconChevronDown
                      size={14}
                      stroke={1.5}
                      className="text-faint transition-transform group-open:rotate-180"
                      aria-hidden
                    />
                  </summary>
                  <div
                    className="absolute right-0 z-[70] mt-1 min-w-[12.5rem] rounded-md border border-border bg-surface py-1 shadow-2xl"
                    role="menu"
                  >
                    {resolvedSlug ? (
                      <Link
                        href={`/mentors/${resolvedSlug}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        role="menuitem"
                        className="mono flex items-center gap-2 px-3 py-2.5 text-[12px] text-foreground transition hover:bg-surface-light"
                        onClick={closeActionsMenu}
                      >
                        <IconExternalLink size={16} stroke={1.5} />
                        Live site
                      </Link>
                    ) : (
                      <span
                        className="mono flex cursor-not-allowed items-center gap-2 px-3 py-2.5 text-[12px] text-faint"
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
                      className="mono flex w-full items-center gap-2 px-3 py-2.5 text-left text-[12px] text-foreground transition hover:bg-surface-light disabled:cursor-not-allowed disabled:text-faint disabled:hover:bg-transparent"
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
                      className="mono flex w-full items-center gap-2 px-3 py-2.5 text-left text-[12px] text-foreground transition hover:bg-surface-light disabled:cursor-not-allowed disabled:text-faint disabled:hover:bg-transparent"
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
                    className="mono inline-flex items-center gap-1.5 text-[11px] uppercase tracking-[0.06em] text-muted"
                    aria-live="polite"
                  >
                    <IconLoader2 size={16} className="animate-spin" />
                    AI draft…
                  </span>
                ) : null}
                <button
                  type="button"
                  onClick={onClose}
                  className="flex h-10 w-10 items-center justify-center rounded-md text-muted transition hover:bg-surface-light hover:text-foreground"
                  aria-label="Close"
                >
                  <IconX size={22} stroke={1.5} />
                </button>
              </div>
            </div>
          </header>

          <div className="fh-scroll min-h-0 flex-1 overflow-y-auto bg-background px-6 py-4">
            {loadError && (
              <div className={`mb-3 ${errorBoxClass}`}>{loadError}</div>
            )}
            {saveError && (
              <div
                className="fh-scroll mb-3 max-h-40 overflow-y-auto whitespace-pre-wrap rounded-md border border-[#F2777A]/25 bg-[#F2777A]/12 px-3 py-2 mono text-xs text-[#F2777A]"
              >
                {saveError}
              </div>
            )}

            {loading ? (
              <div className="flex justify-center py-16">
                <IconLoader2 className="animate-spin text-accent" size={32} />
              </div>
            ) : (
              <>
                <div
                  className="mb-4 flex gap-6 border-b border-border"
                  role="tablist"
                  aria-label="Landing editor mode"
                >
                  <button
                    type="button"
                    role="tab"
                    aria-selected={editorTab === "form"}
                    onClick={() => setEditorTab("form")}
                    className={`mono -mb-px flex items-center gap-2 border-b-2 px-1 py-2.5 text-[11px] uppercase tracking-[0.08em] transition ${
                      editorTab === "form"
                        ? "border-accent text-accent"
                        : "border-transparent text-faint hover:text-foreground"
                    }`}
                  >
                    <IconForms size={16} stroke={1.5} aria-hidden />
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
                    className={`mono -mb-px flex items-center gap-2 border-b-2 px-1 py-2.5 text-[11px] uppercase tracking-[0.08em] transition ${
                      editorTab === "json"
                        ? "border-accent text-accent"
                        : "border-transparent text-faint hover:text-foreground"
                    }`}
                  >
                    <IconCode size={16} stroke={1.5} aria-hidden />
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
                    className={`${inputClass} mb-3 mono`}
                    spellCheck={false}
                  />
                  <p className="mb-3 text-xs leading-relaxed text-muted">
                    Lowercase letters, numbers, and hyphens only. Changing the slug
                    updates the row URL; ensure the mentor profile uses the same
                    slug.
                  </p>
                  <label className={labelClass}>Profile image URL</label>
                  <p className="mb-3 text-[11px] leading-relaxed text-muted">
                    Optional. Full <code className="text-foreground">https://</code>{" "}
                    image URL or a path served from{" "}
                    <code className="text-foreground">/public</code> (e.g.{" "}
                    <code className="text-foreground">/mentors/colin.jpg</code>
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
                      className="flex shrink-0 flex-col items-center justify-start gap-2 sm:w-[5.75rem] sm:justify-center sm:border-l sm:border-border sm:pl-5 sm:py-1"
                      aria-label="Profile image preview"
                    >
                      <span className="mono text-[10px] uppercase tracking-[0.08em] text-faint">
                        Preview
                      </span>
                      <div className="relative h-[72px] w-[72px] shrink-0 overflow-hidden rounded-full border border-border bg-background">
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
                                  className="text-faint"
                                  aria-hidden
                                />
                                <span className="mono text-[9px] leading-tight text-faint">
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
                  <label className="flex cursor-pointer items-center gap-2 text-sm text-foreground">
                    <input
                      type="checkbox"
                      checked={published}
                      onChange={(e) => setPublished(e.target.checked)}
                      className="h-4 w-4 rounded border-border accent-[#CAED57]"
                    />
                    Published (live when this is on and the mentor is active)
                  </label>
                  <div className="mt-4 border-t border-border pt-4">
                    <p className="mono mb-3 text-[11px] uppercase tracking-[0.08em] text-faint">
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
                        className={iconRemoveButtonClass}
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
                    className={`${addButtonClass} mt-1`}
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
                      className={`${nestedCardClass} mb-3`}
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
                          className={`${inputClass} w-20 shrink-0 mono`}
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
                        className={removeTextButtonClass}
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
                    className={addButtonClass}
                  >
                    <IconPlus size={14} /> Add problem card
                  </button>
                </AccordionSection>

                <AccordionSection
                  title="Companies (optional)"
                  subtitle="Logo strip"
                  icon={<IconBuilding size={20} stroke={1.5} aria-hidden />}
                >
                  <p className="mb-3 text-xs leading-relaxed text-muted">
                    Logos in the &quot;Companies worked with&quot; strip. Use a
                    path under <code className="text-foreground">/public</code>{" "}
                    (e.g. <code className="text-foreground">/companies/ibm.svg</code>)
                    or a full <strong>https://</strong> image URL. Each row needs a
                    unique alt label. Height is a preset (Tailwind); width follows
                    the image aspect ratio on the live page.
                  </p>
                  {(content.companies ?? []).map((co, i) => (
                    <div
                      key={i}
                      className={`${nestedCardClass} mb-4`}
                    >
                      <div className="mb-3">
                        <label className={labelClass}>Image URL</label>
                        <p className="mb-1 text-[11px] leading-relaxed text-muted">
                          Local file path or hosted image URL (
                          <code className="text-foreground">https://…</code>).
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
                        <p className="mb-1 text-[11px] leading-relaxed text-muted">
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
                          <p className="mb-1 text-[11px] leading-relaxed text-muted">
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
                            className={`${inputClass} mono`}
                          >
                            {MENTOR_LANDING_COMPANY_LOGO_HEIGHTS.map((opt) => (
                              <option
                                key={opt}
                                value={opt}
                                className="bg-surface text-foreground"
                              >
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
                          className="mono inline-flex shrink-0 items-center gap-1 rounded-md border border-[#F2777A]/25 px-3 py-2 text-[11px] uppercase tracking-[0.06em] text-[#F2777A] transition hover:bg-[#F2777A]/10"
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
                    className={addButtonClass}
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
                      className={`${nestedCardClass} mb-3`}
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
                        className={`${removeTextButtonClass} mt-2 block`}
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
                    className={addButtonClass}
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
                      className={`${nestedCardClass} mb-3`}
                    >
                      <label className="mb-1 flex cursor-pointer items-center gap-2 text-xs text-muted">
                        <input
                          type="radio"
                          name="featuredReview"
                          className="accent-[#CAED57]"
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
                        className={`${removeTextButtonClass} mt-2 block`}
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
                    className={addButtonClass}
                  >
                    <IconPlus size={14} /> Add review
                  </button>
                </AccordionSection>

                <AccordionSection
                  title="Starters"
                  icon={<IconMessages size={20} stroke={1.5} aria-hidden />}
                >
                  {content.chatStarters.length === 0 ? (
                    <p className="mb-3 text-sm text-muted">
                      No starters yet. Add one to show suggestion chips on the
                      marketing page.
                    </p>
                  ) : null}
                  {content.chatStarters.map((line, i) => (
                    <div key={i} className="mb-2 flex gap-2">
                      <span className="mono flex w-7 shrink-0 items-start justify-end pt-2.5 text-[11px] text-faint">
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
                        className={iconRemoveButtonClass}
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
                    className={addButtonClass}
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
                  <p className="mb-3 text-xs leading-relaxed text-muted">
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
                  <div className="flex flex-col gap-3 rounded-md border border-border bg-surface p-4">
                    <p className="text-xs leading-relaxed text-muted">
                      Edit the full landing content object. Apply runs schema
                      validation and replaces the form fields.
                    </p>
                    <textarea
                      value={rawJsonText}
                      onChange={(e) => setRawJsonText(e.target.value)}
                      spellCheck={false}
                      className={`${inputClass} fh-scroll min-h-[min(55vh,22rem)] flex-1 resize-y mono text-xs leading-relaxed`}
                    />
                    {rawJsonError ? (
                      <p className="fh-scroll max-h-40 overflow-y-auto whitespace-pre-wrap rounded-md border border-[#F2777A]/25 bg-[#F2777A]/12 px-3 py-2 mono text-xs text-[#F2777A]">
                        {rawJsonError}
                      </p>
                    ) : null}
                    <button
                      type="button"
                      onClick={handleApplyRawJson}
                      className="mono inline-flex w-fit items-center gap-2 rounded-md border border-border px-4 py-2.5 text-[12px] uppercase tracking-[0.06em] text-foreground transition hover:bg-surface-light"
                    >
                      <IconCode size={18} stroke={1.5} aria-hidden />
                      Apply JSON to form
                    </button>
                  </div>
                )}
              </>
            )}
          </div>

          <footer className="shrink-0 border-t border-border bg-surface px-6 py-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                {mode === "edit" && (originalSlug ?? slug) && !loading && (
                  <button
                    type="button"
                    onClick={handleDelete}
                    disabled={deleting || saving}
                    className="mono inline-flex items-center gap-2 rounded-md border border-[#F2777A]/25 px-4 py-3.5 text-[11px] leading-[1.4] uppercase tracking-[0.06em] text-[#F2777A] transition hover:bg-[#F2777A]/10 disabled:cursor-not-allowed disabled:opacity-40"
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
                  className="mono rounded-md border border-border px-4 py-3.5 text-[11px] leading-[1.4] uppercase tracking-[0.06em] text-foreground transition hover:bg-surface-light"
                >
                  Cancel
                </button>
                <div className="w-[150px]">
                  {saving || loading || deleting || aiLoading ? (
                    <div className="clip-corner mono flex w-full items-center gap-2 bg-white/8 px-5 py-3.5 text-[11px] leading-[1.4] tracking-[0.01em] text-faint">
                      {saving ? (
                        <>
                          <IconLoader2 size={16} className="animate-spin" />
                          Saving…
                        </>
                      ) : (
                        "Save"
                      )}
                    </div>
                  ) : (
                    <ClipButton variant="paper" onClick={handleSave}>
                      Save
                    </ClipButton>
                  )}
                </div>
              </div>
            </div>
          </footer>
        </div>
      </div>

      {aiPromptModalOpen && (
        <div
          className="fixed inset-0 z-[75] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
          role="presentation"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget && !aiLoading) {
              setAiPromptModalOpen(false);
              setAiDraftModalError(null);
            }
          }}
        >
          <div
            className="w-full max-w-lg rounded-lg border border-border bg-surface shadow-2xl"
            role="dialog"
            aria-modal="true"
            aria-labelledby="ai-draft-modal-title"
            onMouseDown={(e) => e.stopPropagation()}
          >
            <div className="border-b border-border bg-surface px-5 py-4">
              <h3
                id="ai-draft-modal-title"
                className="text-[20px] leading-tight text-foreground"
              >
                Fill with AI
              </h3>
              <p className="mt-1.5 text-xs leading-relaxed text-muted">
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
                className={`${inputClass} fh-scroll resize-y mono text-xs`}
                spellCheck={true}
              />
              <p className="mono mt-1.5 text-[11px] text-faint">
                {aiNotes.trim().length} / 20+ characters
              </p>
              {aiDraftModalError ? (
                <p className="fh-scroll mt-2 max-h-32 overflow-y-auto whitespace-pre-wrap rounded-md border border-[#F2777A]/25 bg-[#F2777A]/12 px-3 py-2 mono text-xs text-[#F2777A]">
                  {aiDraftModalError}
                </p>
              ) : null}
            </div>
            <div className="flex flex-wrap justify-end gap-2 border-t border-border bg-surface px-5 py-4">
              <button
                type="button"
                disabled={aiLoading}
                onClick={() => {
                  setAiPromptModalOpen(false);
                  setAiDraftModalError(null);
                }}
                className="mono rounded-md border border-border px-4 py-3.5 text-[11px] leading-[1.4] uppercase tracking-[0.06em] text-foreground transition hover:bg-surface-light disabled:cursor-not-allowed disabled:opacity-40"
              >
                Cancel
              </button>
              <div className="w-[190px]">
                {aiLoading ? (
                  <div className="clip-corner mono flex w-full items-center gap-2 bg-white/8 px-5 py-3.5 text-[11px] leading-[1.4] tracking-[0.01em] text-faint">
                    <IconLoader2 size={16} className="animate-spin" />
                    Generate draft
                  </div>
                ) : (
                  <ClipButton
                    variant="paper"
                    onClick={() => {
                      void (async () => {
                        const ok = await handleAiDraft();
                        if (ok) setAiPromptModalOpen(false);
                      })();
                    }}
                  >
                    Generate draft
                  </ClipButton>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {previewOpen && (
        <div className="fixed inset-0 z-[70] flex flex-col bg-black/70 backdrop-blur-sm p-2 sm:p-4">
          <div className="flex shrink-0 items-center justify-between gap-2 rounded-t-lg border border-b-0 border-border bg-surface px-4 py-3">
            <p className="mono text-[11px] tracking-[0.02em] text-muted">
              Preview (draft — not saved to live until you publish and save)
            </p>
            <button
              type="button"
              onClick={() => setPreviewOpen(false)}
              className="mono rounded-md border border-border px-3 py-1.5 text-[11px] uppercase tracking-[0.06em] text-foreground transition hover:bg-surface-light"
            >
              Close preview
            </button>
          </div>
          <div className="fh-scroll min-h-0 flex-1 overflow-y-auto rounded-b-lg border border-border bg-background">
            {previewLoading || !previewMentor ? (
              <div className="flex justify-center py-24">
                <IconLoader2 className="animate-spin text-accent" size={36} />
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
