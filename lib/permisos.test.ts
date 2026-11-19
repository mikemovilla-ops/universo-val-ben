import { describe, expect, it } from "vitest";
import { Familia } from "@/lib/familia";
import {
  puedeBorrarReceta,
  puedeEscribirRecuerdos,
  puedeRedactarRecetas,
  type Quien,
} from "@/lib/permisos";

const familia = new Familia([
  { id: "papa", nombre: "papa", progenitor1Id: null, progenitor2Id: null, parejaId: null, fechaNacimiento: null },
  { id: "hijo", nombre: "hijo", progenitor1Id: "papa", progenitor2Id: null, parejaId: null, fechaNacimiento: null },
  { id: "nieto", nombre: "nieto", progenitor1Id: "hijo", progenitor2Id: null, parejaId: null, fechaNacimiento: null },
  { id: "tio", nombre: "tio", progenitor1Id: null, progenitor2Id: null, parejaId: null, fechaNacimiento: null },
]);

const q = (personaId: string | null, rol: Quien["rol"] = "FAMILIAR", isAdmin = false): Quien => ({
  personaId,
  rol,
  isAdmin,
});

describe("puedeEscribirRecuerdos", () => {
  it("uno mismo, sus padres y sus abuelos sí", () => {
    expect(puedeEscribirRecuerdos(q("nieto"), "nieto", familia)).toBe(true);
    expect(puedeEscribirRecuerdos(q("hijo"), "nieto", familia)).toBe(true);
    expect(puedeEscribirRecuerdos(q("papa"), "nieto", familia)).toBe(true);
  });
  it("otros no (salvo el admin)", () => {
    expect(puedeEscribirRecuerdos(q("tio"), "nieto", familia)).toBe(false);
    expect(puedeEscribirRecuerdos(q("nieto"), "hijo", familia)).toBe(false);
    expect(puedeEscribirRecuerdos(q(null, null, true), "hijo", familia)).toBe(true);
  });
});

describe("recetas", () => {
  it("solo padres y admin redactan", () => {
    expect(puedeRedactarRecetas(q("papa", "PADRE"))).toBe(true);
    expect(puedeRedactarRecetas(q("hijo", "HIJO"))).toBe(false);
    expect(puedeRedactarRecetas(q(null, null, true))).toBe(true);
  });
  it("quien la pidió la puede borrar solo mientras nadie la ha empezado", () => {
    expect(puedeBorrarReceta(q("hijo", "HIJO"), { estado: "PEDIDA", pedidaPorId: "hijo" })).toBe(true);
    expect(puedeBorrarReceta(q("hijo", "HIJO"), { estado: "EN_CURSO", pedidaPorId: "hijo" })).toBe(false);
    expect(puedeBorrarReceta(q("tio"), { estado: "PEDIDA", pedidaPorId: "hijo" })).toBe(false);
  });
});
