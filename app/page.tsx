import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getViewer } from "@/lib/sesion";
import { nombreMostrado } from "@/lib/familia";
import { formatDiaMes, hoyMadrid, proximoCumpleanos, textoDiasHasta } from "@/lib/fechas";
import { puedeRedactarRecetas } from "@/lib/permisos";
import { enlaceWhatsapp } from "@/lib/vista";
import Logo from "@/components/Logo";
import Avatar from "@/components/Avatar";
import BotonEntrarGoogle from "@/components/BotonEntrarGoogle";
import EnlaceConCarga from "@/components/EnlaceConCarga";
import EtiquetaEstado from "@/components/EtiquetaEstado";

export const dynamic = "force-dynamic";

const DIAS_PROXIMOS = 45;

export default async function Inicio() {
  const v = await getViewer();

  if (!v) {
    return (
      <div className="max-w-md mx-auto px-4 py-12 text-center space-y-6">
        <Logo size={180} className="mx-auto shadow-xl shadow-black/40" />
        <h1 className="font-display text-4xl">
          Universo <span className="text-mielbrillante">Val-Ben</span>
        </h1>
        <p className="text-crema/70 text-lg">El árbol de la familia, las recetas de casa y nuestras fotos, todo en un sitio.</p>
        <BotonEntrarGoogle />
        <p className="text-crema/40 text-sm">Solo pueden entrar los miembros de la familia, con su cuenta de Google.</p>
      </div>
    );
  }

  const hoy = hoyMadrid();
  const [personas, pedidas, misPeticiones, ultimasFotos] = await Promise.all([
    prisma.persona.findMany({
      where: { fechaNacimiento: { not: null }, fechaFallecimiento: null },
      select: { id: true, nombre: true, apodo: true, fotoUrl: true, fechaNacimiento: true, telefono: true },
    }),
    prisma.receta.count({ where: { estado: "PEDIDA" } }),
    v.personaId
      ? prisma.receta.findMany({
          where: { pedidaPorId: v.personaId },
          orderBy: { updatedAt: "desc" },
          take: 4,
          select: { id: true, titulo: true, estado: true },
        })
      : Promise.resolve([]),
    prisma.foto.findMany({ orderBy: { createdAt: "desc" }, take: 8, select: { id: true, url: true, pie: true } }),
  ]);

  const cumples = personas
    .map((p) => ({ ...p, ...proximoCumpleanos(p.fechaNacimiento!, hoy) }))
    .filter((p) => p.dias <= DIAS_PROXIMOS)
    .sort((a, b) => a.dias - b.dias);
  const deHoy = cumples.filter((c) => c.dias === 0);
  const proximos = cumples.filter((c) => c.dias > 0).slice(0, 4);
  const redacta = puedeRedactarRecetas(v);

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 space-y-5">
      <h1 className="font-display text-3xl">¡Hola{v.nombre ? `, ${v.nombre.split(" ")[0]}` : ""}! 👋</h1>

      {!v.personaId && v.isAdmin && (
        <div className="card p-4 border-miel/40">
          Eres administrador pero todavía no estás en el árbol.{" "}
          <Link href="/familia/nueva" className="text-mielbrillante underline">
            Añade a la familia
          </Link>{" "}
          (empezando por ti, con tu email de Google).
        </div>
      )}

      {/* Cumpleaños de hoy: lo primero y bien grande */}
      {deHoy.map((c) => {
        const wa = c.telefono ? enlaceWhatsapp(c.telefono) : null;
        return (
          <section key={c.id} className="card p-5 border-miel/50 bg-gradient-to-br from-burdeos/60 to-corteza/80 text-center space-y-3">
            <p className="text-4xl">🎂🎉</p>
            <Link href={`/familia/${c.id}`} className="inline-block">
              <Avatar nombre={nombreMostrado(c)} fotoUrl={c.fotoUrl} size={96} className="ring-4 ring-miel mx-auto" />
            </Link>
            <h2 className="font-display text-2xl">¡Hoy es el cumpleaños de {nombreMostrado(c)}!</h2>
            <p className="text-crema/80 text-lg">Cumple {c.edad} años</p>
            {c.telefono && (
              <div className="flex flex-wrap justify-center gap-2">
                <a href={`tel:${c.telefono.replace(/\s/g, "")}`} className="boton">
                  📞 Llamar para felicitar
                </a>
                {wa && (
                  <a href={wa} target="_blank" rel="noreferrer" className="boton-secundario">
                    💬 WhatsApp
                  </a>
                )}
              </div>
            )}
          </section>
        );
      })}

      {/* Accesos grandes a las secciones */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { href: "/familia", emoji: "🌳", titulo: "Familia" },
          { href: "/recetas", emoji: "🍲", titulo: "Recetas" },
          { href: "/album", emoji: "📷", titulo: "Álbum" },
        ].map((s) => (
          <EnlaceConCarga key={s.href} href={s.href} className="card flex flex-col items-center gap-1 py-5 hover:bg-corteza">
            <span className="text-4xl">{s.emoji}</span>
            <span className="font-display text-lg">{s.titulo}</span>
          </EnlaceConCarga>
        ))}
      </div>

      {redacta && pedidas > 0 && (
        <EnlaceConCarga href="/recetas?estado=PEDIDA" className="card block p-4 border-miel/40 hover:bg-corteza">
          <p className="text-lg">
            📋 Hay <strong>{pedidas}</strong> receta{pedidas === 1 ? "" : "s"} pedida{pedidas === 1 ? "" : "s"} esperando a que
            la{pedidas === 1 ? "" : "s"} escribáis.
          </p>
          <p className="text-mielbrillante text-sm mt-1">Ver las recetas pedidas →</p>
        </EnlaceConCarga>
      )}

      {proximos.length > 0 && (
        <section className="card p-4 space-y-2">
          <h2 className="font-display text-xl">🎈 Próximos cumpleaños</h2>
          <ul>
            {proximos.map((c) => (
              <li key={c.id}>
                <EnlaceConCarga href={`/familia/${c.id}`} className="flex items-center gap-3 rounded-xl p-2 hover:bg-crema/5">
                  <Avatar nombre={nombreMostrado(c)} fotoUrl={c.fotoUrl} size={42} />
                  <span className="flex-1">
                    <span className="block">{nombreMostrado(c)}</span>
                    <span className="block text-sm text-crema/50">
                      {formatDiaMes(c.fechaNacimiento!)} · cumple {c.edad}
                    </span>
                  </span>
                  <span className="text-sm text-mielbrillante">{textoDiasHasta(c.dias)}</span>
                </EnlaceConCarga>
              </li>
            ))}
          </ul>
        </section>
      )}

      {misPeticiones.length > 0 && (
        <section className="card p-4 space-y-2">
          <h2 className="font-display text-xl">🙋 Recetas que has pedido</h2>
          <ul>
            {misPeticiones.map((r) => (
              <li key={r.id}>
                <EnlaceConCarga href={`/recetas/${r.id}`} className="flex items-center justify-between gap-2 rounded-xl p-2 hover:bg-crema/5">
                  <span>{r.titulo}</span>
                  <EtiquetaEstado estado={r.estado} />
                </EnlaceConCarga>
              </li>
            ))}
          </ul>
        </section>
      )}

      {ultimasFotos.length > 0 && (
        <section className="card p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-xl">📷 Últimas fotos</h2>
            <Link href="/album" className="text-sm text-mielbrillante underline">
              Ver álbum
            </Link>
          </div>
          <div className="grid grid-cols-4 gap-1.5">
            {ultimasFotos.map((f) => (
              <EnlaceConCarga key={f.id} href={`/album/${f.id}`} className="block aspect-square overflow-hidden rounded-md">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={f.url} alt={f.pie ?? ""} loading="lazy" className="h-full w-full object-cover" />
              </EnlaceConCarga>
            ))}
          </div>
        </section>
      )}

      <p className="text-center text-sm text-crema/40">
        ¿Primera vez por aquí?{" "}
        <Link href="/ayuda" className="underline hover:text-crema/70">
          Mira cómo funciona
        </Link>
      </p>
    </div>
  );
}
