import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase-server";

export async function GET() {
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

  const { data: member } = await supabase
    .from("guild_members")
    .select("guild_id")
    .eq("user_id", user.id)
    .limit(1)
    .maybeSingle();
  if (!member) return NextResponse.json({ guild: null, leaderboard: [], messages: [] });

  const [{ data: guild }, { data: leaderboard }, { data: messages }] = await Promise.all([
    supabase.from("guilds").select("*").eq("id", member.guild_id).single(),
    supabase
      .from("guild_members")
      .select("*")
      .eq("guild_id", member.guild_id)
      .order("weekly_xp", { ascending: false })
      .limit(10),
    supabase
      .from("guild_messages")
      .select("*")
      .eq("guild_id", member.guild_id)
      .order("created_at", { ascending: false })
      .limit(20)
  ]);
  return NextResponse.json({
    guild,
    leaderboard,
    messages: (messages ?? []).reverse()
  });
}

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

  const body = z.object({ name: z.string().min(3).max(40) }).safeParse(raw);
  if (!body.success) {
    return NextResponse.json({ error: "Guild name must be 3-40 characters." }, { status: 400 });
  }

  const { data: existing } = await supabase
    .from("guild_members")
    .select("guild_id")
    .eq("user_id", user.id)
    .maybeSingle();
  if (existing) {
    return NextResponse.json({ error: "You are already in a guild." }, { status: 409 });
  }

  const { data: guild, error } = await supabase
    .from("guilds")
    .insert({
      name: body.data.name,
      owner_id: user.id,
      goal_category: "int",
      description: "A focused Vanguard guild."
    })
    .select("*")
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const { error: memberErr } = await supabase
    .from("guild_members")
    .insert({ guild_id: guild.id, user_id: user.id, role: "owner" });
  if (memberErr) {
    await supabase.from("guilds").delete().eq("id", guild.id);
    return NextResponse.json({ error: memberErr.message }, { status: 500 });
  }

  return NextResponse.json({ guild });
}
