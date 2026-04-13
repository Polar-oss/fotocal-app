import { NextResponse } from "next/server";
import { hasSupabaseEnv } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";

function jsonError(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

function formatInsertError(message: string) {
  if (message.includes('relation "public.friends" does not exist')) {
    return "A tabela de amigos ainda nao existe no Supabase. Rode a migration do FotoCal antes de usar o banco real.";
  }

  if (message.includes("friends_user_id_lower_idx")) {
    return "Esse amigo ja esta no seu circulo do FotoCal.";
  }

  return message;
}

export async function POST(request: Request) {
  if (!hasSupabaseEnv) {
    return jsonError(
      "Configure o Supabase no .env.local antes de ativar o circulo real de amigos.",
    );
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return jsonError("Sua sessao expirou. Entre novamente para continuar.", 401);
  }

  const body = (await request.json()) as { name?: string };
  const name = body.name?.trim() ?? "";

  if (!name) {
    return jsonError("Adicione um nome para criar seu circulo.");
  }

  const { data, error } = await supabase
    .from("friends")
    .insert({
      name,
      user_id: user.id,
    })
    .select("id, name, created_at")
    .single();

  if (error || !data) {
    return jsonError(formatInsertError(error?.message ?? "Nao foi possivel adicionar o amigo."));
  }

  return NextResponse.json(
    {
      data: {
        createdAt: data.created_at,
        id: data.id,
        name: data.name,
      },
      message: "Amigo adicionado ao seu circulo do FotoCal.",
    },
    { status: 201 },
  );
}
