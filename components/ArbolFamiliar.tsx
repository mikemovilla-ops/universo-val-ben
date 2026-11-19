"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import Link from "next/link";
import Avatar from "@/components/Avatar";
import type { ArbolColocado } from "@/lib/familia";

export type TarjetaArbol = {
  id: string;
  nombre: string;
  fotoUrl: string | null;
  esNucleo: boolean;
  cumpleHoy: boolean;
  fallecido: boolean;
};

// Árbol genealógico: una fila por generación, las parejas juntas con un ♥,
// y líneas desde cada pareja hasta sus hijos. Las líneas se dibujan en un
// SVG encima, midiendo dónde ha quedado cada tarjeta (así el reparto en
// filas lo hace el navegador con flexbox y funciona igual en móvil y en
// escritorio). En móvil, si no cabe, se desliza de lado.
export default function ArbolFamiliar({
  personas,
  arbol,
}: {
  personas: TarjetaArbol[];
  arbol: ArbolColocado;
}) {
  const porId = new Map(personas.map((p) => [p.id, p]));
  const scrollRef = useRef<HTMLDivElement>(null);
  const contRef = useRef<HTMLDivElement>(null);
  const tarjetas = useRef(new Map<string, HTMLElement>());
  const [lineas, setLineas] = useState<string[]>([]);
  const [tam, setTam] = useState({ w: 0, h: 0 });

  const calcular = useCallback(() => {
    const cont = contRef.current;
    if (!cont) return;
    const base = cont.getBoundingClientRect();
    const caja = (id: string) => {
      const el = tarjetas.current.get(id);
      if (!el) return null;
      const r = el.getBoundingClientRect();
      return { x: r.left - base.left + r.width / 2, top: r.top - base.top, bottom: r.bottom - base.top };
    };

    // Hermanos de los mismos padres comparten una "barra" horizontal.
    const grupos = new Map<string, string[]>();
    for (const e of arbol.enlaces) {
      const clave = [...e.progenitores].sort().join("|");
      grupos.set(clave, [...(grupos.get(clave) ?? []), e.hijo]);
    }

    const d: string[] = [];
    let i = 0;
    for (const [clave, hijos] of grupos) {
      const ps = clave.split("|").map(caja).filter((c): c is NonNullable<typeof c> => !!c);
      const hs = hijos.map(caja).filter((c): c is NonNullable<typeof c> => !!c);
      if (!ps.length || !hs.length) continue;
      const x0 = ps.reduce((s, p) => s + p.x, 0) / ps.length;
      // Si son pareja, la línea sale de entre los dos (a media altura, donde
      // está el ♥); si es uno solo, de debajo de su tarjeta.
      const y0 = ps.length > 1 ? Math.max(...ps.map((p) => p.top)) + 40 : Math.max(...ps.map((p) => p.bottom));
      const yHijos = Math.min(...hs.map((h) => h.top));
      const yBarra = yHijos - 22 - (i++ % 3) * 6; // pequeño desfase si coinciden varias barras
      const xs = [x0, ...hs.map((h) => h.x)];
      d.push(`M${x0},${y0} V${yBarra}`);
      d.push(`M${Math.min(...xs)},${yBarra} H${Math.max(...xs)}`);
      for (const h of hs) d.push(`M${h.x},${yBarra} V${h.top}`);
    }
    setLineas(d);
    setTam({ w: cont.scrollWidth, h: cont.scrollHeight });
  }, [arbol]);

  useLayoutEffect(() => {
    calcular();
    const ro = new ResizeObserver(calcular);
    if (contRef.current) ro.observe(contRef.current);
    window.addEventListener("resize", calcular);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", calcular);
    };
  }, [calcular]);

  // En móvil, empezar con los "5" a la vista en vez de en la esquina.
  useEffect(() => {
    const scroll = scrollRef.current;
    const nucleo = personas.find((p) => p.esNucleo);
    const el = nucleo ? tarjetas.current.get(nucleo.id) : null;
    if (scroll && el && scroll.scrollWidth > scroll.clientWidth) {
      scroll.scrollLeft = el.offsetLeft + el.offsetWidth / 2 - scroll.clientWidth / 2;
    }
  }, [personas]);

  return (
    <div ref={scrollRef} className="overflow-x-auto -mx-4 px-4 pb-2">
      <div ref={contRef} className="relative mx-auto w-max min-w-full">
        <svg className="pointer-events-none absolute inset-0" width={tam.w} height={tam.h} aria-hidden>
          {lineas.map((d, i) => (
            <path key={i} d={d} fill="none" stroke="#FBEFD9" strokeOpacity={0.35} strokeWidth={2} strokeLinecap="round" />
          ))}
        </svg>
        <div className="relative flex flex-col items-center gap-14 py-2">
          {arbol.filas.map((fila, f) => (
            <div key={f} className="flex items-start justify-center gap-8">
              {fila.map((unidad) => (
                <div key={unidad.join("-")} className="flex items-start gap-1">
                  {unidad.map((id, k) => {
                    const p = porId.get(id);
                    if (!p) return null;
                    return (
                      <div key={id} className="flex items-start gap-1">
                        {k === 1 && (
                          <span className="mt-6 text-coral text-3xl leading-none select-none drop-shadow" aria-hidden>
                            ♥
                          </span>
                        )}
                        <Link
                          href={`/familia/${id}`}
                          ref={(el) => {
                            if (el) tarjetas.current.set(id, el);
                            else tarjetas.current.delete(id);
                          }}
                          className={`flex flex-col items-center gap-1.5 rounded-2xl px-1.5 py-2 text-center transition hover:bg-crema/5 ${
                            p.esNucleo ? "w-28" : "w-24"
                          }`}
                        >
                          <span className="relative">
                            <Avatar
                              nombre={p.nombre}
                              fotoUrl={p.fotoUrl}
                              size={p.esNucleo ? 76 : 60}
                              className={`${p.esNucleo ? "ring-[3px] ring-miel" : "ring-1 ring-crema/25"} ${
                                p.fallecido ? "grayscale" : ""
                              }`}
                            />
                            {p.cumpleHoy && <span className="absolute -right-1 -top-1 text-xl">🎂</span>}
                          </span>
                          <span
                            className={`text-sm leading-tight ${p.esNucleo ? "font-semibold text-crema" : "text-crema/80"}`}
                          >
                            {p.nombre}
                            {p.fallecido && <span className="text-crema/50"> ✝</span>}
                          </span>
                        </Link>
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
