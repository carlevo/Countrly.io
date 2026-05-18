import { createClient } from "@supabase/supabase-js";
import { createGame } from "@/lib/gameStore";
import { NextResponse } from "next/server";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_ANON_KEY!
);

export async function POST() {
  // Los IDs van de 1 a 224 (SERIAL tras TRUNCATE RESTART IDENTITY)
  const randomId = Math.floor(Math.random() * 224) + 1;

  const { data, error } = await supabase
    .from("paises")
    .select("nombre")
    .eq("id", randomId)
    .single();

  if (error || !data) {
    return NextResponse.json({ error: "No se pudo obtener un país" }, { status: 500 });
  }

  const gameId = createGame(data.nombre);
  return NextResponse.json({ gameId, country: data.nombre });
}
