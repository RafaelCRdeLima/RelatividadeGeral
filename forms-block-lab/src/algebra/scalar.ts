/**
 * Álgebra escalar simbólica mínima: o suficiente para representar
 * coeficientes de formas diferenciais (números, coordenadas, símbolos
 * opacos como funções nomeadas, somas, produtos) e diferenciá-los
 * formalmente. Não é um CAS geral — símbolos opacos (ex.: "f") produzem
 * derivadas parciais formais não avaliadas (∂f/∂x), não expressões
 * fechadas, exceto quando o próprio símbolo é uma coordenada ativa.
 */

export type Scalar =
  | { kind: "num"; value: number }
  | { kind: "coord"; name: string }
  | { kind: "symbol"; name: string }
  | { kind: "sum"; terms: Scalar[] }
  | { kind: "product"; factors: Scalar[] }
  | { kind: "partial"; wrts: string[]; of: Scalar };

export const num = (value: number): Scalar => ({ kind: "num", value });
export const coord = (name: string): Scalar => ({ kind: "coord", name });
export const symbol = (name: string): Scalar => ({ kind: "symbol", name });

export const ZERO: Scalar = num(0);
export const ONE: Scalar = num(1);

function isZero(s: Scalar): boolean {
  return s.kind === "num" && s.value === 0;
}

/** Chave estável usada para ordenar e agrupar termos comutativos. */
function scalarKey(s: Scalar): string {
  switch (s.kind) {
    case "num":
      return `0:${s.value}`;
    case "coord":
      return `1:${s.name}`;
    case "symbol":
      return `2:${s.name}`;
    case "sum":
      return `3:[${s.terms.map(scalarKey).sort().join("|")}]`;
    case "product":
      return `4:[${s.factors.map(scalarKey).sort().join("|")}]`;
    case "partial":
      return `5:${s.wrts.slice().sort().join(",")}(${scalarKey(s.of)})`;
  }
}

/** Separa o fator numérico "de fora" de um termo já simplificado — ex.:
 * produto(-1, X) → {coef: -1, base: X}; número puro → {coef: n, base: null}. */
function splitCoefficient(s: Scalar): { coef: number; base: Scalar | null } {
  if (s.kind === "num") return { coef: s.value, base: null };
  if (s.kind === "product") {
    let coef = 1;
    const rest: Scalar[] = [];
    for (const f of s.factors) {
      if (f.kind === "num") coef *= f.value;
      else rest.push(f);
    }
    if (rest.length === 0) return { coef, base: null };
    const base: Scalar = rest.length === 1 ? rest[0] : { kind: "product", factors: rest };
    return { coef, base };
  }
  return { coef: 1, base: s };
}

