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
      <div className="border border-border bg-surface p-6 flex flex-col items-center justify-center min-h-[280px] opacity-40">
        <div className="text-4xl mb-3">🔒</div>
        <p className="text-muted text-sm">{tagline}</p>
      </div>
    );
  }
  return (
    <Link href={href} className="group border border-border bg-surface hover:border-amber/40 transition-all duration-300 p-6 flex flex-col">
      <div className="text-4xl mb-4">{emoji}</div>
      <h3 className="text-lg font-bold mb-1 group-hover:text-amber transition">{name}</h3>
      <p className="text-muted text-sm mb-4 flex-1">{tagline}</p>
      <div className="flex flex-wrap gap-2 mb-4">
        {tags.map((tag) => (
          <span key={tag} className="text-xs px-2 py-1 border border-border text-muted">{tag}</span>
        ))}
      </div>
      <div className="flex items-center justify-between">
        <span className="text-amber text-sm font-semibold">{price}</span>
        <span className="text-xs text-muted group-hover:text-foreground transition">View →</span>
      </div>
    </Link>
  );
}
