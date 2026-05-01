import { auth } from "@/lib/auth";
import { getStripe } from "@/lib/stripe";
import { getMentorPricing } from "@/lib/mentor-pricing";
import { isSubscribedToMentor } from "@/lib/subscription";

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

    // Check if user is already subscribed to this mentor
    const userId = (session.user as { id?: string }).id;
    if (userId) {
      const alreadySubscribed = await isSubscribedToMentor(userId, mentorSlug);
      if (alreadySubscribed) {
        return Response.json({ error: "Already subscribed to this mentor" }, { status: 400 });
      }
    }

    const stripe = getStripe();

    const checkoutSession = await stripe.checkout.sessions.create({
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [
        { price: mentor.stripePriceId, quantity: 1 },
      ],
      customer_email: session.user.email,
      success_url: `${process.env.NEXTAUTH_URL || "https://forgehouse.io"}/chat/${mentorSlug}?subscribed=true`,
      cancel_url: `${process.env.NEXTAUTH_URL || "https://forgehouse.io"}/mentors`,
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
