import type { SupabaseClient } from "@supabase/supabase-js";
import type { SharePlan } from "@/lib/share-premium";

export async function getSharePlanForUser(supabase: SupabaseClient, userId: string): Promise<SharePlan> {
  const { data } = await supabase.from("subscriptions").select("plan_type, expiry_date").eq("user_id", userId).maybeSingle();
  if (!data) return "free";
  if (data.plan_type === "pro") {
    if (!data.expiry_date) return "pro";
    if (new Date(data.expiry_date) > new Date()) return "pro";
  }
  return "free";
}
