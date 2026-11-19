import Link from "next/link";

export default function NoEncontrado() {
  return (
    <div className="max-w-md mx-auto px-4 py-16 text-center space-y-4">
      <p className="text-5xl">🍂</p>
      <h1 className="font-display text-2xl">Esto ya no existe</h1>
      <p className="text-crema/60">Puede que lo hayan borrado o que el enlace esté mal.</p>
      <Link href="/" className="boton">
        Ir al inicio
      </Link>
    </div>
  );
}
