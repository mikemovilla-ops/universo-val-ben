"use client";

import { useTransition } from "react";
import { signIn, signOut, useSession } from "next-auth/react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { APP_VERSION } from "@/lib/version";
import Logo from "@/components/Logo";

export const SECCIONES = [
  { href: "/familia", label: "Familia" },
  { href: "/recetas", label: "Recetas" },
  { href: "/album", label: "Álbum" },
];

export default function Navbar() {
  const { status } = useSession();
  const pathname = usePathname();
  const router = useRouter();
  const [navegando, startTransition] = useTransition();

  // Igual que en Tarados: mientras carga la página siguiente se ve una
  // barra arriba y se ignoran los clics repetidos.
  function navegar(e: React.MouseEvent, href: string) {
    e.preventDefault();
    if (navegando) return;
    startTransition(() => {
      if (pathname === href) router.refresh();
      else router.push(href);
    });
  }

  function actualizar() {
    if (navegando) return;
    startTransition(() => router.refresh());
  }

  const enlace = (href: string) =>
    `transition ${
      pathname === href || pathname.startsWith(href + "/")
        ? "text-mielbrillante"
        : "text-crema/70 hover:text-crema"
    }`;

  return (
    <header className="relative border-b border-crema/10 bg-nogaldark/70 pt-[env(safe-area-inset-top)]">
      {navegando && <div className="absolute inset-x-0 bottom-0 h-0.5 bg-mielbrillante animate-pulse" />}
      <div className="max-w-5xl mx-auto flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-2 whitespace-nowrap">
          <Link href="/" onClick={(e) => navegar(e, "/")} className="shrink-0">
            <Logo size={34} />
          </Link>
          <div className="flex items-baseline gap-2">
            <Link href="/" onClick={(e) => navegar(e, "/")} className="font-display text-lg text-crema">
              Universo <span className="text-mielbrillante">Val-Ben</span>
            </Link>
            <Link
              href="/novedades"
              className="text-[10px] font-body text-crema/40 hover:text-crema/70 hover:underline"
            >
              {APP_VERSION}
            </Link>
          </div>
        </div>

        <nav className="hidden md:flex items-center gap-5 text-sm">
          {status === "authenticated" && (
            <>
              {SECCIONES.map((s) => (
                <Link key={s.href} href={s.href} onClick={(e) => navegar(e, s.href)} className={enlace(s.href)}>
                  {s.label}
                </Link>
              ))}
              <Link href="/ayuda" onClick={(e) => navegar(e, "/ayuda")} className={enlace("/ayuda")}>
                Ayuda
              </Link>
              <Link href="/ajustes" onClick={(e) => navegar(e, "/ajustes")} className={enlace("/ajustes")}>
                Mis datos
              </Link>
              <button onClick={() => signOut()} className="text-crema/50 hover:text-coral transition">
                Salir
              </button>
            </>
          )}
          {status === "unauthenticated" && (
            <button onClick={() => signIn("google")} className="boton py-1.5 text-sm">
              Entrar con Google
            </button>
          )}
        </nav>

        <button
          onClick={actualizar}
          disabled={navegando}
          aria-label="Actualizar página"
          className="md:hidden text-crema/60 hover:text-crema transition p-1.5 -mr-1.5 disabled:opacity-50"
        >
          <svg
            viewBox="0 0 24 24"
            width="22"
            height="22"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.8}
            strokeLinecap="round"
            strokeLinejoin="round"
            className={navegando ? "animate-spin" : ""}
          >
            <path d="M3 12a9 9 0 0 1 15-6.7L21 8" />
            <path d="M21 3v5h-5" />
            <path d="M21 12a9 9 0 0 1-15 6.7L3 16" />
            <path d="M3 21v-5h5" />
          </svg>
        </button>
      </div>
    </header>
  );
}
