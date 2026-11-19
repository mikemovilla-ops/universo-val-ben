"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";

export default function SelectorVerComo({
  actual,
  grupos,
}: {
  actual: string;
  grupos: { titulo: string; personas: { id: string; nombre: string }[] }[];
}) {
  const router = useRouter();
  const [cambiando, startTransition] = useTransition();

  function elegir(personaId: string) {
    startTransition(async () => {
      await fetch("/api/dev/ver-como", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ personaId }),
      });
      router.refresh();
    });
  }

  return (
    <select
      value={actual}
      disabled={cambiando}
      onChange={(e) => elegir(e.target.value)}
      className="min-w-0 flex-1 sm:flex-none rounded-lg border border-cielo/40 bg-nogaldark px-2 py-1 text-sm text-crema disabled:opacity-50"
      style={{ fontSize: 14 }}
    >
      <option value="">Yo (admin)</option>
      {grupos.map((g) =>
        g.personas.length ? (
          <optgroup key={g.titulo} label={g.titulo}>
            {g.personas.map((p) => (
              <option key={p.id} value={p.id}>
                {p.nombre}
              </option>
            ))}
          </optgroup>
        ) : null
      )}
    </select>
  );
}
