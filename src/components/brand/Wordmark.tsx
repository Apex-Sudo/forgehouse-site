import Sparkle from "./Sparkle";

/**
 * Stacked "Forge / House" wordmark.
 * The second line is indented and led by the sparkle, matching the Figma lockup.
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
        <Sparkle
          size={size * 0.44}
          className={`inline-block align-baseline ${sparkleClassName}`}
        />
        <span style={{ marginLeft: size * 0.02 }}>House</span>
      </span>
    </span>
  );
}
