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

  const prompt = `El país secreto es "${country}". La pregunta del jugador es: "${question}".`;

  const completion = await groq.chat.completions.create({
    model: process.env.GROQ_MODEL || "gemma2-9b-it",
    messages: [
      {
        role: "system",
        content: `Eres el juez de un juego de adivinar países.

REGLAS ESTRICTAS:
1. Si la pregunta hace referencia al NOMBRE del país (letras, longitud, cuántas letras tiene, si empieza o termina por alguna letra, si contiene tal letra, número de sílabas, o cualquier aspecto de la palabra en sí), responde exactamente: INVALIDA
2. Para cualquier otra pregunta sobre el país como lugar o entidad (geografía, cultura, historia, clima, población, continente, idioma, etc.), responde únicamente: Sí  o  No
3. Nunca añadas explicaciones.`,
      },
      { role: "user", content: prompt },
    ],
    max_tokens: 10,
    temperature: 0,
  });

  const raw = completion.choices[0]?.message?.content?.trim() ?? "No";
  const normalized = raw.toLowerCase();
  const answer = normalized.includes("invalid") ? "INVALIDA" : normalized.startsWith("s") ? "Sí" : "No";

  return NextResponse.json({ answer });
}
