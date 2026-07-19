import {
  basisForm,
  exteriorDerivative,
  formAdd,
  formWedge,
  hodgeStar,
  interiorProduct,
  scalarForm,
  type FormExpr,
  type Metric,
  type VectorField,
} from "../algebra/form";
import { num, symbol } from "../algebra/scalar";
import type { CanvasNode } from "./canvasModel";

export interface EvalResult {
  form: FormExpr | null;
  error: string | null;
}

const INCOMPLETE: EvalResult = { form: null, error: null };

function toVectorField(components: Record<string, number>): VectorField {
  const field: VectorField = {};
  for (const [coord, value] of Object.entries(components)) {
    if (value !== 0) field[coord] = num(value);
  }
  return field;
}

/**
 * Avalia uma árvore de blocos com o motor real. Soquete vazio propaga como
 * "incompleta" (sem erro); grau incompatível numa soma propaga como erro
 * explícito até a raiz — não é detectado no momento do encaixe, é revelado
 * ao computar, o que é mais honesto sobre o que "não encaixa" significa em
 * álgebra (o bloco engata fisicamente; a matemática é que rejeita).
 */
export function evaluateNode(node: CanvasNode | null, coords: string[], metric: Metric): EvalResult {
  if (!node) return INCOMPLETE;

  switch (node.kind) {
    case "zero-form":
      return { form: scalarForm(symbol(node.tag || "f")), error: null };

    case "one-form":
      return { form: basisForm(node.tag || "x"), error: null };

    case "wedge": {
      const left = evaluateNode(node.left, coords, metric);
      if (left.error) return left;
      const right = evaluateNode(node.right, coords, metric);
      if (right.error) return right;
      if (!left.form || !right.form) return INCOMPLETE;
      return { form: formWedge(left.form, right.form, coords), error: null };
    }

    case "sum": {
      const left = evaluateNode(node.left, coords, metric);
      if (left.error) return left;
      const right = evaluateNode(node.right, coords, metric);
      if (right.error) return right;
      if (!left.form || !right.form) return INCOMPLETE;
      if (left.form.degree !== right.form.degree) {
        return {
          form: null,
          error: `Soma só aceita formas do mesmo grau (${left.form.degree} ≠ ${right.form.degree}).`,
        };
      }
      return { form: formAdd(left.form, right.form), error: null };
    }

    case "d": {
      const child = evaluateNode(node.child, coords, metric);
      if (child.error) return child;
      if (!child.form) return INCOMPLETE;
      return { form: exteriorDerivative(child.form, coords), error: null };
    }

    // um campo vetorial não é uma forma — não tem grau, não entra em ∧/+/d/⋆,
    // só faz sentido como entrada dos soquetes "campo" de ι ou "vetor" de
    // pareamento (que leem node.field/node.vector diretamente, sem passar
    // por este caso). Chegar aqui significa que o bloco foi encaixado num
    // soquete que espera uma forma.
    case "vector-field":
      return {
        form: null,
        error:
          'Campo vetorial não é uma forma — só encaixa no soquete "campo" de ι (contração) ou "vetor" de ⟨,⟩ (pareamento).',
      };

    case "interior": {
      if (!node.field || node.field.kind !== "vector-field") return INCOMPLETE;
      const form = evaluateNode(node.form, coords, metric);
      if (form.error) return form;
      if (!form.form) return INCOMPLETE;
      if (form.form.degree === 0) {
        return { form: null, error: "ι (contração) exige uma forma de grau 1 ou mais." };
      }
      return { form: interiorProduct(toVectorField(node.field.components), form.form), error: null };
    }

    case "hodge": {
      const child = evaluateNode(node.child, coords, metric);
      if (child.error) return child;
      if (!child.form) return INCOMPLETE;
      return { form: hodgeStar(metric, coords, child.form), error: null };
    }

    case "pairing": {
      if (!node.vector || node.vector.kind !== "vector-field") return INCOMPLETE;
      const form = evaluateNode(node.form, coords, metric);
      if (form.error) return form;
      if (!form.form) return INCOMPLETE;
      if (form.form.degree !== 1) {
        return { form: null, error: "Pareamento ⟨ω,X⟩ exige uma 1-forma exatamente (grau 1)." };
      }
      // ι_X(ω) com ω de grau 1 já é o pareamento ⟨ω,X⟩ — mesma conta do
      // motor, só com um nome e uma exigência de grau mais específicos.
      return { form: interiorProduct(toVectorField(node.vector.components), form.form), error: null };
    }
  }
}
