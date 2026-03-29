import { auth } from "@/lib/auth";
import { getStripe } from "@/lib/stripe";
import { getMentorPricing, PLATFORM_PRICE_ID } from "@/lib/mentor-pricing";

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return Response.json({ error: "Not authenticated" }, { status: 401 });
    }

    const { mentorSlug } = (await req.json()) as { mentorSlug?: string };
    if (!mentorSlug) {
      return Response.json({ error: "mentorSlug required" }, { status: 400 });
    }

    const mentor = await getMentorPricing(mentorSlug);
    if (!mentor) {
      return Response.json({ error: "Unknown mentor" }, { status: 400 });
    }

    const stripe = getStripe();
    const userId = (session.user as { id?: string }).id;

    const checkoutSession = await stripe.checkout.sessions.create({
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [
        { price: PLATFORM_PRICE_ID, quantity: 1 },
        { price: mentor.stripePriceId, quantity: 1 },
      ],
      customer_email: session.user.email,
      success_url: `${process.env.NEXTAUTH_URL || "https://forgehouse.io"}/chat/${mentorSlug}?subscribed=true`,
      cancel_url: `${process.env.NEXTAUTH_URL || "https://forgehouse.io"}/pricing`,
      subscription_data: {
        metadata: {
          userId: userId || "",
          mentorSlug,
        },
      },
      metadata: {
        userId: userId || "",
        mentorSlug,
      },
    });

    return Response.json({ url: checkoutSession.url });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Checkout failed";
    console.error("Checkout error:", msg);
    return Response.json({ error: msg }, { status: 500 });
  }
}
