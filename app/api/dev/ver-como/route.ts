import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { COOKIE_VER_COMO, getViewerReal, verComoPermitido } from "@/lib/sesion";

// Elegir (o quitar, con personaId vacío) a quién "imitar" en "Ver como…".
// Solo el admin de verdad y nunca en producción.
export async function POST(req: Request) {
  if (!verComoPermitido()) {
    return NextResponse.json({ error: "No disponible en producción." }, { status: 404 });
  }
  const real = await getViewerReal();
  if (!real?.isAdmin) return NextResponse.json({ error: "No autorizado." }, { status: 403 });

  const { personaId } = (await req.json()) as { personaId?: string };
  const res = NextResponse.json({ ok: true });
  if (!personaId) {
    res.cookies.delete(COOKIE_VER_COMO);
    return res;
  }
  const existe = await prisma.persona.findUnique({ where: { id: personaId }, select: { id: true } });
  if (!existe) return NextResponse.json({ error: "Esa persona no existe." }, { status: 400 });
  res.cookies.set(COOKIE_VER_COMO, personaId, { sameSite: "lax", path: "/", httpOnly: true });
  return res;
}
