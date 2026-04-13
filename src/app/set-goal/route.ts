import { NextResponse } from "next/server";
import { hasSupabaseEnv } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";

const GOAL_MIN = 1200;
const GOAL_MAX = 3200;

function getGoalValue(rawValue: FormDataEntryValue | null) {
  if (typeof rawValue !== "string") {
    return null;
  }

  const parsed = Number(rawValue);

  if (!Number.isFinite(parsed)) {
    return null;
  }

  const goal = Math.round(parsed);

  if (goal < GOAL_MIN || goal > GOAL_MAX) {
    return null;
  }

  return goal;
}

export async function POST(request: Request) {
  const formData = await request.formData();
  const goal = getGoalValue(formData.get("goal"));
  const requestUrl = new URL(request.url);

  if (!goal) {
    return NextResponse.redirect(new URL("/onboarding?error=goal", requestUrl), 303);
  }

  const response = NextResponse.redirect(
    new URL(`/app?goal=${goal}`, requestUrl),
    303,
  );

  response.cookies.set("fotocal_goal_override", String(goal), {
    httpOnly: false,
    maxAge: 60 * 60 * 24 * 365,
    path: "/",
    sameSite: "lax",
  });

  if (!hasSupabaseEnv) {
    return response;
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.redirect(new URL("/sign-in?next=/onboarding", requestUrl), 303);
  }

  const { error } = await supabase.from("profiles").upsert(
    {
      calorie_goal: goal,
      user_id: user.id,
    },
    {
      onConflict: "user_id",
    },
  );

  if (error) {
    try {
      await supabase.auth.updateUser({
        data: {
          calorie_goal: goal,
        },
      });
    } catch {
      return response;
    }
  }

  return response;
}
