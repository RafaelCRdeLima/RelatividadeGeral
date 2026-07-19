/**
 * Álgebra exterior sobre coordenadas nomeadas concretas (dx, dy, dz, ...).
 * Uma forma é uma soma normalizada de monômios: coeficiente escalar vezes
 * o wedge de covetores básicos distintos em ordem canônica. Antissimetria,
 * d²=0 e a regra de Leibniz graduada não são casos especiais — emergem da
 * normalização (canonicalizeIndices) e de derivar o coeficiente de cada
 * monômio, já que d(dx)=0 torna a regra do produto trivial nesse termo.
 */
import {
  ONE,
  Scalar,
  num,
  partialDerivative,
  scalarAdd,
  scalarMul,
  scalarToLatex,
  scalarsEqual,
  simplify as simplifyScalar,
} from "./scalar";

export interface Term {
  coeff: Scalar;
  /** Nomes de coordenada, canônicos: ordenados e distintos. */
  indices: string[];
}

export interface FormExpr {
  degree: number;
  terms: Term[];
}

function isZeroScalar(s: Scalar): boolean {
  return s.kind === "num" && s.value === 0;
}

export function scalarForm(coeff: Scalar): FormExpr {
  const c = simplifyScalar(coeff);
  return isZeroScalar(c) ? { degree: 0, terms: [] } : { degree: 0, terms: [{ coeff: c, indices: [] }] };
}

export function basisForm(index: string): FormExpr {
  return { degree: 1, terms: [{ coeff: ONE, indices: [index] }] };
}

export function zeroForm(degree: number): FormExpr {
  return { degree, terms: [] };
}

function termKey(indices: string[]): string {
  return indices.join(",");
}

function normalize(degree: number, rawTerms: Term[]): FormExpr {
  const groups = new Map<string, { indices: string[]; coeff: Scalar }>();
  for (const t of rawTerms) {
    const key = termKey(t.indices);
    const existing = groups.get(key);
    const coeff = existing ? scalarAdd(existing.coeff, t.coeff) : simplifyScalar(t.coeff);
    groups.set(key, { indices: t.indices, coeff });
  }
  const terms = Array.from(groups.values())
    .filter(({ coeff }) => !isZeroScalar(coeff))
    .sort((a, b) => (termKey(a.indices) < termKey(b.indices) ? -1 : 1));
  return { degree, terms };
}

export function formAdd(a: FormExpr, b: FormExpr): FormExpr {
  if (a.degree !== b.degree) {
    throw new Error(`Soma só aceita formas do mesmo grau (${a.degree} ≠ ${b.degree}).`);
  }
  return normalize(a.degree, [...a.terms, ...b.terms]);
}

/**
 * Ordena um multiconjunto de índices em ordem canônica, devolvendo o sinal
 * da permutação usada. Sinal 0 significa índice repetido — o monômio se
 * anula (é isso que faz dx∧dx=0 e a antissimetria em geral).
 */
export function canonicalizeIndices(
  rawIndices: string[],
  order?: string[],
): { sign: -1 | 0 | 1; indices: string[] } {
  const compare = order
    ? (x: string, y: string) => order.indexOf(x) - order.indexOf(y)
    : (x: string, y: string) => (x < y ? -1 : x > y ? 1 : 0);

  const working = rawIndices.slice();
  let swaps = 0;
  for (let i = 0; i < working.length; i++) {
    for (let j = 0; j < working.length - i - 1; j++) {
      if (compare(working[j], working[j + 1]) > 0) {
        [working[j], working[j + 1]] = [working[j + 1], working[j]];
        swaps++;
      }
    }
  }
  for (let i = 0; i < working.length - 1; i++) {
    if (working[i] === working[i + 1]) return { sign: 0, indices: working };
  }
  return { sign: swaps % 2 === 0 ? 1 : -1, indices: working };
}

export function formWedge(a: FormExpr, b: FormExpr, order?: string[]): FormExpr {
  const degree = a.degree + b.degree;
  const rawTerms: Term[] = [];
  for (const ta of a.terms) {
    for (const tb of b.terms) {
      const { sign, indices } = canonicalizeIndices([...ta.indices, ...tb.indices], order);
      if (sign === 0) continue;
      const coeff = scalarMul(num(sign), scalarMul(ta.coeff, tb.coeff));
      rawTerms.push({ coeff, indices });
    }
  }
  return normalize(degree, rawTerms);
}

