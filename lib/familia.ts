// Relaciones familiares y colocación del árbol, a partir solo de tres
// datos por persona: sus dos progenitores y su pareja. Todo lo demás
// (hermanos, tíos, sobrinos, cuñados...) se deduce de ahí, así que el admin
// solo tiene que rellenar eso al dar de alta a alguien.

export type NodoFamilia = {
  id: string;
  nombre: string;
  progenitor1Id: string | null;
  progenitor2Id: string | null;
  parejaId: string | null;
  fechaNacimiento: Date | null;
};

export type Grupo = { etiqueta: string; ids: string[] };

export function nombreMostrado(p: { nombre: string; apodo?: string | null }): string {
  return p.apodo?.trim() || p.nombre;
}

export function nombreCompleto(p: { nombre: string; apellidos?: string | null }): string {
  return [p.nombre, p.apellidos].filter(Boolean).join(" ");
}

export function iniciales(nombre: string): string {
  return nombre
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]!.toUpperCase())
    .join("");
}

// Mayor primero; quien no tiene fecha, al final y por nombre.
export function compararPorEdad(a: NodoFamilia, b: NodoFamilia): number {
  const fa = a.fechaNacimiento?.getTime() ?? Infinity;
  const fb = b.fechaNacimiento?.getTime() ?? Infinity;
  if (fa !== fb) return fa - fb;
  return a.nombre.localeCompare(b.nombre, "es");
}

export class Familia {
  private porId = new Map<string, NodoFamilia>();
  private hijosDe = new Map<string, string[]>();

  constructor(nodos: NodoFamilia[]) {
    for (const n of nodos) this.porId.set(n.id, n);
    for (const n of nodos) {
      for (const p of [n.progenitor1Id, n.progenitor2Id]) {
        if (p && this.porId.has(p)) {
          const lista = this.hijosDe.get(p) ?? [];
          lista.push(n.id);
          this.hijosDe.set(p, lista);
        }
      }
    }
  }

  get(id: string): NodoFamilia | undefined {
    return this.porId.get(id);
  }

  todos(): NodoFamilia[] {
    return [...this.porId.values()];
  }

  private ordenar(ids: Iterable<string>, excluir: string[] = []): string[] {
    const set = new Set(ids);
    for (const e of excluir) set.delete(e);
    return [...set]
      .map((id) => this.porId.get(id))
      .filter((n): n is NodoFamilia => !!n)
      .sort(compararPorEdad)
      .map((n) => n.id);
  }

  progenitores(id: string): string[] {
    const n = this.porId.get(id);
    if (!n) return [];
    return [n.progenitor1Id, n.progenitor2Id].filter(
      (p): p is string => !!p && this.porId.has(p)
    );
  }

  pareja(id: string): string | null {
    const p = this.porId.get(id)?.parejaId;
    return p && this.porId.has(p) ? p : null;
  }

  hijos(id: string): string[] {
    return this.ordenar(this.hijosDe.get(id) ?? []);
  }

  // Comparten al menos un progenitor (incluye medio hermanos).
  hermanos(id: string): string[] {
    const res: string[] = [];
    for (const p of this.progenitores(id)) res.push(...(this.hijosDe.get(p) ?? []));
    return this.ordenar(res, [id]);
  }

  abuelos(id: string): string[] {
    return this.ordenar(this.progenitores(id).flatMap((p) => this.progenitores(p)));
  }

  nietos(id: string): string[] {
    return this.ordenar(this.hijos(id).flatMap((h) => this.hijos(h)));
  }

  // Hermanos de los progenitores y sus parejas.
  tios(id: string): string[] {
    const hermanosProg = this.progenitores(id).flatMap((p) => this.hermanos(p));
    const parejas = hermanosProg.map((h) => this.pareja(h)).filter((x): x is string => !!x);
    return this.ordenar([...hermanosProg, ...parejas], this.progenitores(id));
  }

