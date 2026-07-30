import StarH from "./StarH";

/**
 * Stacked "Forge / House" wordmark.
 *
 * The sparkle sits *inside* the H of "House", in place of the crossbar — it is
 * part of the letterform, not a bullet to the left of the word.
 */
export default function Wordmark({
  size = 22,
  className = "",
  sparkleClassName = "text-accent",
}: {
  /** Font size of the wordmark in px. Everything else scales from it. */
  size?: number;
  className?: string;
  sparkleClassName?: string;
}) {
  return (
    <span
      className={`inline-block select-none leading-[0.86] tracking-[-0.01em] ${className}`}
      style={{ fontSize: size }}
    >
      <span className="block">Forge</span>
      <span className="block" style={{ paddingLeft: size * 0.18 }}>
        <StarH size={size} sparkleClassName={sparkleClassName} />
        ouse
      </span>
    </span>
  );
}
