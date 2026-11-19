import Link from "next/link";
import { HISTORIAL_VERSIONES } from "@/lib/version";
import ListaCambios, { SeparadorHito } from "@/components/ListaCambios";

export default function Novedades() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-5">
      <h1 className="font-display text-3xl text-center">Novedades</h1>
      <p className="text-center text-crema/50 text-sm">Todo lo que ha ido cambiando en la app, versión a versión.</p>

      {HISTORIAL_VERSIONES.map((entrada) => (
        <div key={entrada.version}>
          {entrada.hito && <SeparadorHito />}
          <div className="card p-5">
            <h2 className="font-display text-lg text-mielbrillante">
              {entrada.version} <span className="text-crema/40 text-sm">({entrada.fecha})</span>
            </h2>
            <div className="text-sm text-crema/80">
              <ListaCambios entrada={entrada} />
            </div>
          </div>
        </div>
      ))}

      <p className="text-center">
        <Link href="/" className="text-crema/50 text-sm underline hover:text-crema">
          Volver al inicio
        </Link>
      </p>
    </div>
  );
}
