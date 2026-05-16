// Supabase Edge Function: secure scheduled Oracle reports.
// Deploy with: supabase functions deploy ai-oracle
import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import OpenAI from "https://deno.land/x/openai@v4.68.1/mod.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

serve(async (req) => {
  try {
    const auth = req.headers.get("authorization") ?? "";
    if (auth !== `Bearer ${Deno.env.get("EDGE_CRON_SECRET")}`) return new Response("Unauthorized", { status: 401 });
    const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    const openai = new OpenAI({ apiKey: Deno.env.get("OPENAI_API_KEY")! });
    const { data: profiles } = await supabase.from("profiles").select("id, username, character_class").eq("onboarding_completed", true).limit(100);
    for (const p of profiles ?? []) {
      const since = new Date(Date.now() - 7 * 864e5).toISOString();
      const { data: quests } = await supabase.from("quests").select("title,status,difficulty,category,completed_at,created_at").eq("user_id", p.id).gte("created_at", since);
      const completion = await openai.chat.completions.create({ model: "gpt-4o", messages: [{ role: "system", content: "Create a concise markdown daily productivity battle report." }, { role: "user", content: JSON.stringify({ profile: p, quests }) }] });
      await supabase.from("ai_insights").insert({ user_id: p.id, insight_type: "daily_report", content: completion.choices[0]?.message.content ?? "## Battle Report\nKeep your hardest quest before noon." });
    }
    return Response.json({ ok: true, processed: profiles?.length ?? 0 });
  } catch (error) {
    return Response.json({ error: String(error) }, { status: 500 });
  }
});
