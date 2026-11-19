import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { noAutorizado, viewerApi } from "@/lib/sesion";
import { puedeGestionarFamilia } from "@/lib/permisos";
import { cambiarPareja, esErrorEmailRepetido, leerDatosPersona } from "@/lib/personas";

// Añadir una persona al árbol (solo el admin).
export async function POST(req: Request) {
  const v = await viewerApi();
  if (v instanceof NextResponse) return v;
  if (!puedeGestionarFamilia(v)) return noAutorizado();

  const body = (await req.json()) as Record<string, unknown>;
  if (!body.nombre) return NextResponse.json({ error: "El nombre es obligatorio." }, { status: 400 });
  const { datos, parejaId, error } = leerDatosPersona(body, { admin: true });
  if (error) return NextResponse.json({ error }, { status: 400 });

  try {
    const persona = await prisma.$transaction(async (tx) => {
      const p = await tx.persona.create({ data: datos as Parameters<typeof tx.persona.create>[0]["data"] });
      if (parejaId) await cambiarPareja(tx, p.id, parejaId);
      return p;
    });
    return NextResponse.json({ id: persona.id });
  } catch (e) {
    if (esErrorEmailRepetido(e)) {
      return NextResponse.json({ error: "Ya hay otra persona con ese email." }, { status: 400 });
    }
    throw e;
  }
}
