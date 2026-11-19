import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireViewer } from "@/lib/sesion";
import { nombreMostrado } from "@/lib/familia";
import { aYMD, formatFechaInstante, formatFechaLarga } from "@/lib/fechas";
import { puedeBorrarFoto } from "@/lib/permisos";
import Avatar from "@/components/Avatar";
import EditarFoto from "@/components/EditarFoto";
import BotonAccion from "@/components/BotonAccion";
import EnlaceConCarga from "@/components/EnlaceConCarga";

export const dynamic = "force-dynamic";

export default async function VerFoto({ params }: { params: { id: string } }) {
  const v = await requireViewer();
  const [foto, personas] = await Promise.all([
    prisma.foto.findUnique({
      where: { id: params.id },
      include: { subidaPor: true, etiquetas: { include: { persona: true } } },
    }),
    prisma.persona.findMany({ select: { id: true, nombre: true, apodo: true, fotoUrl: true } }),
  ]);
  if (!foto) notFound();
  const opciones = personas
    .map((p) => ({ id: p.id, nombre: nombreMostrado(p), fotoUrl: p.fotoUrl }))
    .sort((a, b) => a.nombre.localeCompare(b.nombre, "es"));

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-4">
      <Link href="/album" className="text-sm text-crema/50 hover:text-crema">
        ← Volver al álbum
      </Link>

      <figure className="card overflow-hidden">
        <a href={foto.url} target="_blank" rel="noreferrer">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={foto.url} alt={foto.pie ?? "Foto"} className="max-h-[75vh] w-full bg-nogaldark object-contain" />
        </a>
        <figcaption className="p-5 space-y-3">
          {foto.pie && <p className="text-lg whitespace-pre-line">{foto.pie}</p>}
          {(foto.lugar || foto.fecha) && (
            <p className="text-crema/70">
              {foto.lugar && <>📍 {foto.lugar}</>}
              {foto.lugar && foto.fecha && " · "}
              {foto.fecha && <>📅 {formatFechaLarga(foto.fecha)}</>}
            </p>
          )}
          {foto.etiquetas.length > 0 && (
            <div className="space-y-1.5">
              <p className="text-sm text-crema/50">Salen:</p>
              <div className="flex flex-wrap gap-2">
                {foto.etiquetas.map((e) => (
                  <EnlaceConCarga
                    key={e.personaId}
                    href={`/familia/${e.personaId}`}
                    className="flex items-center gap-2 rounded-full bg-nogaldark/60 py-1 pl-1 pr-3 hover:bg-crema/10"
                  >
                    <Avatar nombre={nombreMostrado(e.persona)} fotoUrl={e.persona.fotoUrl} size={28} />
                    <span className="text-sm">{nombreMostrado(e.persona)}</span>
                  </EnlaceConCarga>
                ))}
              </div>
            </div>
          )}
          <p className="text-xs text-crema/35">
            Subida {foto.subidaPor ? `por ${nombreMostrado(foto.subidaPor)} ` : ""}el {formatFechaInstante(foto.createdAt)}
          </p>
        </figcaption>
      </figure>

      <div className="flex flex-wrap gap-2">
        <EditarFoto
          id={foto.id}
          personas={opciones}
          inicial={{
            pie: foto.pie ?? "",
            lugar: foto.lugar ?? "",
            fecha: foto.fecha ? aYMD(foto.fecha) : "",
            personas: foto.etiquetas.map((e) => e.personaId),
          }}
        />
        <a href={foto.url} download target="_blank" rel="noreferrer" className="boton-secundario">
          ⬇️ Abrir / descargar
        </a>
        {puedeBorrarFoto(v, foto.subidaPorId) && (
          <BotonAccion
            url={`/api/fotos/${foto.id}`}
            metodo="DELETE"
            confirmar="¿Borrar esta foto del álbum? No se puede deshacer."
            irA="/album"
            className="boton-peligro"
          >
            🗑️ Borrar
          </BotonAccion>
        )}
      </div>
    </div>
  );
}
