import { supabase } from "@/lib/supabase";
import { PLATFORM_MONTHLY_PRICE_USD } from "@/lib/platform-pricing";

export interface MentorPricing {
  stripePriceId: string;
  monthlyPrice: number;
  mentorName: string;
}

export const PLATFORM_PRICE_ID = process.env.STRIPE_PLATFORM_PRICE_ID || "price_PLATFORM_PLACEHOLDER";
export const PLATFORM_MONTHLY_PRICE = PLATFORM_MONTHLY_PRICE_USD;

export async function getMentorPricing(slug: string): Promise<MentorPricing | null> {
  const { data } = await supabase
    .from("mentors")
    .select("name, stripe_price_id, monthly_price")
    .eq("slug", slug)
    .eq("is_active", true)
    .single();

  if (!data || !data.stripe_price_id) return null;

  return {
    stripePriceId: data.stripe_price_id,
    monthlyPrice: data.monthly_price,
    mentorName: data.name,
  };
}

export async function getTotalPrice(slug: string): Promise<number | null> {
  const mentor = await getMentorPricing(slug);
  if (!mentor) return null;
  return PLATFORM_MONTHLY_PRICE_USD + mentor.monthlyPrice / 100;
}
