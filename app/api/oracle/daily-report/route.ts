import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";
import { openai } from "@/lib/openai";
import type { Quest } from "@/lib/types";

type QuestSnippet = Pick<Quest, "title" | "difficulty" | "status" | "category"> & {
  created_at?: string;
  completed_at?: string | null;
};

export async function POST() {
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

  const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
  const [{ data: quests }, { data: profile }] = await Promise.all([
    supabase
      .from("quests")
      .select("title,difficulty,status,category,created_at,completed_at")
      .eq("user_id", user.id)
      .gte("created_at", since)
      .order("created_at", { ascending: true })
      .returns<QuestSnippet[]>(),
    supabase.from("profiles").select("username, character_class, xp, level").eq("id", user.id).single()
  ]);

  const list = quests ?? [];
  const completedByDay = list
    .filter((q) => q.status === "done")
    .reduce<Record<string, number>>((acc, q) => {
      const d = new Date(q.completed_at ?? q.created_at ?? Date.now()).toLocaleDateString("en-US", {
        weekday: "long"
      });
      acc[d] = (acc[d] ?? 0) + q.difficulty;
      return acc;
    }, {});
  const weakestDay =
    Object.entries(completedByDay).sort((a, b) => a[1] - b[1])[0]?.[0] ?? "Wednesday";

  let content = `## Daily Battle Report\n\nHey Kahraman! Last week your energy looked lowest around **${weakestDay}**. Today, avoid that trap: complete your hardest quest before noon.\n\n### Tactical Orders\n- Put your highest-XP quest first.\n- Use a 25-minute focus sprint.\n- End the day with a 3-line reflection.`;

  try {
    const client = openai();
    const completion = await client.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content:
            "Write a concise professional markdown battle report for a productivity RPG user. Include prediction, risk, and tactical plan. Turkish/English hybrid tone is okay."
        },
        { role: "user", content: JSON.stringify({ profile, quests: list, weakestDay }) }
      ]
    });
    content = completion.choices[0]?.message.content ?? content;
  } catch {
    /* keep template */
  }

  const { error } = await supabase.from("ai_insights").insert({
    user_id: user.id,
    insight_type: "daily_report",
    content
  });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ content });
}
