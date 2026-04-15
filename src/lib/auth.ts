import type { User } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import { FREE_AI_ANALYSES_PER_DAY, getAiUsageSnapshot, type AiUsageSnapshot } from "@/lib/ai/limits";
import type { UserProfile } from "@/lib/profile";
import {
  normalizeObjective,
  parseHeightCm,
  parseWeightKg,
} from "@/lib/profile";
import { getUserSubscription } from "@/lib/subscriptions/server";
import type { AppSubscription } from "@/lib/subscriptions";
import { createClient } from "@/lib/supabase/server";
import { hasSupabaseEnv } from "@/lib/supabase/env";

type AuthContext = {
  aiUsage: AiUsageSnapshot;
  calorieGoal: number | null;
  displayName: string;
  isAuthenticated: boolean;
  isConfigured: boolean;
  profile: UserProfile;
  subscription: AppSubscription | null;
  user: User | null;
};

function getGoalFromMetadata(user: User | null) {
  const value = user?.user_metadata?.calorie_goal;

  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === "string") {
    const parsed = Number(value);

    if (Number.isFinite(parsed)) {
      return parsed;
    }
  }

  return null;
}

function getGoalFromCookie(rawValue?: string) {
  if (!rawValue) {
    return null;
  }

  const parsed = Number(rawValue);

  if (!Number.isFinite(parsed)) {
    return null;
  }

  return parsed;
}

function getObjectiveFromMetadata(user: User | null) {
  return normalizeObjective(user?.user_metadata?.objective);
}

function getObjectiveFromCookie(rawValue?: string) {
  return normalizeObjective(rawValue);
}

function getWeightFromMetadata(user: User | null) {
  return parseWeightKg(user?.user_metadata?.weight_kg);
}

function getHeightFromMetadata(user: User | null) {
  return parseHeightCm(user?.user_metadata?.height_cm);
}

function getWeightFromCookie(rawValue?: string) {
  return parseWeightKg(rawValue);
}

function getHeightFromCookie(rawValue?: string) {
  return parseHeightCm(rawValue);
}

function getDisplayName(user: User | null) {
  const rawName = user?.user_metadata?.full_name;

  if (typeof rawName === "string" && rawName.trim()) {
    return rawName.trim();
  }

  if (user?.email) {
    return user.email.split("@")[0];
  }

  return "voce";
}

async function getGoalFromProfile(
  userId: string,
  supabase: Awaited<ReturnType<typeof createClient>>,
) {
  const { data, error } = await supabase
    .from("profiles")
    .select("calorie_goal")
    .eq("user_id", userId)
    .maybeSingle();

  if (error) {
    return null;
  }

  return typeof data?.calorie_goal === "number" ? data.calorie_goal : null;
}

async function getProfileFromDatabase(
  userId: string,
  supabase: Awaited<ReturnType<typeof createClient>>,
) {
  const { data, error } = await supabase
    .from("profiles")
    .select("calorie_goal, objective, weight_kg, height_cm")
    .eq("user_id", userId)
    .maybeSingle();

  if (error) {
    const fallbackGoal = await getGoalFromProfile(userId, supabase);

    return {
      calorieGoal: fallbackGoal,
      profile: {
        heightCm: null,
        objective: null,
        weightKg: null,
      } satisfies UserProfile,
    };
  }

  return {
    calorieGoal:
      typeof data?.calorie_goal === "number" ? data.calorie_goal : null,
    profile: {
      heightCm: parseHeightCm(data?.height_cm),
      objective: normalizeObjective(data?.objective),
      weightKg: parseWeightKg(data?.weight_kg),
    } satisfies UserProfile,
  };
}

export async function getAuthContext(): Promise<AuthContext> {
  if (!hasSupabaseEnv) {
    return {
      aiUsage: {
        dailyLimit: FREE_AI_ANALYSES_PER_DAY,
        isPremium: false,
        reachedLimit: false,
        remainingToday: FREE_AI_ANALYSES_PER_DAY,
        usedToday: 0,
        usageDate: new Date().toISOString().slice(0, 10),
      },
      calorieGoal: null,
      displayName: "voce",
      isAuthenticated: false,
      isConfigured: false,
      profile: {
        heightCm: null,
        objective: null,
        weightKg: null,
      },
      subscription: null,
      user: null,
    };
  }

  const cookieStore = await cookies();
  const cookieGoal = getGoalFromCookie(
    cookieStore.get("fotocal_goal_override")?.value,
  );
  const cookieObjective = getObjectiveFromCookie(
    cookieStore.get("fotocal_objective")?.value,
  );
  const cookieWeightKg = getWeightFromCookie(
    cookieStore.get("fotocal_weight_kg")?.value,
  );
  const cookieHeightCm = getHeightFromCookie(
    cookieStore.get("fotocal_height_cm")?.value,
  );
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error) {
    return {
      aiUsage: {
        dailyLimit: FREE_AI_ANALYSES_PER_DAY,
        isPremium: false,
        reachedLimit: false,
        remainingToday: FREE_AI_ANALYSES_PER_DAY,
        usedToday: 0,
        usageDate: new Date().toISOString().slice(0, 10),
      },
      calorieGoal: null,
      displayName: "voce",
      isAuthenticated: false,
      isConfigured: true,
      profile: {
        heightCm: null,
        objective: null,
        weightKg: null,
      },
      subscription: null,
      user: null,
    };
  }

  const profileData = user
    ? await getProfileFromDatabase(user.id, supabase)
    : {
        calorieGoal: null,
        profile: {
          heightCm: null,
          objective: null,
          weightKg: null,
        } satisfies UserProfile,
      };
  const subscription = user ? await getUserSubscription(user.id) : null;
  const aiUsage = getAiUsageSnapshot({
    isPremium: Boolean(subscription?.isActive),
    user,
  });

  return {
    aiUsage,
    calorieGoal:
      cookieGoal ?? profileData.calorieGoal ?? getGoalFromMetadata(user),
    displayName: getDisplayName(user),
    isAuthenticated: Boolean(user),
    isConfigured: true,
    profile: {
      heightCm:
        cookieHeightCm ??
        profileData.profile.heightCm ??
        getHeightFromMetadata(user),
      objective:
        cookieObjective ??
        profileData.profile.objective ??
        getObjectiveFromMetadata(user),
      weightKg:
        cookieWeightKg ??
        profileData.profile.weightKg ??
        getWeightFromMetadata(user),
    },
    subscription,
    user,
  };
}
