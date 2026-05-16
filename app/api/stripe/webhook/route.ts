import { headers } from "next/headers";
import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { parseStripeWebhookSecret } from "@/lib/stripe-webhook-env";
import { stripe } from "@/lib/stripe";
import { supabaseAdmin } from "@/lib/supabase-admin";

export const dynamic = "force-dynamic";

function stripeId(ref: string | { id: string } | null | undefined): string | null {
  if (!ref) return null;
  if (typeof ref === "string") return ref;
  return ref.id ?? null;
}

async function userIdForCustomer(customerId: string): Promise<string | null> {
  const { data } = await supabaseAdmin()
    .from("subscriptions")
    .select("user_id")
    .eq("stripe_customer_id", customerId)
    .maybeSingle();
  return data?.user_id ?? null;
}

export async function POST(req: Request) {
  const parsedSecret = parseStripeWebhookSecret(process.env.STRIPE_WEBHOOK_SECRET);
  if (!parsedSecret.success) {
    return NextResponse.json(
      {
        error: "Invalid or missing STRIPE_WEBHOOK_SECRET",
        hint: parsedSecret.error.issues.map((i) => i.message).join(" ")
      },
      { status: 500 }
    );
  }
  const secret = parsedSecret.data;
  const body = await req.text();
  const signature = headers().get("stripe-signature");
  if (!signature) return NextResponse.json({ error: "Missing stripe signature" }, { status: 400 });

  let event: Stripe.Event;
  try {
    event = stripe().webhooks.constructEvent(body, signature, secret);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Verification failed";
    return NextResponse.json({ error: `Webhook signature failed: ${message}` }, { status: 400 });
  }

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      const userId = session.metadata?.user_id;
      const customerId = stripeId(session.customer);
      const subscriptionId = stripeId(session.subscription);

      if (userId && customerId && session.mode === "subscription") {
        const admin = supabaseAdmin();
        const { error } = await admin.from("subscriptions").upsert(
          {
            user_id: userId,
            plan_type: "pro",
            expiry_date: null,
            stripe_customer_id: customerId,
            stripe_subscription_id: subscriptionId
          },
          { onConflict: "user_id" }
        );
        if (error) {
          console.error("[stripe webhook] checkout.session.completed persist failed:", error.message);
          return NextResponse.json({ error: "Database update failed" }, { status: 500 });
        }
      }
      break;
    }

    case "customer.subscription.updated": {
      const sub = event.data.object as Stripe.Subscription;
      const customerId = stripeId(sub.customer);
      if (!customerId) break;
      const userId = await userIdForCustomer(customerId);
      if (!userId) break;

      const admin = supabaseAdmin();
      if (sub.status === "active") {
        await admin
          .from("subscriptions")
          .update({
            plan_type: "pro",
            expiry_date: null,
            stripe_subscription_id: sub.id
          })
          .eq("user_id", userId);
      } else if (
        sub.status === "canceled" ||
        sub.status === "unpaid" ||
        sub.status === "incomplete_expired"
      ) {
        await admin
          .from("subscriptions")
          .update({
            plan_type: "free",
            expiry_date: new Date().toISOString(),
            stripe_subscription_id: null
          })
          .eq("user_id", userId);
      }
      break;
    }

    case "customer.subscription.deleted": {
      const sub = event.data.object as Stripe.Subscription;
      const customerId = stripeId(sub.customer);
      if (!customerId) break;
      const userId = await userIdForCustomer(customerId);
      if (!userId) break;
      const { error } = await supabaseAdmin()
        .from("subscriptions")
        .update({
          plan_type: "free",
          expiry_date: new Date().toISOString(),
          stripe_subscription_id: null
        })
        .eq("user_id", userId);
      if (error) {
        console.error("[stripe webhook] subscription.deleted failed:", error.message);
      }
      break;
    }

    default:
      break;
  }

  return NextResponse.json({ received: true });
}
