import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";
import { stripe } from "@/lib/stripe";
import { appBaseUrl } from "@/lib/env-public";

export const dynamic = "force-dynamic";

export async function POST() {
  let supabase;
  try {
    supabase = createClient();
  } catch {
    return NextResponse.json({ error: "Supabase is not configured." }, { status: 500 });
  }

  const {
    data: { user }
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const price = process.env.NEXT_PUBLIC_STRIPE_PRICE_ID?.trim();
  if (!price) {
    return NextResponse.json({ error: "Missing NEXT_PUBLIC_STRIPE_PRICE_ID" }, { status: 500 });
  }

  let client;
  try {
    client = stripe();
  } catch {
    return NextResponse.json({ error: "Stripe is not configured." }, { status: 500 });
  }

  const origin = appBaseUrl();

  const session = await client.checkout.sessions.create({
    mode: "subscription",
    customer_email: user.email ?? undefined,
    line_items: [{ price, quantity: 1 }],
    success_url: `${origin}/dashboard?upgraded=true`,
    cancel_url: `${origin}/dashboard?upgrade=cancelled`,
    metadata: { user_id: user.id },
    client_reference_id: user.id,
    subscription_data: {
      metadata: { user_id: user.id }
    }
  });

  return NextResponse.json({ url: session.url });
}
