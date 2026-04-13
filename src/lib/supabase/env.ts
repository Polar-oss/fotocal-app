const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabasePublishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

export const hasSupabaseEnv = Boolean(
  supabaseUrl && supabasePublishableKey,
);

export function getSupabaseEnv() {
  if (!supabaseUrl || !supabasePublishableKey) {
    throw new Error(
      "Supabase nao configurado. Copie .env.example para .env.local e adicione as chaves do projeto.",
    );
  }

  return {
    supabaseUrl,
    supabasePublishableKey,
  };
}
