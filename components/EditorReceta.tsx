"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import SubirImagen from "@/components/SubirImagen";
import { CATEGORIAS_RECETA, faltaParaTerminar } from "@/lib/recetas";

type Fila<T> = T & { k: number };
export type ContenidoReceta = {
  titulo: string;
  categoria: string;
  raciones: string;
  tiempo: string;
  consejos: string;
  fotoUrl: string | null;
  ingredientes: { cantidad: string; nombre: string }[];
  pasos: { texto: string; fotoUrl: string | null }[];
  fotos: { url: string; pie: string }[];
};

let contador = 0;
const conClave = <T,>(x: T): Fila<T> => ({ ...x, k: ++contador });

// Editor de una receta: datos básicos, ingredientes (primero) y pasos
// (después), cada paso con su foto opcional, consejos y fotos extra. Se
// guarda a mano ("Guardar y seguir luego") o se da por terminada.
export default function EditorReceta({
  id,
  inicial,
  yaLista,
}: {
  id: string;
  inicial: ContenidoReceta;
  yaLista: boolean;
}) {
  const router = useRouter();
  const [titulo, setTitulo] = useState(inicial.titulo);
  const [categoria, setCategoria] = useState(inicial.categoria);
  const [raciones, setRaciones] = useState(inicial.raciones);
  const [tiempo, setTiempo] = useState(inicial.tiempo);
  const [consejos, setConsejos] = useState(inicial.consejos);
  const [fotoUrl, setFotoUrl] = useState(inicial.fotoUrl);
  const [ingredientes, setIngredientes] = useState(() =>
    (inicial.ingredientes.length ? inicial.ingredientes : [{ cantidad: "", nombre: "" }]).map(conClave)
  );
  const [pasos, setPasos] = useState(() =>
    (inicial.pasos.length ? inicial.pasos : [{ texto: "", fotoUrl: null }]).map(conClave)
  );
  const [fotos, setFotos] = useState(() => inicial.fotos.map(conClave));
  const [guardando, setGuardando] = useState(false);
  const [mensaje, setMensaje] = useState<{ ok: boolean; texto: string } | null>(null);
  const [, startTransition] = useTransition();

  // "Hay cambios sin guardar" = el contenido actual no es el último guardado
  // (para avisar antes de salir de la página).
  const sinClaves = <T extends { k: number }>(xs: T[]) => xs.map(({ k, ...resto }) => resto);
  const foto = JSON.stringify([titulo, categoria, raciones, tiempo, consejos, fotoUrl, sinClaves(ingredientes), sinClaves(pasos), sinClaves(fotos)]);
  const ultimaGuardada = useRef<string | null>(null);
  if (ultimaGuardada.current === null) ultimaGuardada.current = foto;
  const cambios = foto !== ultimaGuardada.current;

  useEffect(() => {
    if (!cambios) return;
    const aviso = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", aviso);
    return () => window.removeEventListener("beforeunload", aviso);
  }, [cambios]);

  function cambiarFila<T>(set: React.Dispatch<React.SetStateAction<Fila<T>[]>>, k: number, parcial: Partial<T>) {
    set((prev) => prev.map((f) => (f.k === k ? { ...f, ...parcial } : f)));
  }
  function quitarFila<T>(set: React.Dispatch<React.SetStateAction<Fila<T>[]>>, k: number) {
    set((prev) => prev.filter((f) => f.k !== k));
  }
  function moverFila<T>(set: React.Dispatch<React.SetStateAction<Fila<T>[]>>, k: number, delta: number) {
    set((prev) => {
      const i = prev.findIndex((f) => f.k === k);
      const j = i + delta;
      if (i < 0 || j < 0 || j >= prev.length) return prev;
      const copia = [...prev];
      [copia[i], copia[j]] = [copia[j], copia[i]];
      return copia;
    });
  }

  async function guardar(terminar: boolean) {
    const ingr = ingredientes.filter((i) => i.nombre.trim());
    const pas = pasos.filter((p) => p.texto.trim() || p.fotoUrl);
    if (terminar) {
      const falta = faltaParaTerminar({ titulo: titulo.trim(), ingredientes: ingr, pasos: pas });
      if (falta.length) {
        setMensaje({ ok: false, texto: `Para terminarla falta ${falta.join(", ")}.` });
        return;
      }
    }
    setGuardando(true);
    setMensaje(null);
    try {
      const res = await fetch(`/api/recetas/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          accion: "guardar",
          terminar,
          titulo,
          categoria,
          raciones,
          tiempo,
          consejos,
          fotoUrl,
          ingredientes: ingr.map(({ cantidad, nombre }) => ({ cantidad, nombre })),
          pasos: pas.map(({ texto, fotoUrl }) => ({ texto, fotoUrl })),
          fotos: fotos.map(({ url, pie }) => ({ url, pie })),
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error ?? "No se pudo guardar.");
      ultimaGuardada.current = foto;
      if (terminar) {
        startTransition(() => {
          router.push(`/recetas/${id}`);
          router.refresh();
        });
      } else {
        setMensaje({ ok: true, texto: "✅ Guardado. Puedes seguir ahora o en otro momento." });
        setGuardando(false);
      }
    } catch (e) {
      setMensaje({ ok: false, texto: e instanceof Error ? e.message : "No se pudo guardar." });
      setGuardando(false);
    }
  }

  const botonPequeno = "h-10 w-10 shrink-0 rounded-lg border border-crema/15 text-crema/60 hover:bg-crema/10 disabled:opacity-30";

  return (
    <div className="space-y-5">
      <section className="card p-5 space-y-4">
        <h2 className="font-display text-xl">1. La receta</h2>
        <label className="block">
          <span className="etiqueta-campo">Nombre *</span>
          <input className="campo text-lg" value={titulo} onChange={(e) => setTitulo(e.target.value)} />
        </label>
        <div className="grid gap-4 sm:grid-cols-3">
          <label className="block">
            <span className="etiqueta-campo">Tipo de plato</span>
            <input
              className="campo"
              list="categorias"
              placeholder="Ej.: Postres"
              value={categoria}
              onChange={(e) => setCategoria(e.target.value)}
            />
            <datalist id="categorias">
              {CATEGORIAS_RECETA.map((c) => (
                <option key={c} value={c} />
              ))}
            </datalist>
          </label>
          <label className="block">
            <span className="etiqueta-campo">¿Para cuántos?</span>
            <input className="campo" placeholder="Ej.: 4 personas" value={raciones} onChange={(e) => setRaciones(e.target.value)} />
          </label>
          <label className="block">
            <span className="etiqueta-campo">Tiempo</span>
            <input className="campo" placeholder="Ej.: 1 hora" value={tiempo} onChange={(e) => setTiempo(e.target.value)} />
          </label>
        </div>
        <div>
          <span className="etiqueta-campo">Foto del plato</span>
          <SubirImagen carpeta="recetas" url={fotoUrl} onCambio={setFotoUrl} texto="📷 Añadir foto del plato" />
        </div>
      </section>

      <section className="card p-5 space-y-3">
        <h2 className="font-display text-xl">2. Ingredientes</h2>
        <p className="text-sm text-crema/50">Una línea por ingrediente. La cantidad es opcional («al gusto», «un chorrito»…).</p>
        {ingredientes.map((i, idx) => (
          <div key={i.k} className="flex gap-2">
            <input
              className="campo w-28 shrink-0 sm:w-36"
              placeholder="Cantidad"
              value={i.cantidad}
              onChange={(e) => cambiarFila(setIngredientes, i.k, { cantidad: e.target.value })}
            />
            <input
              className="campo flex-1 min-w-0"
              placeholder={idx === 0 ? "Ej.: harina" : "Ingrediente"}
              value={i.nombre}
              onChange={(e) => cambiarFila(setIngredientes, i.k, { nombre: e.target.value })}
            />
            <button
              type="button"
              onClick={() => quitarFila(setIngredientes, i.k)}
              className={botonPequeno}
              aria-label="Quitar ingrediente"
            >
              ✕
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={() => setIngredientes((p) => [...p, conClave({ cantidad: "", nombre: "" })])}
          className="boton-secundario w-full"
        >
          ➕ Añadir ingrediente
        </button>
      </section>

      <section className="card p-5 space-y-4">
        <h2 className="font-display text-xl">3. Pasos</h2>
        <p className="text-sm text-crema/50">Explica cada paso como si se lo contaras a alguien en la cocina. Puedes añadir una foto a cada uno.</p>
        {pasos.map((p, idx) => (
          <div key={p.k} className="rounded-xl bg-nogaldark/50 p-3 space-y-2">
            <div className="flex items-center gap-2">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-miel font-semibold text-nogaldark">
                {idx + 1}
              </span>
              <span className="flex-1 text-sm text-crema/50">Paso {idx + 1}</span>
              <button type="button" onClick={() => moverFila(setPasos, p.k, -1)} disabled={idx === 0} className={botonPequeno} aria-label="Subir paso">
                ↑
              </button>
              <button
                type="button"
                onClick={() => moverFila(setPasos, p.k, 1)}
                disabled={idx === pasos.length - 1}
                className={botonPequeno}
                aria-label="Bajar paso"
              >
                ↓
              </button>
              <button
                type="button"
                onClick={() => (p.texto.trim() ? window.confirm("¿Quitar este paso?") : true) && quitarFila(setPasos, p.k)}
                className={botonPequeno}
                aria-label="Quitar paso"
              >
                ✕
              </button>
            </div>
            <textarea
              className="campo min-h-24"
              placeholder="Ej.: Pon a calentar el aceite en una sartén a fuego medio…"
              value={p.texto}
              onChange={(e) => cambiarFila(setPasos, p.k, { texto: e.target.value })}
            />
            <SubirImagen
              carpeta="recetas"
              url={p.fotoUrl}
              onCambio={(u) => cambiarFila(setPasos, p.k, { fotoUrl: u })}
              texto="📷 Foto de este paso"
            />
          </div>
        ))}
        <button
          type="button"
          onClick={() => setPasos((prev) => [...prev, conClave({ texto: "", fotoUrl: null })])}
          className="boton-secundario w-full"
        >
          ➕ Añadir paso
        </button>
      </section>

      <section className="card p-5 space-y-4">
        <h2 className="font-display text-xl">4. Para terminar (opcional)</h2>
        <label className="block">
          <span className="etiqueta-campo">Consejos y trucos</span>
          <textarea
            className="campo min-h-20"
            placeholder="Ej.: queda mejor si se deja reposar de un día para otro"
            value={consejos}
            onChange={(e) => setConsejos(e.target.value)}
          />
        </label>
        <div className="space-y-2">
          <span className="etiqueta-campo">Más fotos</span>
          {fotos.map((f) => (
            <div key={f.k} className="flex items-center gap-2">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={f.url} alt="" className="h-16 w-16 shrink-0 rounded-lg object-cover" />
              <input
                className="campo flex-1 min-w-0"
                placeholder="Pie de foto (opcional)"
                value={f.pie}
                onChange={(e) => cambiarFila(setFotos, f.k, { pie: e.target.value })}
              />
              <button type="button" onClick={() => quitarFila(setFotos, f.k)} className={botonPequeno} aria-label="Quitar foto">
                ✕
              </button>
            </div>
          ))}
          <SubirImagen
            key={fotos.length}
            carpeta="recetas"
            url={null}
            onCambio={(u) => u && setFotos((prev) => [...prev, conClave({ url: u, pie: "" })])}
            texto="📷 Añadir otra foto"
          />
        </div>
      </section>

      {/* Barra de guardar, pegada abajo (encima de la barra de navegación en móvil) */}
      <div className="sticky bottom-24 md:bottom-4 z-30">
        <div className="card bg-nogaldark/95 p-3 space-y-2 shadow-lg shadow-black/50">
          {mensaje && (!mensaje.ok || !cambios) && (
            <p className={mensaje.ok ? "text-salvia text-sm" : "text-coral text-sm"}>{mensaje.texto}</p>
          )}
          {cambios && !(mensaje && !mensaje.ok) && <p className="text-crema/50 text-xs">Tienes cambios sin guardar.</p>}
          <div className="flex flex-col gap-2 sm:flex-row">
            <button type="button" onClick={() => guardar(false)} disabled={guardando} className="boton-secundario flex-1">
              {guardando ? "Guardando…" : yaLista ? "💾 Guardar cambios" : "💾 Guardar y seguir luego"}
            </button>
            {!yaLista && (
              <button type="button" onClick={() => guardar(true)} disabled={guardando} className="boton flex-1">
                ✅ Terminada
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
