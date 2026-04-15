import { NextResponse } from "next/server";
import {
  normalizeObjective,
  parseHeightCm,
  parseWeightKg,
} from "@/lib/profile";
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

function withProfileCookies(
  response: NextResponse,
  profile: {
    heightCm: number | null;
    objective: string | null;
    weightKg: number | null;
  },
) {
  response.cookies.set("fotocal_objective", profile.objective ?? "", {
    httpOnly: false,
    maxAge: profile.objective ? 60 * 60 * 24 * 365 : 0,
    path: "/",
    sameSite: "lax",
  });

  response.cookies.set("fotocal_weight_kg", profile.weightKg ? String(profile.weightKg) : "", {
    httpOnly: false,
    maxAge: typeof profile.weightKg === "number" ? 60 * 60 * 24 * 365 : 0,
    path: "/",
    sameSite: "lax",
  });

  response.cookies.set("fotocal_height_cm", profile.heightCm ? String(profile.heightCm) : "", {
    httpOnly: false,
    maxAge: typeof profile.heightCm === "number" ? 60 * 60 * 24 * 365 : 0,
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
  const body = (await request.json()) as {
    goal?: number;
    heightCm?: number | string | null;
    objective?: string | null;
    weightKg?: number | string | null;
  };
  const goal = getGoalValue(body.goal);
  const objective = normalizeObjective(body.objective);
  const weightKg = parseWeightKg(body.weightKg);
  const heightCm = parseHeightCm(body.heightCm);

  if (!goal) {
    return jsonError("Escolha uma meta entre 1.200 e 3.200 kcal.");
  }

  const responsePayload = {
    goal,
    profile: {
      heightCm,
      objective,
      weightKg,
    },
  };

  if (!hasSupabaseEnv) {
    return withProfileCookies(
      withGoalCookie(
      NextResponse.json({
          data: responsePayload,
        message:
          "Meta salva neste dispositivo. A sincronizacao com a conta entra depois da configuracao completa.",
      }),
      goal,
      ),
      responsePayload.profile,
    );
  }

  const supabase = await createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return withProfileCookies(
      withGoalCookie(
      NextResponse.json({
          data: responsePayload,
        message:
          "Meta salva neste dispositivo. Entre novamente quando quiser sincronizar com sua conta.",
      }),
      goal,
      ),
      responsePayload.profile,
    );
  }

  let { error } = await supabase.from("profiles").upsert(
    {
      calorie_goal: goal,
      height_cm: heightCm,
      objective,
      user_id: user.id,
      weight_kg: weightKg,
    },
    {
      onConflict: "user_id",
    },
  );

  if (error) {
    const { error: fallbackError } = await supabase.from("profiles").upsert(
      {
        calorie_goal: goal,
        user_id: user.id,
      },
      {
        onConflict: "user_id",
      },
    );

    error = fallbackError ?? null;
  }

  if (error) {
    try {
      await supabase.auth.updateUser({
        data: {
          calorie_goal: goal,
          height_cm: heightCm,
          objective,
          weight_kg: weightKg,
        },
      });
    } catch {
      return withProfileCookies(
        withGoalCookie(
        NextResponse.json({
            data: responsePayload,
          message:
            "Meta salva neste dispositivo. A sincronizacao com a conta ainda nao ficou disponivel.",
        }),
        goal,
        ),
        responsePayload.profile,
      );
    }
  }

  try {
    await supabase.auth.updateUser({
      data: {
        calorie_goal: goal,
        height_cm: heightCm,
        objective,
        weight_kg: weightKg,
      },
    });
  } catch {
    // O banco ou os cookies ja seguram a experiencia mesmo se o metadata falhar.
  }

  return withProfileCookies(
    withGoalCookie(
    NextResponse.json({
        data: responsePayload,
        message: "Perfil salvo com sucesso.",
    }),
    goal,
    ),
    responsePayload.profile,
  );
}
