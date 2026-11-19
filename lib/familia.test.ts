import { describe, expect, it } from "vitest";
import { colocarArbol, Familia, type NodoFamilia } from "@/lib/familia";

// Familia de ejemplo:
//   abuelo + abuela            otroAbuelo
//        |                         |
//      papa  +  mama  (mama es hija de otroAbuelo)
//        |
//   hijo1 (+ cunada), hijo2, hija3 (+ cunado)
//     |                         |
//   sobrino1                 sobrina2
function n(
  id: string,
  nac: string,
  p1: string | null = null,
  p2: string | null = null,
  pareja: string | null = null
): NodoFamilia {
  return {
    id,
    nombre: id,
    progenitor1Id: p1,
    progenitor2Id: p2,
    parejaId: pareja,
    fechaNacimiento: new Date(nac + "T00:00:00Z"),
  };
}

const nodos: NodoFamilia[] = [
  n("abuelo", "1930-01-01", null, null, "abuela"),
  n("abuela", "1932-01-01", null, null, "abuelo"),
  n("otroAbuelo", "1931-01-01"),
  n("papa", "1958-01-01", "abuelo", "abuela", "mama"),
  n("mama", "1960-01-01", "otroAbuelo", null, "papa"),
  n("tia", "1962-01-01", "abuelo", "abuela"),
  n("hijo1", "1985-01-01", "papa", "mama", "cunada"),
  n("hijo2", "1988-01-01", "papa", "mama"),
  n("hija3", "1990-01-01", "papa", "mama", "cunado"),
  n("cunada", "1986-01-01", null, null, "hijo1"),
  n("cunado", "1989-01-01", null, null, "hija3"),
  n("sobrino1", "2015-01-01", "hijo1", "cunada"),
  n("sobrina2", "2018-01-01", "hija3", "cunado"),
];

const f = new Familia(nodos);

describe("Familia: relaciones", () => {
  it("hijos y hermanos, ordenados por edad", () => {
    expect(f.hijos("papa")).toEqual(["hijo1", "hijo2", "hija3"]);
    expect(f.hermanos("hijo2")).toEqual(["hijo1", "hija3"]);
  });
  it("abuelos y nietos", () => {
    expect(f.abuelos("hijo1")).toEqual(["abuelo", "otroAbuelo", "abuela"]);
    expect(f.nietos("papa")).toEqual(["sobrino1", "sobrina2"]);
  });
  it("tíos, sobrinos y primos", () => {
    expect(f.tios("hijo1")).toEqual(["tia"]);
    expect(f.sobrinos("hijo2")).toEqual(["sobrino1", "sobrina2"]);
    // La cuñada también tiene como sobrina a la hija de su cuñada
    expect(f.sobrinos("cunada")).toEqual(["sobrina2"]);
    expect(f.primos("sobrino1")).toEqual(["sobrina2"]);
  });
  it("cuñados en las dos direcciones", () => {
    expect(f.cunados("hijo2")).toEqual(["cunada", "cunado"]);
    expect(f.cunados("cunada")).toEqual(["hijo2", "cunado", "hija3"]);
  });
  it("suegros y yernos/nueras", () => {
    expect(f.suegros("cunada")).toEqual(["papa", "mama"]);
    expect(f.yernosNueras("mama")).toEqual(["cunada", "cunado"]);
  });
  it("relaciones() omite los grupos vacíos", () => {
    const etiquetas = f.relaciones("abuelo").map((g) => g.etiqueta);
    // mamá (pareja de su hijo papá) es su nuera
    expect(etiquetas).toEqual(["Pareja", "Hijos", "Nietos", "Yernos y nueras"]);
  });
  it("progenitores y abuelos pueden escribir recuerdos de hijos y nietos", () => {
    expect(f.esProgenitorOAbuelo("papa", "hijo1")).toBe(true);
    expect(f.esProgenitorOAbuelo("abuela", "hija3")).toBe(true);
    expect(f.esProgenitorOAbuelo("hijo1", "papa")).toBe(false);
    expect(f.esProgenitorOAbuelo("cunada", "hijo2")).toBe(false);
  });
});

describe("colocarArbol", () => {
  const { filas, enlaces } = colocarArbol(nodos, "hijo1");

  it("una fila por generación, de mayores a pequeños", () => {
    expect(filas).toHaveLength(4);
    expect(filas[0].flat().sort()).toEqual(["abuela", "abuelo", "otroAbuelo"]);
    expect(filas[3].flat().sort()).toEqual(["sobrina2", "sobrino1"]);
  });

  it("las parejas van juntas en la misma unidad", () => {
    expect(filas[1]).toContainEqual(["papa", "mama"]);
    expect(filas[2]).toContainEqual(["hijo1", "cunada"]);
  });

  it("los hermanos salen por edad bajo sus padres", () => {
    const ordenHijos = filas[2].flat().filter((id) => ["hijo1", "hijo2", "hija3"].includes(id));
    expect(ordenHijos).toEqual(["hijo1", "hijo2", "hija3"]);
  });

  it("enlaces de cada hijo con sus progenitores", () => {
    expect(enlaces).toContainEqual({ hijo: "sobrino1", progenitores: ["hijo1", "cunada"] });
    expect(enlaces.find((e) => e.hijo === "abuelo")).toBeUndefined();
  });

  it("árbol vacío", () => {
    expect(colocarArbol([])).toEqual({ filas: [], enlaces: [] });
  });
});
