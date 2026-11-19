import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cargarFamilia, noAutorizado, viewerApi } from "@/lib/sesion";
import { puedeEscribirRecuerdos } from "@/lib/permisos";
import { hitoPredefinido } from "@/lib/hitos";

// Rellenar un hito: si es uno de los predefinidos (viene `clave`) se crea
// o se actualiza; si no, se añade uno propio con el título que se escriba.
export async function POST(req: Request, { params }: { params: { id: string } }) {
  const v = await viewerApi();
  if (v instanceof NextResponse) return v;
  if (!puedeEscribirRecuerdos(v, params.id, await cargarFamilia())) return noAutorizado();

  const body = (await req.json()) as Record<string, unknown>;
  const valor = typeof body.valor === "string" ? body.valor.trim().slice(0, 300) : "";
  const detalle = typeof body.detalle === "string" ? body.detalle.trim().slice(0, 3000) || null : null;
  if (!valor) return NextResponse.json({ error: "Escribe cuándo o cómo fue." }, { status: 400 });

  const predefinido = hitoPredefinido(typeof body.clave === "string" ? body.clave : null);
  if (predefinido) {
    await prisma.hito.upsert({
      where: { personaId_clave: { personaId: params.id, clave: predefinido.clave } },
      create: {
        personaId: params.id,
        clave: predefinido.clave,
        titulo: predefinido.titulo,
        valor,
        detalle,
        autorId: v.personaId,
      },
      update: { valor, detalle, autorId: v.personaId },
    });
    return NextResponse.json({ ok: true });
  }

  const titulo = typeof body.titulo === "string" ? body.titulo.trim().slice(0, 120) : "";
  if (!titulo) return NextResponse.json({ error: "Ponle un título al hito." }, { status: 400 });
  await prisma.hito.create({
    data: { personaId: params.id, titulo, valor, detalle, autorId: v.personaId },
  });
  return NextResponse.json({ ok: true });
}
