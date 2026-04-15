import type { User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import {
  FREE_AI_ANALYSES_PER_DAY,
  getAiUsageSnapshot,
  type AiUsageSnapshot,
} from "@/lib/ai/limits";

const USAGE_COUNT_KEY = "ai_analysis_usage_count";
const USAGE_DATE_KEY = "ai_analysis_usage_date";

export async function incrementAiUsage(input: {
  isPremium: boolean;
  user: User;
}) {
  const current = getAiUsageSnapshot({
    isPremium: input.isPremium,
    user: input.user,
  });

  if (input.isPremium) {
    return current;
  }

  const nextCount = current.usedToday + 1;
  const usageDate = current.usageDate;
  const supabase = await createClient();

  try {
    await supabase.auth.updateUser({
      data: {
        ...(input.user.user_metadata ?? {}),
        [USAGE_COUNT_KEY]: nextCount,
        [USAGE_DATE_KEY]: usageDate,
      },
    });
  } catch {
    return {
      dailyLimit: FREE_AI_ANALYSES_PER_DAY,
      isPremium: false,
      reachedLimit: nextCount >= FREE_AI_ANALYSES_PER_DAY,
      remainingToday: Math.max(0, FREE_AI_ANALYSES_PER_DAY - nextCount),
      usedToday: nextCount,
      usageDate,
    } satisfies AiUsageSnapshot;
  }

  return {
    dailyLimit: FREE_AI_ANALYSES_PER_DAY,
    isPremium: false,
    reachedLimit: nextCount >= FREE_AI_ANALYSES_PER_DAY,
    remainingToday: Math.max(0, FREE_AI_ANALYSES_PER_DAY - nextCount),
    usedToday: nextCount,
    usageDate,
  } satisfies AiUsageSnapshot;
}