export function simplify(s: Scalar): Scalar {
  switch (s.kind) {
    case "num":
    case "coord":
    case "symbol":
      return s;

    case "sum": {
      const flat: Scalar[] = [];
      for (const t of s.terms) {
        const st = simplify(t);
        if (st.kind === "sum") flat.push(...st.terms);
        else flat.push(st);
      }
      // separa o multiplicador numérico da base simbólica de cada termo,
      // para que X e -1·X caiam no mesmo grupo e se cancelem — sem isso,
      // "produto(-1, X)" e "X" são tratados como átomos não relacionados.
      let numericTotal = 0;
      const groups = new Map<string, { base: Scalar; coef: number }>();
      for (const t of flat) {
        const { coef, base } = splitCoefficient(t);
        if (base === null) {
          numericTotal += coef;
          continue;
        }
        const key = scalarKey(base);
        const existing = groups.get(key);
        if (existing) existing.coef += coef;
        else groups.set(key, { base, coef });
      }
      const rebuilt: Scalar[] = [];
      if (numericTotal !== 0) rebuilt.push(num(numericTotal));
      for (const { base, coef } of groups.values()) {
        if (coef === 0) continue;
        rebuilt.push(coef === 1 ? base : { kind: "product", factors: [num(coef), base] });
      }
      rebuilt.sort((a, b) => (scalarKey(a) < scalarKey(b) ? -1 : 1));
      if (rebuilt.length === 0) return ZERO;
      if (rebuilt.length === 1) return rebuilt[0];
      return { kind: "sum", terms: rebuilt };
    }

    case "product": {
      const flat: Scalar[] = [];
      for (const f of s.factors) {
        const sf = simplify(f);
        if (sf.kind === "product") flat.push(...sf.factors);
        else flat.push(sf);
      }
      if (flat.some(isZero)) return ZERO;

      // distribui produto sobre soma antes de tratar como monômio — sem
      // isso, "-1 · (a+b)" fica um átomo opaco que nunca cancela com "a+b"
      // em outro lugar da árvore (é o que faz d²=0 exigir esta expansão).
      const sumIndex = flat.findIndex((f) => f.kind === "sum");
      if (sumIndex !== -1) {
        const sumFactor = flat[sumIndex] as Extract<Scalar, { kind: "sum" }>;
        const otherFactors = flat.filter((_, i) => i !== sumIndex);
        const expanded = sumFactor.terms.map((term) =>
          simplify({ kind: "product", factors: [...otherFactors, term] }),
        );
        return simplify({ kind: "sum", terms: expanded });
      }

      let numericTotal = 1;
      const rest: Scalar[] = [];
      for (const f of flat) {
        if (f.kind === "num") numericTotal *= f.value;
        else rest.push(f);
      }
      rest.sort((a, b) => (scalarKey(a) < scalarKey(b) ? -1 : 1));
      const parts: Scalar[] = [];
      if (numericTotal !== 1 || rest.length === 0) parts.push(num(numericTotal));
      parts.push(...rest);
      if (parts.length === 0) return ONE;
      if (parts.length === 1) return parts[0];
      return { kind: "product", factors: parts };
    }

    case "partial": {
      const of = simplify(s.of);
      const wrts = s.wrts.slice().sort();
      if (isZero(of)) return ZERO;
      if (wrts.length === 0) return of;
      return { kind: "partial", wrts, of };
    }
  }
}

export function scalarAdd(a: Scalar, b: Scalar): Scalar {
  return simplify({ kind: "sum", terms: [a, b] });
}

export function scalarMul(a: Scalar, b: Scalar): Scalar {
  return simplify({ kind: "product", factors: [a, b] });
}

/**
 * Deriva parcialmente em relação a uma coordenada. Coordenadas derivam
 * para 0 ou 1 de forma fechada; símbolos opacos geram um nó `partial`
 * formal, propagado por soma e produto (regra de Leibniz padrão).
 */
export function partialDerivative(s: Scalar, wrt: string): Scalar {
  switch (s.kind) {
    case "num":
      return ZERO;
    case "coord":
      return s.name === wrt ? ONE : ZERO;
    case "symbol":
      return simplify({ kind: "partial", wrts: [wrt], of: s });
    case "sum":
      return simplify({ kind: "sum", terms: s.terms.map((t) => partialDerivative(t, wrt)) });
    case "product": {
      const terms: Scalar[] = s.factors.map((_, i) =>
        simplify({
          kind: "product",
          factors: s.factors.map((f, j) => (i === j ? partialDerivative(f, wrt) : f)),
        }),
      );
      return simplify({ kind: "sum", terms });
    }
    case "partial":
      return simplify({ kind: "partial", wrts: [...s.wrts, wrt], of: s.of });
  }
}

export function scalarsEqual(a: Scalar, b: Scalar): boolean {
  return scalarKey(simplify(a)) === scalarKey(simplify(b));
}

export function scalarToLatex(s: Scalar): string {
  switch (s.kind) {
    case "num":
      return String(s.value);
    case "coord":
    case "symbol":
      return s.name;
    case "sum":
      return s.terms.map(scalarToLatex).join(" + ").replace(/\+ -/g, "- ");
    case "product": {
      const factors = s.factors.map((f) => (f.kind === "sum" ? `(${scalarToLatex(f)})` : scalarToLatex(f)));
      return factors.join(" ");
    }
    case "partial": {
      const counts = new Map<string, number>();
      for (const w of s.wrts) counts.set(w, (counts.get(w) ?? 0) + 1);
      const denom = Array.from(counts.entries())
        .map(([name, n]) => `\\partial ${name}${n > 1 ? `^${n}` : ""}`)
        .join("\\,");
      const order = s.wrts.length;
      return `\\dfrac{\\partial${order > 1 ? `^${order}` : ""} ${scalarToLatex(s.of)}}{${denom}}`;
    }
  }
}
