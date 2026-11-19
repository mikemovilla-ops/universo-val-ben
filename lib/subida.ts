"use client";

import { upload } from "@vercel/blob/client";

export type Carpeta = "album" | "recetas" | "personas";

// Las fotos del móvil pesan 3-8 MB; para verlas en la app basta con 2000 px
// de lado. Se reducen en el propio navegador antes de subirlas (ocupan
// mucho menos en Vercel Blob y suben mucho más rápido con datos móviles).
// Si el navegador no sabe leer el formato, se sube la original tal cual.
async function comprimir(file: File, ladoMax = 2000, calidad = 0.85): Promise<Blob> {
  try {
    const bitmap = await createImageBitmap(file);
    const escala = Math.min(1, ladoMax / Math.max(bitmap.width, bitmap.height));
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(bitmap.width * escala);
    canvas.height = Math.round(bitmap.height * escala);
    const ctx = canvas.getContext("2d");
    if (!ctx) return file;
    ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    bitmap.close();
    const blob = await new Promise<Blob | null>((ok) => canvas.toBlob(ok, "image/jpeg", calidad));
    return blob && blob.size < file.size ? blob : file;
  } catch {
    return file;
  }
}

// Sube una imagen directamente del navegador a Vercel Blob (el servidor solo
// firma el permiso, ver app/api/subida) y devuelve su URL pública.
export async function subirImagen(file: File, carpeta: Carpeta): Promise<string> {
  const datos = await comprimir(file);
  const ext = datos.type === "image/jpeg" ? "jpg" : (file.name.split(".").pop() || "jpg").toLowerCase();
  const res = await upload(`${carpeta}/foto.${ext}`, datos, {
    access: "public",
    handleUploadUrl: "/api/subida",
    contentType: datos.type || file.type,
  });
  return res.url;
}
