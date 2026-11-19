"use client";

import { useState } from "react";

export default function SeccionDesplegable({
  titulo,
  abiertoInicial = true,
  children,
}: {
  titulo: React.ReactNode;
  abiertoInicial?: boolean;
  children: React.ReactNode;
}) {
  const [abierto, setAbierto] = useState(abiertoInicial);
  return (
    <section className="card p-4">
      <button
        onClick={() => setAbierto((v) => !v)}
        className="w-full flex items-center justify-between gap-2 -m-1 p-1 rounded hover:bg-crema/5 transition-colors"
      >
        <h2 className="font-display text-lg text-left">{titulo}</h2>
        <svg
          viewBox="0 0 24 24"
          width="20"
          height="20"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
          className={`text-crema/40 shrink-0 transition-transform duration-200 ${abierto ? "rotate-180" : ""}`}
        >
          <path d="M6 9l6 6 6-6" />
        </svg>
      </button>
      <div
        className={`grid transition-[grid-template-rows] duration-300 ease-in-out ${
          abierto ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
        }`}
      >
        <div className="overflow-hidden">
          <div className="pt-3 space-y-3">{children}</div>
        </div>
      </div>
    </section>
  );
}
