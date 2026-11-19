import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireViewer } from "@/lib/sesion";
import { puedeGestionarFamilia } from "@/lib/permisos";
import { opcionesPersonas } from "@/lib/vista";
import FormPersona, { VALORES_VACIOS } from "@/components/FormPersona";

export const dynamic = "force-dynamic";

export default async function NuevaPersona({ searchParams }: { searchParams: { padre?: string; pareja?: string } }) {
  const v = await requireViewer();
  if (!puedeGestionarFamilia(v)) redirect("/familia");
  const personas = await prisma.persona.findMany({ select: { id: true, nombre: true, apodo: true, apellidos: true } });
  const ids = new Set(personas.map((p) => p.id));

  // Atajos desde la ficha de alguien: "Añadir hijo" / "Añadir pareja".
  const inicial = {
    ...VALORES_VACIOS,
    progenitor1Id: searchParams.padre && ids.has(searchParams.padre) ? searchParams.padre : "",
    parejaId: searchParams.pareja && ids.has(searchParams.pareja) ? searchParams.pareja : "",
  };
  if (inicial.progenitor1Id) {
    const pareja = await prisma.persona.findUnique({ where: { id: inicial.progenitor1Id }, select: { parejaId: true } });
    if (pareja?.parejaId) inicial.progenitor2Id = pareja.parejaId;
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-5">
      <h1 className="font-display text-3xl">Añadir a la familia</h1>
      <FormPersona modo="nueva" inicial={inicial} otras={opcionesPersonas(personas)} />
    </div>
  );
}
