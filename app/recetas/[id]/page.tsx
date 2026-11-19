import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireViewer } from "@/lib/sesion";
import { nombreMostrado } from "@/lib/familia";
import { formatFechaInstante } from "@/lib/fechas";
import { puedeBorrarReceta, puedeRedactarRecetas } from "@/lib/permisos";
import EtiquetaEstado from "@/components/EtiquetaEstado";
import ListaIngredientes from "@/components/ListaIngredientes";
import BotonAccion from "@/components/BotonAccion";

export const dynamic = "force-dynamic";

export default async function VerReceta({ params }: { params: { id: string } }) {
  const v = await requireViewer();
  const r = await prisma.receta.findUnique({
    where: { id: params.id },
    include: {
      pedidaPor: true,
      redactor: true,
      ingredientes: { orderBy: { orden: "asc" } },
      pasos: { orderBy: { orden: "asc" } },
      fotos: { orderBy: { orden: "asc" } },
    },
  });
  if (!r) notFound();
  const redacta = puedeRedactarRecetas(v);
  const tieneContenido = r.ingredientes.length > 0 || r.pasos.length > 0;

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 space-y-5">
      <Link href={`/recetas?estado=${r.estado}`} className="text-sm text-crema/50 hover:text-crema">
        ← Volver a recetas
      </Link>

      <section className="card overflow-hidden">
        {r.fotoUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={r.fotoUrl} alt={r.titulo} className="max-h-96 w-full object-cover" />
        )}
        <div className="p-5 space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <EtiquetaEstado estado={r.estado} />
            {r.categoria && <span className="text-xs text-crema/50">{r.categoria}</span>}
          </div>
          <h1 className="font-display text-3xl">{r.titulo}</h1>
          {(r.raciones || r.tiempo) && (
            <p className="flex flex-wrap gap-4 text-crema/70">
              {r.raciones && <span>👥 {r.raciones}</span>}
              {r.tiempo && <span>⏱️ {r.tiempo}</span>}
            </p>
          )}
          <div className="text-sm text-crema/55 space-y-0.5">
            {r.pedidaPor && (
              <p>
                🙋 Pedida por {nombreMostrado(r.pedidaPor)} el {formatFechaInstante(r.createdAt)}
              </p>
            )}
            {r.redactor && (
              <p>
                ✍️ {r.estado === "LISTA" ? "Escrita" : "La está escribiendo"} {nombreMostrado(r.redactor)}
                {r.terminadaAt && ` · terminada el ${formatFechaInstante(r.terminadaAt)}`}
              </p>
            )}
          </div>
          {r.nota && (
            <p className="rounded-xl bg-nogaldark/60 p-3 text-crema/80 italic">
              «{r.nota}»{r.pedidaPor && <span className="not-italic text-crema/40"> — {nombreMostrado(r.pedidaPor)}</span>}
            </p>
          )}
        </div>
      </section>

      {/* Acciones según el estado */}
      {redacta && r.estado === "PEDIDA" && (
        <div className="card p-5 space-y-3 border-miel/40">
          <p>Nadie ha empezado esta receta todavía.</p>
          <BotonAccion
            url={`/api/recetas/${r.id}`}
            metodo="PATCH"
            cuerpo={{ accion: "empezar" }}
            irA={`/recetas/${r.id}/editar`}
            className="boton text-lg w-full sm:w-auto"
          >
            ✍️ Empezar a escribirla
          </BotonAccion>
        </div>
      )}
      {redacta && r.estado === "EN_CURSO" && (
        <Link href={`/recetas/${r.id}/editar`} className="boton text-lg w-full sm:w-auto">
          ✍️ Seguir escribiéndola
        </Link>
      )}
      {!redacta && r.estado !== "LISTA" && (
        <p className="card p-4 text-crema/60">
          {r.estado === "PEDIDA"
            ? "📋 Está en la lista de pedidas. Te avisaremos por email cuando esté lista."
            : "✍️ Se está escribiendo. Te avisaremos por email cuando esté lista."}
        </p>
      )}

      {tieneContenido && (
        <>
          <section className="card p-5 space-y-3">
            <h2 className="font-display text-2xl">🧺 Ingredientes</h2>
            {r.ingredientes.length ? (
              <ListaIngredientes ingredientes={r.ingredientes} />
            ) : (
              <p className="text-crema/40">Todavía sin ingredientes.</p>
            )}
          </section>

          <section className="card p-5 space-y-4">
            <h2 className="font-display text-2xl">👩‍🍳 Pasos</h2>
            {r.pasos.length === 0 && <p className="text-crema/40">Todavía sin pasos.</p>}
            <ol className="space-y-5">
              {r.pasos.map((p, i) => (
                <li key={p.id} className="flex gap-3">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-miel font-display font-semibold text-nogaldark">
                    {i + 1}
                  </span>
                  <div className="flex-1 space-y-2 pt-1">
                    <p className="whitespace-pre-line leading-relaxed">{p.texto}</p>
                    {p.fotoUrl && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={p.fotoUrl} alt={`Paso ${i + 1}`} loading="lazy" className="max-h-72 rounded-xl object-cover" />
                    )}
                  </div>
                </li>
              ))}
            </ol>
          </section>
        </>
      )}

      {r.consejos && (
        <section className="card p-5 space-y-2">
          <h2 className="font-display text-xl">💡 Consejos y trucos</h2>
          <p className="whitespace-pre-line">{r.consejos}</p>
        </section>
      )}

      {r.fotos.length > 0 && (
        <section className="card p-5 space-y-3">
          <h2 className="font-display text-xl">📷 Más fotos</h2>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {r.fotos.map((f) => (
              <figure key={f.id} className="space-y-1">
                <a href={f.url} target="_blank" rel="noreferrer">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={f.url} alt={f.pie ?? ""} loading="lazy" className="aspect-square w-full rounded-xl object-cover" />
                </a>
                {f.pie && <figcaption className="text-xs text-crema/60">{f.pie}</figcaption>}
              </figure>
            ))}
          </div>
        </section>
      )}

      <div className="flex flex-wrap gap-2 pt-2">
        {redacta && r.estado === "LISTA" && (
          <Link href={`/recetas/${r.id}/editar`} className="boton-secundario">
            ✏️ Editar receta
          </Link>
        )}
        {puedeBorrarReceta(v, r) && (
          <BotonAccion
            url={`/api/recetas/${r.id}`}
            metodo="DELETE"
            confirmar={`¿Borrar la receta «${r.titulo}»? No se puede deshacer.`}
            irA="/recetas"
            className="boton-peligro"
          >
            🗑️ Borrar
          </BotonAccion>
        )}
      </div>
    </div>
  );
}
