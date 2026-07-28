import Link from "next/link";

interface AgentCardProps {
  name: string;
  emoji: string;
  tagline: string;
  tags: string[];
  price: string;
  href: string;
  placeholder?: boolean;
}

export default function AgentCard({ name, emoji, tagline, tags, price, href, placeholder }: AgentCardProps) {
  if (placeholder) {
    return (
      <div className="bg-surface border border-border rounded-lg p-7 flex flex-col items-center justify-center text-center min-h-[280px]">
        <svg
          width="26"
          height="26"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.25"
          className="text-faint mb-4"
          aria-hidden="true"
        >
          <rect x="4" y="10" width="16" height="10" rx="1.5" />
          <path d="M8 10V7a4 4 0 0 1 8 0v3" />
        </svg>
        <p className="mono text-[11px] tracking-[0.06em] uppercase text-faint">{tagline}</p>
      </div>
    );
  }

  return (
    <Link
      href={href}
      className="group bg-surface border border-border rounded-lg p-7 flex flex-col hover:border-border-light transition-colors duration-300"
    >
      <div className="text-[32px] leading-none mb-5" aria-hidden="true">
        {emoji}
      </div>

      <h3 className="text-[26px] uppercase leading-none tracking-[0.01em] text-paper">{name}</h3>
      <p className="text-[19px] italic text-accent mt-1">{tagline}</p>

      <div className="flex flex-wrap gap-2 mt-5 mb-6">
        {tags.map((tag) => (
          <span
            key={tag}
            className="mono text-[11px] tracking-[0.04em] text-muted border border-border rounded-md px-2.5 py-1"
          >
            {tag}
          </span>
        ))}
      </div>

      <p className="mono text-[15px] tracking-[0.02em] text-accent mb-5">{price}</p>

      <div className="mt-auto">
        <div className="clip-corner mono flex items-center justify-between gap-3 w-full px-5 py-3.5 text-[12px] tracking-[0.02em] bg-paper text-[#1B1B18] transition group-hover:bg-white">
          <span>View</span>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
            <path d="M9 6l6 6-6 6" />
          </svg>
        </div>
      </div>
    </Link>
  );
}
