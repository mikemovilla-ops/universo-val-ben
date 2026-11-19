"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { HITOS_PREDEFINIDOS } from "@/lib/hitos";

export type HitoVista = {
  id: string;
  clave: string | null;
  titulo: string;
  valor: string;
  detalle: string | null;
  autor: string | null;
};

type Edicion = { tipo: "predefinido"; clave: string } | { tipo: "propio"; id: string } | { tipo: "nuevo" };

// Hitos de una persona: los predefinidos (salen todos, listos para
// rellenar) y los propios que se añadan. Quien no puede editar solo ve los
// que están rellenos.
export default function HitosPersona({
  personaId,
  hitos,
  puedeEditar,
}: {
  personaId: string;
  hitos: HitoVista[];
  puedeEditar: boolean;
}) {
  const router = useRouter();
  const [edicion, setEdicion] = useState<Edicion | null>(null);
  const [titulo, setTitulo] = useState("");
  const [valor, setValor] = useState("");
  const [detalle, setDetalle] = useState("");
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  const porClave = new Map(hitos.filter((h) => h.clave).map((h) => [h.clave!, h]));
  const propios = hitos.filter((h) => !h.clave);

  function abrir(e: Edicion, h?: HitoVista) {
    setEdicion(e);
    setTitulo(h?.titulo ?? "");
    setValor(h?.valor ?? "");
    setDetalle(h?.detalle ?? "");
    setError(null);
  }

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
      setEdicion(null);
      startTransition(() => router.refresh());
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudo guardar.");
    } finally {
      setGuardando(false);
    }
  }

  function guardar(e: React.FormEvent) {
    e.preventDefault();
    if (!edicion) return;
    if (edicion.tipo === "predefinido") {
      peticion(`/api/personas/${personaId}/hitos`, "POST", { clave: edicion.clave, valor, detalle });
    } else if (edicion.tipo === "nuevo") {
      peticion(`/api/personas/${personaId}/hitos`, "POST", { titulo, valor, detalle });
    } else {
      peticion(`/api/hitos/${edicion.id}`, "PATCH", { titulo, valor, detalle });
    }
  }

  function borrar(id: string) {
    if (window.confirm("¿Borrar este hito?")) peticion(`/api/hitos/${id}`, "DELETE");
  }

  const formulario = (conTitulo: boolean, ejemplo?: string) => (
    <form onSubmit={guardar} className="mt-2 space-y-2 rounded-xl bg-nogaldark/60 p-3">
      {conTitulo && (
        <input
          className="campo"
          placeholder="¿Qué hito? (ej.: Primer concierto)"
          value={titulo}
          onChange={(e) => setTitulo(e.target.value)}
          required
          autoFocus
        />
      )}
      <input
        className="campo"
        placeholder={ejemplo ? `Cuándo / cómo — ej.: ${ejemplo}` : "Cuándo / cómo"}
        value={valor}
        onChange={(e) => setValor(e.target.value)}
        required
        autoFocus={!conTitulo}
      />
      <textarea
        className="campo min-h-16"
        placeholder="Algún detalle más (opcional)"
        value={detalle}
        onChange={(e) => setDetalle(e.target.value)}
      />
      {error && <p className="text-coral text-sm">{error}</p>}
      <div className="flex gap-2">
        <button type="submit" disabled={guardando} className="boton py-2">
          {guardando ? "Guardando…" : "Guardar"}
        </button>
        <button type="button" onClick={() => setEdicion(null)} className="boton-secundario py-2">
          Cancelar
        </button>
      </div>
    </form>
  );

  const fila = (
    clave: string,
    emoji: string,
    tituloHito: string,
    h: HitoVista | undefined,
    editando: boolean,
    onEditar: () => void,
    onBorrar?: () => void,
    formu?: React.ReactNode
  ) => (
    <li key={clave} className="border-b border-crema/5 py-2.5 last:border-0">
      <div className="flex items-start gap-3">
        <span className="text-xl leading-6">{emoji}</span>
        <div className="flex-1 min-w-0">
          <p className="text-sm text-crema/60">{tituloHito}</p>
          {h ? (
            <>
              <p className="font-medium">{h.valor}</p>
              {h.detalle && <p className="text-sm text-crema/70 whitespace-pre-line">{h.detalle}</p>}
              {h.autor && <p className="text-xs text-crema/35 mt-0.5">Lo apuntó {h.autor}</p>}
            </>
          ) : (
            <p className="text-crema/35 italic">Sin rellenar</p>
          )}
        </div>
        {puedeEditar && !editando && (
          <div className="flex shrink-0 gap-1">
            <button onClick={onEditar} className="rounded-lg px-2 py-1 text-sm text-mielbrillante hover:bg-crema/5">
              {h ? "Editar" : "Rellenar"}
            </button>
            {onBorrar && (
              <button onClick={onBorrar} className="rounded-lg px-2 py-1 text-sm text-crema/40 hover:text-coral" aria-label="Borrar">
                ✕
              </button>
            )}
          </div>
        )}
      </div>
      {editando && formu}
    </li>
  );

  const visiblesPredef = HITOS_PREDEFINIDOS.filter((p) => puedeEditar || porClave.has(p.clave));

  if (!puedeEditar && hitos.length === 0) {
    return <p className="text-crema/40 text-sm">Todavía no hay hitos apuntados.</p>;
  }

  return (
    <div>
      <ul>
        {visiblesPredef.map((p) => {
          const h = porClave.get(p.clave);
          const editando = edicion?.tipo === "predefinido" && edicion.clave === p.clave;
          return fila(
            p.clave,
            p.emoji,
            p.titulo,
            h,
            editando,
            () => abrir({ tipo: "predefinido", clave: p.clave }, h),
            h ? () => borrar(h.id) : undefined,
            formulario(false, p.ejemplo)
          );
        })}
        {propios.map((h) => {
          const editando = edicion?.tipo === "propio" && edicion.id === h.id;
          return fila(
            h.id,
            "⭐",
            h.titulo,
            h,
            editando,
            () => abrir({ tipo: "propio", id: h.id }, h),
            () => borrar(h.id),
            formulario(true)
          );
        })}
      </ul>
      {puedeEditar &&
        (edicion?.tipo === "nuevo" ? (
          formulario(true)
        ) : (
          <button onClick={() => abrir({ tipo: "nuevo" })} className="boton-secundario mt-3 w-full">
            ➕ Añadir otro hito
          </button>
        ))}
    </div>
  );
}
