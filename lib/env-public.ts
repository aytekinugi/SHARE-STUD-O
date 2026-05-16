/**
 * Public env accessors safe for Edge, server, and client bundles.
 * Does not expose server-only secrets.
 */
export function getPublicSupabaseConfig(): { url: string; anonKey: string } | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();
  if (!url || !anonKey) return null;
  if (!/^https?:\/\//i.test(url)) return null;
  return { url, anonKey };
}

export function appBaseUrl(): string {
  const u = process.env.NEXT_PUBLIC_APP_URL?.trim();
  if (!u) return "http://localhost:3000";
  return u.replace(/\/$/, "");
}
