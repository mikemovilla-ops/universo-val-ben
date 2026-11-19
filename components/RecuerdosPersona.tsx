"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

export type RecuerdoVista = {
  id: string;
  tipo: "ANECDOTA" | "CURIOSIDAD";
  texto: string;
  autor: string | null;
  fecha: string;
  puedeBorrar: boolean;
};

// Anécdotas y curiosidades de una persona, con un formulario sencillo para
// añadir una nueva.
export default function RecuerdosPersona({
  personaId,
  recuerdos,
  puedeEscribir,
}: {
  personaId: string;
  recuerdos: RecuerdoVista[];
  puedeEscribir: boolean;
}) {
  const router = useRouter();
  const [abierto, setAbierto] = useState(false);
  const [tipo, setTipo] = useState<"ANECDOTA" | "CURIOSIDAD">("ANECDOTA");
  const [texto, setTexto] = useState("");
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  async function peticion(url: string, metodo: string, body?: unknown) {
    setGuardando(true);
    setError(null);
    try {
      const res = await fetch(url, {
        method: metodo,
        headers: body ? { "Content-Type": "application/json" } : undefined,
        body: body ? JSON.stringify(body) : undefined,
      });
      if (!res.ok) throw new Error((await res.json().catch(() => ({}))).error ?? "No se pudo guardar.");
      setTexto("");
      setAbierto(false);
      startTransition(() => router.refresh());
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudo guardar.");
    } finally {
      setGuardando(false);
    }
  }

  return (
    <div className="space-y-3">
      {recuerdos.length === 0 && <p className="text-crema/40 text-sm">Todavía no hay ninguna.</p>}
      {recuerdos.map((r) => (
        <div key={r.id} className="rounded-xl bg-nogaldark/50 p-3">
          <div className="flex items-start justify-between gap-2">
            <span className="text-xs uppercase tracking-wide text-mielbrillante">
              {r.tipo === "ANECDOTA" ? "😄 Anécdota" : "💡 Curiosidad"}
            </span>
            {r.puedeBorrar && (
              <button
                onClick={() => window.confirm("¿Borrar?") && peticion(`/api/recuerdos/${r.id}`, "DELETE")}
                className="text-crema/40 hover:text-coral text-sm"
                aria-label="Borrar"
              >
                ✕
              </button>
            )}
          </div>
          <p className="mt-1 whitespace-pre-line">{r.texto}</p>
          <p className="mt-1 text-xs text-crema/35">
            {r.autor ? `${r.autor} · ` : ""}
            {r.fecha}
          </p>
        </div>
      ))}

      {puedeEscribir &&
        (abierto ? (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              peticion(`/api/personas/${personaId}/recuerdos`, "POST", { tipo, texto });
            }}
            className="space-y-2 rounded-xl bg-nogaldark/60 p-3"
          >
            <div className="flex gap-2">
              {(["ANECDOTA", "CURIOSIDAD"] as const).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setTipo(t)}
                  className={`flex-1 rounded-xl border px-3 py-2 text-sm ${
                    tipo === t ? "border-miel bg-miel/15 text-mielbrillante" : "border-crema/15 text-crema/70"
                  }`}
                >
                  {t === "ANECDOTA" ? "😄 Anécdota" : "💡 Curiosidad"}
                </button>
              ))}
            </div>
            <textarea
              className="campo min-h-28"
              placeholder={
                tipo === "ANECDOTA"
                  ? "Cuéntala: qué pasó, cuándo, dónde…"
                  : "Algo curioso: le daban miedo los payasos, se sabía todas las capitales…"
              }
              value={texto}
              onChange={(e) => setTexto(e.target.value)}
              required
              autoFocus
            />
            {error && <p className="text-coral text-sm">{error}</p>}
            <div className="flex gap-2">
              <button type="submit" disabled={guardando} className="boton py-2">
                {guardando ? "Guardando…" : "Guardar"}
              </button>
              <button type="button" onClick={() => setAbierto(false)} className="boton-secundario py-2">
                Cancelar
              </button>
            </div>
          </form>
        ) : (
          <button onClick={() => setAbierto(true)} className="boton-secundario w-full">
            ➕ Añadir anécdota o curiosidad
          </button>
        ))}
    </div>
  );
}
