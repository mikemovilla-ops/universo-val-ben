"use client";

import { useState, useTransition } from "react";
import { signIn, signOut, useSession } from "next-auth/react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

type IconoProps = { activo: boolean };
const trazo = (activo: boolean) => ({
  viewBox: "0 0 24 24",
  width: 24,
  height: 24,
  fill: "none",
  stroke: "currentColor",
  strokeWidth: activo ? 2.2 : 1.8,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
});

function IconoInicio({ activo }: IconoProps) {
  return (
    <svg {...trazo(activo)}>
      <path d="M4 11.5 12 4l8 7.5" />
      <path d="M6 10v9a1 1 0 0 0 1 1h3v-6h4v6h3a1 1 0 0 0 1-1v-9" />
    </svg>
  );
}

function IconoFamilia({ activo }: IconoProps) {
  return (
    <svg {...trazo(activo)}>
      <circle cx="12" cy="5" r="2.2" />
      <circle cx="5.5" cy="17" r="2.2" />
      <circle cx="12" cy="17" r="2.2" />
      <circle cx="18.5" cy="17" r="2.2" />
      <path d="M12 7.2V11M5.5 14.8V11h13v3.8M12 11v3.8" />
    </svg>
  );
}

function IconoRecetas({ activo }: IconoProps) {
  return (
    <svg {...trazo(activo)}>
      <path d="M4 11h16a8 8 0 0 1-16 0Z" />
      <path d="M9 7c0-1.5 1-1.5 1-3M14 7c0-1.5 1-1.5 1-3" />
    </svg>
  );
}

function IconoAlbum({ activo }: IconoProps) {
  return (
    <svg {...trazo(activo)}>
      <rect x="3.5" y="5.5" width="17" height="14" rx="2" />
      <circle cx="9" cy="10.5" r="1.8" />
      <path d="m20.5 16-5-5-8 8.5" />
    </svg>
  );
}

function IconoMas({ activo }: IconoProps) {
  return (
    <svg {...trazo(activo)}>
      <circle cx="12" cy="8.5" r="3.5" />
      <path d="M5 20c0-3.6 3.1-6.5 7-6.5s7 2.9 7 6.5" />
    </svg>
  );
}

// Barra flotante abajo, solo en móvil: las tres secciones con iconos grandes
// y un último botón "Tú" con Mis datos, Ayuda, Novedades y Salir.
export default function BottomNav() {
  const { status } = useSession();
  const pathname = usePathname();
  const router = useRouter();
  const [menuAbierto, setMenuAbierto] = useState(false);
  const [navegando, startTransition] = useTransition();

  function navegar(e: React.MouseEvent, href: string) {
    e.preventDefault();
    setMenuAbierto(false);
    if (navegando) return;
    startTransition(() => {
      if (pathname === href) router.refresh();
      else router.push(href);
    });
  }

  if (status !== "authenticated") {
    if (status === "loading") return null;
    return (
      <nav className="md:hidden fixed inset-x-4 bottom-4 z-50 mb-[env(safe-area-inset-bottom)]">
        <button onClick={() => signIn("google")} className="boton w-full py-3.5 shadow-lg shadow-black/40">
          Entrar con Google
        </button>
      </nav>
    );
  }

  const pestanas = [
    { href: "/", label: "Inicio", Icono: IconoInicio },
    { href: "/familia", label: "Familia", Icono: IconoFamilia },
    { href: "/recetas", label: "Recetas", Icono: IconoRecetas },
    { href: "/album", label: "Álbum", Icono: IconoAlbum },
  ];
  const activa = (href: string) => (href === "/" ? pathname === "/" : pathname.startsWith(href));
  const enlaceMenu = "py-1 text-base text-crema/80 hover:text-crema transition";

  return (
    <>
      {menuAbierto && <div className="md:hidden fixed inset-0 z-40" onClick={() => setMenuAbierto(false)} />}
      <nav
        className={`md:hidden fixed inset-x-3 bottom-3 z-50 mb-[env(safe-area-inset-bottom)] rounded-2xl border border-crema/10 bg-nogaldark/95 backdrop-blur-sm shadow-lg shadow-black/50 overflow-hidden transition-opacity ${
          navegando ? "opacity-50" : "opacity-100"
        }`}
      >
        {menuAbierto && (
          <div className="border-b border-crema/10 px-5 py-3 flex flex-col gap-2">
            <Link href="/ajustes" className={enlaceMenu} onClick={(e) => navegar(e, "/ajustes")}>
              👤 Mis datos
            </Link>
            <Link href="/ayuda" className={enlaceMenu} onClick={(e) => navegar(e, "/ayuda")}>
              ❓ Ayuda / instrucciones
            </Link>
            <Link href="/novedades" className={enlaceMenu} onClick={(e) => navegar(e, "/novedades")}>
              ✨ Novedades
            </Link>
            <button
              onClick={() => {
                setMenuAbierto(false);
                signOut();
              }}
              className="py-1 text-left text-base text-crema/60 hover:text-coral transition"
            >
              🚪 Salir
            </button>
          </div>
        )}
        <div className="flex items-stretch justify-around">
          {pestanas.map(({ href, label, Icono }) => (
            <Link
              key={href}
              href={href}
              onClick={(e) => navegar(e, href)}
              className={`flex flex-1 flex-col items-center gap-0.5 py-2.5 text-[11px] transition ${
                activa(href) ? "text-mielbrillante" : "text-crema/55"
              }`}
            >
              <Icono activo={activa(href)} />
              {label}
            </Link>
          ))}
          <button
            onClick={() => setMenuAbierto((v) => !v)}
            className={`flex flex-1 flex-col items-center gap-0.5 py-2.5 text-[11px] transition ${
              menuAbierto ? "text-mielbrillante" : "text-crema/55"
            }`}
          >
            <IconoMas activo={menuAbierto} />
            Más
          </button>
        </div>
      </nav>
    </>
  );
}
