import type { StatCategory } from "@/lib/types";

const BY_CATEGORY: Record<StatCategory, string[]> = {
  str: ["#VanguardAI", "#Discipline", "#StrengthQuest", "#LevelUp"],
  int: ["#VanguardAI", "#DeepWork", "#IntelligenceQuest", "#Focus"],
  cha: ["#VanguardAI", "#Community", "#CharismaQuest", "#Guild"]
};

export function suggestHashtagsForQuest(category: StatCategory, difficulty?: number): string {
  const tags = [...BY_CATEGORY[category]];
  if (difficulty && difficulty >= 100) tags.push("#EpicQuest");
  return tags.join(" ");
}
