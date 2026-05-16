import { redirect } from "next/navigation";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { createClient } from "@/lib/supabase-server";
import type { AiInsight, Profile, Quest, Subscription } from "@/lib/types";

export const dynamic = "force-dynamic";

async function ensureProfile() {
  const supabase = createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  let { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single<Profile>();
  if (!profile) {
    const username = user.user_metadata?.name ?? user.email?.split("@")[0] ?? "Vanguard";
    const { data, error } = await supabase
      .from("profiles")
      .insert({
        id: user.id,
        username,
        avatar_url: user.user_metadata?.avatar_url ?? null
      })
      .select("*")
      .single<Profile>();
    if (error || !data) redirect("/login?reason=profile");
    profile = data;
    await supabase.from("subscriptions").upsert({ user_id: user.id, plan_type: "free" });
  }

  if (profile && !profile.onboarding_completed) redirect("/onboarding");

  const [{ data: quests }, { data: subscription }, { data: insights }] = await Promise.all([
    supabase
      .from("quests")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .returns<Quest[]>(),
    supabase.from("subscriptions").select("*").eq("user_id", user.id).single<Subscription>(),
    supabase
      .from("ai_insights")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(5)
      .returns<AiInsight[]>()
  ]);

  return {
    profile,
    quests: quests ?? [],
    subscription,
    insights: insights ?? [],
    email: user.email
  };
}

export default async function DashboardPage() {
  const data = await ensureProfile();
  return <DashboardShell initialData={data} />;
}
