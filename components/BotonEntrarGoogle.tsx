"use client";

import { signIn } from "next-auth/react";

export default function BotonEntrarGoogle({ className = "boton text-lg px-6 py-3" }: { className?: string }) {
  return (
    <button onClick={() => signIn("google")} className={className}>
      Entrar con Google
    </button>
  );
}
