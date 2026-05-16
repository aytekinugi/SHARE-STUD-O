"use client";

import type { SupabaseClient } from "@supabase/supabase-js";
import { createBrowserClient } from "@supabase/ssr";
import { getPublicSupabaseConfig } from "@/lib/env-public";

let cached: SupabaseClient | undefined;

/** Browser-only singleton; returns null until env is configured. */
export function getBrowserSupabase(): SupabaseClient | null {
  if (typeof window === "undefined") return null;
  const config = getPublicSupabaseConfig();
  if (!config) return null;
  if (!cached) cached = createBrowserClient(config.url, config.anonKey);
  return cached;
}

/** @deprecated Prefer getBrowserSupabase — avoids SSR prerender crashes when env is missing. */
export function createClient(): SupabaseClient {
  const c = getBrowserSupabase();
  if (!c) {
    throw new Error(
      "Supabase browser client unavailable. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY."
    );
  }
  return c;
}
