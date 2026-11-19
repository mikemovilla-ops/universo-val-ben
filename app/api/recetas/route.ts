import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { noAutorizado, viewerApi } from "@/lib/sesion";
import { puedePedirRecetas, puedeRedactarRecetas } from "@/lib/permisos";
import { avisarRecetaPedida } from "@/lib/email";

// Dos formas de crear una receta:
//  - accion "pedir": alguien la pide → va al backlog (PEDIDA) y se avisa a
//    los padres y al admin.
//  - accion "escribir": un padre/madre escribe una nueva por su cuenta →
//    directamente "escribiéndose" (EN_CURSO), sin aviso.
export async function POST(req: Request) {
  const v = await viewerApi();
  if (v instanceof NextResponse) return v;

  const body = (await req.json()) as Record<string, unknown>;
  const titulo = typeof body.titulo === "string" ? body.titulo.trim().slice(0, 200) : "";
  if (!titulo) return NextResponse.json({ error: "Escribe qué receta es." }, { status: 400 });

  if (body.accion === "escribir") {
    if (!puedeRedactarRecetas(v)) return noAutorizado();
    const r = await prisma.receta.create({
      data: { titulo, estado: "EN_CURSO", redactorId: v.personaId, empezadaAt: new Date() },
    });
    return NextResponse.json({ id: r.id });
  }

  if (!puedePedirRecetas(v)) return noAutorizado();
  const nota = typeof body.nota === "string" ? body.nota.trim().slice(0, 1000) || null : null;
  const r = await prisma.receta.create({
    data: { titulo, nota, estado: "PEDIDA", pedidaPorId: v.personaId },
  });
  await avisarRecetaPedida({ id: r.id, titulo, nota, pedidaPor: v.nombre || "Alguien" });
  return NextResponse.json({ id: r.id });
}
