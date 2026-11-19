"use client";

import Avatar from "@/components/Avatar";

export type OpcionPersona = { id: string; nombre: string; fotoUrl: string | null };

// Etiquetar personas en una foto: se toca a cada una para marcarla.
export default function SelectorPersonas({
  opciones,
  seleccion,
  onCambio,
}: {
  opciones: OpcionPersona[];
  seleccion: string[];
  onCambio: (ids: string[]) => void;
}) {
  const marcadas = new Set(seleccion);
  return (
    <div className="flex flex-wrap gap-2">
      {opciones.map((p) => {
        const on = marcadas.has(p.id);
        return (
          <button
            key={p.id}
            type="button"
            onClick={() => onCambio(on ? seleccion.filter((id) => id !== p.id) : [...seleccion, p.id])}
            className={`flex items-center gap-2 rounded-full border py-1 pl-1 pr-3 text-sm transition ${
              on ? "border-miel bg-miel/20 text-crema" : "border-crema/15 text-crema/70 hover:bg-crema/5"
            }`}
          >
            <Avatar nombre={p.nombre} fotoUrl={p.fotoUrl} size={28} />
            {on && "✓ "}
            {p.nombre}
          </button>
        );
      })}
    </div>
  );
}
