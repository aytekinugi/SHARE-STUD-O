import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { checkRateLimit, rateLimitKey } from "@/lib/rate-limit";
import { limitsForPlan } from "@/lib/share-premium";
import { getSharePlanForUser } from "@/lib/share-plan-server";

function makeId(): string {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  const bytes = crypto.getRandomValues(new Uint8Array(8));
  return Array.from(bytes, (b) => chars[b % chars.length]).join("");
}

export async function GET(req: Request) {
  let supabase;
  try {
    supabase = createClient();
  } catch {
    return NextResponse.json({ error: "Supabase not configured" }, { status: 503 });
  }

  const {
    data: { user }
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data, error } = await supabase
    .from("short_links")
    .select("id, target_url, clicks, created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(50);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ links: data ?? [] });
}

/** Oturum açmış kullanıcı için kısa yönlendirme linki oluşturur. */
export async function POST(req: Request) {
  let supabase;
  try {
    supabase = createClient();
  } catch {
    return NextResponse.json({ error: "Supabase not configured" }, { status: 503 });
  }

  const {
    data: { user }
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const rl = checkRateLimit(`short:${rateLimitKey(req, user.id)}`, 30, 60_000);
  if (!rl.allowed) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429, headers: { "Retry-After": String(rl.retryAfterSec ?? 60) } });
  }

  const plan = await getSharePlanForUser(supabase, user.id);
  const limits = limitsForPlan(plan);
  const dayStart = new Date();
  dayStart.setUTCHours(0, 0, 0, 0);
  const { count } = await supabase
    .from("short_links")
    .select("id", { count: "exact", head: true })
    .eq("user_id", user.id)
    .gte("created_at", dayStart.toISOString());

  if ((count ?? 0) >= limits.shortLinksPerDay) {
    return NextResponse.json({ error: "short_link_limit", plan }, { status: 403 });
  }

  const body = (await req.json()) as { url?: string };
  const target = body.url?.trim();
  if (!target) return NextResponse.json({ error: "url required" }, { status: 400 });

  try {
    new URL(target);
  } catch {
    return NextResponse.json({ error: "invalid url" }, { status: 400 });
  }

  const id = makeId();
  const { error } = await supabaseAdmin().from("short_links").insert({
    id,
    target_url: target,
    user_id: user.id
  });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const origin = new URL(req.url).origin;
  return NextResponse.json({ id, shortUrl: `${origin}/s/${id}`, clicks: 0 });
}
