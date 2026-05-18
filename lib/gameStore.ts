import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_ANON_KEY!
);

const TWO_HOURS_MS = 2 * 60 * 60 * 1000;

export async function createGame(country: string): Promise<string> {
  const gameId = crypto.randomUUID();
  await supabase.from("game_sessions").insert({ game_id: gameId, country });
  return gameId;
}

export async function getCountry(gameId: string): Promise<string | null> {
  const since = new Date(Date.now() - TWO_HOURS_MS).toISOString();
  const { data } = await supabase
    .from("game_sessions")
    .select("country")
    .eq("game_id", gameId)
    .gte("created_at", since)
    .single();
  return data?.country ?? null;
}

export async function endGame(gameId: string): Promise<string | null> {
  const country = await getCountry(gameId);
  if (country) await supabase.from("game_sessions").delete().eq("game_id", gameId);
  return country;
}
