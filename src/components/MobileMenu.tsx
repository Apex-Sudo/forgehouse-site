"use client";
import { useState, useRef, useEffect, type ReactNode } from "react";
import { DotsThree, BookOpen } from "@phosphor-icons/react";

interface ScenarioConfig {
  id: string;
  title: string;
  description: string;
  icon: string;
  questions: string[];
  system_prompt_addition: string;
}

interface Props {
  children: ReactNode;
  onPromptClick: () => void;
  scenarios: ScenarioConfig[];
  onScenarioSelect: (sc: ScenarioConfig) => void;
}

export default function MobileMenu({ children, onPromptClick, scenarios, onScenarioSelect }: Props) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const close = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, [open]);

  return (
    <div ref={ref} className="relative">
      {children}

      {/* Mobile: 3-dot menu */}
      <div className="md:hidden absolute right-4 top-4 flex items-center">
        <button
          onClick={() => setOpen(!open)}
          className="flex items-center justify-center w-8 h-8 rounded-lg text-muted hover:text-foreground hover:bg-[#F5F3F0] transition cursor-pointer"
        >
          <DotsThree size={22} weight="bold" />
        </button>
      </div>

      {/* Mobile: dropdown menu */}
      {open && (
        <div className="md:hidden absolute right-4 top-12 mt-1 w-44 border border-[#E5E2DC] rounded-xl bg-white overflow-hidden shadow-lg z-50">
          <button
            onClick={() => { setOpen(false); onPromptClick(); }}
            className="flex items-center gap-2.5 w-full px-4 py-3 hover:bg-[#F5F3F0] transition text-left cursor-pointer"
          >
            <BookOpen size={15} weight="regular" className="text-muted" />
            <span className="text-sm font-medium text-[#1A1A1A]">Prompts</span>
          </button>
          {scenarios.length > 0 && (
            <div className="border-t border-[#F0EDE8]">
              <p className="px-4 pt-2.5 pb-1.5 text-[10px] text-muted uppercase tracking-wider">Scenarios</p>
              {scenarios.map((sc) => (
                <button
                  key={sc.id}
                  onClick={() => { setOpen(false); onScenarioSelect(sc); }}
                  className="flex items-start gap-2.5 w-full px-4 py-2.5 hover:bg-[#F5F3F0] transition text-left cursor-pointer"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-[#1A1A1A]">{sc.title}</p>
                    <p className="text-[11px] text-[#999] mt-0.5 leading-snug line-clamp-1">{sc.description}</p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
