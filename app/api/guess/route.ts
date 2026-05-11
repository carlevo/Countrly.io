import { getCountry, endGame } from "@/lib/gameStore";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { gameId, guess } = await req.json();

  if (!gameId || !guess) {
    return NextResponse.json({ error: "Faltan parámetros" }, { status: 400 });
  }

  const country = getCountry(gameId);
  if (!country) {
    return NextResponse.json({ error: "Partida no encontrada o expirada" }, { status: 404 });
  }

  const correct = guess.trim().toLowerCase() === country.toLowerCase();
  if (correct) endGame(gameId);

  return NextResponse.json({ correct, country: correct ? country : undefined });
}
