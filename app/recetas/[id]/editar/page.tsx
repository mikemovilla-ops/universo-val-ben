import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireViewer } from "@/lib/sesion";
import { nombreMostrado } from "@/lib/familia";
import { puedeRedactarRecetas } from "@/lib/permisos";
import EditorReceta from "@/components/EditorReceta";

export const dynamic = "force-dynamic";

export default async function EditarReceta({ params }: { params: { id: string } }) {
  const v = await requireViewer();
  if (!puedeRedactarRecetas(v)) redirect(`/recetas/${params.id}`);
  const r = await prisma.receta.findUnique({
    where: { id: params.id },
    include: {
      pedidaPor: true,
      ingredientes: { orderBy: { orden: "asc" } },
      pasos: { orderBy: { orden: "asc" } },
      fotos: { orderBy: { orden: "asc" } },
    },
  });
  if (!r) notFound();

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 space-y-5">
      <Link href={`/recetas/${r.id}`} className="text-sm text-crema/50 hover:text-crema">
        ← Ver la receta
      </Link>
      <h1 className="font-display text-3xl">✍️ {r.estado === "LISTA" ? "Editar" : "Escribir"}: {r.titulo}</h1>
      {r.pedidaPor && (
        <p className="text-crema/60">
          La pidió {nombreMostrado(r.pedidaPor)}
          {r.nota && <span className="italic"> — «{r.nota}»</span>}
        </p>
      )}
      <EditorReceta
        id={r.id}
        yaLista={r.estado === "LISTA"}
        inicial={{
          titulo: r.titulo,
          categoria: r.categoria ?? "",
          raciones: r.raciones ?? "",
          tiempo: r.tiempo ?? "",
          consejos: r.consejos ?? "",
          fotoUrl: r.fotoUrl,
          ingredientes: r.ingredientes.map((i) => ({ cantidad: i.cantidad ?? "", nombre: i.nombre })),
          pasos: r.pasos.map((p) => ({ texto: p.texto, fotoUrl: p.fotoUrl })),
          fotos: r.fotos.map((f) => ({ url: f.url, pie: f.pie ?? "" })),
        }}
      />
    </div>
  );
}
