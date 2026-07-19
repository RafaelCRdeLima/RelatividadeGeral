import {
  basisForm,
  exteriorDerivative,
  formAdd,
  formWedge,
  interiorProduct,
  scalarForm,
  type FormExpr,
  type VectorField,
} from "../algebra/form";
import { ONE, symbol } from "../algebra/scalar";
import type { CanvasNode } from "./canvasModel";

export interface EvalResult {
  form: FormExpr | null;
  error: string | null;
}

const INCOMPLETE: EvalResult = { form: null, error: null };

/**
 * Avalia uma árvore de blocos com o motor real. Soquete vazio propaga como
 * "incompleta" (sem erro); grau incompatível numa soma propaga como erro
 * explícito até a raiz — não é detectado no momento do encaixe, é revelado
 * ao computar, o que é mais honesto sobre o que "não encaixa" significa em
 * álgebra (o bloco engata fisicamente; a matemática é que rejeita).
 */
export function evaluateNode(node: CanvasNode | null, coords: string[]): EvalResult {
  if (!node) return INCOMPLETE;

  switch (node.kind) {
    case "zero-form":
      return { form: scalarForm(symbol(node.tag || "f")), error: null };

    case "one-form":
      return { form: basisForm(node.tag || "x"), error: null };

    case "wedge": {
      const left = evaluateNode(node.left, coords);
      if (left.error) return left;
      const right = evaluateNode(node.right, coords);
      if (right.error) return right;
      if (!left.form || !right.form) return INCOMPLETE;
      return { form: formWedge(left.form, right.form, coords), error: null };
    }

    case "sum": {
      const left = evaluateNode(node.left, coords);
      if (left.error) return left;
      const right = evaluateNode(node.right, coords);
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
      const child = evaluateNode(node.child, coords);
      if (child.error) return child;
      if (!child.form) return INCOMPLETE;
      return { form: exteriorDerivative(child.form, coords), error: null };
    }

    // um campo vetorial sozinho não é uma forma — só faz sentido como
    // entrada do soquete "field" de ι; não tem valor de FormExpr próprio.
    case "vector-field":
      return INCOMPLETE;

    case "interior": {
      if (!node.field || node.field.kind !== "vector-field") return INCOMPLETE;
      const form = evaluateNode(node.form, coords);
      if (form.error) return form;
      if (!form.form) return INCOMPLETE;
      if (form.form.degree === 0) {
        return { form: null, error: "ι (contração) exige uma forma de grau 1 ou mais." };
      }
      const field: VectorField = { [node.field.tag]: ONE };
      return { form: interiorProduct(field, form.form), error: null };
    }
  }
}
