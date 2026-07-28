"use client";
import { BookOpen } from "@phosphor-icons/react";

interface Props {
  onClick: () => void;
}

export default function PromptLibraryButton({ onClick }: Props) {
  return (
    <button
      onClick={onClick}
      className="mono flex items-center gap-1.5 text-[11px] tracking-[0.06em] uppercase text-muted hover:text-accent border border-border hover:border-accent/60 px-3 py-1.5 rounded-md transition cursor-pointer"
    >
      <BookOpen size={13} weight="regular" />
      <span>Prompts</span>
    </button>
  );
}
