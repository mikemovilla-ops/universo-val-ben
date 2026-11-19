import { describe, expect, it } from "vitest";
import { coincideBusqueda, faltaParaTerminar, limpiarContenidoReceta } from "@/lib/recetas";

describe("limpiarContenidoReceta", () => {
  it("quita filas vacías y recorta espacios", () => {
    const c = limpiarContenidoReceta({
      titulo: "  Croquetas ",
      ingredientes: [
        { cantidad: "1 l", nombre: " leche " },
        { cantidad: "2", nombre: "" },
      ],
      pasos: [{ texto: "Hacer la bechamel" }, { texto: "   " }],
      fotos: [{ url: "javascript:alert(1)" }, { url: "https://x.public.blob.vercel-storage.com/a.jpg", pie: "Así quedan" }],
    });
    expect(c.titulo).toBe("Croquetas");
    expect(c.ingredientes).toEqual([{ cantidad: "1 l", nombre: "leche" }]);
    expect(c.pasos).toEqual([{ texto: "Hacer la bechamel", fotoUrl: null }]);
    expect(c.fotos).toHaveLength(1);
    expect(c.categoria).toBeNull();
  });
});

describe("coincideBusqueda", () => {
  const r = {
    titulo: "Albóndigas de la abuela",
    nota: null,
    categoria: "Carnes",
    ingredientes: ["Carne picada", "Pan rallado"],
    pasos: ["Freír en aceite de oliva"],
  };
  it("sin tildes ni mayúsculas", () => {
    expect(coincideBusqueda(r, "ALBONDIGAS")).toBe(true);
  });
  it("todas las palabras, en cualquier campo", () => {
    expect(coincideBusqueda(r, "abuela pan")).toBe(true);
    expect(coincideBusqueda(r, "abuela pescado")).toBe(false);
    expect(coincideBusqueda(r, "oliva")).toBe(true);
  });
  it("búsqueda vacía coincide con todo", () => {
    expect(coincideBusqueda(r, "  ")).toBe(true);
  });
});

describe("faltaParaTerminar", () => {
  it("pide título, ingredientes y pasos", () => {
    expect(faltaParaTerminar({ titulo: "", ingredientes: [], pasos: [] })).toHaveLength(3);
    expect(faltaParaTerminar({ titulo: "X", ingredientes: [1], pasos: [1] })).toEqual([]);
  });
});
