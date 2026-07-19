import { describe, expect, it } from "vitest";
import { coord, num, partialDerivative, scalarAdd, scalarMul, scalarsEqual, symbol } from "../../src/algebra/scalar";

describe("scalar", () => {
  it("deriva uma coordenada em relação a si mesma como 1 e a outra como 0", () => {
    expect(scalarsEqual(partialDerivative(coord("x"), "x"), num(1))).toBe(true);
    expect(scalarsEqual(partialDerivative(coord("x"), "y"), num(0))).toBe(true);
  });

  it("deriva um número como 0", () => {
    expect(scalarsEqual(partialDerivative(num(7), "x"), num(0))).toBe(true);
  });

  it("gera uma derivada parcial formal para símbolo opaco", () => {
    const df = partialDerivative(symbol("f"), "x");
    expect(df).toEqual({ kind: "partial", wrts: ["x"], of: { kind: "symbol", name: "f" } });
  });

  it("aplica a regra do produto: ∂x(x·y) = y", () => {
    const xy = scalarMul(coord("x"), coord("y"));
    expect(scalarsEqual(partialDerivative(xy, "x"), coord("y"))).toBe(true);
    expect(scalarsEqual(partialDerivative(xy, "y"), coord("x"))).toBe(true);
  });

  it("deriva parciais mistas em ordem canônica (comutam)", () => {
    const dxdy = partialDerivative(partialDerivative(symbol("f"), "x"), "y");
    const dydx = partialDerivative(partialDerivative(symbol("f"), "y"), "x");
    expect(scalarsEqual(dxdy, dydx)).toBe(true);
  });

  it("soma comutativa: x+y é igual a y+x", () => {
    expect(scalarsEqual(scalarAdd(coord("x"), coord("y")), scalarAdd(coord("y"), coord("x")))).toBe(true);
  });

  it("soma numérica funde constantes", () => {
    expect(scalarsEqual(scalarAdd(num(2), num(3)), num(5))).toBe(true);
  });

  it("produto por zero é zero", () => {
    expect(scalarsEqual(scalarMul(coord("x"), num(0)), num(0))).toBe(true);
  });

  it("distribui produto sobre soma: -1·(a+b) cancela com a+b", () => {
    const ab = scalarAdd(symbol("a"), symbol("b"));
    const negated = scalarMul(num(-1), ab);
    expect(scalarsEqual(scalarAdd(ab, negated), num(0))).toBe(true);
  });

  it("distribui produto sobre soma com múltiplos fatores: x·(a+b) = x·a + x·b", () => {
    const left = scalarMul(coord("x"), scalarAdd(symbol("a"), symbol("b")));
    const right = scalarAdd(scalarMul(coord("x"), symbol("a")), scalarMul(coord("x"), symbol("b")));
    expect(scalarsEqual(left, right)).toBe(true);
  });
});
