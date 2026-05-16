export type SharePlan = "free" | "pro";

export const SHARE_FREE_LIMITS = {
  shortLinksPerDay: 5,
  cloudTemplatesMax: 3,
  guildTemplatesMax: 0,
  batchMaxTabs: 5
} as const;

export const SHARE_PRO_LIMITS = {
  shortLinksPerDay: 100,
  cloudTemplatesMax: 40,
  guildTemplatesMax: 20,
  batchMaxTabs: 12
} as const;

export function limitsForPlan(plan: SharePlan) {
  return plan === "pro" ? SHARE_PRO_LIMITS : SHARE_FREE_LIMITS;
}
