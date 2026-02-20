import { getStripe, PRICE_ID } from "@/lib/stripe";

export async function POST(req: Request) {
  try {
    const { email } = (await req.json()) as { email?: string };
    const stripe = getStripe();

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [{ price: PRICE_ID, quantity: 1 }],
      ...(email ? { customer_email: email } : {}),
      success_url: `${process.env.NEXT_PUBLIC_URL || "https://forgehouse.io"}/chat/apex?subscribed=1`,
      cancel_url: `${process.env.NEXT_PUBLIC_URL || "https://forgehouse.io"}/chat/apex`,
      metadata: { source: "forgehouse" },
    });

    return Response.json({ url: session.url });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Checkout failed";
    return Response.json({ error: msg }, { status: 500 });
  }
}
