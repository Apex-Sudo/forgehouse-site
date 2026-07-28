"use client";
import { useEffect, useState, useRef } from "react";
import { X, BookOpen, ArrowRight } from "@phosphor-icons/react";

interface PromptItem {
  id: string;
  title: string;
  description: string;
  prompt_text: string;
}

interface PromptCategory {
  slug: string;
  name: string;
  prompts: PromptItem[];
}

interface Props {
  open: boolean;
  onClose: () => void;
  onSelect: (promptText: string) => void;
}

const CATEGORY_SLUGS = ["productivity", "business", "code", "research"] as const;

export default function PromptLibraryBottomSheet({ open, onClose, onSelect }: Props) {
  const [categories, setCategories] = useState<PromptCategory[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string>("productivity");
  const sheetRef = useRef<HTMLDivElement>(null);

  // Fetch prompts on open
  useEffect(() => {
    if (!open) return;
    setLoading(true);
    fetch("/api/prompts")
      .then((r) => r.json())
      .then((data) => {
        if (data.categories) {
          setCategories(data.categories);
          if (data.categories.length > 0) {
            setActiveCategory(data.categories[0].slug);
          }
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [open]);

  // Escape key
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open, onClose]);

  // Prevent body scroll when open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  if (!open) return null;

  const activePrompts = categories.find((c) => c.slug === activeCategory)?.prompts ?? [];

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Sheet */}
      <div
        ref={sheetRef}
        className="relative bg-surface border-t border-border rounded-t-2xl shadow-[0_-8px_40px_rgba(0,0,0,0.5)] flex flex-col max-h-[85vh] animate-in slide-in-from-bottom duration-300"
      >
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full bg-border-light" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-border shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-md border border-accent/40 flex items-center justify-center shrink-0">
              <BookOpen size={17} weight="regular" className="text-accent" />
            </div>
            <div>
              <h2 className="text-[24px] leading-none text-foreground">Prompt Library</h2>
              <p className="mono text-[10px] tracking-[0.06em] uppercase text-muted mt-1.5">Browse premade prompts to kick off your conversation</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-md text-muted hover:text-accent hover:bg-surface-light transition cursor-pointer"
          >
            <X size={17} weight="bold" />
          </button>
        </div>

        {/* Category tabs */}
        <div className="px-5 pt-4 pb-2 flex gap-2 overflow-x-auto shrink-0">
          {CATEGORY_SLUGS.map((slug) => {
            const cat = categories.find((c) => c.slug === slug);
            if (!cat) return null;
            const isActive = activeCategory === slug;
            return (
              <button
                key={slug}
                onClick={() => setActiveCategory(slug)}
                className={`mono px-3.5 py-1.5 rounded-full text-[11px] tracking-[0.06em] uppercase whitespace-nowrap transition cursor-pointer border ${
                  isActive
                    ? "bg-accent text-[#1B1B18] border-accent"
                    : "bg-transparent text-muted border-border hover:text-accent hover:border-accent/60"
                }`}
              >
                {cat.name}
              </button>
            );
          })}
        </div>

        {/* Prompt cards */}
        <div className="flex-1 overflow-y-auto fh-scroll px-5 pb-8 pt-3">
          {loading && (
            <div className="flex justify-center py-12">
              <div className="w-5 h-5 border-2 border-accent/30 border-t-accent rounded-full animate-spin" />
            </div>
          )}

          {!loading && activePrompts.length === 0 && (
            <div className="text-center py-12">
              <p className="mono text-[11px] tracking-[0.06em] uppercase text-faint">No prompts in this category yet.</p>
            </div>
          )}

          {!loading && activePrompts.length > 0 && (
            <div className="grid gap-3">
              {activePrompts.map((prompt) => (
                <button
                  key={prompt.id}
                  onClick={() => {
                    onSelect(prompt.prompt_text);
                    onClose();
                  }}
                  className="text-left bg-background border border-border rounded-lg p-5 hover:border-accent/50 transition-all group cursor-pointer"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <p className="text-[20px] leading-none text-foreground group-hover:text-accent transition-colors">
                          {prompt.title}
                        </p>
                        <span className="mono shrink-0 text-[10px] tracking-[0.06em] uppercase text-accent border border-accent/50 px-2 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                          Use this
                        </span>
                      </div>
                      <p className="text-[14px] italic text-muted leading-relaxed line-clamp-2 mb-3">
                        {prompt.description}
                      </p>
                      <div className="bg-surface border border-border rounded-md px-3 py-2.5">
                        <p className="mono text-[11px] text-faint leading-relaxed line-clamp-2">
                          &ldquo;{prompt.prompt_text.slice(0, 120)}{prompt.prompt_text.length > 120 ? "..." : ""}&rdquo;
                        </p>
                      </div>
                    </div>
                    <div className="shrink-0 mt-1 opacity-40 group-hover:opacity-100 transition-opacity">
                      <div className="w-6 h-6 rounded-full border border-accent/50 flex items-center justify-center">
                        <ArrowRight size={12} weight="bold" className="text-accent" />
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
