import type { Familia } from "@/lib/familia";

// Quién puede hacer qué. Funciones puras (sin base de datos) para poder
// probarlas y usarlas igual en páginas y en la API.
export type Quien = {
  isAdmin: boolean;
  personaId: string | null;
  rol: "PADRE" | "HIJO" | "FAMILIAR" | null;
};

// Añadir/borrar personas y cambiar relaciones: solo el admin.
export function puedeGestionarFamilia(q: Quien): boolean {
  return q.isAdmin;
}

// Datos de contacto, foto y "sobre mí": el admin y la propia persona.
export function puedeEditarPersona(q: Quien, personaId: string): boolean {
  return q.isAdmin || q.personaId === personaId;
}

// Hitos, anécdotas y curiosidades: la propia persona, sus padres y sus
// abuelos (y el admin).
export function puedeEscribirRecuerdos(q: Quien, personaId: string, familia: Familia): boolean {
  if (q.isAdmin) return true;
  if (!q.personaId) return false;
  if (q.personaId === personaId) return true;
  return familia.esProgenitorOAbuelo(q.personaId, personaId);
}

// Borrar un hito/recuerdo concreto: quien lo escribió, o el admin.
export function puedeBorrarRecuerdo(q: Quien, autorId: string | null): boolean {
  return q.isAdmin || (!!q.personaId && q.personaId === autorId);
}

// Redactar recetas (empezar una pedida, escribir una nueva, editar): padres
// y admin.
export function puedeRedactarRecetas(q: Quien): boolean {
  return q.isAdmin || q.rol === "PADRE";
}

// Pedir recetas: cualquiera que esté en la familia.
export function puedePedirRecetas(q: Quien): boolean {
  return q.isAdmin || !!q.personaId;
}

// Borrar una receta: el admin siempre; quien la pidió, mientras nadie la
// haya empezado.
export function puedeBorrarReceta(
  q: Quien,
  receta: { estado: string; pedidaPorId: string | null }
): boolean {
  if (q.isAdmin) return true;
  return receta.estado === "PEDIDA" && !!q.personaId && q.personaId === receta.pedidaPorId;
}

// Fotos del álbum: borrar solo quien la subió o el admin (editar el pie y
// las etiquetas puede cualquiera de la familia).
export function puedeBorrarFoto(q: Quien, subidaPorId: string | null): boolean {
  return q.isAdmin || (!!q.personaId && q.personaId === subidaPorId);
}
