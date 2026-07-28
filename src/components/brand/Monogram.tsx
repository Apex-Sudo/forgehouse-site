import Sparkle from "./Sparkle";

/** "F ✦ H" monogram used in the footer. */
export default function Monogram({
  size = 30,
  className = "",
}: {
  size?: number;
  className?: string;
}) {
  return (
    <span
      className={`inline-flex items-center leading-none select-none ${className}`}
      style={{ fontSize: size }}
      aria-label="Forge House"
    >
      F
      <Sparkle size={size * 0.4} className="text-accent mx-[0.04em]" />H
    </span>
  );
}
