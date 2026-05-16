"use client";
import { BookOpen } from "@phosphor-icons/react";

interface Props {
  onClick: () => void;
}

export default function PromptLibraryButton({ onClick }: Props) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-1.5 text-xs text-muted hover:text-foreground border border-foreground/[0.1] hover:border-foreground/[0.2] px-3 py-1.5 rounded-lg transition cursor-pointer"
    >
      <BookOpen size={13} weight="regular" />
      <span>Prompts</span>
    </button>
  );
}
