import Stripe from "stripe";

let _stripe: Stripe | null = null;

export function getStripe() {
  if (!_stripe) {
    _stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
      apiVersion: "2026-01-28.clover",
    });
  }
  return _stripe;
}

export const PRICE_ID = process.env.STRIPE_PRICE_ID || "price_1T2wKI6mX5Jyd7kwg0rwilfd";
