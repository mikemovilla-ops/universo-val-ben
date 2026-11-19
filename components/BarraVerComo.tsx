import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { COOKIE_VER_COMO, getViewerReal, verComoPermitido } from "@/lib/sesion";
import { nombreMostrado } from "@/lib/familia";
import SelectorVerComo from "@/components/SelectorVerComo";

const ROL = { PADRE: "padre/madre", HIJO: "hijo/a", FAMILIAR: "familia" } as const;

// Franja azul arriba del todo, solo para el admin y solo fuera de
// producción: "Ver como…" cualquier persona del árbol. Mientras se está
// viendo como otro, la franja lo dice bien claro.
export default async function BarraVerComo() {
  if (!verComoPermitido()) return null;
  const real = await getViewerReal();
  if (!real?.isAdmin) return null;

  const personas = await prisma.persona.findMany({
    select: { id: true, nombre: true, apodo: true, rol: true, esNucleo: true },
  });
  const ordenar = (xs: typeof personas) =>
    xs
      .map((p) => ({ id: p.id, nombre: `${nombreMostrado(p)} (${ROL[p.rol]})` }))
      .sort((a, b) => a.nombre.localeCompare(b.nombre, "es"));
  const grupos = [
    { titulo: "Los 5", personas: ordenar(personas.filter((p) => p.esNucleo && p.id !== real.personaId)) },
    { titulo: "Resto de la familia", personas: ordenar(personas.filter((p) => !p.esNucleo && p.id !== real.personaId)) },
  ];

  const id = cookies().get(COOKIE_VER_COMO)?.value ?? "";
  const viendo = personas.find((p) => p.id === id);

  return (
    <div className={`border-b px-4 py-1.5 text-sm ${viendo ? "border-cielo bg-cielo/25" : "border-cielo/30 bg-cielo/10"}`}>
      <div className="max-w-5xl mx-auto flex items-center gap-2">
        <span className="shrink-0 text-cielo">👁️ {viendo ? <strong>Viendo como:</strong> : "Ver como:"}</span>
        <SelectorVerComo actual={viendo ? id : ""} grupos={grupos} />
        <span className="hidden sm:inline text-xs text-crema/40">Solo en pruebas — en producción no aparece</span>
      </div>
    </div>
  );
}
