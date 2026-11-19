"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import SubirImagen from "@/components/SubirImagen";

export type ValoresPersona = {
  nombre: string;
  apellidos: string;
  apodo: string;
  email: string;
  telefono: string;
  fechaNacimiento: string; // YYYY-MM-DD
  fechaFallecimiento: string;
  lugarNacimiento: string;
  fotoUrl: string | null;
  sobreMi: string;
  rol: "PADRE" | "HIJO" | "FAMILIAR";
  esNucleo: boolean;
  avisosEmail: boolean;
  emailAvisos: string;
  progenitor1Id: string;
  progenitor2Id: string;
  parejaId: string;
};

export const VALORES_VACIOS: ValoresPersona = {
  nombre: "",
  apellidos: "",
  apodo: "",
  email: "",
  telefono: "",
  fechaNacimiento: "",
  fechaFallecimiento: "",
  lugarNacimiento: "",
  fotoUrl: null,
  sobreMi: "",
  rol: "FAMILIAR",
  esNucleo: false,
  avisosEmail: true,
  emailAvisos: "",
  progenitor1Id: "",
  progenitor2Id: "",
  parejaId: "",
};

const ROLES = [
  { valor: "PADRE", titulo: "Padre / Madre", ayuda: "Escribe las recetas que piden los hijos." },
  { valor: "HIJO", titulo: "Hijo / Hija", ayuda: "Pide recetas y le avisan cuando están listas." },
  { valor: "FAMILIAR", titulo: "Resto de la familia", ayuda: "Ve todo y puede subir fotos." },
] as const;

