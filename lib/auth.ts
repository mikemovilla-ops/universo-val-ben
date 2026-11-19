import { PrismaAdapter } from "@next-auth/prisma-adapter";
import type { AuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { prisma } from "@/lib/prisma";

// Los emails de ADMIN_EMAILS (separados por comas) gestionan la familia:
// añadir personas, relaciones, fotos de perfil...
export const ADMIN_EMAILS = (process.env.ADMIN_EMAILS ?? "")
  .split(",")
  .map((e) => e.trim().toLowerCase())
  .filter(Boolean);

export function esEmailAdmin(email: string | null | undefined): boolean {
  return !!email && ADMIN_EMAILS.includes(email.toLowerCase());
}

export const authOptions: AuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  session: { strategy: "database" },
  // Si alguien de fuera intenta entrar, en vez de la página de error de
  // NextAuth (en inglés) se le explica qué pasa.
  pages: { error: "/acceso-denegado" },
  callbacks: {
    // Es una app privada de la familia (teléfonos, fechas de nacimiento,
    // fotos): solo entran los admins y quien esté dado de alta como persona
    // con ese email.
    async signIn({ user }) {
      const email = (user.email ?? "").toLowerCase();
      if (!email) return false;
      if (esEmailAdmin(email)) return true;
      const persona = await prisma.persona.findUnique({ where: { email }, select: { id: true } });
      return !!persona;
    },
    async session({ session, user }) {
      if (session.user) {
        const email = (user.email ?? "").toLowerCase();
        const persona = email
          ? await prisma.persona.findUnique({
              where: { email },
              select: { id: true, rol: true, nombre: true, apodo: true },
            })
          : null;
        session.user.id = user.id;
        session.user.isAdmin = esEmailAdmin(email);
        session.user.personaId = persona?.id ?? null;
        session.user.rol = persona?.rol ?? null;
        session.user.nombreFamilia = persona ? persona.apodo?.trim() || persona.nombre : null;
      }
      return session;
    },
  },
};
