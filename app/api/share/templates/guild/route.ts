import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";
import { checkRateLimit, rateLimitKey } from "@/lib/rate-limit";
import { parseShareExportPackZod } from "@/lib/share-export-schema";
import { limitsForPlan } from "@/lib/share-premium";
import { getSharePlanForUser } from "@/lib/share-plan-server";

export async function GET(req: Request) {
  const supabase = createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const guildId = new URL(req.url).searchParams.get("guildId")?.trim();
  if (!guildId) return NextResponse.json({ error: "guildId required" }, { status: 400 });

  const { data: member } = await supabase
    .from("guild_members")
    .select("guild_id")
    .eq("guild_id", guildId)
    .eq("user_id", user.id)
    .maybeSingle();
  if (!member) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { data, error } = await supabase
    .from("guild_share_templates")
    .select("id, name, payload, user_id, created_at")
    .eq("guild_id", guildId)
    .order("created_at", { ascending: false })
    .limit(30);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ templates: data ?? [] });
}

export async function POST(req: Request) {
  const supabase = createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const rl = checkRateLimit(`guild-tpl:${rateLimitKey(req, user.id)}`, 20, 60_000);
  if (!rl.allowed) return NextResponse.json({ error: "Too many requests" }, { status: 429 });

  const body = (await req.json()) as { guildId?: string; name?: string; payload?: unknown };
  const guildId = body.guildId?.trim();
  const name = body.name?.trim();
  if (!guildId || !name || !body.payload) {
    return NextResponse.json({ error: "guildId, name and payload required" }, { status: 400 });
  }

  const plan = await getSharePlanForUser(supabase, user.id);
  const limits = limitsForPlan(plan);
  if (limits.guildTemplatesMax <= 0) {
    return NextResponse.json({ error: "guild_templates_pro_only", plan }, { status: 403 });
  }

  const { data: member } = await supabase
    .from("guild_members")
    .select("guild_id")
    .eq("guild_id", guildId)
    .eq("user_id", user.id)
    .maybeSingle();
  if (!member) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { count } = await supabase
    .from("guild_share_templates")
    .select("id", { count: "exact", head: true })
    .eq("guild_id", guildId);

  if ((count ?? 0) >= limits.guildTemplatesMax) {
    return NextResponse.json({ error: "guild_template_limit" }, { status: 403 });
  }

  const payload = parseShareExportPackZod(body.payload);
  if (!payload) return NextResponse.json({ error: "invalid payload" }, { status: 400 });

  const { data, error } = await supabase
    .from("guild_share_templates")
    .insert({ guild_id: guildId, user_id: user.id, name, payload })
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

  const id = new URL(req.url).searchParams.get("id")?.trim();
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

  const { error } = await supabase.from("guild_share_templates").delete().eq("id", id).eq("user_id", user.id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
