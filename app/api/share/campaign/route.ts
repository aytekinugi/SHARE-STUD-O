import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";

/** İsteğe bağlı: giriş yapmış kullanıcının görevini paylaşım formuna hazırlar (metin sunucuda üretilir, batch yine istemcide). */
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

  const { searchParams } = new URL(req.url);
  const questId = searchParams.get("questId")?.trim();

  const { data, error } = questId
    ? await supabase
        .from("quests")
        .select("id, title, category, difficulty, status")
        .eq("user_id", user.id)
        .eq("id", questId)
        .maybeSingle()
    : await supabase
        .from("quests")
        .select("id, title, category, difficulty, status")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(1);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const quest = Array.isArray(data) ? data[0] : data;
  if (!quest) return NextResponse.json({ error: "Quest not found" }, { status: 404 });

  const origin = new URL(req.url).origin;
  const categoryLabel = quest.category === "str" ? "STR" : quest.category === "int" ? "INT" : "CHA";

  return NextResponse.json({
    title: quest.title,
    text: `Vanguard quest · ${categoryLabel} · +${quest.difficulty} XP\n\n${quest.title}`,
    url: `${origin}/dashboard`,
    questId: quest.id
  });
}
