import Link from "next/link";
import Logo from "@/components/Logo";

// A donde manda NextAuth si alguien que no es de la familia intenta entrar
// (o si falla el login por cualquier otro motivo).
export default function AccesoDenegado({ searchParams }: { searchParams: { error?: string } }) {
  const noEsFamilia = searchParams.error === "AccessDenied";
  return (
    <div className="max-w-md mx-auto px-4 py-12 text-center space-y-5">
      <Logo size={96} className="mx-auto" />
      <h1 className="font-display text-3xl">{noEsFamilia ? "Este email no está dado de alta" : "No se ha podido entrar"}</h1>
      <p className="text-crema/70">
        {noEsFamilia
          ? "Universo Val-Ben es privada: solo pueden entrar los emails que el administrador ha añadido a la familia. Si eres de la familia, pídele que te añada con este email de Google (o entra con otra cuenta)."
          : "Ha habido un problema al entrar con Google. Vuelve a intentarlo dentro de un momento."}
      </p>
      <Link href="/" className="boton">
        Volver al inicio
      </Link>
    </div>
  );
}
