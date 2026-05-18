"use client";

import { useState, useRef } from "react";

const MAX_QUESTIONS = 30;
const MAX_GUESSES = 10;

type QA = { question: string; answer: string };
type Guess = { guess: string; correct: boolean };

export default function Home() {
  const [gameId, setGameId] = useState<string | null>(null);
  const [questions, setQuestions] = useState<QA[]>([]);
  const [guesses, setGuesses] = useState<Guess[]>([]);
  const [questionInput, setQuestionInput] = useState("");
  const [guessInput, setGuessInput] = useState("");
  const [loadingQ, setLoadingQ] = useState(false);
  const [loadingG, setLoadingG] = useState(false);
  const [revealed, setRevealed] = useState<string | null>(null);
  const [invalidWarning, setInvalidWarning] = useState(false);
  const questionRef = useRef<HTMLInputElement>(null);
  const guessRef = useRef<HTMLInputElement>(null);

  const questionsLeft = MAX_QUESTIONS - questions.length;
  const guessesLeft = MAX_GUESSES - guesses.length;
  const gameOver = !!revealed;
  const won = guesses.some((g) => g.correct);

  async function startGame() {
    setLoadingQ(true);
    setQuestions([]);
    setGuesses([]);
    setRevealed(null);
    setInvalidWarning(false);
    const res = await fetch("/api/start", { method: "POST" });
    const data = await res.json();
    setGameId(data.gameId);
    setLoadingQ(false);
    setTimeout(() => questionRef.current?.focus(), 100);
  }

  async function askQuestion() {
    if (!questionInput.trim() || !gameId || loadingQ || questionsLeft <= 0) return;
    const question = questionInput.trim();
    setQuestionInput("");
    setLoadingQ(true);

    const res = await fetch("/api/ask", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ gameId, question }),
    });
    const data = await res.json();
    if (data.answer === "INVALIDA") {
      setInvalidWarning(true);
      setLoadingQ(false);
      setTimeout(() => questionRef.current?.focus(), 100);
      return;
    }
    setInvalidWarning(false);
    setQuestions((prev) => [...prev, { question, answer: data.answer ?? "Error" }]);
    setLoadingQ(false);
    setTimeout(() => questionRef.current?.focus(), 100);
  }

  async function submitGuess() {
    if (!guessInput.trim() || !gameId || loadingG || guessesLeft <= 0) return;
    const guess = guessInput.trim();
    setGuessInput("");
    setLoadingG(true);

    const res = await fetch("/api/guess", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ gameId, guess }),
    });
    const data = await res.json();
    const correct = data.correct as boolean;

    setGuesses((prev) => [...prev, { guess, correct }]);
    setLoadingG(false);

    if (correct) {
      setRevealed(data.country);
      setGameId(null);
    } else if (guessesLeft - 1 === 0) {
      // Sin intentos — revelar automáticamente
      const rev = await fetch("/api/reveal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ gameId }),
      });
      const revData = await rev.json();
      setRevealed(revData.country);
      setGameId(null);
    } else {
      setTimeout(() => guessRef.current?.focus(), 100);
    }
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

  const playing = !!gameId && !gameOver;

  if (!gameId && !gameOver) {
    return (
      <main className="flex flex-col items-center justify-center min-h-screen px-4 gap-10">
        <div className="text-center space-y-4">
          <h1 className="text-8xl font-bold tracking-tight">🌍 Countrly</h1>
          <p className="text-slate-400 text-lg">Adivina el país secreto haciendo preguntas de Sí o No</p>
        </div>
        <button
          onClick={startGame}
          disabled={loadingQ}
          className="bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-white font-semibold px-8 py-4 rounded-xl transition text-lg"
        >
          {loadingQ ? "Cargando..." : "Empezar partida"}
        </button>
      </main>
    );
  }

  return (
    <main className="flex flex-col items-center min-h-screen px-4 py-16 gap-8">
<div className="text-center">
        <h1 className="text-4xl font-bold tracking-tight">🌍 Countrly</h1>
        <p className="text-slate-400 mt-2 text-sm">Adivina el país secreto haciendo preguntas de Sí o No</p>
      </div>

      {gameOver && (
        <div className="text-center space-y-3">
          <p className="text-slate-400 text-sm">{won ? "¡Lo has adivinado!" : "El país secreto era:"}</p>
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
        <div className="w-full max-w-4xl flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-6 items-start">

            {/* INTENTOS — izquierda */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">Intentos</h2>
                <span className={`text-xs font-mono ${guessesLeft <= 3 ? "text-red-400" : "text-slate-500"}`}>
                  {guessesLeft}/{MAX_GUESSES}
                </span>
              </div>
              <div className="flex gap-2">
                <input
                  ref={guessRef}
                  value={guessInput}
                  onChange={(e) => setGuessInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && submitGuess()}
                  placeholder="Escribe el nombre del país..."
                  disabled={loadingG || guessesLeft <= 0}
                  className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-40"
                />
                <button
                  onClick={submitGuess}
                  disabled={loadingG || !guessInput.trim() || guessesLeft <= 0}
                  className="bg-blue-500 hover:bg-blue-400 disabled:opacity-40 text-white font-semibold px-4 py-3 rounded-xl transition"
                >
                  {loadingG ? "..." : "✓"}
                </button>
              </div>
              {guesses.length > 0 && (
                <ul className="space-y-2">
                  {[...guesses].reverse().map((g, i) => (
                    <li key={i} className="flex justify-between items-center bg-slate-800 rounded-xl px-4 py-2.5">
                      <span className="text-slate-300 text-sm">{g.guess}</span>
                      <span className={`font-bold ml-4 text-lg ${g.correct ? "text-emerald-400" : "text-red-400"}`}>
                        {g.correct ? "✓" : "✗"}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* PREGUNTAS — derecha */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">Preguntas</h2>
                <span className={`text-xs font-mono ${questionsLeft <= 5 ? "text-red-400" : "text-slate-500"}`}>
                  {questionsLeft}/{MAX_QUESTIONS}
                </span>
              </div>
              <div className="flex gap-2">
                <input
                  ref={questionRef}
                  value={questionInput}
                  onChange={(e) => { setQuestionInput(e.target.value); setInvalidWarning(false); }}
                  onKeyDown={(e) => e.key === "Enter" && askQuestion()}
                  placeholder="¿Es asiático? ¿Tiene costa? ..."
                  disabled={loadingQ || questionsLeft <= 0}
                  className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:opacity-40"
                />
                <button
                  onClick={askQuestion}
                  disabled={loadingQ || !questionInput.trim() || questionsLeft <= 0}
                  className="bg-emerald-500 hover:bg-emerald-400 disabled:opacity-40 text-white font-semibold px-4 py-3 rounded-xl transition"
                >
                  {loadingQ ? "..." : "→"}
                </button>
              </div>
              {invalidWarning && (
                <div className="flex items-start gap-2 bg-amber-950/60 border border-amber-600/40 rounded-xl px-4 py-3 text-amber-400 text-sm">
                  <span className="mt-0.5">⚠️</span>
                  <span>
                    <span className="font-semibold">Pregunta no válida.</span> Solo puedes preguntar sobre características del país, no sobre su nombre.{" "}
                    <span className="text-amber-300">Ej: ¿Está en Asia?</span>
                  </span>
                </div>
              )}
              {questions.length > 0 && (
                <ul className="space-y-2 max-h-96 overflow-y-auto">
                  {[...questions].reverse().map((qa, i) => (
                    <li key={i} className="flex justify-between items-center bg-slate-800 rounded-xl px-4 py-2.5">
                      <span className="text-slate-300 text-sm">{qa.question}</span>
                      <span className={`font-bold ml-4 ${qa.answer === "Sí" ? "text-emerald-400" : "text-red-400"}`}>
                        {qa.answer}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>

          </div>

          <button
            onClick={reveal}
            className="text-slate-600 hover:text-slate-400 text-xs transition underline text-center"
          >
            Rendirse y ver el país
          </button>
        </div>
      )}
    </main>
  );
}
