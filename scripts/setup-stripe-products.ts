import Stripe from "stripe";

const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;
if (!STRIPE_SECRET_KEY) {
  console.error("Set STRIPE_SECRET_KEY env var");
  process.exit(1);
}

const stripe = new Stripe(STRIPE_SECRET_KEY);

async function findOrCreateProduct(name: string, metadataKey: string): Promise<string> {
  // Search by metadata for idempotency
  const existing = await stripe.products.search({
    query: `metadata["fh_key"]:"${metadataKey}"`,
  });

  if (existing.data.length > 0) {
    console.log(`✓ Product "${name}" already exists: ${existing.data[0].id}`);
    return existing.data[0].id;
  }

  const product = await stripe.products.create({
    name,
    metadata: { fh_key: metadataKey },
  });
  console.log(`✓ Created product "${name}": ${product.id}`);
  return product.id;
}

async function findOrCreatePrice(productId: string, amountCents: number, metadataKey: string): Promise<string> {
  const existing = await stripe.prices.search({
    query: `metadata["fh_key"]:"${metadataKey}"`,
  });

  if (existing.data.length > 0) {
    console.log(`✓ Price $${amountCents / 100}/mo already exists: ${existing.data[0].id}`);
    return existing.data[0].id;
  }

  const price = await stripe.prices.create({
    product: productId,
    unit_amount: amountCents,
    currency: "usd",
    recurring: { interval: "month" },
    metadata: { fh_key: metadataKey },
  });
  console.log(`✓ Created price $${amountCents / 100}/mo: ${price.id}`);
  return price.id;
}

async function main() {
  console.log("\n🔧 Setting up ForgeHouse Stripe products...\n");

  const platformProductId = await findOrCreateProduct("ForgeHouse Platform", "fh_platform");
  const platformPriceId = await findOrCreatePrice(platformProductId, 4700, "fh_platform_47");

  const colinProductId = await findOrCreateProduct("Colin Chapman Mentorship", "fh_mentor_colin");
  const colinPriceId = await findOrCreatePrice(colinProductId, 15000, "fh_mentor_colin_150");

  console.log("\n📋 Add these to your .env.local:\n");
  console.log(`STRIPE_PLATFORM_PRICE_ID=${platformPriceId}`);
  console.log(`STRIPE_COLIN_PRICE_ID=${colinPriceId}`);
  console.log("\nDone!\n");
}

main().catch(console.error);
