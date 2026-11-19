import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireViewer } from "@/lib/sesion";
import { nombreMostrado } from "@/lib/familia";
import { formatFechaInstante } from "@/lib/fechas";
import { coincideBusqueda, ESTADOS_RECETA, esEstadoReceta, type EstadoRecetaTipo } from "@/lib/recetas";
import { puedePedirRecetas, puedeRedactarRecetas } from "@/lib/permisos";
import AyudaRapida from "@/components/AyudaRapida";
import NuevaReceta from "@/components/NuevaReceta";
import EtiquetaEstado from "@/components/EtiquetaEstado";
import EnlaceConCarga from "@/components/EnlaceConCarga";

export const dynamic = "force-dynamic";

export default async function Recetas({ searchParams }: { searchParams: { estado?: string; q?: string } }) {
  const v = await requireViewer();
  const redacta = puedeRedactarRecetas(v);
  const q = (searchParams.q ?? "").trim();

  // Son como mucho unos cientos: se cargan todas y se filtra aquí, para
  // poder buscar sin que importen las tildes (ver coincideBusqueda).
  const todas = await prisma.receta.findMany({
    orderBy: { updatedAt: "desc" },
    include: {
      pedidaPor: { select: { nombre: true, apodo: true } },
      redactor: { select: { nombre: true, apodo: true } },
      ingredientes: { select: { nombre: true } },
      pasos: q ? { select: { texto: true } } : false,
    },
  });

  const cuenta = (e: EstadoRecetaTipo) => todas.filter((r) => r.estado === e).length;
  // Por defecto: a papá y mamá les sale primero lo pedido (si hay algo), al
  // resto las listas.
  const estado: EstadoRecetaTipo = esEstadoReceta(searchParams.estado)
    ? searchParams.estado
    : redacta && cuenta("PEDIDA") > 0
      ? "PEDIDA"
      : "LISTA";

  const visibles = q
    ? todas.filter((r) =>
        coincideBusqueda(
          {
            titulo: r.titulo,
            nota: r.nota,
            categoria: r.categoria,
            ingredientes: r.ingredientes.map((i) => i.nombre),
            pasos: (r.pasos ?? []).map((p) => p.texto),
          },
          q
        )
      )
    : todas.filter((r) => r.estado === estado);

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 space-y-5">
      <h1 className="font-display text-3xl">🍲 Recetas</h1>

      <AyudaRapida
        ancla="recetas"
        pasos={[
          <>Los hijos piden una receta con <strong>«Pedir una receta»</strong>. Va a la lista de <strong>Pedidas</strong>.</>,
          <>Papá o mamá entran en una pedida y pulsan <strong>«Empezar a escribirla»</strong>: pasa a <strong>Escribiéndose</strong>.</>,
          <>Se escriben primero los ingredientes y luego los pasos. Se puede guardar a medias y seguir otro día.</>,
          <>Al pulsar <strong>«Terminada»</strong> pasa a <strong>Listas</strong> y avisamos por email a quien la pidió.</>,
          <>Usa el buscador para encontrar una receta por su nombre o por un ingrediente.</>,
        ]}
      />

      <NuevaReceta puedePedir={puedePedirRecetas(v)} puedeEscribir={redacta} />

      <form action="/recetas" className="flex gap-2">
        <input
          type="search"
          name="q"
          defaultValue={q}
          placeholder="🔍 Buscar: nombre, ingrediente…"
          className="campo flex-1"
        />
        <button type="submit" className="boton-secundario">
          Buscar
        </button>
      </form>

      {q ? (
        <p className="text-crema/60">
          {visibles.length === 0 ? "No hay ninguna receta" : `${visibles.length} receta${visibles.length === 1 ? "" : "s"}`}{" "}
          con «{q}».{" "}
          <Link href="/recetas" className="text-mielbrillante underline">
            Quitar búsqueda
          </Link>
        </p>
      ) : (
        <div className="grid grid-cols-3 gap-2">
          {ESTADOS_RECETA.map((e) => (
            <Link
              key={e.valor}
              href={`/recetas?estado=${e.valor}`}
              className={`rounded-2xl border px-2 py-3 text-center transition ${
                estado === e.valor ? e.clase + " font-semibold" : "border-crema/10 text-crema/60 hover:bg-crema/5"
              }`}
            >
              <span className="block text-xl">{e.emoji}</span>
              <span className="block text-sm">{e.titulo}</span>
              <span className="block text-xs opacity-70">{cuenta(e.valor)}</span>
            </Link>
          ))}
        </div>
      )}

      {!q && <p className="text-sm text-crema/50">{ESTADOS_RECETA.find((e) => e.valor === estado)!.explicacion}</p>}

      <ul className="space-y-2">
        {visibles.length === 0 && !q && <li className="card p-5 text-center text-crema/50">No hay ninguna aquí.</li>}
        {visibles.map((r) => (
          <li key={r.id}>
            <EnlaceConCarga href={`/recetas/${r.id}`} className="card flex gap-3 p-3 hover:bg-corteza">
              {r.fotoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={r.fotoUrl} alt="" loading="lazy" className="h-20 w-20 shrink-0 rounded-xl object-cover" />
              ) : (
                <span className="flex h-20 w-20 shrink-0 items-center justify-center rounded-xl bg-nogaldark/60 text-3xl">
                  🍽️
                </span>
              )}
              <div className="min-w-0 flex-1 space-y-1">
                <div className="flex items-start justify-between gap-2">
                  <h2 className="font-display text-lg leading-tight">{r.titulo}</h2>
                  {q && <EtiquetaEstado estado={r.estado} />}
                </div>
                {r.categoria && <p className="text-xs text-crema/50">{r.categoria}</p>}
                <p className="text-sm text-crema/60">
                  {r.pedidaPor && <>🙋 Pedida por {nombreMostrado(r.pedidaPor)}</>}
                  {r.pedidaPor && r.redactor && " · "}
                  {r.redactor && <>✍️ {r.estado === "LISTA" ? "Escrita" : "La escribe"} {nombreMostrado(r.redactor)}</>}
                </p>
                <p className="text-xs text-crema/35">
                  {r.estado === "PEDIDA"
                    ? `Pedida el ${formatFechaInstante(r.createdAt)}`
                    : r.estado === "LISTA" && r.terminadaAt
                      ? `Terminada el ${formatFechaInstante(r.terminadaAt)}`
                      : `Última modificación: ${formatFechaInstante(r.updatedAt)}`}
                </p>
              </div>
            </EnlaceConCarga>
          </li>
        ))}
      </ul>
    </div>
  );
}
