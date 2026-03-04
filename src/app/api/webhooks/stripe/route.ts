import { getStripe } from "@/lib/stripe";
import { supabase } from "@/lib/supabase";
import { captureServerEvent } from "@/lib/posthog";

export async function POST(req: Request) {
  const body = await req.text();
  const sig = req.headers.get("stripe-signature");

  if (!sig || !process.env.STRIPE_WEBHOOK_SECRET) {
    return new Response("Missing signature or webhook secret", { status: 400 });
  }

  const stripe = getStripe();
  let event;

  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Invalid signature";
    return new Response(`Webhook Error: ${msg}`, { status: 400 });
  }

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object;
      const email = session.customer_email || session.customer_details?.email;
      const customerId = typeof session.customer === "string" ? session.customer : null;
      const subscriptionId = typeof session.subscription === "string" ? session.subscription : null;
      const mentorSlug = session.metadata?.mentorSlug;
      const userId = session.metadata?.userId;

      if (email && userId) {
        // Update user record in Supabase
        const { data: user } = await supabase
          .from("users")
          .select("subscribed_mentor_slugs")
          .eq("id", userId)
          .single();

        const existingSlugs: string[] = user?.subscribed_mentor_slugs || [];
        const updatedSlugs = mentorSlug && !existingSlugs.includes(mentorSlug)
          ? [...existingSlugs, mentorSlug]
          : existingSlugs;

        await supabase
          .from("users")
          .update({
            subscribed: true,
            stripe_customer_id: customerId,
            stripe_subscription_id: subscriptionId,
            subscribed_mentor_slugs: updatedSlugs,
          })
          .eq("id", userId);

        // Move free tier conversations to permanent
        if (mentorSlug) {
          const { data: freeConvos } = await supabase
            .from("free_tier_conversations")
            .select("*")
            .eq("user_id", userId)
            .eq("mentor_slug", mentorSlug);

          if (freeConvos && freeConvos.length > 0) {
            for (const convo of freeConvos) {
              const { expires_at, ...rest } = convo; // eslint-disable-line @typescript-eslint/no-unused-vars
              await supabase.from("conversations").insert(rest);
            }
            await supabase
              .from("free_tier_conversations")
              .delete()
              .eq("user_id", userId)
              .eq("mentor_slug", mentorSlug);
          }
        }

        // Track subscription event
        if (email) {
          captureServerEvent(email, "subscription_completed", {
            mentor_slug: mentorSlug || "unknown",
            stripe_customer_id: customerId,
            stripe_subscription_id: subscriptionId,
          });
        }

        // Notify
        await notifyTelegram(`💰 New FH subscriber: ${email} (mentor: ${mentorSlug || "unknown"})`);
      }
      break;
    }

    case "customer.subscription.deleted": {
      const subscription = event.data.object;
      const customerId = typeof subscription.customer === "string" ? subscription.customer : null;
      if (customerId) {
        const customer = await stripe.customers.retrieve(customerId);
        if (!customer.deleted && customer.email) {
          await supabase
            .from("users")
            .update({ subscribed: false })
            .eq("stripe_customer_id", customerId);

          await notifyTelegram(`⚠️ FH subscription ended: ${customer.email}`);
        }
      }
      break;
    }

    case "customer.subscription.updated": {
      const subscription = event.data.object;
      const customerId = typeof subscription.customer === "string" ? subscription.customer : null;
      if (customerId) {
        const isActive = subscription.status === "active" || subscription.status === "trialing";
        await supabase
          .from("users")
          .update({ subscribed: isActive })
          .eq("stripe_customer_id", customerId);
      }
      break;
    }
  }

  return new Response("ok", { status: 200 });
}

async function notifyTelegram(text: string) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  if (!token || !chatId) return;
  try {
    await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: chatId, text }),
    });
  } catch { /* silent */ }
}
