import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";
import { limitsForPlan } from "@/lib/share-premium";
import { getSharePlanForUser } from "@/lib/share-plan-server";

export async function GET() {
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

  const plan = await getSharePlanForUser(supabase, user.id);
  const limits = limitsForPlan(plan);

  const dayStart = new Date();
  dayStart.setUTCHours(0, 0, 0, 0);

  const [{ count: shortToday }, { count: templateCount }] = await Promise.all([
    supabase
      .from("short_links")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id)
      .gte("created_at", dayStart.toISOString()),
    supabase.from("share_templates").select("id", { count: "exact", head: true }).eq("user_id", user.id)
  ]);

  return NextResponse.json({
    plan,
    limits,
    usage: {
      shortLinksToday: shortToday ?? 0,
      cloudTemplates: templateCount ?? 0
    }
  });
}
