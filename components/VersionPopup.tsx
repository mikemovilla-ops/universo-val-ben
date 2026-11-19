"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { APP_VERSION, HISTORIAL_VERSIONES, type EntradaVersion } from "@/lib/version";
import ListaCambios, { SeparadorHito } from "@/components/ListaCambios";

const STORAGE_KEY = "valben_version_vista";

function leer(): string | null {
  try {
    return window.localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

// Al entrar después de una actualización, enseña lo que ha cambiado desde
// la última versión que vio este navegador.
export default function VersionPopup() {
  const [entradas, setEntradas] = useState<EntradaVersion[] | null>(null);

  useEffect(() => {
    const vista = leer();
    if (vista === APP_VERSION) return;
    if (!vista) {
      setEntradas([HISTORIAL_VERSIONES[0]]);
      return;
    }
    const idx = HISTORIAL_VERSIONES.findIndex((h) => h.version === vista);
    setEntradas(idx === -1 ? [HISTORIAL_VERSIONES[0]] : HISTORIAL_VERSIONES.slice(0, idx));
  }, []);

  function cerrar() {
    try {
      window.localStorage.setItem(STORAGE_KEY, APP_VERSION);
    } catch {
      // sin almacenamiento (modo privado): volverá a salir, no pasa nada
    }
    setEntradas(null);
  }

  if (!entradas || entradas.length === 0) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 p-4">
      <div className="card w-full max-w-md p-6 space-y-4 bg-nogaldark">
        <h2 className="font-display text-xl text-mielbrillante">Novedades — {APP_VERSION}</h2>
        <div className="max-h-80 space-y-4 overflow-y-auto text-sm text-crema/80">
          {entradas.map((entrada) => (
            <div key={entrada.version}>
              {entrada.hito && <SeparadorHito />}
              <p className="font-medium text-crema">
                {entrada.version} <span className="text-crema/40">({entrada.fecha})</span>
              </p>
              <ListaCambios entrada={entrada} />
            </div>
          ))}
        </div>
        <button onClick={cerrar} className="boton w-full">
          Entendido
        </button>
        <Link
          href="/novedades"
          onClick={cerrar}
          className="block text-center text-xs text-crema/40 underline hover:text-crema/70"
        >
          Ver todo el historial de versiones
        </Link>
      </div>
    </div>
  );
}
