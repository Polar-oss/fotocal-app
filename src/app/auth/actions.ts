"use server";

import { cookies, headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { ActionState } from "@/app/auth/action-state";
import { createClient } from "@/lib/supabase/server";
import { hasSupabaseEnv } from "@/lib/supabase/env";
import { normalizeAppPath } from "@/lib/routing";
import { getAppUrl } from "@/lib/site";

function errorState(message: string): ActionState {
  return {
    message,
    status: "error",
  };
}

function successState(message: string): ActionState {
  return {
    message,
    status: "success",
  };
}

function getField(formData: FormData, field: string) {
  const value = formData.get(field);

  return typeof value === "string" ? value.trim() : "";
}

function getNextPath(formData: FormData, fallback: string) {
  return normalizeAppPath(getField(formData, "next"), fallback);
}

function getGoalValue(formData: FormData) {
  const rawGoal = getField(formData, "goal");
  const goal = Number(rawGoal);

  if (!Number.isFinite(goal) || goal < 1200 || goal > 3200) {
    return null;
  }

  return Math.round(goal);
}

export async function signUpAction(
  _previousState: ActionState,
  formData: FormData,
) {
  if (!hasSupabaseEnv) {
    return errorState(
      "As chaves do Supabase ainda nao foram adicionadas. Copie .env.example para .env.local antes de ativar o cadastro real.",
    );
  }

  const fullName = getField(formData, "fullName");
  const email = getField(formData, "email");
  const password = getField(formData, "password");
  const nextPath = getNextPath(formData, "/onboarding");

  if (!fullName || !email || !password) {
    return errorState("Preencha nome, email e senha para continuar.");
  }

  if (password.length < 6) {
    return errorState("Use uma senha com pelo menos 6 caracteres.");
  }

  const supabase = await createClient();
  const origin = (await headers()).get("origin") ?? getAppUrl();
  const emailRedirectTo = new URL("/auth/confirm", origin);
  emailRedirectTo.searchParams.set("next", nextPath);

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
      },
      emailRedirectTo: emailRedirectTo.toString(),
    },
  });

  if (error) {
    return errorState(error.message);
  }

  revalidatePath("/", "layout");

  if (data.session) {
    redirect(nextPath);
  }

  return successState(
    "Conta criada. Se a confirmacao de email estiver ativa no Supabase, verifique sua caixa de entrada para concluir o acesso.",
  );
}

export async function signInAction(
  _previousState: ActionState,
  formData: FormData,
) {
  if (!hasSupabaseEnv) {
    return errorState(
      "As chaves do Supabase ainda nao foram adicionadas. Copie .env.example para .env.local antes de ativar o login real.",
    );
  }

  const email = getField(formData, "email");
  const password = getField(formData, "password");
  const nextPath = getNextPath(formData, "/app");

  if (!email || !password) {
    return errorState("Informe email e senha para entrar.");
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return errorState(error.message);
  }

  revalidatePath("/", "layout");
  redirect(nextPath);
}

export async function saveGoalAction(
  _previousState: ActionState,
  formData: FormData,
) {
  if (!hasSupabaseEnv) {
    return errorState(
      "O Supabase ainda nao esta configurado. Assim que as chaves forem adicionadas, a meta fica salva por usuario.",
    );
  }

  const goal = getGoalValue(formData);

  if (!goal) {
    return errorState("Escolha uma meta entre 1.200 e 3.200 kcal.");
  }

  const cookieStore = await cookies();
  cookieStore.set("fotocal_goal_override", String(goal), {
    httpOnly: false,
    maxAge: 60 * 60 * 24 * 365,
    path: "/",
    sameSite: "lax",
  });

  const supabase = await createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return errorState("Sua sessao expirou. Entre novamente para salvar a meta.");
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
      // Se o banco ou o metadata falharem, o cookie ainda garante a experiencia.
    }
  }

  revalidatePath("/", "layout");
  revalidatePath("/app");
  revalidatePath("/onboarding");
  redirect(`/app?goal=${goal}`);
}

export async function signOutAction() {
  if (hasSupabaseEnv) {
    const supabase = await createClient();
    await supabase.auth.signOut();
  }

  revalidatePath("/", "layout");
  redirect("/");
}
