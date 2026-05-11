import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Countrly — Adivina el país",
  description: "Haz preguntas de sí o no para adivinar el país secreto",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className="bg-slate-950 text-white min-h-screen">{children}</body>
    </html>
  );
}
