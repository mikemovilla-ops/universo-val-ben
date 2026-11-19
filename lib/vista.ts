import type { Persona } from "@prisma/client";
import { aYMD } from "@/lib/fechas";
import { nombreMostrado } from "@/lib/familia";
import type { ValoresPersona } from "@/components/FormPersona";

// Persona de la base de datos → valores del formulario.
export function valoresDePersona(p: Persona): ValoresPersona {
  return {
    nombre: p.nombre,
    apellidos: p.apellidos ?? "",
    apodo: p.apodo ?? "",
    email: p.email ?? "",
    telefono: p.telefono ?? "",
    fechaNacimiento: p.fechaNacimiento ? aYMD(p.fechaNacimiento) : "",
    fechaFallecimiento: p.fechaFallecimiento ? aYMD(p.fechaFallecimiento) : "",
    lugarNacimiento: p.lugarNacimiento ?? "",
    fotoUrl: p.fotoUrl,
    sobreMi: p.sobreMi ?? "",
    rol: p.rol,
    esNucleo: p.esNucleo,
    avisosEmail: p.avisosEmail,
    emailAvisos: p.emailAvisos ?? "",
    progenitor1Id: p.progenitor1Id ?? "",
    progenitor2Id: p.progenitor2Id ?? "",
    parejaId: p.parejaId ?? "",
  };
}

// Lista para los desplegables (padres, pareja, etiquetas de fotos...).
export function opcionesPersonas(personas: { id: string; nombre: string; apodo: string | null; apellidos?: string | null }[], excluir?: string) {
  return personas
    .filter((p) => p.id !== excluir)
    .map((p) => ({
      id: p.id,
      nombre: p.apodo ? `${p.apodo} (${p.nombre}${p.apellidos ? " " + p.apellidos : ""})` : [p.nombre, p.apellidos].filter(Boolean).join(" "),
      corto: nombreMostrado(p),
    }))
    .sort((a, b) => a.nombre.localeCompare(b.nombre, "es"));
}

// Teléfono → enlace de WhatsApp (asumiendo España si no lleva prefijo).
export function enlaceWhatsapp(telefono: string): string | null {
  let n = telefono.replace(/[^\d+]/g, "");
  if (!n) return null;
  if (n.startsWith("+")) n = n.slice(1);
  else if (n.startsWith("00")) n = n.slice(2);
  else if (n.length === 9) n = "34" + n;
  return `https://wa.me/${n}`;
}
