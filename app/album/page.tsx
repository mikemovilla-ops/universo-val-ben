import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireViewer } from "@/lib/sesion";
import { nombreMostrado } from "@/lib/familia";
import AyudaRapida from "@/components/AyudaRapida";
import SubirFotosAlbum from "@/components/SubirFotosAlbum";
import EnlaceConCarga from "@/components/EnlaceConCarga";
import Avatar from "@/components/Avatar";

export const dynamic = "force-dynamic";

const POR_PAGINA = 60;

export default async function Album({ searchParams }: { searchParams: { persona?: string; n?: string } }) {
  await requireViewer();
  const limite = Math.min(Math.max(Number(searchParams.n) || POR_PAGINA, POR_PAGINA), 2000);
  const personaId = searchParams.persona || null;

  const [personas, fotos, total] = await Promise.all([
    prisma.persona.findMany({ select: { id: true, nombre: true, apodo: true, fotoUrl: true } }),
    prisma.foto.findMany({
      where: personaId ? { etiquetas: { some: { personaId } } } : undefined,
      // Primero las más recientes por fecha de la foto; las que no tienen
      // fecha, por cuándo se subieron.
      orderBy: [{ fecha: { sort: "desc", nulls: "last" } }, { createdAt: "desc" }],
      take: limite,
    }),
    prisma.foto.count({ where: personaId ? { etiquetas: { some: { personaId } } } : undefined }),
  ]);
  const opciones = personas
    .map((p) => ({ id: p.id, nombre: nombreMostrado(p), fotoUrl: p.fotoUrl }))
    .sort((a, b) => a.nombre.localeCompare(b.nombre, "es"));
  const filtrada = opciones.find((p) => p.id === personaId);
  const base = personaId ? `/album?persona=${personaId}&` : "/album?";

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 space-y-5">
      <h1 className="font-display text-3xl">📷 Álbum</h1>

      <AyudaRapida
        ancla="album"
        pasos={[
          <>Pulsa <strong>«Subir fotos»</strong> y elige una o varias de tu móvil.</>,
          "Escribe qué es, dónde y cuándo (si no te acuerdas del día exacto, pon uno aproximado).",
          "Toca el nombre de cada persona que sale para etiquetarla. Así aparecerá en su ficha.",
          "Toca una foto para verla en grande, editarla o descargarla.",
        ]}
      />

      <SubirFotosAlbum personas={opciones} />

      <details className="card p-4" open={!!filtrada}>
        <summary className="cursor-pointer text-crema/80">
          {filtrada ? (
            <>
              Viendo las fotos de <strong>{filtrada.nombre}</strong>
            </>
          ) : (
            "👤 Ver solo las fotos de alguien"
          )}
        </summary>
        <div className="mt-3 flex flex-wrap gap-2">
          {filtrada && (
            <Link href="/album" className="rounded-full border border-crema/20 px-3 py-1.5 text-sm hover:bg-crema/10">
              ✕ Ver todas
            </Link>
          )}
          {opciones.map((p) => (
            <Link
              key={p.id}
              href={`/album?persona=${p.id}`}
              className={`flex items-center gap-2 rounded-full border py-1 pl-1 pr-3 text-sm ${
                p.id === personaId ? "border-miel bg-miel/20" : "border-crema/15 hover:bg-crema/5"
              }`}
            >
              <Avatar nombre={p.nombre} fotoUrl={p.fotoUrl} size={26} />
              {p.nombre}
            </Link>
          ))}
        </div>
      </details>

      {fotos.length === 0 ? (
        <p className="card p-6 text-center text-crema/50">
          {filtrada ? `Todavía no hay fotos con ${filtrada.nombre} etiquetado.` : "Todavía no hay fotos. ¡Sube la primera!"}
        </p>
      ) : (
        <div className="grid grid-cols-3 gap-1 sm:grid-cols-4 md:grid-cols-5 sm:gap-1.5">
          {fotos.map((f) => (
            <EnlaceConCarga key={f.id} href={`/album/${f.id}`} className="block aspect-square overflow-hidden rounded-md bg-corteza">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={f.url} alt={f.pie ?? ""} loading="lazy" className="h-full w-full object-cover hover:scale-105 transition" />
            </EnlaceConCarga>
          ))}
        </div>
      )}

      {total > fotos.length && (
        <div className="text-center">
          <Link href={`${base}n=${limite + POR_PAGINA}`} scroll={false} className="boton-secundario">
            Ver más fotos ({total - fotos.length} más)
          </Link>
        </div>
      )}
    </div>
  );
}
