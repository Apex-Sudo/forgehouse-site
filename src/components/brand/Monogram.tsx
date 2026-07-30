import StarH from "./StarH";

/**
 * Footer monogram: the H with the sparkle inside it, on its own.
 * Per the Figma footer this is a single letterform, not an "F + H" pairing.
 */
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
      <StarH size={size} />
    </span>
  );
}