  // Hijos de los hermanos, y de los hermanos de la pareja.
  sobrinos(id: string): string[] {
    const pareja = this.pareja(id);
    const hermanos = [...this.hermanos(id), ...(pareja ? this.hermanos(pareja) : [])];
    return this.ordenar(hermanos.flatMap((h) => this.hijos(h)));
  }

  primos(id: string): string[] {
    const hermanosProg = this.progenitores(id).flatMap((p) => this.hermanos(p));
    return this.ordenar(hermanosProg.flatMap((h) => this.hijos(h)), [id]);
  }

  // Parejas de los hermanos, y hermanos (y sus parejas) de la pareja.
  cunados(id: string): string[] {
    const res: string[] = [];
    for (const h of this.hermanos(id)) {
      const p = this.pareja(h);
      if (p) res.push(p);
    }
    const pareja = this.pareja(id);
    if (pareja) {
      for (const h of this.hermanos(pareja)) {
        res.push(h);
        const p = this.pareja(h);
        if (p) res.push(p);
      }
    }
    return this.ordenar(res, [id]);
  }

  suegros(id: string): string[] {
    const pareja = this.pareja(id);
    return pareja ? this.ordenar(this.progenitores(pareja)) : [];
  }

  yernosNueras(id: string): string[] {
    return this.ordenar(
      this.hijos(id)
        .map((h) => this.pareja(h))
        .filter((x): x is string => !!x)
    );
  }

  // Todas las relaciones con nombre que tiene alguien, en el orden en que se
  // muestran en su ficha. Los grupos vacíos no salen.
  relaciones(id: string): Grupo[] {
    const pareja = this.pareja(id);
    const grupos: Grupo[] = [
      { etiqueta: "Pareja", ids: pareja ? [pareja] : [] },
      { etiqueta: "Padres", ids: this.ordenar(this.progenitores(id)) },
      { etiqueta: "Hijos", ids: this.hijos(id) },
      { etiqueta: "Hermanos", ids: this.hermanos(id) },
      { etiqueta: "Abuelos", ids: this.abuelos(id) },
      { etiqueta: "Nietos", ids: this.nietos(id) },
      { etiqueta: "Tíos", ids: this.tios(id) },
      { etiqueta: "Sobrinos", ids: this.sobrinos(id) },
      { etiqueta: "Primos", ids: this.primos(id) },
      { etiqueta: "Cuñados", ids: this.cunados(id) },
      { etiqueta: "Suegros", ids: this.suegros(id) },
      { etiqueta: "Yernos y nueras", ids: this.yernosNueras(id) },
    ];
    return grupos.filter((g) => g.ids.length > 0);
  }

  // ¿Es `ancestro` progenitor o abuelo de `id`? (para dejarle rellenar
  // hitos y recuerdos de sus hijos y nietos).
  esProgenitorOAbuelo(ancestro: string, id: string): boolean {
    const progs = this.progenitores(id);
    if (progs.includes(ancestro)) return true;
    return progs.some((p) => this.progenitores(p).includes(ancestro));
  }
}

// ---------------------------------------------------------------------------
// Colocación del árbol
// ---------------------------------------------------------------------------
//
// Filas por generación (abuelos arriba, nietos abajo). En cada fila, cada
// "unidad" es una persona sola o una pareja (que van juntas). El orden de
// las unidades en cada fila se decide mirando dónde están los padres en la
// fila de arriba (cada unidad se coloca bajo la media de las posiciones de
// sus padres), y entre hermanos, por edad.

export type ArbolColocado = {
  filas: string[][][]; // fila → unidades → ids (1 o 2)
  // Cada hijo con sus progenitores (que estén en el árbol), para dibujar
  // las líneas.
  enlaces: { hijo: string; progenitores: string[] }[];
};

