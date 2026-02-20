export async function GET() {
  const key = process.env.STRIPE_SECRET_KEY;
  const keyInfo = key ? `${key.substring(0, 12)}...${key.substring(key.length - 4)}` : "MISSING";

  // Try raw fetch to Stripe API
  try {
    const res = await fetch("https://api.stripe.com/v1/prices/price_1T2wKI6mX5Jyd7kwg0rwilfd", {
      headers: {
        Authorization: `Bearer ${key}`,
      },
    });
    const data = await res.json();
    return Response.json({
      keyInfo,
      stripeStatus: res.status,
      priceAmount: data.unit_amount,
      priceCurrency: data.currency,
    });
  } catch (err) {
    return Response.json({
      keyInfo,
      error: String(err),
    });
  }
}
