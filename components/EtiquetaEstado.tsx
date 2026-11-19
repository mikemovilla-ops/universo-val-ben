import { infoEstado, type EstadoRecetaTipo } from "@/lib/recetas";

export default function EtiquetaEstado({ estado }: { estado: EstadoRecetaTipo }) {
  const e = infoEstado(estado);
  const texto = { PEDIDA: "Pedida", EN_CURSO: "Escribiéndose", LISTA: "Lista" }[estado];
  return (
    <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs whitespace-nowrap ${e.clase}`}>
      {e.emoji} {texto}
    </span>
  );
}
