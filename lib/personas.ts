import type { Prisma, PrismaClient } from "@prisma/client";
import { deYMD } from "@/lib/fechas";

type Tx = Omit<PrismaClient, "$connect" | "$disconnect" | "$on" | "$transaction" | "$use" | "$extends">;

const ROLES = ["PADRE", "HIJO", "FAMILIAR"] as const;

function texto(v: unknown, max = 200): string | null {
  if (typeof v !== "string") return null;
  const t = v.trim().slice(0, max);
  return t || null;
}

function idONull(v: unknown): string | null {
  return typeof v === "string" && v ? v : null;
}

export type DatosPersona = {
  datos: Prisma.PersonaUncheckedUpdateInput;
  parejaId?: string | null; // undefined = no tocar
  error?: string;
};

// Lee lo que manda el formulario de una persona. Cada uno puede cambiar sus
// datos de contacto, foto y "sobre mí"; el nombre, el email de acceso, el
// rol y las relaciones solo el admin. Los campos que no vienen en el body
// no se tocan.
export function leerDatosPersona(
  body: Record<string, unknown>,
  { admin, idPropio }: { admin: boolean; idPropio?: string }
): DatosPersona {
  const datos: Prisma.PersonaUncheckedUpdateInput = {};
  const tiene = (k: string) => Object.prototype.hasOwnProperty.call(body, k);

  if (tiene("apodo")) datos.apodo = texto(body.apodo, 60);
  if (tiene("telefono")) datos.telefono = texto(body.telefono, 30);
  if (tiene("lugarNacimiento")) datos.lugarNacimiento = texto(body.lugarNacimiento, 120);
  if (tiene("sobreMi")) datos.sobreMi = texto(body.sobreMi, 3000);
  if (tiene("fechaNacimiento")) datos.fechaNacimiento = deYMD(body.fechaNacimiento as string);
  if (tiene("avisosEmail")) datos.avisosEmail = body.avisosEmail !== false;
  if (tiene("emailAvisos")) datos.emailAvisos = texto(body.emailAvisos, 200)?.toLowerCase() ?? null;
  if (tiene("fotoUrl")) {
    const u = body.fotoUrl;
    datos.fotoUrl = typeof u === "string" && /^https:\/\//.test(u) ? u : null;
  }

  let parejaId: string | null | undefined;
  if (admin) {
    if (tiene("nombre")) {
      const n = texto(body.nombre, 80);
      if (!n) return { datos, error: "El nombre es obligatorio." };
      datos.nombre = n;
    }
    if (tiene("apellidos")) datos.apellidos = texto(body.apellidos, 120);
    if (tiene("email")) {
      const e = texto(body.email, 200)?.toLowerCase() ?? null;
      if (e && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e)) return { datos, error: "El email no es válido." };
      datos.email = e;
    }
    if (tiene("rol")) {
      if (!ROLES.includes(body.rol as (typeof ROLES)[number])) return { datos, error: "Rol no válido." };
      datos.rol = body.rol as (typeof ROLES)[number];
    }
    if (tiene("esNucleo")) datos.esNucleo = body.esNucleo === true;
    if (tiene("fechaFallecimiento")) datos.fechaFallecimiento = deYMD(body.fechaFallecimiento as string);
    if (tiene("progenitor1Id")) datos.progenitor1Id = idONull(body.progenitor1Id);
    if (tiene("progenitor2Id")) datos.progenitor2Id = idONull(body.progenitor2Id);
    if (tiene("parejaId")) parejaId = idONull(body.parejaId);

    if (idPropio && [datos.progenitor1Id, datos.progenitor2Id, parejaId].includes(idPropio)) {
      return { datos, error: "Una persona no puede ser su propio padre/madre ni su propia pareja." };
    }
    if (datos.progenitor1Id && datos.progenitor1Id === datos.progenitor2Id) {
      return { datos, error: "Los dos progenitores no pueden ser la misma persona." };
    }
  }

  return { datos, parejaId };
}

// La pareja se guarda en los dos lados (A→B y B→A). Al cambiarla hay que
// soltar también a las parejas anteriores de los dos.
export async function cambiarPareja(tx: Tx, id: string, nueva: string | null) {
  const actual = await tx.persona.findUnique({ where: { id }, select: { parejaId: true } });
  if (!actual) return;
  if (actual.parejaId && actual.parejaId !== nueva) {
    await tx.persona.updateMany({ where: { id: actual.parejaId, parejaId: id }, data: { parejaId: null } });
  }
  if (nueva) {
    const otra = await tx.persona.findUnique({ where: { id: nueva }, select: { parejaId: true } });
    if (!otra) throw new Error("La pareja elegida no existe.");
    if (otra.parejaId && otra.parejaId !== id) {
      await tx.persona.updateMany({ where: { id: otra.parejaId, parejaId: nueva }, data: { parejaId: null } });
    }
    await tx.persona.update({ where: { id: nueva }, data: { parejaId: id } });
  }
  await tx.persona.update({ where: { id }, data: { parejaId: nueva } });
}

export function esErrorEmailRepetido(e: unknown): boolean {
  return (e as { code?: string })?.code === "P2002";
}
