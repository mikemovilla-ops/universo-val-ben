import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cargarFamilia, noAutorizado, viewerApi } from "@/lib/sesion";
import { puedeEscribirRecuerdos } from "@/lib/permisos";

async function cargar(id: string) {
  return prisma.hito.findUnique({ where: { id }, select: { personaId: true, clave: true } });
}

// Editar un hito propio (los predefinidos se editan con el POST de la
// persona, por su clave).
export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const v = await viewerApi();
  if (v instanceof NextResponse) return v;
  const hito = await cargar(params.id);
  if (!hito) return NextResponse.json({ error: "No existe." }, { status: 404 });
  if (!puedeEscribirRecuerdos(v, hito.personaId, await cargarFamilia())) return noAutorizado();

  const body = (await req.json()) as Record<string, unknown>;
  const valor = typeof body.valor === "string" ? body.valor.trim().slice(0, 300) : "";
  if (!valor) return NextResponse.json({ error: "Escribe cuándo o cómo fue." }, { status: 400 });
  const titulo = typeof body.titulo === "string" ? body.titulo.trim().slice(0, 120) : "";
  await prisma.hito.update({
    where: { id: params.id },
    data: {
      valor,
      detalle: typeof body.detalle === "string" ? body.detalle.trim().slice(0, 3000) || null : null,
      ...(titulo && !hito.clave ? { titulo } : {}),
      autorId: v.personaId,
    },
  });
  return NextResponse.json({ ok: true });
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const v = await viewerApi();
  if (v instanceof NextResponse) return v;
  const hito = await cargar(params.id);
  if (!hito) return NextResponse.json({ ok: true });
  if (!puedeEscribirRecuerdos(v, hito.personaId, await cargarFamilia())) return noAutorizado();
  await prisma.hito.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
