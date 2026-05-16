import type { Quest } from "@/lib/types";

export const XP_PER_LEVEL = 500;

/** Converts lifetime XP into an RPG level. Leveling starts at 1 so new users feel progress immediately. */
export function levelFromXp(totalXp: number) { return Math.max(1, Math.floor(totalXp / XP_PER_LEVEL) + 1); }

/** Returns XP earned inside the current level band. */
export function xpIntoLevel(totalXp: number) { return totalXp % XP_PER_LEVEL; }

/** Returns a safe 0-100 percentage for progress bars and animated rings. */
export function progressPct(totalXp: number) { return Math.min(100, Math.round((xpIntoLevel(totalXp) / XP_PER_LEVEL) * 100)); }

/** Applies focus boost bonus when active and converts quest completion into XP + Vanguard Gold. */
export function rewardForQuest(quest: Pick<Quest, "difficulty">, focusBoostUntil?: string | null) {
  const boosted = !!focusBoostUntil && new Date(focusBoostUntil).getTime() > Date.now();
  const xp = Math.round(quest.difficulty * (boosted ? 1.2 : 1));
  return { xp, gold: Math.max(3, Math.round(xp / 10)), boosted };
}

/** Aggregates completed quest XP into the Hero Journey stats. */
export function statTotals(quests: Quest[]) {
  return quests.filter(q => q.status === "done").reduce((acc, q) => {
    acc[q.category] += q.difficulty;
    return acc;
  }, { str: 0, int: 0, cha: 0 });
}

/** Names the visual flame tier used by the streak UI. */
export function streakFlame(streak: number) {
  if (streak >= 30) return "legendary";
  if (streak >= 14) return "epic";
  if (streak >= 7) return "rare";
  return "ember";
}

/** Unlock thresholds for the Destiny Map. Kept deterministic so the UI remains instant. */
export function unlockedSkillCount(completedQuests: number) {
  return Math.min(12, Math.max(1, Math.floor(completedQuests / 2) + 1));
}
