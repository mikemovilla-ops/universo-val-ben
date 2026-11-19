import Link from "next/link";

export default function Footer() {
  return (
    // pb-28 en móvil: hueco para que la barra flotante de abajo no lo tape.
    <footer className="border-t border-crema/10 pt-6 pb-28 md:pb-6 text-center space-y-1">
      <p className="text-crema/40 text-xs">🌳 Universo Val-Ben — la app de la familia</p>
      <p className="text-xs">
        <Link href="/ayuda" className="text-crema/40 underline hover:text-crema/70">
          ¿Cómo funciona?
        </Link>
      </p>
    </footer>
  );
}
