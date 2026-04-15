import type { User } from "@supabase/supabase-js";

export const FREE_AI_ANALYSES_PER_DAY = 3;

export type AiUsageSnapshot = {
  dailyLimit: number | null;
  isPremium: boolean;
  reachedLimit: boolean;
  remainingToday: number | null;
  usedToday: number;
  usageDate: string;
};

const USAGE_COUNT_KEY = "ai_analysis_usage_count";
const USAGE_DATE_KEY = "ai_analysis_usage_date";

export function getTodayUsageDate() {
  return new Date().toISOString().slice(0, 10);
}

function getCountFromMetadata(user: User | null, usageDate: string) {
  const rawDate = user?.user_metadata?.[USAGE_DATE_KEY];
  const rawCount = user?.user_metadata?.[USAGE_COUNT_KEY];

  if (rawDate !== usageDate) {
    return 0;
  }

  if (typeof rawCount === "number" && Number.isFinite(rawCount)) {
    return Math.max(0, Math.floor(rawCount));
  }

  if (typeof rawCount === "string") {
    const parsed = Number(rawCount);

    if (Number.isFinite(parsed)) {
      return Math.max(0, Math.floor(parsed));
    }
  }

  return 0;
}

export function getAiUsageSnapshot(input: {
  isPremium: boolean;
  user: User | null;
}) {
  const usageDate = getTodayUsageDate();
  const usedToday = getCountFromMetadata(input.user, usageDate);

  return {
    dailyLimit: input.isPremium ? null : FREE_AI_ANALYSES_PER_DAY,
    isPremium: input.isPremium,
    reachedLimit: input.isPremium ? false : usedToday >= FREE_AI_ANALYSES_PER_DAY,
    remainingToday: input.isPremium
      ? null
      : Math.max(0, FREE_AI_ANALYSES_PER_DAY - usedToday),
    usedToday,
    usageDate,
  } satisfies AiUsageSnapshot;
}
