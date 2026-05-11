import Groq from "groq-sdk";
import { getCountry } from "@/lib/gameStore";
import { NextRequest, NextResponse } from "next/server";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function POST(req: NextRequest) {
  const { gameId, question } = await req.json();

  if (!gameId || !question) {
    return NextResponse.json({ error: "Faltan parámetros" }, { status: 400 });
  }

  const country = getCountry(gameId);
  if (!country) {
    return NextResponse.json({ error: "Partida no encontrada o expirada" }, { status: 404 });
  }

  // El país es invisible para el usuario — solo lo ve el modelo
  const prompt = `El país es ${country}. La pregunta es: "${question}". Responde únicamente con "Sí" o "No", sin ninguna explicación adicional.`;

  const completion = await groq.chat.completions.create({
    model: process.env.GROQ_MODEL || "gemma2-9b-it",
    messages: [
      { role: "system", content: "Eres un asistente de un juego de adivinar países. Solo respondes 'Sí' o 'No'." },
      { role: "user", content: prompt },
    ],
    max_tokens: 5,
    temperature: 0,
  });

  const raw = completion.choices[0]?.message?.content?.trim() ?? "No";
  const answer = raw.toLowerCase().startsWith("s") ? "Sí" : "No";

  return NextResponse.json({ answer });
}
