"use client";

import Link from "next/link";
import { useTransition, type ReactNode, type MouseEvent } from "react";
import { useRouter } from "next/navigation";

// Un <Link> que se atenúa mientras carga la página siguiente, para que en
// el móvil se note que el toque ha funcionado (y no se toque otra vez).
export default function EnlaceConCarga({
  href,
  className = "",
  children,
}: {
  href: string;
  className?: string;
  children: ReactNode;
}) {
  const router = useRouter();
  const [navegando, startTransition] = useTransition();

  function onClick(e: MouseEvent) {
    if (e.metaKey || e.ctrlKey) return; // abrir en otra pestaña
    e.preventDefault();
    if (navegando) return;
    startTransition(() => router.push(href));
  }

  return (
    <Link href={href} onClick={onClick} className={`${className} transition-opacity ${navegando ? "opacity-50" : ""}`}>
      {children}
    </Link>
  );
}
