import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";
import { checkRateLimit, rateLimitKey } from "@/lib/rate-limit";
import { parseShareExportPackZod } from "@/lib/share-export-schema";
import { limitsForPlan } from "@/lib/share-premium";
import { getSharePlanForUser } from "@/lib/share-plan-server";

export async function GET() {
  const supabase = createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data, error } = await supabase
    .from("share_templates")
    .select("id, name, payload, created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(40);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ templates: data ?? [] });
}

export async function POST(req: Request) {
  const supabase = createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const rl = checkRateLimit(`tpl:${rateLimitKey(req, user.id)}`, 40, 60_000);
  if (!rl.allowed) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  const plan = await getSharePlanForUser(supabase, user.id);
  const limits = limitsForPlan(plan);
  const { count } = await supabase
    .from("share_templates")
    .select("id", { count: "exact", head: true })
    .eq("user_id", user.id);

  if ((count ?? 0) >= limits.cloudTemplatesMax) {
    return NextResponse.json({ error: "template_limit", plan }, { status: 403 });
  }

  const body = (await req.json()) as { name?: string; payload?: unknown };
  const name = body.name?.trim();
  if (!name || !body.payload) return NextResponse.json({ error: "name and payload required" }, { status: 400 });

  const payload = parseShareExportPackZod(body.payload);
  if (!payload) return NextResponse.json({ error: "invalid payload" }, { status: 400 });

  const { data, error } = await supabase
    .from("share_templates")
    .insert({ user_id: user.id, name, payload })
    .select("id, name, created_at")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ template: data });
}

export async function DELETE(req: Request) {
  const supabase = createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id")?.trim();
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

  const { error } = await supabase.from("share_templates").delete().eq("id", id).eq("user_id", user.id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
