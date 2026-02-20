import { getStripe } from "@/lib/stripe";
import { setSubscriptionActive, setSubscriptionInactive } from "@/lib/subscription";

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
      const customerId = typeof session.customer === "string" ? session.customer : session.customer?.id;
      if (email && customerId) {
        await setSubscriptionActive(email, customerId);
        // Notify Leon via Telegram
        await notifyTelegram(`💰 New FH subscriber: ${email}`);
      }
      break;
    }
    case "customer.subscription.deleted":
    case "customer.subscription.updated": {
      const subscription = event.data.object;
      const customerId = typeof subscription.customer === "string"
        ? subscription.customer
        : subscription.customer?.id;
      if (customerId) {
        const customer = await stripe.customers.retrieve(customerId);
        if (!customer.deleted && customer.email) {
          const isActive = subscription.status === "active" || subscription.status === "trialing";
          if (isActive) {
            await setSubscriptionActive(customer.email, customerId);
          } else {
            await setSubscriptionInactive(customer.email);
            await notifyTelegram(`⚠️ FH subscription ended: ${customer.email}`);
          }
        }
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
