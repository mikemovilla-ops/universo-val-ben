"use client";

import { useState } from "react";

// Ingredientes que se pueden ir tachando con el dedo mientras se cocina
// (solo en esta pantalla; no se guarda).
export default function ListaIngredientes({ ingredientes }: { ingredientes: { cantidad: string | null; nombre: string }[] }) {
  const [hechos, setHechos] = useState<Set<number>>(new Set());
  return (
    <ul className="space-y-1">
      {ingredientes.map((i, idx) => {
        const hecho = hechos.has(idx);
        return (
          <li key={idx}>
            <button
              type="button"
              onClick={() =>
                setHechos((prev) => {
                  const s = new Set(prev);
                  if (s.has(idx)) s.delete(idx);
                  else s.add(idx);
                  return s;
                })
              }
              className="flex w-full items-start gap-3 rounded-lg px-2 py-1.5 text-left hover:bg-crema/5"
            >
              <span
                className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded border ${
                  hecho ? "border-salvia bg-salvia/30 text-salvia" : "border-crema/30"
                }`}
              >
                {hecho ? "✓" : ""}
              </span>
              <span className={hecho ? "text-crema/40 line-through" : ""}>
                {i.cantidad && <strong className="font-semibold">{i.cantidad} </strong>}
                {i.nombre}
              </span>
            </button>
          </li>
        );
      })}
    </ul>
  );
}
