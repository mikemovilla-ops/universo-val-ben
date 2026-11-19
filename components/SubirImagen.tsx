"use client";

import { useRef, useState } from "react";
import { subirImagen, type Carpeta } from "@/lib/subida";

// Botón para elegir una foto (de la galería o la cámara) que la sube y
// devuelve su URL. Muestra la foto actual con opción de quitarla.
export default function SubirImagen({
  carpeta,
  url,
  onCambio,
  texto = "📷 Añadir foto",
  redonda = false,
}: {
  carpeta: Carpeta;
  url: string | null;
  onCambio: (url: string | null) => void;
  texto?: string;
  redonda?: boolean;
}) {
  const input = useRef<HTMLInputElement>(null);
  const [subiendo, setSubiendo] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function elegir(file: File) {
    setError(null);
    setSubiendo(true);
    try {
      onCambio(await subirImagen(file, carpeta));
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudo subir la foto.");
    } finally {
      setSubiendo(false);
      if (input.current) input.current.value = "";
    }
  }

  return (
    <div className="space-y-2">
      {url && (
        <div className="relative inline-block">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={url}
            alt=""
            className={redonda ? "h-28 w-28 rounded-full object-cover" : "max-h-48 rounded-xl object-cover"}
          />
          <button
            type="button"
            onClick={() => onCambio(null)}
            className="absolute -right-2 -top-2 h-8 w-8 rounded-full bg-nogaldark border border-crema/20 text-crema/80 hover:text-coral"
            aria-label="Quitar foto"
          >
            ✕
          </button>
        </div>
      )}
      <div>
        <input
          ref={input}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) elegir(f);
          }}
        />
        <button
          type="button"
          onClick={() => input.current?.click()}
          disabled={subiendo}
          className="boton-secundario text-sm py-2"
        >
          {subiendo ? "Subiendo foto…" : url ? "🔄 Cambiar foto" : texto}
        </button>
      </div>
      {error && <p className="text-coral text-sm">{error}</p>}
    </div>
  );
}
