import "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      isAdmin: boolean;
      // La persona del árbol que corresponde a este email (null si es un
      // admin que todavía no se ha dado de alta a sí mismo).
      personaId: string | null;
      rol: "PADRE" | "HIJO" | "FAMILIAR" | null;
      nombreFamilia: string | null;
      name?: string | null;
      email?: string | null;
      image?: string | null;
    };
  }
}
