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
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Sheet */}
      <div
        ref={sheetRef}
        className="relative bg-white rounded-t-2xl shadow-[0_-8px_40px_rgba(0,0,0,0.12)] flex flex-col max-h-[85vh] animate-in slide-in-from-bottom duration-300"
      >
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full bg-[#E0DCD4]" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-[#F0EDE8] shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber/10 flex items-center justify-center">
              <BookOpen size={18} weight="fill" className="text-amber" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-[#1A1A1A]">Prompt Library</h2>
              <p className="text-[11px] text-muted">Browse premade prompts to kick off your conversation</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[#F5F3F0] transition cursor-pointer"
          >
            <X size={18} weight="bold" className="text-[#888]" />
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
                className={`px-3.5 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition cursor-pointer ${
                  isActive
                    ? "bg-[#B8916A] text-white"
                    : "bg-[#F5F3F0] text-[#737373] hover:bg-[#EDEAE5] hover:text-[#1A1A1A]"
                }`}
              >
                {cat.name}
              </button>
            );
          })}
        </div>

        {/* Prompt cards */}
        <div className="flex-1 overflow-y-auto px-5 pb-8 pt-3">
          {loading && (
            <div className="flex justify-center py-12">
              <div className="w-5 h-5 border-2 border-amber/30 border-t-amber rounded-full animate-spin" />
            </div>
          )}

          {!loading && activePrompts.length === 0 && (
            <div className="text-center py-12">
              <p className="text-sm text-muted">No prompts in this category yet.</p>
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
                  className="text-left bg-[#FAFAF8] border border-[#EDEAE5] rounded-xl px-4 py-3.5 hover:border-[#B8916A]/30 hover:bg-[#F7F5F2] hover:shadow-sm transition group cursor-pointer"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-[#1A1A1A] mb-1 group-hover:text-[#B8916A] transition-colors">
                        {prompt.title}
                      </p>
                      <p className="text-xs text-[#888] leading-relaxed line-clamp-2">
                        {prompt.description}
                      </p>
                      <p className="text-[11px] text-[#B0ADA5] mt-2 line-clamp-2 leading-relaxed italic">
                        &ldquo;{prompt.prompt_text.slice(0, 120)}{prompt.prompt_text.length > 120 ? "..." : ""}&rdquo;
                      </p>
                    </div>
                    <div className="shrink-0 mt-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                      <ArrowRight size={16} weight="bold" className="text-[#B8916A]" />
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
