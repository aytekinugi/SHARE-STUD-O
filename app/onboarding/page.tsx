import { redirect } from "next/navigation";
import { CharacterOnboarding } from "@/components/onboarding/character-onboarding";
import { createClient } from "@/lib/supabase-server";

export const dynamic = "force-dynamic";

export default async function OnboardingPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const { data: profile } = await supabase.from("profiles").select("onboarding_completed, username").eq("id", user.id).single();
  if (profile?.onboarding_completed) redirect("/dashboard");
  return <CharacterOnboarding username={profile?.username ?? user.email?.split('@')[0] ?? 'Hero'} />;
}
