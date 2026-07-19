import { beforeEach, describe, expect, it } from "vitest";
import { createNode, resetIdCounterForTests, setSocket, type CanvasNode } from "../../src/blocks/canvasModel";
import { evaluateNode } from "../../src/blocks/evaluate";
import { formWedge, formsEqual, isZeroForm, basisForm } from "../../src/algebra/form";

const COORDS = ["x", "y", "z"];

beforeEach(() => resetIdCounterForTests());

describe("evaluateNode", () => {
  it("soquete vazio é 'incompleta', não erro", () => {
    const wedge = createNode("wedge");
    const result = evaluateNode(wedge, COORDS);
    expect(result).toEqual({ form: null, error: null });
  });

  it("avalia uma 1-forma isolada", () => {
    const leaf = createNode("one-form"); // tag "x"
    const result = evaluateNode(leaf, COORDS);
    expect(result.error).toBeNull();
    expect(result.form && formsEqual(result.form, basisForm("x"))).toBe(true);
  });

  it("avalia dx∧dy igual ao motor chamado direto", () => {
    let wedge: CanvasNode = createNode("wedge");
    const left = createNode("one-form"); // x
    const right = { ...createNode("one-form"), tag: "y" };
    wedge = setSocket(wedge, wedge.id, "left", left);
    wedge = setSocket(wedge, wedge.id, "right", right);

    const result = evaluateNode(wedge, COORDS);
    const expected = formWedge(basisForm("x"), basisForm("y"), COORDS);
    expect(result.form && formsEqual(result.form, expected)).toBe(true);
  });

  it("propaga soquete vazio através de operadores aninhados (d de árvore incompleta)", () => {
    let d: CanvasNode = createNode("d");
    const wedge = createNode("wedge"); // ambos os lados vazios
    d = setSocket(d, d.id, "child", wedge);

    const result = evaluateNode(d, COORDS);
    expect(result).toEqual({ form: null, error: null });
  });

  it("soma de graus diferentes vira erro explícito, não exceção", () => {
    let sum: CanvasNode = createNode("sum");
    const zeroForm = createNode("zero-form"); // grau 0
    const oneForm = createNode("one-form"); // grau 1
    sum = setSocket(sum, sum.id, "left", zeroForm);
    sum = setSocket(sum, sum.id, "right", oneForm);

    const result = evaluateNode(sum, COORDS);
    expect(result.form).toBeNull();
    expect(result.error).toMatch(/mesmo grau/);
  });

  it("d(dx∧dy) sobe pra grau 3 e é calculado pelo motor de verdade", () => {
    let wedge: CanvasNode = createNode("wedge");
    const left = createNode("one-form");
    const right = { ...createNode("one-form"), tag: "y" };
    wedge = setSocket(wedge, wedge.id, "left", left);
    wedge = setSocket(wedge, wedge.id, "right", right);

    let d: CanvasNode = createNode("d");
    d = setSocket(d, d.id, "child", wedge);

    const result = evaluateNode(d, COORDS);
    expect(result.error).toBeNull();
    expect(result.form?.degree).toBe(3);
  });

  it("d(dx) = 0, calculado através da árvore", () => {
    let d: CanvasNode = createNode("d");
    const leaf = createNode("one-form");
    d = setSocket(d, d.id, "child", leaf);

    const result = evaluateNode(d, COORDS);
    expect(result.form && isZeroForm(result.form)).toBe(true);
  });
});
