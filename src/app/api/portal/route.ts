import { auth } from "@/lib/auth";
import { getStripe } from "@/lib/stripe";
import { supabase } from "@/lib/supabase";

export async function POST() {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return Response.json({ error: "Not authenticated" }, { status: 401 });
    }

    const userId = (session.user as { id?: string }).id;
    if (!userId) {
      return Response.json({ error: "No user ID" }, { status: 400 });
    }

    const { data: user } = await supabase
      .from("users")
      .select("stripe_customer_id")
      .eq("id", userId)
      .single();

    if (!user?.stripe_customer_id) {
      return Response.json({ error: "No subscription found" }, { status: 400 });
    }

    const stripe = getStripe();
    const portalSession = await stripe.billingPortal.sessions.create({
      customer: user.stripe_customer_id,
      return_url: `${process.env.NEXTAUTH_URL || "https://forgehouse.io"}/pricing`,
    });

    return Response.json({ url: portalSession.url });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Portal failed";
    return Response.json({ error: msg }, { status: 500 });
  }
}
