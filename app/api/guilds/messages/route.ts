import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase-server";

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

  const body = z
    .object({ guildId: z.string().uuid(), content: z.string().min(1).max(1000) })
    .safeParse(raw);
  if (!body.success) return NextResponse.json({ error: "Invalid message." }, { status: 400 });

  const { error } = await supabase.from("guild_messages").insert({
    guild_id: body.data.guildId,
    user_id: user.id,
    content: body.data.content
  });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
