import { describe, expect, it } from "vitest";
import { deYMD, edad, hoyMadrid, proximoCumpleanos, textoDiasHasta } from "@/lib/fechas";

const d = (s: string) => new Date(s + "T00:00:00Z");

describe("hoyMadrid", () => {
  it("usa el día de Madrid, no el de UTC", () => {
    // 23:30 UTC del 17 de nov = 00:30 del 18 en Madrid (CET, UTC+1)
    expect(hoyMadrid(new Date("2026-11-17T23:30:00Z"))).toBe("2026-11-18");
    expect(hoyMadrid(new Date("2026-11-17T22:30:00Z"))).toBe("2026-11-17");
  });
});

describe("proximoCumpleanos", () => {
  it("hoy es su cumpleaños", () => {
    expect(proximoCumpleanos(d("1990-11-18"), "2026-11-18")).toEqual({ dias: 0, edad: 36, fecha: "2026-11-18" });
  });
  it("todavía no ha llegado este año", () => {
    expect(proximoCumpleanos(d("1990-12-01"), "2026-11-18")).toMatchObject({ dias: 13, edad: 36 });
  });
  it("ya pasó este año: el del año que viene", () => {
    expect(proximoCumpleanos(d("1990-01-05"), "2026-11-18")).toMatchObject({ dias: 48, edad: 37, fecha: "2027-01-05" });
  });
  it("29 de febrero en año no bisiesto se celebra el 28", () => {
    expect(proximoCumpleanos(d("2000-02-29"), "2027-02-01")).toMatchObject({ fecha: "2027-02-28", edad: 27 });
    expect(proximoCumpleanos(d("2000-02-29"), "2028-02-01")).toMatchObject({ fecha: "2028-02-29", edad: 28 });
  });
});

describe("edad", () => {
  it("cuenta si ya ha cumplido este año", () => {
    expect(edad(d("1990-11-18"), "2026-11-17")).toBe(35);
    expect(edad(d("1990-11-18"), "2026-11-18")).toBe(36);
  });
});

describe("deYMD", () => {
  it("acepta YYYY-MM-DD y rechaza lo demás", () => {
    expect(deYMD("2026-01-02")?.toISOString()).toBe("2026-01-02T00:00:00.000Z");
    expect(deYMD("")).toBeNull();
    expect(deYMD("02/01/2026")).toBeNull();
  });
});

describe("textoDiasHasta", () => {
  it("hoy, mañana y en N días", () => {
    expect(textoDiasHasta(0)).toBe("¡hoy!");
    expect(textoDiasHasta(1)).toBe("mañana");
    expect(textoDiasHasta(5)).toBe("en 5 días");
  });
});
