import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireViewer } from "@/lib/sesion";
import { colocarArbol, nombreCompleto, nombreMostrado } from "@/lib/familia";
import { hoyMadrid, proximoCumpleanos } from "@/lib/fechas";
import { puedeGestionarFamilia } from "@/lib/permisos";
import ArbolFamiliar from "@/components/ArbolFamiliar";
import AyudaRapida from "@/components/AyudaRapida";
import Avatar from "@/components/Avatar";
import EnlaceConCarga from "@/components/EnlaceConCarga";

export const dynamic = "force-dynamic";

export default async function PaginaFamilia() {
  const v = await requireViewer();
  const personas = await prisma.persona.findMany({ orderBy: { nombre: "asc" } });
  const hoy = hoyMadrid();
  const ancla = personas.find((p) => p.esNucleo && p.rol === "HIJO")?.id ?? v.personaId;
  const arbol = colocarArbol(personas, ancla);

  const tarjetas = personas.map((p) => ({
    id: p.id,
    nombre: nombreMostrado(p),
    fotoUrl: p.fotoUrl,
    esNucleo: p.esNucleo,
    cumpleHoy: !!p.fechaNacimiento && !p.fechaFallecimiento && proximoCumpleanos(p.fechaNacimiento, hoy).dias === 0,
    fallecido: !!p.fechaFallecimiento,
  }));

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-3xl">🌳 La familia</h1>
        {puedeGestionarFamilia(v) && (
          <Link href="/familia/nueva" className="boton">
            ➕ Añadir persona
          </Link>
        )}
      </div>

      <AyudaRapida
        ancla="familia"
        pasos={[
          "Toca a cualquiera para ver su ficha: datos, cumpleaños, teléfono, hitos, anécdotas y fotos.",
          "Si en el móvil no cabe todo, desliza el árbol de lado con el dedo.",
          "En la ficha de tus hijos (y nietos) puedes rellenar sus hitos y contar anécdotas.",
          "Tus propios datos (teléfono, foto…) los cambias en «Mis datos».",
        ]}
      />

      {personas.length === 0 ? (
        <div className="card p-6 text-center space-y-3">
          <p className="text-lg">Todavía no hay nadie en el árbol.</p>
          {puedeGestionarFamilia(v) ? (
            <p className="text-crema/60">
              Empieza por los 5: añade a papá y a mamá, luego a cada hijo (eligiendo sus padres) y marca que son
              «uno de los 5».
            </p>
          ) : (
            <p className="text-crema/60">El administrador lo está preparando.</p>
          )}
        </div>
      ) : (
        <section className="card p-4">
          <ArbolFamiliar personas={tarjetas} arbol={arbol} />
        </section>
      )}

      {personas.length > 0 && (
        <section className="card p-4">
          <h2 className="font-display text-lg mb-3">Todos, por orden alfabético</h2>
          <ul className="grid gap-1 sm:grid-cols-2">
            {personas.map((p) => (
              <li key={p.id}>
                <EnlaceConCarga
                  href={`/familia/${p.id}`}
                  className="flex items-center gap-3 rounded-xl p-2 hover:bg-crema/5"
                >
                  <Avatar nombre={nombreMostrado(p)} fotoUrl={p.fotoUrl} size={40} />
                  <span>
                    <span className="block">{nombreMostrado(p)}</span>
                    {p.apodo && <span className="block text-xs text-crema/50">{nombreCompleto(p)}</span>}
                  </span>
                </EnlaceConCarga>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
