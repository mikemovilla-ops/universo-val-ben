import { NextResponse } from "next/server";
import { del } from "@vercel/blob";
import { prisma } from "@/lib/prisma";
import { noAutorizado, viewerApi } from "@/lib/sesion";
import { puedeBorrarFoto } from "@/lib/permisos";
import { leerDatosFoto } from "@/lib/fotos";

// Cambiar pie, lugar, fecha o etiquetas: cualquiera de la familia (para que
// cada uno pueda etiquetarse en fotos que han subido otros).
export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const v = await viewerApi();
  if (v instanceof NextResponse) return v;
  if (!v.personaId && !v.isAdmin) return noAutorizado();

  const body = (await req.json()) as Record<string, unknown>;
  const ids = new Set((await prisma.persona.findMany({ select: { id: true } })).map((p) => p.id));
  const { pie, lugar, fecha, personas } = leerDatosFoto(body, ids);

  await prisma.$transaction([
    prisma.etiqueta.deleteMany({ where: { fotoId: params.id } }),
    prisma.foto.update({
      where: { id: params.id },
      data: { pie, lugar, fecha, etiquetas: { create: personas.map((personaId) => ({ personaId })) } },
    }),
  ]);
  return NextResponse.json({ ok: true });
}

// Borrar: quien la subió o el admin. También se borra el archivo de Blob.
export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const v = await viewerApi();
  if (v instanceof NextResponse) return v;
  const foto = await prisma.foto.findUnique({ where: { id: params.id } });
  if (!foto) return NextResponse.json({ ok: true });
  if (!puedeBorrarFoto(v, foto.subidaPorId)) return noAutorizado();
  await prisma.foto.delete({ where: { id: foto.id } });
  try {
    await del(foto.url);
  } catch (e) {
    console.error("No se pudo borrar el archivo de Blob:", e);
  }
  return NextResponse.json({ ok: true });
}
