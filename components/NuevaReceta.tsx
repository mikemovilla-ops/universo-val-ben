"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Modal from "@/components/Modal";

// Botones grandes arriba de Recetas: "Pedir una receta" (todos) y, para
// papá y mamá, "Escribir una receta nueva" (sin que nadie la haya pedido).
export default function NuevaReceta({ puedePedir, puedeEscribir }: { puedePedir: boolean; puedeEscribir: boolean }) {
  const router = useRouter();
  const [modo, setModo] = useState<"pedir" | "escribir" | null>(null);
  const [titulo, setTitulo] = useState("");
  const [nota, setNota] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hecho, setHecho] = useState(false);
  const [, startTransition] = useTransition();

  function abrir(m: "pedir" | "escribir") {
    setModo(m);
    setTitulo("");
    setNota("");
    setError(null);
    setHecho(false);
  }

  async function enviar(e: React.FormEvent) {
    e.preventDefault();
    setEnviando(true);
    setError(null);
    try {
      const res = await fetch("/api/recetas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ accion: modo, titulo, nota }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error ?? "No se pudo guardar.");
      if (modo === "escribir") {
        startTransition(() => router.push(`/recetas/${data.id}/editar`));
      } else {
        setHecho(true);
        setEnviando(false);
        startTransition(() => router.refresh());
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo guardar.");
      setEnviando(false);
    }
  }

  return (
    <>
      <div className="flex flex-col gap-2 sm:flex-row">
        {puedePedir && (
          <button onClick={() => abrir("pedir")} className="boton text-lg py-3">
            🙋 Pedir una receta
          </button>
        )}
        {puedeEscribir && (
          <button onClick={() => abrir("escribir")} className={puedePedir ? "boton-secundario py-3" : "boton text-lg py-3"}>
            ✍️ Escribir una receta nueva
          </button>
        )}
      </div>

      {modo && (
        <Modal titulo={modo === "pedir" ? "Pedir una receta" : "Escribir una receta nueva"} onClose={() => setModo(null)}>
          {hecho ? (
            <div className="space-y-4">
              <p className="text-lg">✅ ¡Pedida!</p>
              <p className="text-crema/70">
                Papá y mamá la verán en la lista de «Pedidas» (y les llegará un email). Te avisaremos cuando esté lista.
              </p>
              <button onClick={() => setModo(null)} className="boton w-full">
                Vale
              </button>
            </div>
          ) : (
            <form onSubmit={enviar} className="space-y-4">
              <label className="block">
                <span className="etiqueta-campo">{modo === "pedir" ? "¿Qué receta quieres?" : "¿Qué receta vas a escribir?"}</span>
                <input
                  className="campo"
                  placeholder="Ej.: Croquetas de jamón"
                  value={titulo}
                  onChange={(e) => setTitulo(e.target.value)}
                  required
                  autoFocus
                />
              </label>
              {modo === "pedir" && (
                <label className="block">
                  <span className="etiqueta-campo">¿Algún detalle? (opcional)</span>
                  <textarea
                    className="campo min-h-20"
                    placeholder="Ej.: las que hacías los domingos, con mucha bechamel"
                    value={nota}
                    onChange={(e) => setNota(e.target.value)}
                  />
                </label>
              )}
              {error && <p className="text-coral">{error}</p>}
              <button type="submit" disabled={enviando} className="boton w-full text-lg">
                {enviando ? "Un momento…" : modo === "pedir" ? "Pedir" : "Empezar a escribirla"}
              </button>
            </form>
          )}
        </Modal>
      )}
    </>
  );
}
