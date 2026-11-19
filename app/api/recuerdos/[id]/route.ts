import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { noAutorizado, viewerApi } from "@/lib/sesion";
import { puedeBorrarRecuerdo } from "@/lib/permisos";

// Borrar una anécdota/curiosidad: quien la escribió o el admin.
export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const v = await viewerApi();
  if (v instanceof NextResponse) return v;
  const r = await prisma.recuerdo.findUnique({ where: { id: params.id }, select: { autorId: true } });
  if (!r) return NextResponse.json({ ok: true });
  if (!puedeBorrarRecuerdo(v, r.autorId)) return noAutorizado();
  await prisma.recuerdo.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
