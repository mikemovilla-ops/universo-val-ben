"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

// Botón que hace una petición a la API (con confirmación opcional) y luego
// navega o refresca. Para acciones de un solo toque: borrar, empezar a
// escribir una receta...
export default function BotonAccion({
  url,
  metodo = "POST",
  cuerpo,
  confirmar,
  irA,
  className = "boton",
  children,
}: {
  url: string;
  metodo?: "POST" | "PATCH" | "DELETE";
  cuerpo?: unknown;
  confirmar?: string;
  irA?: string;
  className?: string;
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  async function hacer() {
    if (confirmar && !window.confirm(confirmar)) return;
    setError(null);
    setCargando(true);
    try {
      const res = await fetch(url, {
        method: metodo,
        headers: cuerpo !== undefined ? { "Content-Type": "application/json" } : undefined,
        body: cuerpo !== undefined ? JSON.stringify(cuerpo) : undefined,
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? "Algo ha fallado, inténtalo otra vez.");
      }
      startTransition(() => {
        if (irA) router.push(irA);
        router.refresh();
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Algo ha fallado.");
      setCargando(false);
    }
  }

  return (
    <span className="inline-flex flex-col gap-1">
      <button type="button" onClick={hacer} disabled={cargando} className={className}>
        {cargando ? "Un momento…" : children}
      </button>
      {error && <span className="text-coral text-sm">{error}</span>}
    </span>
  );
}
