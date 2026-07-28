import Link from "next/link";
import type { ReactNode } from "react";

type Variant = "paper" | "tan" | "accent" | "dark";

const VARIANTS: Record<Variant, string> = {
  paper: "bg-paper text-[#1B1B18] hover:bg-white",
  tan: "bg-tan text-[#1B1B18] hover:brightness-105",
  accent: "bg-accent text-[#1B1B18] hover:bg-accent-dim",
  dark: "bg-[#1B1B18] text-paper hover:bg-[#2A2A26]",
};

/**
 * The card CTA from the v2 design: notched top-left corner, mono label,
 * chevron pinned right.
 */
export default function ClipButton({
  href,
  onClick,
  children,
  variant = "paper",
  className = "",
  showChevron = true,
  type = "button",
}: {
  href?: string;
  onClick?: () => void;
  children: ReactNode;
  variant?: Variant;
  className?: string;
  showChevron?: boolean;
  type?: "button" | "submit";
}) {
  const classes = `clip-corner mono flex items-center justify-between gap-3 w-full px-5 py-3.5 text-[11px] leading-[1.4] tracking-[0.01em] transition cursor-pointer ${VARIANTS[variant]} ${className}`;

  const content = (
    <>
      <span>{children}</span>
      {showChevron && (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
          <path d="M9 6l6 6-6 6" />
        </svg>
      )}
    </>
  );

  if (href) {
    return (
      <Link href={href} className={classes}>
        {content}
      </Link>
    );
  }

  return (
    <button type={type} onClick={onClick} className={classes}>
      {content}
    </button>
  );
}
