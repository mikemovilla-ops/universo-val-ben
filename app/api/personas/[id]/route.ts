import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { noAutorizado, viewerApi } from "@/lib/sesion";
import { puedeEditarPersona, puedeGestionarFamilia } from "@/lib/permisos";
import { cambiarPareja, esErrorEmailRepetido, leerDatosPersona } from "@/lib/personas";

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const v = await viewerApi();
  if (v instanceof NextResponse) return v;
  if (!puedeEditarPersona(v, params.id)) return noAutorizado();

  const body = (await req.json()) as Record<string, unknown>;
  const { datos, parejaId, error } = leerDatosPersona(body, { admin: v.isAdmin, idPropio: params.id });
  if (error) return NextResponse.json({ error }, { status: 400 });

  try {
    await prisma.$transaction(async (tx) => {
      await tx.persona.update({ where: { id: params.id }, data: datos });
      if (parejaId !== undefined) await cambiarPareja(tx, params.id, parejaId);
    });
    return NextResponse.json({ ok: true });
  } catch (e) {
    if (esErrorEmailRepetido(e)) {
      return NextResponse.json({ error: "Ya hay otra persona con ese email." }, { status: 400 });
    }
    throw e;
  }
}

// Quitar a alguien del árbol (solo el admin). Sus hijos se quedan sin ese
// progenitor, su pareja sin pareja; se borran sus hitos, recuerdos y
// etiquetas en fotos, pero no las fotos ni las recetas.
export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const v = await viewerApi();
  if (v instanceof NextResponse) return v;
  if (!puedeGestionarFamilia(v)) return noAutorizado();
  await prisma.persona.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
