import { describe, expect, it } from "vitest";
import { coord, scalarMul, symbol } from "../../src/algebra/scalar";
import {
  basisForm,
  formAdd,
  formToLatex,
  formWedge,
  formsEqual,
  exteriorDerivative,
  isZeroForm,
  scalarForm,
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

describe("formToLatex", () => {
  it("formata monômio simples sem coeficiente redundante", () => {
    expect(formToLatex(formWedge(dx, dy))).toBe("dx \\wedge dy");
  });

  it("forma zero vira '0'", () => {
    expect(formToLatex(formWedge(dx, dx))).toBe("0");
  });
});
