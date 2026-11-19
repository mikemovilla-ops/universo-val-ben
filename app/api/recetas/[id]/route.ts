import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { noAutorizado, viewerApi } from "@/lib/sesion";
import { puedeBorrarReceta, puedeRedactarRecetas } from "@/lib/permisos";
import { faltaParaTerminar, limpiarContenidoReceta } from "@/lib/recetas";
import { avisarRecetaLista } from "@/lib/email";

// accion "empezar": un padre/madre coge una receta del backlog (pasa a
//   "escribiéndose" y queda como su redactor).
// accion "guardar": guarda todo el contenido del editor. Con `terminar`
//   la marca como lista (y avisa a los hijos la primera vez).
export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const v = await viewerApi();
  if (v instanceof NextResponse) return v;
  if (!puedeRedactarRecetas(v)) return noAutorizado("Solo papá y mamá pueden escribir recetas.");

  const receta = await prisma.receta.findUnique({ where: { id: params.id } });
  if (!receta) return NextResponse.json({ error: "Esa receta ya no existe." }, { status: 404 });
  const body = (await req.json()) as Record<string, unknown>;

  if (body.accion === "empezar") {
    if (receta.estado === "PEDIDA") {
      await prisma.receta.update({
        where: { id: receta.id },
        data: { estado: "EN_CURSO", redactorId: v.personaId, empezadaAt: new Date() },
      });
    }
    return NextResponse.json({ ok: true });
  }

  if (body.accion !== "guardar") return NextResponse.json({ error: "Acción no válida." }, { status: 400 });

  const c = limpiarContenidoReceta(body);
  const terminar = body.terminar === true;
  if (terminar) {
    const falta = faltaParaTerminar(c);
    if (falta.length) {
      return NextResponse.json({ error: `Para terminarla falta ${falta.join(", ")}.` }, { status: 400 });
    }
  }
  if (!c.titulo) return NextResponse.json({ error: "La receta necesita un nombre." }, { status: 400 });

  const pasaALista = terminar && receta.estado !== "LISTA";
  await prisma.$transaction([
    prisma.ingrediente.deleteMany({ where: { recetaId: receta.id } }),
    prisma.paso.deleteMany({ where: { recetaId: receta.id } }),
    prisma.fotoReceta.deleteMany({ where: { recetaId: receta.id } }),
    prisma.receta.update({
      where: { id: receta.id },
      data: {
        titulo: c.titulo,
        categoria: c.categoria,
        raciones: c.raciones,
        tiempo: c.tiempo,
        consejos: c.consejos,
        fotoUrl: c.fotoUrl,
        // Guardar algo de una receta pedida la pone "escribiéndose".
        ...(receta.estado === "PEDIDA" ? { estado: "EN_CURSO" as const, empezadaAt: new Date() } : {}),
        ...(receta.redactorId ? {} : { redactorId: v.personaId }),
        ...(pasaALista ? { estado: "LISTA" as const, terminadaAt: new Date() } : {}),
        ingredientes: { create: c.ingredientes.map((i, orden) => ({ ...i, cantidad: i.cantidad || null, orden })) },
        pasos: { create: c.pasos.map((p, orden) => ({ texto: p.texto, fotoUrl: p.fotoUrl, orden })) },
        fotos: { create: c.fotos.map((f, orden) => ({ url: f.url, pie: f.pie || null, orden })) },
      },
    }),
  ]);

  if (pasaALista) {
    await avisarRecetaLista({ id: receta.id, titulo: c.titulo, redactor: v.nombre || "Alguien" });
  }
  return NextResponse.json({ ok: true, lista: pasaALista });
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const v = await viewerApi();
  if (v instanceof NextResponse) return v;
  const receta = await prisma.receta.findUnique({ where: { id: params.id } });
  if (!receta) return NextResponse.json({ ok: true });
  if (!puedeBorrarReceta(v, receta)) return noAutorizado();
  await prisma.receta.delete({ where: { id: receta.id } });
  return NextResponse.json({ ok: true });
}
