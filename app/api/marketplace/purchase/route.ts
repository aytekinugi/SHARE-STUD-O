import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase-server";

const Body = z.object({
  itemId: z.string(),
  fallbackType: z.enum(["skin", "boost"]).optional(),
  price: z.number().optional()
});

const EffectJson = z.object({ duration_hours: z.number().positive().max(72).optional() });

export async function POST(req: Request) {
  let supabase;
  try {
    supabase = createClient();
  } catch {
    return NextResponse.json({ error: "Server misconfigured." }, { status: 500 });
  }

  const {
    data: { user }
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let raw: unknown;
  try {
    raw = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const body = Body.safeParse(raw);
  if (!body.success) return NextResponse.json({ error: "Invalid item." }, { status: 400 });

  const [{ data: profile }, { data: dbItem }] = await Promise.all([
    supabase.from("profiles").select("gold, focus_boost_until").eq("id", user.id).single(),
    supabase.from("marketplace_items").select("*").eq("id", body.data.itemId).maybeSingle()
  ]);

  const item =
    dbItem ??
    ({
      id: body.data.itemId,
      price_gold: body.data.price ?? 999999,
      item_type: body.data.fallbackType ?? "skin",
      effect_json: { duration_hours: 2 }
    } as const);

  if (!dbItem && !body.data.fallbackType) {
    return NextResponse.json({ error: "Item not found." }, { status: 404 });
  }

  if (!profile || profile.gold < item.price_gold) {
    return NextResponse.json({ error: "Not enough Vanguard Gold." }, { status: 402 });
  }

  const nextGold = profile.gold - item.price_gold;
  let focus_boost_until = profile.focus_boost_until;
  if (item.item_type === "boost") {
    const parsedFx = EffectJson.safeParse(item.effect_json ?? {});
    const hours = parsedFx.success ? (parsedFx.data.duration_hours ?? 2) : 2;
    focus_boost_until = new Date(Date.now() + hours * 60 * 60 * 1000).toISOString();
  }

  const { error: updErr } = await supabase
    .from("profiles")
    .update({ gold: nextGold, focus_boost_until })
    .eq("id", user.id);
  if (updErr) return NextResponse.json({ error: updErr.message }, { status: 500 });

  if (dbItem) {
    const { error: invErr } = await supabase
      .from("inventory_items")
      .insert({ user_id: user.id, marketplace_item_id: dbItem.id });
    if (invErr) return NextResponse.json({ error: invErr.message }, { status: 500 });
  }

  return NextResponse.json({ gold: nextGold, focus_boost_until });
}
