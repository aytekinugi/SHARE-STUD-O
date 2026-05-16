"use client";

import { Dispatch, SetStateAction, useState } from "react";
import { motion } from "framer-motion";
import { Check, Plus, Swords } from "lucide-react";
import { toast } from "sonner";
import { LevelUpBurst } from "@/components/dashboard/level-up-burst";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { getBrowserSupabase } from "@/lib/supabase-browser";
import { levelFromXp, rewardForQuest } from "@/lib/gamification";
import type { Profile, Quest, StatCategory } from "@/lib/types";

export function QuestLog({
  quests,
  setQuests,
  profile,
  setProfile
}: {
  quests: Quest[];
  setQuests: Dispatch<SetStateAction<Quest[]>>;
  profile: Profile;
  setProfile: Dispatch<SetStateAction<Profile>>;
}) {
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<StatCategory>("int");
  const [levelBurst, setLevelBurst] = useState(false);

  async function addQuest() {
    const supabase = getBrowserSupabase();
    if (!supabase) {
      toast.error("Session client unavailable.", { description: "Check Supabase env vars." });
      return;
    }
    if (!title.trim()) return;
    const {
      data: { user }
    } = await supabase.auth.getUser();
    if (!user) return;
    const payload = { user_id: user.id, title, category, difficulty: 50, status: "todo" as const };
    const { data, error } = await supabase.from("quests").insert(payload).select("*").single();
    if (error) toast.error(error.message);
    else if (data) {
      setQuests((q) => [data as Quest, ...q]);
      setTitle("");
    }
  }

  async function completeQuest(quest: Quest) {
    const supabase = getBrowserSupabase();
    if (!supabase) {
      toast.error("Session client unavailable.");
      return;
    }
    if (quest.status === "done") return;
    const reward = rewardForQuest(quest, profile.focus_boost_until);
    const nextXp = profile.xp + reward.xp;
    const nextLevel = levelFromXp(nextXp);
    const nextProfile = { ...profile, xp: nextXp, gold: profile.gold + reward.gold, level: nextLevel };
    setQuests((qs) => qs.map((q) => (q.id === quest.id ? { ...q, status: "done" as const } : q)));
    setProfile(nextProfile);
    await Promise.all([
      supabase
        .from("quests")
        .update({ status: "done", completed_at: new Date().toISOString() })
        .eq("id", quest.id),
      supabase
        .from("profiles")
        .update({ xp: nextProfile.xp, gold: nextProfile.gold, level: nextProfile.level })
        .eq("id", profile.id),
      supabase.rpc("increment_guild_weekly_xp", { xp_delta: reward.xp }).then(() => null)
    ]);
    if (nextLevel > profile.level) {
      setLevelBurst(true);
      setTimeout(() => setLevelBurst(false), 1800);
    }
    if (navigator.vibrate) navigator.vibrate([18, 24, 18]);
  }

  return (
    <>
      <LevelUpBurst show={levelBurst} level={profile.level} />
      <Card className="rounded-[2rem] p-5">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.25em] text-gold">Quest Log</p>
            <h2 className="text-2xl font-black text-white">Today&apos;s campaign</h2>
          </div>
          <Swords className="h-6 w-6 text-gold" />
        </div>
        <div className="mb-4 grid gap-2 sm:grid-cols-[1fr_auto_auto]">
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Add a real-world quest..."
            onKeyDown={(e) => {
              if (e.key === "Enter") addQuest();
            }}
          />
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value as StatCategory)}
            aria-label="Quest category"
            className="h-12 rounded-2xl border border-gold/15 bg-black/50 px-4 text-white"
          >
            <option value="str">Strength</option>
            <option value="int">Intelligence</option>
            <option value="cha">Charisma</option>
          </select>
          <Button onClick={addQuest}>
            <Plus className="mr-2 h-4 w-4" /> Add
          </Button>
        </div>
        <div className="space-y-3">
          {quests.length === 0 && (
            <div className="rounded-2xl border border-dashed border-gold/20 p-6 text-center text-zinc-500">
              Ask The Sage for your first quest plan.
            </div>
          )}
          {quests.map((quest) => (
            <motion.button
              key={quest.id}
              layout
              type="button"
              whileTap={{ scale: 0.985 }}
              onClick={() => completeQuest(quest)}
              className="group w-full overflow-hidden rounded-2xl border border-white/10 bg-white/[.03] p-4 text-left transition hover:border-gold/30"
            >
              <div className="flex items-center gap-3">
                <span
                  className={`grid h-9 w-9 place-items-center rounded-xl border ${
                    quest.status === "done"
                      ? "border-emerald/40 bg-emerald/20 text-emerald"
                      : "border-gold/20 bg-gold/10 text-gold"
                  }`}
                >
                  {quest.status === "done" ? (
                    <Check className="h-5 w-5" />
                  ) : (
                    <Swords className="h-5 w-5" />
                  )}
                </span>
                <div className="min-w-0 flex-1">
                  <p
                    className={`font-bold ${quest.status === "done" ? "text-zinc-500 line-through" : "text-white"}`}
                  >
                    {quest.title}
                  </p>
                  <p className="text-xs uppercase tracking-[0.2em] text-zinc-600">
                    {quest.category} • +{quest.difficulty} XP
                  </p>
                </div>
              </div>
              <motion.div
                initial={false}
                animate={{ width: quest.status === "done" ? "100%" : "0%" }}
                className="mt-3 h-0.5 bg-gradient-to-r from-gold to-emerald"
              />
            </motion.button>
          ))}
        </div>
      </Card>
    </>
  );
}
