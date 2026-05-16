import { createClient } from "@supabase/supabase-js";
import { getPublicSupabaseConfig } from "@/lib/env-public";

export function supabaseAdmin() {
  const config = getPublicSupabaseConfig();
  const role = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  if (!config) {
    throw new Error(
      "Supabase public env missing. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY."
    );
  }
  if (!role) {
    throw new Error("SUPABASE_SERVICE_ROLE_KEY is not set (required for Stripe webhooks and admin ops).");
  }
  return createClient(config.url, role, {
    auth: { persistSession: false, autoRefreshToken: false }
  });
}
