import { createClient as createSupabaseJs, type SupabaseClient } from "@supabase/supabase-js";
import { createClient as createServerClient } from "@/lib/supabase-server";
import { getPublicSupabaseConfig } from "@/lib/env-public";

/**
 * API routes: cookie session (web) veya Authorization: Bearer <jwt> (PostPilot mobil).
 */
export function createApiSupabase(req: Request): SupabaseClient {
  const config = getPublicSupabaseConfig();
  if (!config) {
    throw new Error("Supabase is not configured");
  }

  const bearer = req.headers.get("authorization")?.replace(/^Bearer\s+/i, "").trim();
  if (bearer) {
    return createSupabaseJs(config.url, config.anonKey, {
      global: {
        headers: {
          Authorization: `Bearer ${bearer}`,
          apikey: config.anonKey
        }
      },
      auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false
      }
    });
  }

  return createServerClient() as unknown as SupabaseClient;
}

export async function getApiUser(supabase: SupabaseClient, req: Request) {
  const bearer = req.headers.get("authorization")?.replace(/^Bearer\s+/i, "").trim();
  if (bearer) {
    return supabase.auth.getUser(bearer);
  }
  return supabase.auth.getUser();
}
