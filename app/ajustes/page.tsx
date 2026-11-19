import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireViewer } from "@/lib/sesion";
import { valoresDePersona } from "@/lib/vista";
import FormPersona from "@/components/FormPersona";

export const dynamic = "force-dynamic";

// "Mis datos": cada uno cambia aquí su teléfono, foto, apodo, "sobre mí" y
// los avisos por email.
export default async function Ajustes() {
  const v = await requireViewer();
  const persona = v.personaId ? await prisma.persona.findUnique({ where: { id: v.personaId } }) : null;

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-5">
      <h1 className="font-display text-3xl">👤 Mis datos</h1>
      <p className="text-crema/50 text-sm">Has entrado con {v.email}.</p>
      {persona ? (
        <>
          <p>
            <Link href={`/familia/${persona.id}`} className="text-mielbrillante underline">
              Ver mi ficha
            </Link>
          </p>
          <FormPersona modo="propio" id={persona.id} inicial={valoresDePersona(persona)} otras={[]} />
        </>
      ) : (
        <div className="card p-5 space-y-3">
          <p>Todavía no estás en el árbol con este email.</p>
          {v.isAdmin && (
            <p className="text-crema/60">
              Como administrador, añádete desde{" "}
              <Link href="/familia/nueva" className="text-mielbrillante underline">
                Familia → Añadir persona
              </Link>{" "}
              poniendo tu email de Google, y aquí verás tus datos.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
