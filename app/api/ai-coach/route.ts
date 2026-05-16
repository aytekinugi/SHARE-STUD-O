import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase-server";
import { openai } from "@/lib/openai";
import type { StatCategory } from "@/lib/types";

const Body = z.object({ goal: z.string().min(3).max(1200) });

const QuestPlan = z.object({
  summary: z.string(),
  quests: z
    .array(
      z.object({
        title: z.string(),
        difficulty: z.number().min(10).max(200),
        category: z.enum(["str", "int", "cha"])
      })
    )
    .min(3)
    .max(7)
});

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

  let parsedBody: z.infer<typeof Body>;
  try {
    parsedBody = Body.parse(await req.json());
  } catch {
    return NextResponse.json({ error: "Invalid goal" }, { status: 400 });
  }

  const { data: sub } = await supabase.from("subscriptions").select("plan_type").eq("user_id", user.id).single();
  const isPro = sub?.plan_type === "pro";

  if (!isPro) {
    const since = new Date();
    since.setHours(0, 0, 0, 0);
    const { count } = await supabase
      .from("ai_insights")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id)
      .gte("created_at", since.toISOString());
    if ((count ?? 0) >= 3) {
      return NextResponse.json(
        {
          error: "Free tier includes 3 AI suggestions per day. Upgrade to unlock The Sage unlimited.",
          upgradeRequired: true
        },
        { status: 402 }
      );
    }
  }

  let plan: z.infer<typeof QuestPlan>;
  try {
    const client = openai();
    const completion = await client.chat.completions.create({
      model: "gpt-4o",
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content:
            "You are The Sage, a premium productivity RPG mentor. Return strict JSON: {summary:string, quests:[{title:string,difficulty:number,category:'str'|'int'|'cha'}]}. Quests must be concrete, completable in 5-45 minutes, motivational, and productive. Difficulty is XP reward: easy 25, medium 50-80, hard 100-150."
        },
        { role: "user", content: parsedBody.goal }
      ]
    });
    plan = QuestPlan.parse(JSON.parse(completion.choices[0]?.message.content ?? "{}"));
  } catch {
    plan = {
      summary:
        "I forged your ambition into a first campaign. Complete these today to build immediate momentum.",
      quests: [
        {
          title: `Define the victory condition for: ${parsedBody.goal.slice(0, 60)}`,
          difficulty: 35,
          category: "int"
        },
        { title: "Complete one focused 25-minute action toward the goal", difficulty: 60, category: "int" },
        { title: "Log what worked, what resisted you, and the next tiny step", difficulty: 35, category: "cha" }
      ]
    };
  }

  const rows = plan.quests.map((q) => ({
    user_id: user.id,
    title: q.title,
    difficulty: q.difficulty,
    category: q.category as StatCategory,
    status: "todo" as const
  }));

  const { data: quests, error: questErr } = await supabase.from("quests").insert(rows).select("*");
  if (questErr) return NextResponse.json({ error: questErr.message }, { status: 500 });

  const { error: insightErr } = await supabase.from("ai_insights").insert({
    user_id: user.id,
    insight_type: "quest_plan",
    content: `## Quest Plan\n\n${plan.summary}\n\n${plan.quests
      .map((q) => `- **${q.title}** (+${q.difficulty} XP, ${q.category})`)
      .join("\n")}`
  });
  if (insightErr) {
    return NextResponse.json(
      { error: insightErr.message, quests: quests ?? [] },
      { status: 500 }
    );
  }

  return NextResponse.json({ summary: plan.summary, quests });
}
