"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { BookOpen, Copy, Check, ArrowRight, Lightbulb, Code, Briefcase, Flask } from "@phosphor-icons/react";

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
    <main className="min-h-screen bg-background">
      {/* Hero */}
      <section className="pt-32 pb-12 px-6 text-center">
        <div className="max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-amber/10 border border-amber/20 rounded-full px-4 py-1.5 text-amber text-xs font-medium mb-6">
            <BookOpen size={14} weight="fill" />
            Prompt Library
          </div>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
            Free Prompts
          </h1>
          <p className="text-lg text-muted max-w-2xl mx-auto leading-relaxed">
            Premade, battle-tested prompts you can drop into any AI chat. 
            Built from real coaching sessions with ForgeHouse mentors. 
            No sign-up required — copy and use anywhere.
          </p>
        </div>
      </section>

      {/* Category tabs */}
      <div className="max-w-4xl mx-auto px-6 pb-8">
        <div className="flex flex-wrap justify-center gap-2">
          {categories.map((cat) => {
            const Icon = CATEGORY_ICONS[cat.slug] ?? BookOpen;
            const isActive = activeCategory === cat.slug;
            return (
              <button
                key={cat.slug}
                onClick={() => setActiveCategory(cat.slug)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition cursor-pointer ${
                  isActive
                    ? "bg-[#B8916A] text-white shadow-[0_2px_8px_rgba(184,145,106,0.3)]"
                    : "bg-[#F5F3F0] text-[#737373] hover:bg-[#EDEAE5] hover:text-[#1A1A1A]"
                }`}
              >
                <Icon size={16} weight={isActive ? "fill" : "regular"} />
                {cat.name}
              </button>
            );
          })}
        </div>

        {activeData && (
          <p className="text-center text-sm text-muted mt-4 max-w-xl mx-auto">
            {CATEGORY_DESCRIPTIONS[activeCategory] ?? ""}
          </p>
        )}
      </div>

      {/* Prompt cards */}
      <div className="max-w-4xl mx-auto px-6 pb-16">
        {loading && (
          <div className="flex justify-center py-20">
            <div className="w-6 h-6 border-2 border-amber/30 border-t-amber rounded-full animate-spin" />
          </div>
        )}

        {!loading && activePrompts.length === 0 && (
          <div className="text-center py-20">
            <BookOpen size={40} weight="regular" className="text-muted/30 mx-auto mb-4" />
            <p className="text-muted text-sm">No prompts in this category yet. Check back soon.</p>
          </div>
        )}

        {!loading && activePrompts.length > 0 && (
          <div className="grid md:grid-cols-2 gap-5">
            {activePrompts.map((prompt) => {
              const isCopied = copiedId === prompt.id;
              return (
                <div
                  key={prompt.id}
                  className="bg-white border border-[#E8E5E0] rounded-2xl p-6 flex flex-col shadow-[0_1px_3px_rgba(0,0,0,0.02),0_1px_2px_rgba(0,0,0,0.03)] hover:shadow-[0_4px_12px_rgba(0,0,0,0.06),0_2px_4px_rgba(0,0,0,0.04)] hover:border-[#B8916A]/25 transition-all group"
                >
                  {/* Header: title + category badge */}
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <h3 className="text-base font-semibold text-[#1A1A1A] group-hover:text-[#B8916A] transition-colors leading-snug">
                      {prompt.title}
                    </h3>
                    <span className="shrink-0 text-[10px] font-medium text-[#B8916A] bg-amber/[0.08] px-2 py-0.5 rounded-md whitespace-nowrap">
                      {activeData?.name}
                    </span>
                  </div>

                  <p className="text-sm text-muted leading-relaxed mb-5">
                    {prompt.description}
                  </p>

                  {/* Prompt preview */}
                  <div className="bg-[#FAFAF8] border border-[#F0EDE8] rounded-xl px-4 py-3.5 mb-5">
                    <p className="text-xs text-[#999] leading-relaxed italic">
                      &ldquo;{prompt.prompt_text}&rdquo;
                    </p>
                  </div>

                  {/* Actions — always visible, clean layout */}
                  <div className="mt-auto flex items-center gap-2.5 pt-1">
                    <button
                      onClick={() => handleCopy(prompt.id, prompt.prompt_text)}
                      className={`flex items-center gap-1.5 px-4 py-2.5 rounded-lg text-xs font-medium transition cursor-pointer ${
                        isCopied
                          ? "bg-green-50 text-green-700 border border-green-200"
                          : "bg-[#F5F3F0] border border-transparent text-[#737373] hover:text-[#1A1A1A] hover:bg-[#EDEAE5] hover:border-[#DDD9D3]"
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
                      className="flex items-center gap-1.5 px-4 py-2.5 rounded-lg text-xs font-medium bg-[#B8916A] text-white hover:bg-[#A07B56] transition ml-auto"
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

      {/* Bottom CTA */}
      <section className="pb-24 px-6">
        <div className="max-w-2xl mx-auto text-center">
          <div className="bg-[#F5F3F0] border border-[#E8E5E0] rounded-2xl px-8 py-10">
            <BookOpen size={28} weight="fill" className="text-[#B8916A] mx-auto mb-4" />
            <h2 className="text-xl font-bold text-[#1A1A1A] mb-2">Want more than a prompt?</h2>
            <p className="text-sm text-muted mb-6 leading-relaxed">
              These prompts are a starting point. ForgeHouse mentors use them inside 
              real coaching sessions — where prompts become conversations, and conversations 
              become results.
            </p>
            <Link
              href="/mentors"
              className="inline-flex items-center gap-2 bg-[#B8916A] text-white px-6 py-3 rounded-xl font-semibold text-sm hover:bg-[#A07B56] transition"
            >
              Browse mentors
              <ArrowRight size={16} weight="bold" />
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
