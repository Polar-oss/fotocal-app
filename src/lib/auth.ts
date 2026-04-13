import type { User } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { hasSupabaseEnv } from "@/lib/supabase/env";

type AuthContext = {
  calorieGoal: number | null;
  displayName: string;
  isAuthenticated: boolean;
  isConfigured: boolean;
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

export async function getAuthContext(): Promise<AuthContext> {
  if (!hasSupabaseEnv) {
    return {
      calorieGoal: null,
      displayName: "voce",
      isAuthenticated: false,
      isConfigured: false,
      user: null,
    };
  }

  const cookieStore = await cookies();
  const cookieGoal = getGoalFromCookie(
    cookieStore.get("fotocal_goal_override")?.value,
  );
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error) {
    return {
      calorieGoal: null,
      displayName: "voce",
      isAuthenticated: false,
      isConfigured: true,
      user: null,
    };
  }

  const profileGoal = user
    ? await getGoalFromProfile(user.id, supabase)
    : null;

  return {
    calorieGoal: cookieGoal ?? profileGoal ?? getGoalFromMetadata(user),
    displayName: getDisplayName(user),
    isAuthenticated: Boolean(user),
    isConfigured: true,
    user,
  };
}
