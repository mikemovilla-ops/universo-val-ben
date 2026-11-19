import { NextResponse } from "next/server";
import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { getViewer } from "@/lib/sesion";

const CARPETAS = ["album/", "recetas/", "personas/"];

// Firma el permiso para que el navegador suba una foto directamente a
// Vercel Blob (sin pasar por nuestro servidor, que tiene un límite de
// tamaño de petición muy por debajo de lo que pesa una foto de móvil).
// Cualquiera de la familia puede subir; la URL resultante se guarda luego
// con una petición normal (álbum, receta o persona).
export async function POST(req: Request) {
  const body = (await req.json()) as HandleUploadBody;

  // La llamada de "subida completada" la hace Vercel, no el navegador (no
  // lleva la sesión): handleUpload ya verifica su firma.
  if (body.type === "blob.generate-client-token") {
    const v = await getViewer();
    if (!v || (!v.personaId && !v.isAdmin)) {
      return NextResponse.json({ error: "Tienes que entrar con Google." }, { status: 401 });
    }
  }

  try {
    const json = await handleUpload({
      body,
      request: req,
      onBeforeGenerateToken: async (pathname) => {
        if (!CARPETAS.some((c) => pathname.startsWith(c))) throw new Error("Carpeta no válida.");
        return {
          allowedContentTypes: ["image/jpeg", "image/png", "image/webp", "image/heic", "image/heif", "image/gif"],
          maximumSizeInBytes: 20 * 1024 * 1024,
          addRandomSuffix: true,
        };
      },
      onUploadCompleted: async () => {
        // Nada: el cliente guarda la URL en cuanto termina la subida.
      },
    });
    return NextResponse.json(json);
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 400 });
  }
}
