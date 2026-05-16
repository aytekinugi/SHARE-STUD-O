// Supabase Edge Function: optional server-side payment verification mirror.
// Use the Next.js webhook for standard deployments; this is ready for Supabase-only payment verification.
import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@16.10.0?target=deno";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

serve(async (req) => {
  try {
    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY")!, { apiVersion: "2024-06-20" });
    const sig = req.headers.get("stripe-signature");
    if (!sig) return new Response("Missing signature", { status: 400 });
    const body = await req.text();
    const event = await stripe.webhooks.constructEventAsync(body, sig, Deno.env.get("STRIPE_WEBHOOK_SECRET")!);
    const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;
      const userId = session.metadata?.user_id;
      if (userId) await supabase.from("subscriptions").upsert({ user_id: userId, plan_type: "pro", expiry_date: null });
    }
    return Response.json({ received: true });
  } catch (error) {
    return Response.json({ error: String(error) }, { status: 400 });
  }
});