// Formulario de una persona. Tres modos:
//  - "nueva": el admin da de alta a alguien.
//  - "admin": el admin edita todo (incluidas relaciones y email de acceso).
//  - "propio": cada uno edita sus datos de contacto, foto y "sobre mí".
export default function FormPersona({
  modo,
  id,
  inicial,
  otras,
}: {
  modo: "nueva" | "admin" | "propio";
  id?: string;
  inicial: ValoresPersona;
  otras: { id: string; nombre: string }[];
}) {
  const router = useRouter();
  const [v, setV] = useState(inicial);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState(false);
  const [, startTransition] = useTransition();
  const admin = modo !== "propio";

  function set<K extends keyof ValoresPersona>(k: K, valor: ValoresPersona[K]) {
    setV((prev) => ({ ...prev, [k]: valor }));
    setOk(false);
  }

  async function guardar(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setGuardando(true);
    const comunes = {
      apodo: v.apodo,
      telefono: v.telefono,
      fechaNacimiento: v.fechaNacimiento,
      lugarNacimiento: v.lugarNacimiento,
      fotoUrl: v.fotoUrl,
      sobreMi: v.sobreMi,
      avisosEmail: v.avisosEmail,
      emailAvisos: v.emailAvisos,
    };
    const body = admin
      ? {
          ...comunes,
          nombre: v.nombre,
          apellidos: v.apellidos,
          email: v.email,
          fechaFallecimiento: v.fechaFallecimiento,
          rol: v.rol,
          esNucleo: v.esNucleo,
          progenitor1Id: v.progenitor1Id,
          progenitor2Id: v.progenitor2Id,
          parejaId: v.parejaId,
        }
      : comunes;
    try {
      const res = await fetch(modo === "nueva" ? "/api/personas" : `/api/personas/${id}`, {
        method: modo === "nueva" ? "POST" : "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error ?? "No se pudo guardar.");
      const destino = `/familia/${modo === "nueva" ? data.id : id}`;
      if (modo === "propio") {
        setOk(true);
        setGuardando(false);
        startTransition(() => router.refresh());
      } else {
        startTransition(() => {
          router.push(destino);
          router.refresh();
        });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo guardar.");
      setGuardando(false);
    }
  }

  const selectPersona = (campo: "progenitor1Id" | "progenitor2Id" | "parejaId", etiqueta: string) => (
    <label className="block">
      <span className="etiqueta-campo">{etiqueta}</span>
      <select className="campo" value={v[campo]} onChange={(e) => set(campo, e.target.value)}>
        <option value="">— Nadie / no está en el árbol —</option>
        {otras.map((o) => (
          <option key={o.id} value={o.id}>
            {o.nombre}
          </option>
        ))}
      </select>
    </label>
  );

  return (
    <form onSubmit={guardar} className="space-y-6">
      <section className="card p-5 space-y-4">
        <h2 className="font-display text-lg">Foto</h2>
        <SubirImagen
          carpeta="personas"
          url={v.fotoUrl}
          onCambio={(u) => set("fotoUrl", u)}
          texto="📷 Poner foto"
          redonda
        />
      </section>

      <section className="card p-5 space-y-4">
        <h2 className="font-display text-lg">Datos</h2>
        {admin && (
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="etiqueta-campo">Nombre *</span>
              <input className="campo" required value={v.nombre} onChange={(e) => set("nombre", e.target.value)} />
            </label>
            <label className="block">
              <span className="etiqueta-campo">Apellidos</span>
              <input className="campo" value={v.apellidos} onChange={(e) => set("apellidos", e.target.value)} />
            </label>
          </div>
        )}
        <label className="block">
          <span className="etiqueta-campo">Cómo le llamamos (opcional)</span>
          <input
            className="campo"
            placeholder="Ej.: Mamá, Abuelo Paco, Chiqui…"
            value={v.apodo}
            onChange={(e) => set("apodo", e.target.value)}
          />
          <span className="text-xs text-crema/40">Si lo rellenas, es el nombre que se ve en toda la app.</span>
        </label>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block">
            <span className="etiqueta-campo">Fecha de nacimiento</span>
            <input
              type="date"
              className="campo"
              value={v.fechaNacimiento}
              onChange={(e) => set("fechaNacimiento", e.target.value)}
            />
          </label>
          <label className="block">
            <span className="etiqueta-campo">Lugar de nacimiento</span>
            <input className="campo" value={v.lugarNacimiento} onChange={(e) => set("lugarNacimiento", e.target.value)} />
          </label>
        </div>
        <label className="block">
          <span className="etiqueta-campo">Teléfono</span>
          <input
            type="tel"
            className="campo"
            placeholder="600 123 456"
            value={v.telefono}
            onChange={(e) => set("telefono", e.target.value)}
          />
        </label>
        <label className="block">
          <span className="etiqueta-campo">Sobre mí</span>
          <textarea
            className="campo min-h-24"
            placeholder="Aficiones, a qué se dedica, lo que quieras contar…"
            value={v.sobreMi}
            onChange={(e) => set("sobreMi", e.target.value)}
          />
        </label>
        {admin && (
          <label className="block">
            <span className="etiqueta-campo">Fecha de fallecimiento (si es el caso)</span>
            <input
              type="date"
              className="campo"
              value={v.fechaFallecimiento}
              onChange={(e) => set("fechaFallecimiento", e.target.value)}
            />
          </label>
        )}
      </section>

      {admin && (
        <section className="card p-5 space-y-4">
          <h2 className="font-display text-lg">Lugar en el árbol</h2>
          <p className="text-sm text-crema/60">
            Basta con decir sus padres y su pareja: hermanos, tíos, sobrinos, cuñados… se calculan solos.
          </p>
          <div className="grid gap-4 sm:grid-cols-2">
            {selectPersona("progenitor1Id", "Padre o madre")}
            {selectPersona("progenitor2Id", "El otro padre o madre")}
          </div>
          {selectPersona("parejaId", "Pareja")}
          <label className="flex items-start gap-3">
            <input
              type="checkbox"
              className="mt-1 h-5 w-5 accent-miel"
              checked={v.esNucleo}
              onChange={(e) => set("esNucleo", e.target.checked)}
            />
            <span>
              Es uno de los 5 (padres e hijos)
              <span className="block text-xs text-crema/50">Sale destacado en el árbol.</span>
            </span>
          </label>
        </section>
      )}

      {admin && (
        <section className="card p-5 space-y-4">
          <h2 className="font-display text-lg">Acceso a la app</h2>
          <label className="block">
            <span className="etiqueta-campo">Email de Google</span>
            <input
              type="email"
              className="campo"
              placeholder="nombre@gmail.com"
              value={v.email}
              onChange={(e) => set("email", e.target.value)}
            />
            <span className="text-xs text-crema/40">
              Con este email podrá entrar en la app. Déjalo vacío si no va a entrar (abuelos, niños…).
            </span>
          </label>
          <fieldset className="space-y-2">
            <legend className="etiqueta-campo">¿Qué puede hacer?</legend>
            {ROLES.map((r) => (
              <label key={r.valor} className="flex items-start gap-3 rounded-xl border border-crema/10 p-3">
                <input
                  type="radio"
                  name="rol"
                  className="mt-1 h-5 w-5 accent-miel"
                  checked={v.rol === r.valor}
                  onChange={() => set("rol", r.valor)}
                />
                <span>
                  {r.titulo}
                  <span className="block text-xs text-crema/50">{r.ayuda}</span>
                </span>
              </label>
            ))}
          </fieldset>
        </section>
      )}

      {modo !== "nueva" && (
        <section className="card p-5 space-y-4">
          <h2 className="font-display text-lg">Avisos por email</h2>
          <label className="flex items-start gap-3">
            <input
              type="checkbox"
              className="mt-1 h-5 w-5 accent-miel"
              checked={v.avisosEmail}
              onChange={(e) => set("avisosEmail", e.target.checked)}
            />
            <span>
              Recibir avisos de recetas
              <span className="block text-xs text-crema/50">
                A los padres cuando alguien pide una receta; a los hijos cuando una receta está lista.
              </span>
            </span>
          </label>
          {v.avisosEmail && (
            <label className="block">
              <span className="etiqueta-campo">Mandar los avisos a otro email (opcional)</span>
              <input
                type="email"
                className="campo"
                placeholder="Si lo dejas vacío, al de Google"
                value={v.emailAvisos}
                onChange={(e) => set("emailAvisos", e.target.value)}
              />
            </label>
          )}
        </section>
      )}

      {error && <p className="text-coral">{error}</p>}
      {ok && <p className="text-salvia">✅ Guardado.</p>}
      <div className="flex flex-wrap gap-3">
        <button type="submit" disabled={guardando} className="boton text-lg px-6">
          {guardando ? "Guardando…" : modo === "nueva" ? "Añadir a la familia" : "Guardar"}
        </button>
        {modo !== "propio" && (
          <button type="button" onClick={() => router.back()} className="boton-secundario">
            Cancelar
          </button>
        )}
      </div>
    </form>
  );
}
