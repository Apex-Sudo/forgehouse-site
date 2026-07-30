/**
 * Four-point sparkle from the Forge House lockup.
 * Sits between the "F" and "H" in the monogram and before "House" in the wordmark.
 */
export default function Sparkle({
  className = "",
  size = 16,
  style,
}: {
  className?: string;
  size?: number | string;
  style?: React.CSSProperties;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      className={className}
      style={style}
    >
      <path
        d="M12 0c.9 8.1 3.9 11.1 12 12-8.1.9-11.1 3.9-12 12-.9-8.1-3.9-11.1-12-12C8.1 11.1 11.1 8.1 12 0Z"
        fill="currentColor"
      />
    </svg>
  );
}
