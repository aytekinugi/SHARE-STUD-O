import Stripe from "stripe";

let cached: Stripe | undefined;

export function stripe(): Stripe {
  const key = process.env.STRIPE_SECRET_KEY?.trim();
  if (!key) {
    throw new Error("STRIPE_SECRET_KEY is not set.");
  }
  if (!cached) cached = new Stripe(key, { apiVersion: "2024-06-20" });
  return cached;
}
