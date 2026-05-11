"use client";

import { useState, useRef } from "react";

type QA = { question: string; answer: string };

export default function Home() {
  const [gameId, setGameId] = useState<string | null>(null);
  const [questions, setQuestions] = useState<QA[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [revealed, setRevealed] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  async function startGame() {
    setLoading(true);
    setQuestions([]);
    setRevealed(null);
    const res = await fetch("/api/start", { method: "POST" });
    const data = await res.json();
    setGameId(data.gameId);
    setLoading(false);
    setTimeout(() => inputRef.current?.focus(), 100);
  }

  async function askQuestion() {
    if (!input.trim() || !gameId || loading) return;
    const question = input.trim();
    setInput("");
    setLoading(true);

    const res = await fetch("/api/ask", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ gameId, question }),
    });
    const data = await res.json();
    setQuestions((prev) => [...prev, { question, answer: data.answer ?? "Error" }]);
    setLoading(false);
    setTimeout(() => inputRef.current?.focus(), 100);
  }

  async function reveal() {
    if (!gameId) return;
    const res = await fetch("/api/reveal", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ gameId }),
    });
    const data = await res.json();
    setRevealed(data.country);
    setGameId(null);
  }

  const playing = !!gameId && !revealed;

  return (
    <main className="flex flex-col items-center justify-start min-h-screen px-4 py-16 gap-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold tracking-tight">🌍 Countrly</h1>
        <p className="text-slate-400 mt-2 text-sm">Adivina el país secreto haciendo preguntas de Sí o No</p>
      </div>

      {!gameId && !revealed && (
        <button
          onClick={startGame}
          disabled={loading}
          className="bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-white font-semibold px-6 py-3 rounded-xl transition"
        >
          {loading ? "Cargando..." : "Empezar partida"}
        </button>
      )}

      {revealed && (
        <div className="text-center space-y-4">
          <p className="text-slate-400">El país secreto era:</p>
          <p className="text-3xl font-bold text-emerald-400">{revealed}</p>
          <button
            onClick={startGame}
            className="bg-emerald-500 hover:bg-emerald-400 text-white font-semibold px-6 py-3 rounded-xl transition"
          >
            Jugar de nuevo
          </button>
        </div>
      )}

      {playing && (
        <div className="w-full max-w-md space-y-6">
          <div className="flex gap-2">
            <input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && askQuestion()}
              placeholder="¿Es asiático? ¿Tiene costa? ..."
              disabled={loading}
              className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:opacity-50"
            />
            <button
              onClick={askQuestion}
              disabled={loading || !input.trim()}
              className="bg-emerald-500 hover:bg-emerald-400 disabled:opacity-40 text-white font-semibold px-4 py-3 rounded-xl transition"
            >
              {loading ? "..." : "→"}
            </button>
          </div>

          {questions.length > 0 && (
            <ul className="space-y-2">
              {[...questions].reverse().map((qa, i) => (
                <li key={i} className="flex justify-between items-center bg-slate-800 rounded-xl px-4 py-3">
                  <span className="text-slate-300">{qa.question}</span>
                  <span className={`font-bold text-lg ${qa.answer === "Sí" ? "text-emerald-400" : "text-red-400"}`}>
                    {qa.answer}
                  </span>
                </li>
              ))}
            </ul>
          )}

          <button
            onClick={reveal}
            className="w-full text-slate-500 hover:text-slate-300 text-sm transition underline"
          >
            Rendirse y ver el país
          </button>
        </div>
      )}
    </main>
  );
}
