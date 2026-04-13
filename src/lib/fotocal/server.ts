import { createClient } from "@/lib/supabase/server";
import { hasSupabaseEnv } from "@/lib/supabase/env";
import { MEAL_IMAGE_BUCKET } from "@/lib/fotocal/constants";
import type { Friend, MealEntry, TrackerBootstrap } from "@/lib/fotocal/types";

type MealRow = {
  calories: number;
  created_at: string | null;
  eaten_at: string;
  id: string;
  image_path: string | null;
  logged_date: string;
  notes: string;
  shared_to_circle: boolean;
  title: string;
};

type FriendRow = {
  created_at: string | null;
  id: string;
  name: string;
};

type ServerSupabaseClient = Awaited<ReturnType<typeof createClient>>;

function formatTimeValue(value: string) {
  return value.slice(0, 5);
}

function formatDatabaseNotice(message: string) {
  if (
    message.includes('relation "public.meals" does not exist') ||
    message.includes('relation "public.friends" does not exist')
  ) {
    return "O Supabase ja esta conectado, mas o banco do FotoCal ainda nao foi preparado. Rode a migration em supabase/migrations para ativar refeicoes, amigos e fotos reais.";
  }

  return "O Supabase respondeu, mas a camada de dados do FotoCal ainda nao ficou pronta neste ambiente. O app continua funcionando em modo local ate concluirmos essa etapa.";
}

async function createSignedImageUrl(
  supabase: ServerSupabaseClient,
  imagePath: string | null,
) {
  if (!imagePath) {
    return "";
  }

  const { data, error } = await supabase.storage
    .from(MEAL_IMAGE_BUCKET)
    .createSignedUrl(imagePath, 60 * 60);

  if (error || !data?.signedUrl) {
    return "";
  }

  return data.signedUrl;
}

export async function serializeMealRow(
  supabase: ServerSupabaseClient,
  row: MealRow,
): Promise<MealEntry> {
  return {
    calories: row.calories,
    createdAt: row.created_at,
    eatenAt: formatTimeValue(row.eaten_at),
    id: row.id,
    imagePath: row.image_path,
    imageUrl: await createSignedImageUrl(supabase, row.image_path),
    loggedDate: row.logged_date,
    notes: row.notes,
    shared: row.shared_to_circle,
    title: row.title,
  };
}

export async function getTrackerBootstrap(
  userId: string | null,
): Promise<TrackerBootstrap> {
  if (!hasSupabaseEnv || !userId) {
    return {
      friends: [],
      meals: [],
      persistenceMode: "local",
    };
  }

  const supabase = await createClient();

  const [mealsResult, friendsResult] = await Promise.all([
    supabase
      .from("meals")
      .select(
        "id, title, calories, logged_date, eaten_at, notes, shared_to_circle, image_path, created_at",
      )
      .order("logged_date", { ascending: false })
      .order("eaten_at", { ascending: false }),
    supabase
      .from("friends")
      .select("id, name, created_at")
      .order("created_at", { ascending: false }),
  ]);

  if (mealsResult.error || friendsResult.error) {
    return {
      friends: [],
      meals: [],
      notice: formatDatabaseNotice(
        mealsResult.error?.message ?? friendsResult.error?.message ?? "",
      ),
      persistenceMode: "local",
    };
  }

  const meals = await Promise.all(
    (mealsResult.data ?? []).map((row) => serializeMealRow(supabase, row)),
  );

  const friends: Friend[] = (friendsResult.data ?? []).map((friend: FriendRow) => ({
    createdAt: friend.created_at,
    id: friend.id,
    name: friend.name,
  }));

  return {
    friends,
    meals,
    persistenceMode: "supabase",
  };
}
