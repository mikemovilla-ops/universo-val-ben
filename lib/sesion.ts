import { getServerSession } from "next-auth";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Familia, nombreMostrado, type NodoFamilia } from "@/lib/familia";
import type { Quien } from "@/lib/permisos";

export type Viewer = Quien & {
  userId: string;
  email: string | null;
  nombre: string;
};

// "Ver como…": el admin, fuera de producción, puede usar la app como si
// fuera otra persona del árbol (para probar qué ven y qué pueden hacer sus
// padres o hermanos). Se guarda en esta cookie el id de esa persona.
export const COOKIE_VER_COMO = "ver_como";

export function verComoPermitido(): boolean {
  return process.env.VERCEL_ENV !== "production";
}

// Quién ha entrado de verdad, sin tener en cuenta "Ver como…".
export async function getViewerReal(): Promise<Viewer | null> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return null;
  return {
    userId: session.user.id,
    email: session.user.email ?? null,
    isAdmin: session.user.isAdmin,
    personaId: session.user.personaId,
    rol: session.user.rol,
    nombre: session.user.nombreFamilia ?? session.user.name ?? "",
  };
}

// Quién manda a efectos de la app: el usuario real, o la persona elegida en
// "Ver como…" (sin permisos de admin). Lo usan tanto las páginas como la
// API, así que en "Ver como" también se actúa como esa persona (pedir una
// receta como un hermano, escribirla como mamá...).
export async function getViewer(): Promise<Viewer | null> {
  const real = await getViewerReal();
  if (!real?.isAdmin || !verComoPermitido()) return real;
  const id = cookies().get(COOKIE_VER_COMO)?.value;
  if (!id) return real;
  const p = await prisma.persona.findUnique({
    where: { id },
    select: { id: true, rol: true, nombre: true, apodo: true, email: true },
  });
  if (!p) return real;
  return {
    userId: real.userId,
    email: p.email,
    isAdmin: false,
    personaId: p.id,
    rol: p.rol,
    nombre: nombreMostrado(p),
  };
}

// Para páginas: sin sesión, a la portada (donde está el botón de entrar).
export async function requireViewer(): Promise<Viewer> {
  const v = await getViewer();
  if (!v) redirect("/");
  return v;
}

// Para la API: devuelve el viewer o una respuesta 401 lista para devolver.
export async function viewerApi(): Promise<Viewer | NextResponse> {
  const v = await getViewer();
  if (!v) return NextResponse.json({ error: "Tienes que entrar con Google." }, { status: 401 });
  return v;
}

export function noAutorizado(mensaje = "No tienes permiso para hacer esto.") {
  return NextResponse.json({ error: mensaje }, { status: 403 });
}

// Toda la familia como nodos (para relaciones y permisos que dependen del
// árbol). Son pocas decenas de filas: se lee entera sin problema.
export async function cargarFamilia(): Promise<Familia> {
  const nodos: NodoFamilia[] = await prisma.persona.findMany({
    select: {
      id: true,
      nombre: true,
      progenitor1Id: true,
      progenitor2Id: true,
      parejaId: true,
      fechaNacimiento: true,
    },
  });
  return new Familia(nodos);
}
