import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { cargarFamilia, requireViewer } from "@/lib/sesion";
import { nombreCompleto, nombreMostrado } from "@/lib/familia";
import { edad, formatFechaInstante, formatFechaLarga, hoyMadrid, proximoCumpleanos, textoDiasHasta, aYMD } from "@/lib/fechas";
import {
  puedeBorrarRecuerdo,
  puedeEditarPersona,
  puedeEscribirRecuerdos,
  puedeGestionarFamilia,
} from "@/lib/permisos";
import { enlaceWhatsapp } from "@/lib/vista";
import Avatar from "@/components/Avatar";
import EnlaceConCarga from "@/components/EnlaceConCarga";
import HitosPersona from "@/components/HitosPersona";
import RecuerdosPersona from "@/components/RecuerdosPersona";
import BotonAccion from "@/components/BotonAccion";

export const dynamic = "force-dynamic";

const ROL_TEXTO = { PADRE: "Padre / Madre", HIJO: "Hijo / Hija", FAMILIAR: "Familia" } as const;

export default async function FichaPersona({ params }: { params: { id: string } }) {
  const v = await requireViewer();
  const [persona, familia, todas] = await Promise.all([
    prisma.persona.findUnique({
      where: { id: params.id },
      include: {
        hitos: { include: { autor: true }, orderBy: { createdAt: "asc" } },
        recuerdos: { include: { autor: true }, orderBy: { createdAt: "desc" } },
        etiquetas: { include: { foto: true }, orderBy: { foto: { createdAt: "desc" } }, take: 12 },
        _count: { select: { etiquetas: true } },
      },
    }),
    cargarFamilia(),
    prisma.persona.findMany({ select: { id: true, nombre: true, apodo: true, fotoUrl: true } }),
  ]);
  if (!persona) notFound();

  const porId = new Map(todas.map((p) => [p.id, p]));
  const hoy = hoyMadrid();
  const nombre = nombreMostrado(persona);
  const vivo = !persona.fechaFallecimiento;
  const cumple = persona.fechaNacimiento && vivo ? proximoCumpleanos(persona.fechaNacimiento, hoy) : null;
  const anos = persona.fechaNacimiento
    ? edad(persona.fechaNacimiento, persona.fechaFallecimiento ? aYMD(persona.fechaFallecimiento) : hoy)
    : null;
  const whatsapp = persona.telefono ? enlaceWhatsapp(persona.telefono) : null;
  const puedeEscribir = puedeEscribirRecuerdos(v, persona.id, familia);
  const admin = puedeGestionarFamilia(v);

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 space-y-5">
      <Link href="/familia" className="text-sm text-crema/50 hover:text-crema">
        ← Volver al árbol
      </Link>

      {/* Cabecera */}
      <section className="card p-5 flex flex-col items-center text-center gap-3 sm:flex-row sm:text-left sm:items-center sm:gap-5">
        <Avatar
          nombre={nombre}
          fotoUrl={persona.fotoUrl}
          size={120}
          className={`ring-4 ${persona.esNucleo ? "ring-miel" : "ring-crema/20"} ${vivo ? "" : "grayscale"}`}
        />
        <div className="space-y-1 flex-1">
          <h1 className="font-display text-3xl">
            {nombre}
            {!vivo && <span className="text-crema/50"> ✝</span>}
          </h1>
          {(persona.apodo || persona.apellidos) && <p className="text-crema/60">{nombreCompleto(persona)}</p>}
          <p className="text-xs uppercase tracking-wide text-crema/40">{ROL_TEXTO[persona.rol]}</p>
          {cumple?.dias === 0 && (
            <p className="text-lg text-mielbrillante font-semibold">🎂 ¡Hoy cumple {cumple.edad} años!</p>
          )}
        </div>
      </section>

      {/* Datos */}
      <section className="card p-5 space-y-3">
        <h2 className="font-display text-xl">Datos</h2>
        <dl className="grid gap-3 sm:grid-cols-2">
          {persona.fechaNacimiento && (
            <div>
              <dt className="text-sm text-crema/50">Nació el</dt>
              <dd>
                {formatFechaLarga(persona.fechaNacimiento)}
                {anos !== null && <span className="text-crema/60"> ({anos} años)</span>}
              </dd>
              {cumple && cumple.dias > 0 && (
                <dd className="text-sm text-crema/50">
                  🎂 Cumple {cumple.edad} {textoDiasHasta(cumple.dias)}
                </dd>
              )}
            </div>
          )}
          {persona.fechaFallecimiento && (
            <div>
              <dt className="text-sm text-crema/50">Falleció el</dt>
              <dd>{formatFechaLarga(persona.fechaFallecimiento)}</dd>
            </div>
          )}
          {persona.lugarNacimiento && (
            <div>
              <dt className="text-sm text-crema/50">Lugar de nacimiento</dt>
              <dd>{persona.lugarNacimiento}</dd>
            </div>
          )}
          {persona.telefono && (
            <div>
              <dt className="text-sm text-crema/50">Teléfono</dt>
              <dd className="flex flex-wrap items-center gap-2">
                <span>{persona.telefono}</span>
                <a href={`tel:${persona.telefono.replace(/\s/g, "")}`} className="boton-secundario py-1 px-3 text-sm">
                  📞 Llamar
                </a>
                {whatsapp && (
                  <a href={whatsapp} target="_blank" rel="noreferrer" className="boton-secundario py-1 px-3 text-sm">
                    💬 WhatsApp
                  </a>
                )}
              </dd>
            </div>
          )}
          {persona.email && (
            <div>
              <dt className="text-sm text-crema/50">Email</dt>
              <dd className="break-all">
                <a href={`mailto:${persona.email}`} className="underline decoration-crema/30">
                  {persona.email}
                </a>
              </dd>
            </div>
          )}
        </dl>
        {persona.sobreMi && <p className="whitespace-pre-line text-crema/85 border-t border-crema/10 pt-3">{persona.sobreMi}</p>}
        {!persona.fechaNacimiento && !persona.telefono && !persona.sobreMi && (
          <p className="text-crema/40 text-sm">Todavía no hay datos.</p>
        )}
        <div className="flex flex-wrap gap-2 pt-1">
          {puedeEditarPersona(v, persona.id) && (
            <Link href={`/familia/${persona.id}/editar`} className="boton-secundario text-sm py-2">
              ✏️ Editar datos
            </Link>
          )}
        </div>
      </section>

      {/* Relaciones */}
      <section className="card p-5 space-y-4">
        <h2 className="font-display text-xl">Su familia</h2>
        {familia.relaciones(persona.id).length === 0 && <p className="text-crema/40 text-sm">Sin relaciones todavía.</p>}
        {familia.relaciones(persona.id).map((g) => (
          <div key={g.etiqueta}>
            <h3 className="text-sm text-crema/50 mb-1.5">{g.etiqueta}</h3>
            <div className="flex flex-wrap gap-2">
              {g.ids.map((id) => {
                const p = porId.get(id);
                if (!p) return null;
                return (
                  <EnlaceConCarga
                    key={id}
                    href={`/familia/${id}`}
                    className="flex items-center gap-2 rounded-full bg-nogaldark/60 py-1 pl-1 pr-3 hover:bg-crema/10"
                  >
                    <Avatar nombre={nombreMostrado(p)} fotoUrl={p.fotoUrl} size={30} />
                    <span className="text-sm">{nombreMostrado(p)}</span>
                  </EnlaceConCarga>
                );
              })}
            </div>
          </div>
        ))}
        {admin && (
          <div className="flex flex-wrap gap-2 border-t border-crema/10 pt-3">
            <Link href={`/familia/nueva?padre=${persona.id}`} className="boton-secundario text-sm py-2">
              ➕ Añadir hijo/a
            </Link>
            {!persona.parejaId && (
              <Link href={`/familia/nueva?pareja=${persona.id}`} className="boton-secundario text-sm py-2">
                ➕ Añadir pareja
              </Link>
            )}
          </div>
        )}
      </section>

      {/* Hitos */}
      <section className="card p-5 space-y-2">
        <h2 className="font-display text-xl">⭐ Hitos</h2>
        {puedeEscribir && (
          <p className="text-sm text-crema/50">Toca «Rellenar» en cualquiera y escribe cuándo fue (como lo recuerdes).</p>
        )}
        <HitosPersona
          personaId={persona.id}
          puedeEditar={puedeEscribir}
          hitos={persona.hitos.map((h) => ({
            id: h.id,
            clave: h.clave,
            titulo: h.titulo,
            valor: h.valor,
            detalle: h.detalle,
            autor: h.autor ? nombreMostrado(h.autor) : null,
          }))}
        />
      </section>

      {/* Anécdotas y curiosidades */}
      <section className="card p-5 space-y-3">
        <h2 className="font-display text-xl">📖 Anécdotas y curiosidades</h2>
        <RecuerdosPersona
          personaId={persona.id}
          puedeEscribir={puedeEscribir}
          recuerdos={persona.recuerdos.map((r) => ({
            id: r.id,
            tipo: r.tipo,
            texto: r.texto,
            autor: r.autor ? nombreMostrado(r.autor) : null,
            fecha: formatFechaInstante(r.createdAt),
            puedeBorrar: puedeBorrarRecuerdo(v, r.autorId),
          }))}
        />
      </section>

      {/* Fotos */}
      <section className="card p-5 space-y-3">
        <div className="flex items-center justify-between gap-2">
          <h2 className="font-display text-xl">📷 Fotos en las que sale</h2>
          {persona._count.etiquetas > 0 && (
            <Link href={`/album?persona=${persona.id}`} className="text-sm text-mielbrillante underline">
              Ver las {persona._count.etiquetas}
            </Link>
          )}
        </div>
        {persona.etiquetas.length === 0 ? (
          <p className="text-crema/40 text-sm">
            Todavía no está etiquetado en ninguna foto. Al subir fotos al Álbum, toca su nombre para etiquetarle.
          </p>
        ) : (
          <div className="grid grid-cols-3 gap-1.5 sm:grid-cols-4">
            {persona.etiquetas.map((e) => (
              <EnlaceConCarga key={e.fotoId} href={`/album/${e.fotoId}`} className="block aspect-square overflow-hidden rounded-lg">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={e.foto.url} alt={e.foto.pie ?? ""} loading="lazy" className="h-full w-full object-cover" />
              </EnlaceConCarga>
            ))}
          </div>
        )}
      </section>

      {admin && (
        <div className="pt-2">
          <BotonAccion
            url={`/api/personas/${persona.id}`}
            metodo="DELETE"
            confirmar={`¿Seguro que quieres quitar a ${nombre} del árbol? Se borrarán sus hitos y anécdotas (las fotos y recetas se quedan).`}
            irA="/familia"
            className="boton-peligro text-sm"
          >
            🗑️ Quitar del árbol
          </BotonAccion>
        </div>
      )}
    </div>
  );
}
