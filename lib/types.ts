export type StatCategory = "str" | "int" | "cha";
export type QuestStatus = "todo" | "done";
export type PlanType = "free" | "pro";

export type Profile = {
  id: string;
  username: string | null;
  avatar_url: string | null;
  level: number;
  xp: number;
  gold: number;
  bio: string | null;
  health_points: number;
  character_class?: string | null;
  onboarding_completed?: boolean | null;
  focus_boost_until?: string | null;
};

export type Quest = {
  id: string;
  user_id: string;
  title: string;
  difficulty: number;
  status: QuestStatus;
  category: StatCategory;
  created_at?: string;
  completed_at?: string | null;
};

export type AiInsightType = "quest_plan" | "oracle_prediction" | "daily_report";

export type AiInsight = {
  id: string;
  user_id: string;
  content: string;
  insight_type: AiInsightType;
  created_at: string;
};

export type Subscription = {
  user_id: string;
  plan_type: PlanType;
  expiry_date: string | null;
  stripe_customer_id?: string | null;
  stripe_subscription_id?: string | null;
};

export type Guild = {
  id: string;
  name: string;
  description: string | null;
  goal_category: StatCategory;
  owner_id: string;
  created_at?: string;
};

export type GuildMember = {
  guild_id: string;
  user_id: string;
  role: "owner" | "member";
  weekly_xp: number;
  joined_at?: string;
  profiles?: Pick<Profile, "username" | "avatar_url" | "level">;
};

export type GuildMessage = {
  id: string;
  guild_id: string;
  user_id: string;
  content: string;
  created_at: string;
  profiles?: Pick<Profile, "username" | "avatar_url">;
};

export type MarketplaceItem = {
  id: string;
  name: string;
  description: string;
  item_type: "skin" | "boost";
  price_gold: number;
  effect_json: Record<string, unknown> | null;
  rarity: "common" | "rare" | "legendary";
};

export type SkillNode = {
  id: string;
  user_id: string;
  category: StatCategory;
  node_key: string;
  title: string;
  unlocked: boolean;
  unlocked_at: string | null;
};
