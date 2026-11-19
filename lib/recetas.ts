export type EstadoRecetaTipo = "PEDIDA" | "EN_CURSO" | "LISTA";

export const ESTADOS_RECETA: {
  valor: EstadoRecetaTipo;
  titulo: string;
  emoji: string;
  explicacion: string;
  clase: string; // colores de la etiqueta
}[] = [
  {
    valor: "PEDIDA",
    titulo: "Pedidas",
    emoji: "📋",
    explicacion: "Recetas que alguien ha pedido y nadie ha empezado todavía.",
    clase: "bg-miel/15 text-mielbrillante border-miel/30",
  },
  {
    valor: "EN_CURSO",
    titulo: "Escribiéndose",
    emoji: "✍️",
    explicacion: "Recetas que papá o mamá están escribiendo ahora mismo.",
    clase: "bg-cielo/15 text-cielo border-cielo/30",
  },
  {
    valor: "LISTA",
    titulo: "Listas",
    emoji: "✅",
    explicacion: "Recetas terminadas, listas para cocinar.",
    clase: "bg-salvia/15 text-salvia border-salvia/30",
  },
];

export function infoEstado(estado: EstadoRecetaTipo) {
  return ESTADOS_RECETA.find((e) => e.valor === estado)!;
}

export function esEstadoReceta(v: unknown): v is EstadoRecetaTipo {
  return v === "PEDIDA" || v === "EN_CURSO" || v === "LISTA";
}

// Sugerencias para el campo "categoría" (se puede escribir otra cualquiera).
export const CATEGORIAS_RECETA = [
  "Entrantes",
  "Sopas y cremas",
  "Arroces y pastas",
  "Legumbres",
  "Carnes",
  "Pescados",
  "Verduras",
  "Postres",
  "Repostería",
  "Salsas",
  "Bebidas",
];

// Para buscar sin que importen mayúsculas ni tildes ("albondigas" encuentra
// "Albóndigas de la abuela").
export function normalizar(s: string): string {
  return s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .trim();
}

// ¿Coincide la receta con lo buscado? Cada palabra buscada tiene que
// aparecer en algún sitio (título, nota, categoría, ingredientes o pasos).
export function coincideBusqueda(
  r: { titulo: string; nota: string | null; categoria: string | null; ingredientes: string[]; pasos: string[] },
  busqueda: string
): boolean {
  const palabras = normalizar(busqueda).split(/\s+/).filter(Boolean);
  if (palabras.length === 0) return true;
  const texto = normalizar([r.titulo, r.nota ?? "", r.categoria ?? "", ...r.ingredientes, ...r.pasos].join(" "));
  return palabras.every((p) => texto.includes(p));
}

export type IngredienteEntrada ={ cantidad: string; nombre: string };
export type PasoEntrada = { texto: string; fotoUrl: string | null };
export type FotoEntrada = { url: string; pie: string };

function texto(v: unknown, max = 2000): string {
  return typeof v === "string" ? v.trim().slice(0, max) : "";
}

function urlValida(v: unknown): string | null {
  return typeof v === "string" && /^https:\/\//.test(v) ? v : null;
}

// Limpia lo que manda el editor: quita filas vacías y recorta textos.
export function limpiarContenidoReceta(body: Record<string, unknown>) {
  const ingredientes: IngredienteEntrada[] = (Array.isArray(body.ingredientes) ? body.ingredientes : [])
    .map((i: any) => ({ cantidad: texto(i?.cantidad, 100), nombre: texto(i?.nombre, 200) }))
    .filter((i) => i.nombre);
  const pasos: PasoEntrada[] = (Array.isArray(body.pasos) ? body.pasos : [])
    .map((p: any) => ({ texto: texto(p?.texto, 4000), fotoUrl: urlValida(p?.fotoUrl) }))
    .filter((p) => p.texto || p.fotoUrl);
  const fotos: FotoEntrada[] = (Array.isArray(body.fotos) ? body.fotos : [])
    .map((f: any) => ({ url: urlValida(f?.url) ?? "", pie: texto(f?.pie, 300) }))
    .filter((f) => f.url);
  return {
    titulo: texto(body.titulo, 200),
    categoria: texto(body.categoria, 80) || null,
    raciones: texto(body.raciones, 80) || null,
    tiempo: texto(body.tiempo, 80) || null,
    consejos: texto(body.consejos, 4000) || null,
    fotoUrl: urlValida(body.fotoUrl),
    ingredientes,
    pasos,
    fotos,
  };
}

// Qué le falta a una receta para poder marcarla como terminada (vacío =
// se puede terminar).
export function faltaParaTerminar(c: { titulo: string; ingredientes: unknown[]; pasos: unknown[] }): string[] {
  const falta: string[] = [];
  if (!c.titulo) falta.push("el nombre de la receta");
  if (c.ingredientes.length === 0) falta.push("al menos un ingrediente");
  if (c.pasos.length === 0) falta.push("al menos un paso");
  return falta;
}