export function colocarArbol(nodos: NodoFamilia[], ancla?: string | null): ArbolColocado {
  const familia = new Familia(nodos);
  const gen = new Map<string, number>();

  // 1) Generación de cada persona: recorrido en anchura desde el ancla
  // (padres = -1, hijos = +1, pareja = misma). Grupos sin conexión con el
  // ancla se recorren aparte, empezando también en 0.
  const ordenInicio = [...nodos].sort(compararPorEdad).map((n) => n.id);
  if (ancla && familia.get(ancla)) {
    ordenInicio.splice(ordenInicio.indexOf(ancla), 1);
    ordenInicio.unshift(ancla);
  }
  for (const inicio of ordenInicio) {
    if (gen.has(inicio)) continue;
    gen.set(inicio, 0);
    const cola = [inicio];
    while (cola.length) {
      const id = cola.shift()!;
      const g = gen.get(id)!;
      const vecinos: [string, number][] = [
        ...familia.progenitores(id).map((p) => [p, g - 1] as [string, number]),
        ...familia.hijos(id).map((h) => [h, g + 1] as [string, number]),
      ];
      const pareja = familia.pareja(id);
      if (pareja) vecinos.push([pareja, g]);
      for (const [v, gv] of vecinos) {
        if (!gen.has(v)) {
          gen.set(v, gv);
          cola.push(v);
        }
      }
    }
  }

  const minGen = Math.min(...gen.values(), 0);
  const maxGen = Math.max(...gen.values(), 0);
  const numFilas = nodos.length ? maxGen - minGen + 1 : 0;

  // 2) Unidades por fila: parejas juntas (si están en la misma generación).
  const unidadesPorFila: string[][][] = Array.from({ length: numFilas }, () => []);
  const enUnidad = new Set<string>();
  for (const id of [...nodos].sort(compararPorEdad).map((n) => n.id)) {
    if (enUnidad.has(id)) continue;
    const fila = gen.get(id)! - minGen;
    const pareja = familia.pareja(id);
    const unidad = [id];
    if (pareja && !enUnidad.has(pareja) && gen.get(pareja) === gen.get(id)) unidad.push(pareja);
    unidad.forEach((u) => enUnidad.add(u));
    unidadesPorFila[fila].push(unidad);
  }

  // 3) Orden: la primera fila por edad; las demás, bajo sus padres.
  const posicion = new Map<string, number>(); // id → índice de su unidad en su fila
  const filas: string[][][] = [];
  for (let f = 0; f < numFilas; f++) {
    const unidades = unidadesPorFila[f].map((unidad) => {
      // Dentro de una pareja, primero quien tiene a sus padres más a la
      // izquierda (o quien tiene padres en el árbol, frente al "político").
      const claveMiembro = (id: string) => {
        const ps = familia.progenitores(id).filter((p) => posicion.has(p));
        return ps.length ? ps.reduce((s, p) => s + posicion.get(p)!, 0) / ps.length : null;
      };
      const ordenada = [...unidad].sort((a, b) => {
        const ka = claveMiembro(a);
        const kb = claveMiembro(b);
        if (ka === null && kb === null) return 0;
        if (ka === null) return 1;
        if (kb === null) return -1;
        return ka - kb;
      });
      const claves = ordenada.map(claveMiembro).filter((k): k is number => k !== null);
      const clave = claves.length ? claves.reduce((s, k) => s + k, 0) / claves.length : null;
      return { unidad: ordenada, clave };
    });
    const primeroDe = (u: { unidad: string[] }) => familia.get(u.unidad[0])!;
    unidades.sort((a, b) => {
      if (a.clave !== null && b.clave !== null && a.clave !== b.clave) return a.clave - b.clave;
      if (a.clave === null && b.clave !== null) return 1;
      if (a.clave !== null && b.clave === null) return -1;
      return compararPorEdad(primeroDe(a), primeroDe(b));
    });
    unidades.forEach((u, i) => u.unidad.forEach((id) => posicion.set(id, i)));
    filas.push(unidades.map((u) => u.unidad));
  }

  const enlaces = nodos
    .map((n) => ({ hijo: n.id, progenitores: familia.progenitores(n.id) }))
    .filter((e) => e.progenitores.length > 0);

  return { filas, enlaces };
}
