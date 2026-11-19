import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { noAutorizado, viewerApi } from "@/lib/sesion";
import { leerDatosFoto } from "@/lib/fotos";

// Guarda en el álbum una o varias fotos ya subidas a Vercel Blob, todas con
// el mismo pie, lugar, fecha y personas etiquetadas.
export async function POST(req: Request) {
  const v = await viewerApi();
  if (v instanceof NextResponse) return v;
  if (!v.personaId && !v.isAdmin) return noAutorizado();

  const body = (await req.json()) as Record<string, unknown>;
  const urls = (Array.isArray(body.urls) ? body.urls : []).filter(
    (u): u is string => typeof u === "string" && /^https:\/\//.test(u)
  );
  if (urls.length === 0) return NextResponse.json({ error: "No hay fotos." }, { status: 400 });

  const ids = new Set((await prisma.persona.findMany({ select: { id: true } })).map((p) => p.id));
  const { pie, lugar, fecha, personas } = leerDatosFoto(body, ids);

  await prisma.$transaction(
    urls.map((url) =>
      prisma.foto.create({
        data: {
          url,
          pie,
          lugar,
          fecha,
          subidaPorId: v.personaId,
          etiquetas: { create: personas.map((personaId) => ({ personaId })) },
        },
      })
    )
  );
  return NextResponse.json({ ok: true });
}
