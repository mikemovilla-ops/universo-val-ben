// Historial de versiones de la app. Añade una entrada nueva ARRIBA del todo
// cada vez que despliegues una mejora — `APP_VERSION` se calcula siempre a
// partir de la primera entrada, así que no hace falta tocar nada más. El
// pop-up de novedades (components/VersionPopup.tsx) usa este mismo listado
// para mostrar, a cada uno, lo que ha cambiado desde la última vez que
// entró. Los textos van en lenguaje de usuario, no técnico (los leen los
// padres).
export type Cambio =
  | string
  | {
      texto: string;
      // Etiqueta destacada al lado del texto, p.ej. "Idea de mamá" — para
      // dar crédito a de dónde vino la idea.
      origen: string;
    };

export type EntradaVersion = {
  version: string;
  fecha: string; // YYYY-MM-DD
  cambios: Cambio[];
  // Marca un hito — /novedades y el pop-up dibujan una línea divisoria
  // encima de esta entrada.
  hito?: boolean;
};

export const HISTORIAL_VERSIONES: EntradaVersion[] = [
  {
    version: "1.0.0",
    fecha: "2026-11-18",
    hito: true,
    cambios: [
      "🎉 Primera versión de Universo Val-Ben.",
      "🌳 Familia: el árbol con todos (las parejas unidas por un corazón), y la ficha de cada uno (datos, cumpleaños, hitos, anécdotas, curiosidades y fotos en las que sale).",
      "🎂 Si hoy es el cumpleaños de alguien, sale en la pantalla de inicio (con botón para llamarle).",
      "🍲 Recetas: los hijos las piden, papá y mamá las escriben (ingredientes primero, luego los pasos, con fotos). Aviso por email al pedirla y al terminarla. Buscador.",
      "📷 Álbum: sube fotos con un pie, el lugar y la fecha, y etiqueta a quien sale.",
      "❓ Ayuda con instrucciones paso a paso.",
    ],
  },
];

export const APP_VERSION = HISTORIAL_VERSIONES[0].version;
