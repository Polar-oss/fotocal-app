import { NextResponse } from "next/server";
import { hasSupabaseEnv } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";

function jsonError(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

export async function DELETE(
  _request: Request,
  context: { params: Promise<{ friendId: string }> },
) {
  if (!hasSupabaseEnv) {
    return jsonError("O Supabase ainda nao foi configurado neste ambiente.");
  }

  const { friendId } = await context.params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return jsonError("Sua sessao expirou. Entre novamente para continuar.", 401);
  }

  const { data: friend, error: fetchError } = await supabase
    .from("friends")
    .select("id")
    .eq("id", friendId)
    .single();

  if (fetchError || !friend) {
    return jsonError("Nao encontrei esse amigo para remover.", 404);
  }

  const { error: deleteError } = await supabase
    .from("friends")
    .delete()
    .eq("id", friendId);

  if (deleteError) {
    return jsonError(deleteError.message);
  }

  return NextResponse.json({ message: "Amigo removido do circulo." });
}
