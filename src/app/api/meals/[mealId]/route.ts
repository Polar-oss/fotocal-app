import { NextResponse } from "next/server";
import { MEAL_IMAGE_BUCKET } from "@/lib/fotocal/constants";
import { hasSupabaseEnv } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";

function jsonError(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

export async function DELETE(
  _request: Request,
  context: { params: Promise<{ mealId: string }> },
) {
  if (!hasSupabaseEnv) {
    return jsonError("O Supabase ainda nao foi configurado neste ambiente.");
  }

  const { mealId } = await context.params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return jsonError("Sua sessao expirou. Entre novamente para continuar.", 401);
  }

  const { data: meal, error: fetchError } = await supabase
    .from("meals")
    .select("id, image_path")
    .eq("id", mealId)
    .single();

  if (fetchError || !meal) {
    return jsonError("Nao encontrei essa refeicao para remover.", 404);
  }

  const { error: deleteError } = await supabase.from("meals").delete().eq("id", mealId);

  if (deleteError) {
    return jsonError(deleteError.message);
  }

  if (meal.image_path) {
    await supabase.storage.from(MEAL_IMAGE_BUCKET).remove([meal.image_path]);
  }

  return NextResponse.json({ message: "Refeicao removida." });
}
