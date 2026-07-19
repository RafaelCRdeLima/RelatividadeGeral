import { describe, expect, it } from "vitest";
import { coord, num, scalarMul, symbol } from "../../src/algebra/scalar";
import {
  basisForm,
  formAdd,
  formToLatex,
  formWedge,
  formsEqual,
  exteriorDerivative,
  interiorProduct,
  isZeroForm,
  scalarForm,
  type VectorField,
} from "../../src/algebra/form";

const dx = basisForm("x");
const dy = basisForm("y");
const dz = basisForm("z");
const XYZ = ["x", "y", "z"];

describe("formWedge", () => {
  it("dx∧dy é um monômio de grau 2 com coeficiente 1", () => {
    const result = formWedge(dx, dy);
    expect(result.degree).toBe(2);
    expect(result.terms).toEqual([{ coeff: { kind: "num", value: 1 }, indices: ["x", "y"] }]);
  });

  it("antissimetria: dy∧dx = -dx∧dy", () => {
    const a = formWedge(dy, dx);
    const b = formWedge(dx, dy);
    expect(a.terms[0].coeff).toEqual({ kind: "num", value: -1 });
    expect(a.terms[0].indices).toEqual(b.terms[0].indices);
  });

  it("nilpotência: dx∧dx = 0", () => {
    expect(isZeroForm(formWedge(dx, dx))).toBe(true);
  });

  it("somar dx∧dy com dy∧dx cancela (mesmo monômio, sinais opostos)", () => {
    const sum = formAdd(formWedge(dx, dy), formWedge(dy, dx));
    expect(isZeroForm(sum)).toBe(true);
  });

  it("distributividade sobre a soma: (dx+dy)∧dz = dx∧dz + dy∧dz", () => {
    const left = formWedge(formAdd(dx, dy), dz, XYZ);
    const right = formAdd(formWedge(dx, dz, XYZ), formWedge(dy, dz, XYZ));
    expect(formsEqual(left, right)).toBe(true);
  });
});

describe("formAdd", () => {
  it("rejeita soma de graus diferentes", () => {
    expect(() => formAdd(dx, formWedge(dx, dy))).toThrow(/mesmo grau/);
  });
});

describe("exteriorDerivative", () => {
  it("d(dx) = 0 — a base já é fechada", () => {
    expect(isZeroForm(exteriorDerivative(dx, XYZ))).toBe(true);
  });

  it("d(x) = dx — diferencial da própria função coordenada", () => {
    const dxForm = exteriorDerivative(scalarForm(coord("x")), XYZ);
    expect(formsEqual(dxForm, dx)).toBe(true);
  });

  it("d²f = 0 para um símbolo opaco qualquer, sobre qualquer número de coordenadas", () => {
    const f = scalarForm(symbol("f"));
    const df = exteriorDerivative(f, XYZ);
    const ddf = exteriorDerivative(df, XYZ);
    expect(isZeroForm(ddf)).toBe(true);
  });

  it("d²=0 também para um coeficiente composto (produto + soma de símbolos)", () => {
    const f = formAdd(scalarForm(scalarMul(symbol("a"), coord("x"))), scalarForm(symbol("b")));
    const df = exteriorDerivative(f, XYZ);
    const ddf = exteriorDerivative(df, XYZ);
    expect(isZeroForm(ddf)).toBe(true);
  });

  it("regra de Leibniz: d(x·y) = y dx + x dy", () => {
    const xy = scalarForm(scalarMul(coord("x"), coord("y")));
    const result = exteriorDerivative(xy, ["x", "y"]);
    const expected = formAdd(
      formWedge(scalarForm(coord("y")), dx, ["x", "y"]),
      formWedge(scalarForm(coord("x")), dy, ["x", "y"]),
    );
    expect(formsEqual(result, expected)).toBe(true);
  });

  it("d de uma 2-forma sobe pra grau 3 corretamente", () => {
    const omega = formWedge(scalarForm(symbol("f")), formWedge(dx, dy, XYZ), XYZ);
    const result = exteriorDerivative(omega, XYZ);
    expect(result.degree).toBe(3);
  });
});

describe("interiorProduct", () => {
  const X: VectorField = { x: num(1) }; // ∂/∂x

  it("ι_X(dx) = 1 — contrai a 1-forma pro escalar componente", () => {
    const result = interiorProduct(X, dx);
    expect(result.degree).toBe(0);
    expect(formsEqual(result, scalarForm(num(1)))).toBe(true);
  });

  it("ι_X(dy) = 0 — componente ausente do campo", () => {
    expect(isZeroForm(interiorProduct(X, dy))).toBe(true);
  });

  it("ι_X(dx∧dy) = dy — contrai só o primeiro fator, sem sinal (posição 0)", () => {
    const result = interiorProduct(X, formWedge(dx, dy, XYZ));
    expect(formsEqual(result, dy)).toBe(true);
  });

  it("ι_X(dy∧dx) = -dy — mesmo monômio canônico, mas x aparece na posição 1 antes de ordenar", () => {
    // dy∧dx normaliza para -1·(dx∧dy) internamente; contrair x (posição 1
    // do índice já ordenado [x,y]) dá sinal -1, então o resultado é -dy.
    const result = interiorProduct(X, formWedge(dy, dx, XYZ));
    expect(result.terms).toEqual([{ coeff: { kind: "num", value: -1 }, indices: ["y"] }]);
  });

  it("ι_X∘ι_X = 0 sempre, para um campo geral, sobre uma 3-forma", () => {
    const field: VectorField = { x: symbol("a"), y: symbol("b"), z: symbol("c") };
    const vol = formWedge(dx, formWedge(dy, dz, XYZ), XYZ); // dx∧dy∧dz
    const once = interiorProduct(field, vol);
    const twice = interiorProduct(field, once);
    expect(isZeroForm(twice)).toBe(true);
  });

  it("ι_X de uma 0-forma é 0 por convenção", () => {
    expect(isZeroForm(interiorProduct(X, scalarForm(symbol("f"))))).toBe(true);
  });
});

describe("formToLatex", () => {
  it("formata monômio simples sem coeficiente redundante", () => {
    expect(formToLatex(formWedge(dx, dy))).toBe("dx \\wedge dy");
  });

  it("forma zero vira '0'", () => {
    expect(formToLatex(formWedge(dx, dx))).toBe("0");
  });
});
