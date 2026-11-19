"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Modal from "@/components/Modal";
import SelectorPersonas, { type OpcionPersona } from "@/components/SelectorPersonas";

// Botón "Editar" de una foto: pie, lugar, fecha y etiquetas.
export default function EditarFoto({
  id,
  inicial,
  personas,
}: {
  id: string;
  inicial: { pie: string; lugar: string; fecha: string; personas: string[] };
  personas: OpcionPersona[];
}) {
  const router = useRouter();
  const [abierto, setAbierto] = useState(false);
  const [v, setV] = useState(inicial);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  async function guardar(e: React.FormEvent) {
    e.preventDefault();
    setGuardando(true);
    setError(null);
    try {
      const res = await fetch(`/api/fotos/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(v),
      });
      if (!res.ok) throw new Error((await res.json().catch(() => ({}))).error ?? "No se pudo guardar.");
      setAbierto(false);
      startTransition(() => router.refresh());
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo guardar.");
    } finally {
      setGuardando(false);
    }
  }

  return (
    <>
      <button
        onClick={() => {
          setV(inicial);
          setAbierto(true);
        }}
        className="boton-secundario"
      >
        ✏️ Editar / etiquetar
      </button>
      {abierto && (
        <Modal titulo="Editar foto" onClose={() => setAbierto(false)}>
          <form onSubmit={guardar} className="space-y-4">
            <label className="block">
              <span className="etiqueta-campo">Pie de foto</span>
              <textarea className="campo min-h-16" value={v.pie} onChange={(e) => setV({ ...v, pie: e.target.value })} />
            </label>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block">
                <span className="etiqueta-campo">Lugar</span>
                <input className="campo" value={v.lugar} onChange={(e) => setV({ ...v, lugar: e.target.value })} />
              </label>
              <label className="block">
                <span className="etiqueta-campo">Fecha</span>
                <input type="date" className="campo" value={v.fecha} onChange={(e) => setV({ ...v, fecha: e.target.value })} />
              </label>
            </div>
            <div>
              <span className="etiqueta-campo">¿Quién sale?</span>
              <SelectorPersonas opciones={personas} seleccion={v.personas} onCambio={(p) => setV({ ...v, personas: p })} />
            </div>
            {error && <p className="text-coral">{error}</p>}
            <button type="submit" disabled={guardando} className="boton w-full">
              {guardando ? "Guardando…" : "Guardar"}
            </button>
          </form>
        </Modal>
      )}
    </>
  );
}
