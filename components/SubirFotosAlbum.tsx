"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Modal from "@/components/Modal";
import SelectorPersonas, { type OpcionPersona } from "@/components/SelectorPersonas";
import { subirImagen } from "@/lib/subida";

// Subir una o varias fotos al álbum: se eligen, se les pone un pie, lugar,
// fecha y quién sale, y se suben todas de golpe (con barra de progreso).
export default function SubirFotosAlbum({ personas }: { personas: OpcionPersona[] }) {
  const router = useRouter();
  const input = useRef<HTMLInputElement>(null);
  const [archivos, setArchivos] = useState<File[]>([]);
  const [vistas, setVistas] = useState<string[]>([]);
  const [pie, setPie] = useState("");
  const [lugar, setLugar] = useState("");
  const [fecha, setFecha] = useState("");
  const [etiquetas, setEtiquetas] = useState<string[]>([]);
  const [progreso, setProgreso] = useState<{ hechas: number; total: number } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  function elegir(lista: FileList | null) {
    const fs = Array.from(lista ?? []).filter((f) => f.type.startsWith("image/") || /\.(heic|heif)$/i.test(f.name));
    if (!fs.length) return;
    vistas.forEach((u) => URL.revokeObjectURL(u));
    setArchivos(fs);
    setVistas(fs.map((f) => URL.createObjectURL(f)));
    setError(null);
  }

  function cerrar() {
    if (progreso) return;
    vistas.forEach((u) => URL.revokeObjectURL(u));
    setArchivos([]);
    setVistas([]);
    setPie("");
    setLugar("");
    setFecha("");
    setEtiquetas([]);
    if (input.current) input.current.value = "";
  }

  async function subir(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setProgreso({ hechas: 0, total: archivos.length });
    const urls: string[] = [];
    try {
      for (const f of archivos) {
        urls.push(await subirImagen(f, "album"));
        setProgreso({ hechas: urls.length, total: archivos.length });
      }
      const res = await fetch("/api/fotos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ urls, pie, lugar, fecha, personas: etiquetas }),
      });
      if (!res.ok) throw new Error((await res.json().catch(() => ({}))).error ?? "No se pudieron guardar.");
      setProgreso(null);
      cerrar();
      startTransition(() => router.refresh());
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudieron subir las fotos.");
      setProgreso(null);
    }
  }

  return (
    <>
      <input
        ref={input}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => elegir(e.target.files)}
      />
      <button onClick={() => input.current?.click()} className="boton text-lg py-3 w-full sm:w-auto">
        📷 Subir fotos
      </button>

      {archivos.length > 0 && (
        <Modal titulo={archivos.length === 1 ? "Subir 1 foto" : `Subir ${archivos.length} fotos`} onClose={cerrar}>
          <form onSubmit={subir} className="space-y-4">
            <div className="flex gap-2 overflow-x-auto pb-1">
              {vistas.map((u, i) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img key={i} src={u} alt="" className="h-24 w-24 shrink-0 rounded-lg object-cover" />
              ))}
            </div>
            <label className="block">
              <span className="etiqueta-campo">¿Qué es? (pie de foto)</span>
              <textarea
                className="campo min-h-16"
                placeholder="Ej.: Comida de Navidad en casa de los abuelos"
                value={pie}
                onChange={(e) => setPie(e.target.value)}
              />
            </label>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block">
                <span className="etiqueta-campo">Lugar</span>
                <input className="campo" placeholder="Ej.: Benidorm" value={lugar} onChange={(e) => setLugar(e.target.value)} />
              </label>
              <label className="block">
                <span className="etiqueta-campo">Fecha (aproximada vale)</span>
                <input type="date" className="campo" value={fecha} onChange={(e) => setFecha(e.target.value)} />
              </label>
            </div>
            <div>
              <span className="etiqueta-campo">¿Quién sale? Toca a cada uno</span>
              <SelectorPersonas opciones={personas} seleccion={etiquetas} onCambio={setEtiquetas} />
            </div>
            {archivos.length > 1 && (
              <p className="text-xs text-crema/50">El pie, lugar, fecha y etiquetas se ponen a todas. Luego puedes cambiarlos foto a foto.</p>
            )}
            {error && <p className="text-coral">{error}</p>}
            {progreso && (
              <div className="space-y-1">
                <div className="h-2 overflow-hidden rounded-full bg-crema/10">
                  <div
                    className="h-full bg-miel transition-all"
                    style={{ width: `${(progreso.hechas / progreso.total) * 100}%` }}
                  />
                </div>
                <p className="text-sm text-crema/60">
                  Subiendo {progreso.hechas} de {progreso.total}… no cierres la página.
                </p>
              </div>
            )}
            <button type="submit" disabled={!!progreso} className="boton w-full text-lg">
              {progreso ? "Subiendo…" : "Subir"}
            </button>
          </form>
        </Modal>
      )}
    </>
  );
}
