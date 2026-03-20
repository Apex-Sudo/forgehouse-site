export interface MentorPricing {
  stripePriceId: string;
  monthlyPrice: number;
  mentorName: string;
}

// Platform fee applied to all subscriptions
export const PLATFORM_PRICE_ID = process.env.STRIPE_PLATFORM_PRICE_ID || "price_PLATFORM_PLACEHOLDER";
export const PLATFORM_MONTHLY_PRICE = 47;

// Mentor-specific pricing — update stripePriceId after running setup script
export const mentorPricing: Record<string, MentorPricing> = {
  "colin-chapman": {
    stripePriceId: process.env.STRIPE_COLIN_PRICE_ID || "price_COLIN_PLACEHOLDER",
    monthlyPrice: 1,
    mentorName: "Colin Chapman",
  },
  "leon-freier": {
    stripePriceId: process.env.STRIPE_LEON_PRICE_ID || "price_LEON_PLACEHOLDER",
    monthlyPrice: 1,
    mentorName: "Leon Freier",
  },
};

export function getMentorPricing(slug: string): MentorPricing | null {
  return mentorPricing[slug] ?? null;
}

export function getTotalPrice(slug: string): number | null {
  const mentor = getMentorPricing(slug);
  if (!mentor) return null;
  return PLATFORM_MONTHLY_PRICE + mentor.monthlyPrice;
}
