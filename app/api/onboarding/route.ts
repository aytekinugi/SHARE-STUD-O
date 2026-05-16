import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase-server";
import { openai } from "@/lib/openai";

const Body = z.object({
  goals: z.string().min(2),
  focus: z.string().min(2),
  hobbies: z.string().min(2)
});

const Result = z.object({
  characterClass: z.string(),
  summary: z.string(),
  quests: z
    .array(
      z.object({
        title: z.string(),
        difficulty: z.number(),
        category: z.enum(["str", "int", "cha"])
      })
    )
    .min(4)
    .max(6)
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

  /* Idempotent replay: onboarding already persisted — avoids duplicate quests */
  const { data: resume } = await supabase
    .from("profiles")
    .select("onboarding_completed, character_class, bio")
    .eq("id", user.id)
    .maybeSingle();

  if (resume?.onboarding_completed) {
    const { data: questRows } = await supabase
      .from("quests")
      .select("title, difficulty, category")
      .eq("user_id", user.id)
      .order("created_at", { ascending: true })
      .limit(12);
    const quests = (questRows ?? []).map((q) => ({
      title: q.title,
      difficulty: q.difficulty,
      category: q.category as "str" | "int" | "cha"
    }));
    return NextResponse.json({
      characterClass: resume.character_class ?? "Hero",
      summary: resume.bio ?? "",
      quests,
      cached: true
    });
  }

  let bodyJson: unknown;
  try {
    bodyJson = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const body = Body.safeParse(bodyJson);
  if (!body.success) {
    return NextResponse.json({ error: "Please answer all three questions." }, { status: 400 });
  }

  let plan: z.infer<typeof Result>;
  try {
    const completion = await openai().chat.completions.create({
      model: "gpt-4o",
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content:
            "You are Vanguard AI's Oracle. Return strict JSON with characterClass, summary, quests. Character class should be memorable in Turkish/English hybrid like 'Kodlama Büyücüsü' or 'Entrepreneur Warrior'. Quests must be concrete starter actions, 15-45 minutes, difficulty 25-100, categories str/int/cha."
        },
        { role: "user", content: JSON.stringify(body.data) }
      ]
    });
    plan = Result.parse(JSON.parse(completion.choices[0]?.message.content ?? "{}"));
  } catch {
    plan = {
      characterClass: "Odak Şövalyesi",
      summary:
        "Net hedefleri küçük zaferlere bölen disiplin odaklı bir başlangıç sınıfı.",
      quests: [
        {
          title: "Bugünün ana hedefini tek cümleyle yaz",
          difficulty: 25,
          category: "int"
        },
        {
          title: "25 dakika telefon uzak modda derin çalışma yap",
          difficulty: 60,
          category: "int"
        },
        {
          title: "10 dakikalık fiziksel enerji reseti yap",
          difficulty: 35,
          category: "str"
        },
        {
          title: "Günün sonunda 3 satırlık refleksiyon yaz",
          difficulty: 30,
          category: "cha"
        }
      ]
    };
  }

  const questRows = plan.quests.map((q) => ({
    user_id: user.id,
    title: q.title,
    difficulty: q.difficulty,
    category: q.category,
    status: "todo" as const
  }));

  const skillRows = ["str", "int", "cha"].flatMap((cat) =>
    [1, 2, 3, 4].map((n) => ({
      user_id: user.id,
      category: cat as "str" | "int" | "cha",
      node_key: `${cat}-${n}`,
      title: `${cat.toUpperCase()} Mastery ${n}`,
      unlocked: n === 1,
      unlocked_at: n === 1 ? new Date().toISOString() : null
    }))
  );

  const [{ error: profileError }, { error: questError }] = await Promise.all([
    supabase
      .from("profiles")
      .update({
        character_class: plan.characterClass,
        bio: plan.summary,
        onboarding_completed: true
      })
      .eq("id", user.id),
    supabase.from("quests").insert(questRows)
  ]);

  if (profileError || questError) {
    return NextResponse.json(
      { error: profileError?.message ?? questError?.message ?? "Database error" },
      { status: 500 }
    );
  }

  const { error: skillError } = await supabase
    .from("skill_nodes")
    .upsert(skillRows, { onConflict: "user_id,node_key" });

  const { error: insightError } = await supabase.from("ai_insights").insert({
    user_id: user.id,
    insight_type: "quest_plan",
    content: `## Starter Class: ${plan.characterClass}\n\n${plan.summary}`
  });

  if (skillError || insightError) {
    return NextResponse.json(
      {
        error: skillError?.message ?? insightError?.message ?? "Partial save failed",
        partial: true
      },
      { status: 500 }
    );
  }

  return NextResponse.json(plan);
}
