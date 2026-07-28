/**
 * Presentation copy for expert cards.
 *
 * The `mentors` table stores name/tagline/avatar/price but has no field for the
 * short specialty line or the credential list the v2 design puts on every card,
 * so those live here keyed by slug. Anything not listed falls back to the
 * mentor's own tagline, so a newly added expert still renders correctly.
 */
export type ExpertProfile = {
  /** Short italic line under the name, e.g. "B2B Sales & GTM". */
  specialty: string;
  /** Uppercase mono credential lines shown on the card. */
  highlights: string[];
  /** First-person prompt seeded into the chat from the homepage card. */
  openingPrompt?: string;
};

export const EXPERT_PROFILES: Record<string, ExpertProfile> = {
  "colin-chapman": {
    specialty: "B2B Sales & GTM",
    highlights: [
      "25+ YEARS EXPERIENCE",
      "COLD OUTREACH",
      "DISCOVERY CALLS",
      "PIPELINE",
      "OBJECTION HANDLING",
      "FOUNDER-LED SALES",
    ],
    openingPrompt:
      "I need help fixing founder-led sales. Diagnose my outbound, qualification, and discovery process.",
  },
  "kyle-parratt": {
    specialty: "Production AI & Systems",
    highlights: [
      "9+ YEARS EXPERIENCE",
      "AI STRATEGY",
      "RAG & RETRIEVAL",
      "MVP SCOPING",
      "PRODUCTION ML",
      "AGENT SYSTEMS",
    ],
    openingPrompt:
      "Help me figure out if AI is actually the right move for this business, and what I should build first.",
  },
  "leon-freier": {
    specialty: "Luxury STR & Guest Experience",
    highlights: [
      "10+ YEARS EXPERIENCE",
      "GUEST EXPERIENCE",
      "PROPERTY EVALUATION",
      "REVENUE OPTIMIZATION",
    ],
    openingPrompt:
      "My short-term rental business is running, but guest experience and repeatability still feel inconsistent.",
  },
};

export function getExpertProfile(
  slug: string,
  fallbackTagline?: string | null
): ExpertProfile {
  return (
    EXPERT_PROFILES[slug] ?? {
      specialty: fallbackTagline?.trim() || "Trained Expert",
      highlights: [],
    }
  );
}

/** "Colin Chapman" → "Colin" */
export function firstName(name: string): string {
  return name.trim().split(/\s+/)[0] ?? name;
}

/**
 * `monthly_price` is stored in cents. Renders the design's
 * "150 USD PER MONTH" line, or a free label when unpriced.
 */
export function formatMonthlyPrice(cents: number | null | undefined): string {
  const dollars = Math.round((cents ?? 0) / 100);
  if (dollars <= 0) return "FREE TO START";
  return `${dollars} USD PER MONTH`;
}
