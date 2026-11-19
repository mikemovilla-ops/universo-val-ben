const MESES = [
  "enero", "febrero", "marzo", "abril", "mayo", "junio",
  "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre",
];

// El servidor (Vercel) corre en UTC; "hoy" (para los cumpleaños) tiene que
// ser el día en Madrid, no en UTC — a las 00:30 en España en UTC aún es ayer.
const ZONA_MADRID = "Europe/Madrid";

// YYYY-MM-DD de hoy (u otra fecha-hora) en Madrid.
export function hoyMadrid(ahora: Date = new Date()): string {
  const partes = new Intl.DateTimeFormat("es-ES", {
    timeZone: ZONA_MADRID,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(ahora);
  const p = (t: string) => partes.find((x) => x.type === t)?.value ?? "";
  return `${p("year")}-${p("month")}-${p("day")}`;
}

// Las fechas sin hora (nacimiento, fecha de una foto) se guardan como
// medianoche UTC (`@db.Date`), así que se leen siempre con getters UTC.
export function aYMD(fecha: Date): string {
  return fecha.toISOString().slice(0, 10);
}

// "YYYY-MM-DD" de un <input type="date"> → Date a medianoche UTC. Devuelve
// null si viene vacío o mal formado.
export function deYMD(valor: string | null | undefined): Date | null {
  if (!valor) return null;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(valor)) return null;
  const d = new Date(valor + "T00:00:00Z");
  return isNaN(d.getTime()) ? null : d;
}

// "17 de septiembre de 1990"
export function formatFechaLarga(fecha: Date): string {
  return `${fecha.getUTCDate()} de ${MESES[fecha.getUTCMonth()]} de ${fecha.getUTCFullYear()}`;
}

// "17 de septiembre" (sin año), para cumpleaños.
export function formatDiaMes(fecha: Date): string {
  return `${fecha.getUTCDate()} de ${MESES[fecha.getUTCMonth()]}`;
}

// "septiembre de 1990", para fotos de las que no se sabe el día exacto no
// hace falta, pero queda bien en el pie del álbum.
export function formatMesAnio(fecha: Date): string {
  return `${MESES[fecha.getUTCMonth()]} de ${fecha.getUTCFullYear()}`;
}

// Fecha y hora "de pared" en Madrid de un instante (p.ej. cuándo se pidió
// una receta): "18 de noviembre de 2026".
export function formatFechaInstante(instante: Date): string {
  return formatFechaLarga(new Date(hoyMadrid(instante) + "T00:00:00Z"));
}

function esBisiesto(anio: number): boolean {
  return (anio % 4 === 0 && anio % 100 !== 0) || anio % 400 === 0;
}

// Fecha (YYYY-MM-DD) del cumpleaños en un año dado. Quien nació un 29 de
// febrero lo celebra el 28 en los años no bisiestos.
function cumpleEnAnio(nacimiento: Date, anio: number): string {
  let mes = nacimiento.getUTCMonth() + 1;
  let dia = nacimiento.getUTCDate();
  if (mes === 2 && dia === 29 && !esBisiesto(anio)) dia = 28;
  return `${anio}-${String(mes).padStart(2, "0")}-${String(dia).padStart(2, "0")}`;
}

function diasEntre(desdeYMD: string, hastaYMD: string): number {
  const a = Date.parse(desdeYMD + "T00:00:00Z");
  const b = Date.parse(hastaYMD + "T00:00:00Z");
  return Math.round((b - a) / 86_400_000);
}

// Cuántos días faltan para el próximo cumpleaños (0 = hoy) y cuántos años
// cumple ese día.
export function proximoCumpleanos(
  nacimiento: Date,
  hoyYMD: string
): { dias: number; edad: number; fecha: string } {
  const anioHoy = Number(hoyYMD.slice(0, 4));
  let fecha = cumpleEnAnio(nacimiento, anioHoy);
  if (fecha < hoyYMD) fecha = cumpleEnAnio(nacimiento, anioHoy + 1);
  const edad = Number(fecha.slice(0, 4)) - nacimiento.getUTCFullYear();
  return { dias: diasEntre(hoyYMD, fecha), edad, fecha };
}

// Edad que tiene hoy (o tenía al morir, si se pasa `hasta`).
export function edad(nacimiento: Date, hastaYMD: string): number {
  const nacYMD = aYMD(nacimiento);
  let anios = Number(hastaYMD.slice(0, 4)) - Number(nacYMD.slice(0, 4));
  if (hastaYMD.slice(5) < nacYMD.slice(5)) anios -= 1;
  return anios;
}

export function textoDiasHasta(dias: number): string {
  if (dias === 0) return "¡hoy!";
  if (dias === 1) return "mañana";
  return `en ${dias} días`;
}
