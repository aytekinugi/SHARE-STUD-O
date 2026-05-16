"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import dynamic from "next/dynamic";
import { Brain, Crown, LogOut, Sparkles, Swords, Zap } from "lucide-react";
import { AvatarCard } from "@/components/dashboard/avatar-card";
import { QuestLog } from "@/components/dashboard/quest-log";
import { UpgradeModal } from "@/components/dashboard/upgrade-modal";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { signOut } from "@/lib/auth-actions";
import { statTotals } from "@/lib/gamification";
import type { AiInsight, Profile, Quest, Subscription } from "@/lib/types";

const AiSanctum = dynamic(() => import("@/components/ai/ai-sanctum").then((m) => m.AiSanctum), {
  ssr: false
});
const DestinyMap = dynamic(() => import("@/components/skill-tree/destiny-map").then((m) => m.DestinyMap), {
  ssr: false
});
const GuildPanel = dynamic(() => import("@/components/guilds/guild-panel").then((m) => m.GuildPanel), {
  ssr: false
});
const MarketplacePanel = dynamic(
  () => import("@/components/marketplace/marketplace-panel").then((m) => m.MarketplacePanel),
  { ssr: false }
);
const OraclePanel = dynamic(() => import("@/components/oracle/oracle-panel").then((m) => m.OraclePanel), {
  ssr: false
});

type Props = {
  initialData: {
    profile: Profile;
    quests: Quest[];
    subscription: Subscription | null;
    insights: AiInsight[];
    email?: string | null;
  };
};

export function DashboardShell({ initialData }: Props) {
  const [profile, setProfile] = useState(initialData.profile);
  const [quests, setQuests] = useState(initialData.quests);
  const [upgradeOpen, setUpgradeOpen] = useState(false);
  const stats = useMemo(() => statTotals(quests), [quests]);
  const doneToday = quests.filter((q) => q.status === "done").length;
  const isPro = initialData.subscription?.plan_type === "pro";
  const latestOracle = initialData.insights.find(
    (i) => i.insight_type === "daily_report" || i.insight_type === "oracle_prediction"
  )?.content;

  return (
    <main className="mx-auto min-h-screen max-w-7xl px-4 py-5 pb-24 sm:px-6 lg:px-8">
      <header className="sticky top-0 z-30 -mx-4 mb-5 border-b border-white/5 bg-obsidian/80 px-4 py-3 backdrop-blur-xl sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-2xl border border-gold/30 bg-gold/10">
              <Crown className="h-5 w-5 text-gold" />
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.28em] text-gold">Vanguard AI</p>
              <h1 className="font-black text-white">Command Center</h1>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="secondary" onClick={() => setUpgradeOpen(true)}>
              {isPro ? "Pro" : "Upgrade"}
            </Button>
            <form action={signOut}>
              <Button variant="ghost" size="icon" type="submit" aria-label="Sign out">
                <LogOut className="h-5 w-5" />
              </Button>
            </form>
          </div>
        </div>
      </header>

      <div className="grid gap-5 lg:grid-cols-[.9fr_1.1fr]">
        <div className="space-y-5">
          <AvatarCard profile={profile} stats={stats} streak={Math.max(1, doneToday)} />
          <DestinyMap quests={quests} />
          <MarketplacePanel profile={profile} setProfile={setProfile} />
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: "Quests", value: quests.length, icon: Swords },
              { label: "Done", value: doneToday, icon: Zap },
              { label: "AI", value: isPro ? "∞" : "3/day", icon: Brain }
            ].map(({ label, value, icon: Icon }) => (
              <Card key={label} className="rounded-3xl p-4 text-center">
                <Icon className="mx-auto mb-2 h-5 w-5 text-gold" />
                <p className="text-xs text-zinc-500">{label}</p>
                <p className="font-black text-white">{value}</p>
              </Card>
            ))}
          </div>
        </div>
        <div className="space-y-5">
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
            <AiSanctum
              isPro={isPro}
              onQuestsCreated={(newQuests) => setQuests((q) => [...newQuests, ...q])}
              onUpgrade={() => setUpgradeOpen(true)}
            />
          </motion.div>
          <OraclePanel initialInsight={latestOracle} />
          <GuildPanel />
          <QuestLog
            quests={quests}
            setQuests={setQuests}
            profile={profile}
            setProfile={setProfile}
          />
        </div>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-gold/10 bg-black/80 px-4 py-3 backdrop-blur-xl md:hidden">
        <div className="mx-auto flex max-w-md justify-around text-xs text-zinc-400">
          <span className="text-gold">
            <Sparkles className="mx-auto h-5 w-5" />
            Avatar
          </span>
          <span>
            <Swords className="mx-auto h-5 w-5" />
            Quests
          </span>
          <span>
            <Brain className="mx-auto h-5 w-5" />
            Sage
          </span>
        </div>
      </div>
      <UpgradeModal open={upgradeOpen} setOpen={setUpgradeOpen} />
    </main>
  );
}
