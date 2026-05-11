import { GoogleGenerativeAI } from "@google/generative-ai";
import { getCountry } from "@/lib/gameStore";
import { NextRequest, NextResponse } from "next/server";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY!);

export async function POST(req: NextRequest) {
  const { gameId, question } = await req.json();

  if (!gameId || !question) {
    return NextResponse.json({ error: "Faltan parámetros" }, { status: 400 });
  }

  const country = getCountry(gameId);
  if (!country) {
    return NextResponse.json({ error: "Partida no encontrada o expirada" }, { status: 404 });
  }

  // El prompt incluye el país de forma invisible para el usuario
  const prompt = `El país es ${country}. La pregunta es: "${question}". Responde únicamente con "Sí" o "No", sin ninguna explicación adicional.`;

  const model = genAI.getGenerativeModel({
    model: process.env.GEMMA_MODEL || "gemma-3-27b-it",
    systemInstruction: "Eres un asistente de un juego de adivinar países. Solo respondes 'Sí' o 'No'.",
  });

  const result = await model.generateContent(prompt);
  const raw = result.response.text().trim();

  // Normaliza la respuesta a Sí o No
  const answer = raw.toLowerCase().startsWith("s") ? "Sí" : "No";

  return NextResponse.json({ answer });
}
