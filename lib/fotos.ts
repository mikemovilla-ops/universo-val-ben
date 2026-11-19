import { deYMD } from "@/lib/fechas";

// Pie, lugar, fecha y personas etiquetadas de una foto del álbum, tal como
// los manda el formulario (subir o editar).
export function leerDatosFoto(body: Record<string, unknown>, idsValidos: Set<string>) {
  const texto = (v: unknown, max: number) => (typeof v === "string" ? v.trim().slice(0, max) || null : null);
  const personas = Array.isArray(body.personas)
    ? [...new Set(body.personas.filter((p): p is string => typeof p === "string" && idsValidos.has(p)))]
    : [];
  return {
    pie: texto(body.pie, 500),
    lugar: texto(body.lugar, 150),
    fecha: deYMD(typeof body.fecha === "string" ? body.fecha : null),
    personas,
  };
}
