import { endGame } from "@/lib/gameStore";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { gameId } = await req.json();

  if (!gameId) {
    return NextResponse.json({ error: "Falta gameId" }, { status: 400 });
  }

  const country = await endGame(gameId);
  if (!country) {
    return NextResponse.json({ error: "Partida no encontrada" }, { status: 404 });
  }

  return NextResponse.json({ country });
}