/**
 * Derivada exterior sobre a carta `coords`. Para cada monômio, deriva só o
 * coeficiente (a parte de base já é fechada: d(dx)=0), soma sobre todas as
 * coordenadas ativas e reantissimetriza. d²=0 sai de graça: aplicar duas
 * vezes produz, para cada par (k1,k2), dois termos com o mesmo coeficiente
 * simbólico (derivadas mistas comutam, ver `partial` em scalar.ts) e sinais
 * opostos — eles se cancelam na normalização.
 */
export function exteriorDerivative(a: FormExpr, coords: string[]): FormExpr {
  const degree = a.degree + 1;
  const rawTerms: Term[] = [];
  for (const t of a.terms) {
    for (const k of coords) {
      const dcoeff = simplifyScalar(partialDerivative(t.coeff, k));
      if (isZeroScalar(dcoeff)) continue;
      const { sign, indices } = canonicalizeIndices([k, ...t.indices], coords);
      if (sign === 0) continue;
      rawTerms.push({ coeff: scalarMul(num(sign), dcoeff), indices });
    }
  }
  return normalize(degree, rawTerms);
}

/** Campo vetorial: componente escalar por nome de coordenada. Ausente = 0. */
export type VectorField = Record<string, Scalar>;

/**
 * Produto interior (contração) ι_X. Baixa o grau em 1: para cada monômio,
 * soma sobre cada posição j do índice removendo dx^{ij} e multiplicando
 * pela componente X^{ij}, com sinal (-1)^j (0-indexado) — a soma alternada
 * que aparece porque contrair "por dentro" do wedge exige passar X por
 * cada fator anterior. ι_X∘ι_X = 0 sempre, pela mesma razão estrutural que
 * d²=0: os termos cruzados se cancelam aos pares na normalização.
 */
export function interiorProduct(field: VectorField, a: FormExpr): FormExpr {
  if (a.degree === 0) return zeroForm(0);
  const rawTerms: Term[] = [];
  for (const t of a.terms) {
    for (let position = 0; position < t.indices.length; position++) {
      const component = field[t.indices[position]];
      if (!component || isZeroScalar(simplifyScalar(component))) continue;
      const sign = position % 2 === 0 ? 1 : -1;
      const remaining = t.indices.filter((_, i) => i !== position);
      const coeff = scalarMul(num(sign), scalarMul(t.coeff, component));
      rawTerms.push({ coeff, indices: remaining });
    }
  }
  return normalize(a.degree - 1, rawTerms);
}

export function isZeroForm(a: FormExpr): boolean {
  return a.terms.length === 0;
}

export function formsEqual(a: FormExpr, b: FormExpr): boolean {
  if (a.degree !== b.degree || a.terms.length !== b.terms.length) return false;
  return a.terms.every((ta, i) => {
    const tb = b.terms[i];
    return termKey(ta.indices) === termKey(tb.indices) && scalarsEqual(ta.coeff, tb.coeff);
  });
}

function basisLatex(indices: string[]): string {
  return indices.map((i) => `d${i}`).join(" \\wedge ");
}

export function formToLatex(a: FormExpr): string {
  if (a.terms.length === 0) return "0";
  return a.terms
    .map((t) => {
      const basis = basisLatex(t.indices);
      if (t.indices.length === 0) return scalarToLatex(t.coeff);
      if (t.coeff.kind === "num" && t.coeff.value === 1) return basis;
      if (t.coeff.kind === "num" && t.coeff.value === -1) return `-${basis}`;
      const coeffLatex = t.coeff.kind === "sum" ? `(${scalarToLatex(t.coeff)})` : scalarToLatex(t.coeff);
      return `${coeffLatex} \\, ${basis}`;
    })
    .join(" + ")
    .replace(/\+ -/g, "- ");
}

/** Estrutura JSON simples — já serializável, sem transformação extra. */
export function formToAST(a: FormExpr): FormExpr {
  return a;
}
