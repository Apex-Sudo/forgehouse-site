"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { BookOpen, Copy, Check, ArrowRight, Lightbulb, Code, Briefcase, Flask } from "@phosphor-icons/react";
import ClipButton from "@/components/ui/ClipButton";

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

const CATEGORY_ICONS: Record<string, React.ElementType> = {
  productivity: Lightbulb,
  business: Briefcase,
  code: Code,
  research: Flask,
};

const CATEGORY_DESCRIPTIONS: Record<string, string> = {
  productivity: "Get more done with less. Prompts designed to structure your thinking and accelerate execution.",
  business: "Sales, strategy, and operations prompts built from real-world GTM expertise.",
  code: "Code reviews, debugging, and architecture prompts for shipping faster with fewer bugs.",
  research: "Synthesize information, map competitive landscapes, and surface insights others miss.",
};

export default function FreePromptsPage() {
  const [categories, setCategories] = useState<PromptCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<string>("productivity");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
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
  }, []);

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    });
  };

  const activeData = categories.find((c) => c.slug === activeCategory);
  const activePrompts = activeData?.prompts ?? [];

  return (
    <main className="min-h-screen bg-background pt-16 md:pt-[72px]">
      {/* ═══════════════════════════════════════════
          HERO
          ═══════════════════════════════════════════ */}
      <section className="px-6 pt-20 md:pt-28 pb-12">
        <div className="max-w-[1008px] mx-auto">
          <span className="mono inline-flex items-center gap-2 text-[11px] tracking-[0.06em] uppercase text-accent bg-accent/10 border border-accent/25 rounded-md px-2.5 py-1 mb-6">
            <BookOpen size={13} weight="fill" />
            Prompt Library
          </span>
          <h1 className="text-[48px] md:text-[72px] leading-[0.92] tracking-[-0.015em] mb-6">
            Free Prompts
          </h1>
          <p className="text-[17px] leading-[1.55] text-muted max-w-[580px]">
            Premade, battle-tested prompts you can drop into any AI chat.
            Built from real coaching sessions with ForgeHouse mentors.
            No sign-up required — copy and use anywhere.
          </p>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          CATEGORY TABS
          ═══════════════════════════════════════════ */}
      <div className="max-w-[1008px] mx-auto px-6 pb-10">
        <div className="flex flex-wrap gap-2">
          {categories.map((cat) => {
            const Icon = CATEGORY_ICONS[cat.slug] ?? BookOpen;
            const isActive = activeCategory === cat.slug;
            return (
              <button
                key={cat.slug}
                onClick={() => setActiveCategory(cat.slug)}
                className={`mono flex items-center gap-2 px-4 py-2.5 rounded-md text-[11px] tracking-[0.06em] uppercase transition cursor-pointer border ${
                  isActive
                    ? "bg-accent text-[#1B1B18] border-accent"
                    : "bg-surface text-muted border-border hover:border-border-light hover:text-foreground"
                }`}
              >
                <Icon size={14} weight={isActive ? "fill" : "regular"} />
                {cat.name}
              </button>
            );
          })}
        </div>

        {activeData && (
          <p className="text-[16px] leading-[1.5] text-muted mt-5 max-w-[560px]">
            {CATEGORY_DESCRIPTIONS[activeCategory] ?? ""}
          </p>
        )}
      </div>

      {/* ═══════════════════════════════════════════
          PROMPT CARDS
          ═══════════════════════════════════════════ */}
      <div className="max-w-[1008px] mx-auto px-6 pb-20">
        {loading && (
          <div className="flex justify-center py-20">
            <div className="w-6 h-6 border-2 border-accent/30 border-t-accent rounded-full animate-spin" />
          </div>
        )}

        {!loading && activePrompts.length === 0 && (
          <div className="text-center py-20">
            <BookOpen size={36} weight="regular" className="text-faint mx-auto mb-4" />
            <p className="mono text-[12px] tracking-[0.06em] uppercase text-muted">
              No prompts in this category yet. Check back soon.
            </p>
          </div>
        )}

        {!loading && activePrompts.length > 0 && (
          <div className="grid md:grid-cols-2 gap-[30px]">
            {activePrompts.map((prompt) => {
              const isCopied = copiedId === prompt.id;
              return (
                <div
                  key={prompt.id}
                  className="bg-surface border border-border rounded-lg p-6 flex flex-col hover:border-border-light transition-colors group"
                >
                  {/* Header: title + category badge */}
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <h3 className="text-[22px] leading-[1.15] text-foreground group-hover:text-accent transition-colors">
                      {prompt.title}
                    </h3>
                    <span className="mono shrink-0 text-[11px] tracking-[0.06em] uppercase text-accent bg-accent/10 border border-accent/25 rounded-md px-2.5 py-1 whitespace-nowrap">
                      {activeData?.name}
                    </span>
                  </div>

                  <p className="text-[16px] leading-[1.5] text-muted mb-5">
                    {prompt.description}
                  </p>

                  {/* Prompt preview */}
                  <div className="mono text-[13px] leading-[1.6] bg-background border border-border rounded-md p-4 text-foreground mb-5">
                    &ldquo;{prompt.prompt_text}&rdquo;
                  </div>

                  {/* Actions — always visible, clean layout */}
                  <div className="mt-auto flex items-center gap-2.5 pt-1">
                    <button
                      onClick={() => handleCopy(prompt.id, prompt.prompt_text)}
                      className={`mono inline-flex items-center gap-2 border px-4 py-2.5 rounded-md text-[11px] tracking-[0.06em] uppercase transition cursor-pointer ${
                        isCopied
                          ? "border-accent/40 bg-accent/10 text-accent"
                          : "border-border-light text-foreground hover:border-accent hover:text-accent"
                      }`}
                    >
                      {isCopied ? (
                        <>
                          <Check size={14} weight="bold" />
                          Copied
                        </>
                      ) : (
                        <>
                          <Copy size={14} weight="regular" />
                          Copy prompt
                        </>
                      )}
                    </button>
                    <Link
                      href={`/chat`}
                      className="mono inline-flex items-center gap-2 bg-accent text-[#1B1B18] px-4 py-2.5 rounded-md text-[11px] tracking-[0.06em] uppercase hover:bg-accent-dim transition ml-auto"
                    >
                      Try in chat
                      <ArrowRight size={14} weight="bold" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ═══════════════════════════════════════════
          BOTTOM CTA
          ═══════════════════════════════════════════ */}
      <section className="px-6 pb-24">
        <div className="max-w-[1008px] mx-auto">
          <div className="sparkle-field border border-border rounded-lg px-8 md:px-12 py-14 text-center">
            <BookOpen size={28} weight="fill" className="text-accent mx-auto mb-5" />
            <h2 className="text-[36px] md:text-[44px] leading-[0.95] tracking-[-0.015em] text-foreground mb-4">
              Want more than a prompt?
            </h2>
            <p className="text-[17px] leading-[1.5] text-muted max-w-[520px] mx-auto mb-8">
              These prompts are a starting point. ForgeHouse mentors use them inside
              real coaching sessions — where prompts become conversations, and conversations
              become results.
            </p>
            <div className="max-w-[260px] mx-auto">
              <ClipButton href="/mentors" variant="paper">
                Browse mentors
              </ClipButton>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
