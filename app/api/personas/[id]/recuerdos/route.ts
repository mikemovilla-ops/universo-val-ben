import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cargarFamilia, noAutorizado, viewerApi } from "@/lib/sesion";
import { puedeEscribirRecuerdos } from "@/lib/permisos";

// Añadir una anécdota o una curiosidad a la ficha de alguien.
export async function POST(req: Request, { params }: { params: { id: string } }) {
  const v = await viewerApi();
  if (v instanceof NextResponse) return v;
  if (!puedeEscribirRecuerdos(v, params.id, await cargarFamilia())) return noAutorizado();

  const body = (await req.json()) as Record<string, unknown>;
  const tipo = body.tipo === "CURIOSIDAD" ? "CURIOSIDAD" : "ANECDOTA";
  const texto = typeof body.texto === "string" ? body.texto.trim().slice(0, 5000) : "";
  if (!texto) return NextResponse.json({ error: "Escribe algo primero." }, { status: 400 });

  await prisma.recuerdo.create({ data: { personaId: params.id, tipo, texto, autorId: v.personaId } });
  return NextResponse.json({ ok: true });
}
