import { NextResponse } from "next/server";
import { hasSupabaseEnv } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";

function jsonError(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

function withGoalCookie(response: NextResponse, goal: number) {
  response.cookies.set("fotocal_goal_override", String(goal), {
    httpOnly: false,
    maxAge: 60 * 60 * 24 * 365,
    path: "/",
    sameSite: "lax",
  });

  return response;
}

function getGoalValue(rawGoal: unknown) {
  if (typeof rawGoal !== "number" || !Number.isFinite(rawGoal)) {
    return null;
  }

  const goal = Math.round(rawGoal);

  if (goal < 1200 || goal > 3200) {
    return null;
  }

  return goal;
}

export async function POST(request: Request) {
  const body = (await request.json()) as { goal?: number };
  const goal = getGoalValue(body.goal);

  if (!goal) {
    return jsonError("Escolha uma meta entre 1.200 e 3.200 kcal.");
  }

  if (!hasSupabaseEnv) {
    return withGoalCookie(
      NextResponse.json({
        data: { goal },
        message:
          "Meta salva neste dispositivo. A sincronizacao com a conta entra depois da configuracao completa.",
      }),
      goal,
    );
  }

  const supabase = await createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return withGoalCookie(
      NextResponse.json({
        data: { goal },
        message:
          "Meta salva neste dispositivo. Entre novamente quando quiser sincronizar com sua conta.",
      }),
      goal,
    );
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
      return withGoalCookie(
        NextResponse.json({
          data: { goal },
          message:
            "Meta salva neste dispositivo. A sincronizacao com a conta ainda nao ficou disponivel.",
        }),
        goal,
      );
    }
  }

  return withGoalCookie(
    NextResponse.json({
      data: { goal },
      message: "Meta salva com sucesso.",
    }),
    goal,
  );
}
