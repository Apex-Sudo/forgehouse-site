import Sparkle from "./Sparkle";

/**
 * The "H" of the Forge House lockup, with the sparkle sitting inside it in
 * place of the crossbar.
 *
 * This is the core brand letterform: it is the whole footer monogram on its
 * own, and the leading glyph of "House" in the stacked wordmark.
 */
export default function StarH({
  size,
  sparkleClassName = "text-accent",
}: {
  /** Font size in px; the sparkle scales from it. */
  size: number;
  sparkleClassName?: string;
}) {
  return (
    <span className="relative inline-block">
      H
      <Sparkle
        size={size * 0.42}
        className={`absolute left-1/2 ${sparkleClassName}`}
        /* 47% rather than 50%: the line box is taller than the cap, so the
           crossbar sits just above the box's vertical centre. */
        style={{ top: "47%", transform: "translate(-50%, -50%)" }}
      />
    </span>
  );
}
