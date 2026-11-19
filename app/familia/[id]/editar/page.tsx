import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireViewer } from "@/lib/sesion";
import { puedeEditarPersona } from "@/lib/permisos";
import { nombreMostrado } from "@/lib/familia";
import { opcionesPersonas, valoresDePersona } from "@/lib/vista";
import FormPersona from "@/components/FormPersona";

export const dynamic = "force-dynamic";

export default async function EditarPersona({ params }: { params: { id: string } }) {
  const v = await requireViewer();
  const persona = await prisma.persona.findUnique({ where: { id: params.id } });
  if (!persona) notFound();
  if (!puedeEditarPersona(v, persona.id)) redirect(`/familia/${persona.id}`);
  const otras = v.isAdmin
    ? await prisma.persona.findMany({ select: { id: true, nombre: true, apodo: true, apellidos: true } })
    : [];

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-5">
      <h1 className="font-display text-3xl">Editar a {nombreMostrado(persona)}</h1>
      <FormPersona
        modo={v.isAdmin ? "admin" : "propio"}
        id={persona.id}
        inicial={valoresDePersona(persona)}
        otras={opcionesPersonas(otras, persona.id)}
      />
    </div>
  );
}
