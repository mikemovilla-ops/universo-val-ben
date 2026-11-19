// Hitos que salen en la ficha de todo el mundo, listos para rellenar (sin
// tener que inventarse el título cada vez). Para añadir uno nuevo basta con
// ponerlo aquí: aparecerá vacío en todas las fichas. La `clave` no debe
// cambiar nunca una vez usada (es lo que une cada respuesta guardada con su
// hito); el título y el ejemplo sí se pueden retocar.
export type HitoPredefinido = {
  clave: string;
  titulo: string;
  emoji: string;
  ejemplo: string;
};

export const HITOS_PREDEFINIDOS: HitoPredefinido[] = [
  { clave: "primera-palabra", titulo: "Primera palabra", emoji: "🗣️", ejemplo: "\"Agua\", con 10 meses" },
  { clave: "primer-diente", titulo: "Primer diente", emoji: "🦷", ejemplo: "Con 7 meses" },
  { clave: "caminar", titulo: "Empezó a caminar", emoji: "👣", ejemplo: "Con 11 meses, en el salón de casa" },
  { clave: "primer-dia-cole", titulo: "Primer día de colegio", emoji: "🎒", ejemplo: "Septiembre de 1993, lloró toda la mañana" },
  { clave: "leer", titulo: "Aprendió a leer", emoji: "📖", ejemplo: "Con 5 años" },
  { clave: "nadar", titulo: "Aprendió a nadar", emoji: "🏊", ejemplo: "Verano de 1995, en la piscina del pueblo" },
  { clave: "bici", titulo: "Montó en bici sin ruedines", emoji: "🚲", ejemplo: "Con 6 años, en el parque" },
  { clave: "primer-avion", titulo: "Primer viaje en avión", emoji: "✈️", ejemplo: "2001, a Canarias" },
  { clave: "comida-favorita", titulo: "Comida favorita de pequeño", emoji: "🍝", ejemplo: "Los macarrones de mamá" },
  { clave: "mote", titulo: "Cómo le llamaban de pequeño", emoji: "🏷️", ejemplo: "\"Chiqui\"" },
  { clave: "carnet", titulo: "Sacó el carnet de conducir", emoji: "🚗", ejemplo: "2008, a la segunda" },
  { clave: "primer-trabajo", titulo: "Primer trabajo", emoji: "💼", ejemplo: "Camarero en verano, 2006" },
];

export function hitoPredefinido(clave: string | null): HitoPredefinido | undefined {
  return clave ? HITOS_PREDEFINIDOS.find((h) => h.clave === clave) : undefined;
}
