"use client";

import { useState } from "react";
import Link from "next/link";

// Recuadro "¿Cómo funciona?" plegado al principio de cada sección, con los
// pasos básicos en lenguaje sencillo. Enlaza a /ayuda para el detalle.
export default function AyudaRapida({ pasos, ancla }: { pasos: React.ReactNode[]; ancla?: string }) {
  const [abierto, setAbierto] = useState(false);
  return (
    <div className="rounded-2xl border border-cielo/25 bg-cielo/5 px-4 py-3 text-sm">
      <button onClick={() => setAbierto((v) => !v)} className="w-full flex items-center justify-between gap-2 text-cielo">
        <span className="font-medium">💡 ¿Cómo funciona esto?</span>
        <span className="text-xs">{abierto ? "Ocultar" : "Ver"}</span>
      </button>
      {abierto && (
        <div className="mt-2 space-y-2 text-crema/80">
          <ol className="list-decimal list-outside pl-5 space-y-1.5">
            {pasos.map((p, i) => (
              <li key={i}>{p}</li>
            ))}
          </ol>
          <Link href={`/ayuda${ancla ? `#${ancla}` : ""}`} className="inline-block text-cielo underline">
            Más instrucciones
          </Link>
        </div>
      )}
    </div>
  );
}
