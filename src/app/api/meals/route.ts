import { NextResponse } from "next/server";
import { MEAL_IMAGE_BUCKET, MEAL_IMAGE_MAX_BYTES } from "@/lib/fotocal/constants";
import { serializeMealRow } from "@/lib/fotocal/server";
import { hasSupabaseEnv } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";

function jsonError(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

function getField(formData: FormData, field: string) {
  const value = formData.get(field);
  return typeof value === "string" ? value.trim() : "";
}

function isUploadedFile(value: FormDataEntryValue | null): value is File {
  return typeof File !== "undefined" && value instanceof File && value.size > 0;
}

function getFileExtension(file: File) {
  const parts = file.name.split(".");
  const extension = parts.at(-1)?.toLowerCase();
  return extension && extension.length <= 8 ? extension : "jpg";
}

function isValidDate(value: string) {
  return /^\d{4}-\d{2}-\d{2}$/.test(value);
}

function isValidTime(value: string) {
  return /^\d{2}:\d{2}$/.test(value);
}

function formatInsertError(message: string) {
  if (message.includes('relation "public.meals" does not exist')) {
    return "A tabela de refeicoes ainda nao existe no Supabase. Rode a migration do FotoCal antes de usar o banco real.";
  }

  return message;
}

export async function POST(request: Request) {
  if (!hasSupabaseEnv) {
    return jsonError(
      "Configure o Supabase no .env.local antes de ativar o salvamento real de refeicoes.",
    );
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return jsonError("Sua sessao expirou. Entre novamente para continuar.", 401);
  }

  const formData = await request.formData();
  const title = getField(formData, "title");
  const notes = getField(formData, "notes");
  const loggedDate = getField(formData, "loggedDate");
  const eatenAt = getField(formData, "eatenAt");
  const calories = Number(getField(formData, "calories"));
  const sharedToCircle = getField(formData, "shared") === "true";
  const imageValue = formData.get("image");

  if (!title) {
    return jsonError("Diga o que voce comeu para registrar a refeicao.");
  }

  if (!Number.isFinite(calories) || calories <= 0) {
    return jsonError("Informe uma estimativa calorica valida para a refeicao.");
  }

  if (!isValidDate(loggedDate)) {
    return jsonError("A data da refeicao nao esta valida.");
  }

  if (!isValidTime(eatenAt)) {
    return jsonError("O horario da refeicao nao esta valido.");
  }

  let imagePath: string | null = null;

  if (isUploadedFile(imageValue)) {
    if (!imageValue.type.startsWith("image/")) {
      return jsonError("Envie uma imagem valida para a refeicao.");
    }

    if (imageValue.size > MEAL_IMAGE_MAX_BYTES) {
      return jsonError("Use uma foto de ate 5 MB por refeicao.");
    }

    imagePath = `${user.id}/${crypto.randomUUID()}.${getFileExtension(imageValue)}`;

    const { error: uploadError } = await supabase.storage
      .from(MEAL_IMAGE_BUCKET)
      .upload(imagePath, imageValue, {
        contentType: imageValue.type,
        upsert: false,
      });

    if (uploadError) {
      return jsonError(uploadError.message);
    }
  }

  const { data, error } = await supabase
    .from("meals")
    .insert({
      calories: Math.round(calories),
      eaten_at: `${eatenAt}:00`,
      image_path: imagePath,
      logged_date: loggedDate,
      notes,
      shared_to_circle: sharedToCircle,
      title,
      user_id: user.id,
    })
    .select(
      "id, title, calories, logged_date, eaten_at, notes, shared_to_circle, image_path, created_at",
    )
    .single();

  if (error || !data) {
    if (imagePath) {
      await supabase.storage.from(MEAL_IMAGE_BUCKET).remove([imagePath]);
    }

    return jsonError(formatInsertError(error?.message ?? "Nao foi possivel salvar a refeicao."));
  }

  const meal = await serializeMealRow(supabase, data);

  return NextResponse.json(
    {
      data: meal,
      message: sharedToCircle
        ? "Refeicao registrada e compartilhada no seu circulo."
        : "Refeicao registrada com sucesso.",
    },
    { status: 201 },
  );
}
