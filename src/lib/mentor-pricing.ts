import { supabase } from "@/lib/supabase";

export interface MentorPricing {
  stripePriceId: string;
  monthlyPrice: number;
  mentorName: string;
}

export async function getMentorPricing(slug: string): Promise<MentorPricing | null> {
  const { data } = await supabase
    .from("mentors")
    .select("name, stripe_price_id, monthly_price")
    .eq("slug", slug)
    .eq("is_active", true)
    .single();

  if (!data) return null;

  return {
    stripePriceId: data.stripe_price_id || "",
    monthlyPrice: data.monthly_price ?? 0,
    mentorName: data.name,
  };
}
