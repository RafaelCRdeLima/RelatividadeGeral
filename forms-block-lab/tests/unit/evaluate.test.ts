import { beforeEach, describe, expect, it } from "vitest";
import { createNode, resetIdCounterForTests, setSocket, type CanvasNode } from "../../src/blocks/canvasModel";
import { evaluateNode } from "../../src/blocks/evaluate";
import {
  formAdd,
  formWedge,
  formsEqual,
  isZeroForm,
  basisForm,
  hodgeStar,
  scalarForm,
  type Metric,
} from "../../src/algebra/form";
import { num } from "../../src/algebra/scalar";

const COORDS = ["x", "y", "z"];
const METRIC: Metric = { x: 1, y: 1, z: 1 };

beforeEach(() => resetIdCounterForTests());

describe("evaluateNode", () => {
  it("soquete vazio é 'incompleta', não erro", () => {
    const wedge = createNode("wedge");
    const result = evaluateNode(wedge, COORDS, METRIC);
    expect(result).toEqual({ form: null, error: null });
  });

  it("avalia uma 1-forma isolada", () => {
    const leaf = createNode("one-form"); // tag "x"
    const result = evaluateNode(leaf, COORDS, METRIC);
    expect(result.error).toBeNull();
    expect(result.form && formsEqual(result.form, basisForm("x"))).toBe(true);
  });

  it("avalia dx∧dy igual ao motor chamado direto", () => {
    let wedge: CanvasNode = createNode("wedge");
    const left = createNode("one-form"); // x
    const right = { ...createNode("one-form"), tag: "y" };
    wedge = setSocket(wedge, wedge.id, "left", left);
    wedge = setSocket(wedge, wedge.id, "right", right);

    const result = evaluateNode(wedge, COORDS, METRIC);
    const expected = formWedge(basisForm("x"), basisForm("y"), COORDS);
    expect(result.form && formsEqual(result.form, expected)).toBe(true);
  });

  it("propaga soquete vazio através de operadores aninhados (d de árvore incompleta)", () => {
    let d: CanvasNode = createNode("d");
    const wedge = createNode("wedge"); // ambos os lados vazios
    d = setSocket(d, d.id, "child", wedge);

    const result = evaluateNode(d, COORDS, METRIC);
    expect(result).toEqual({ form: null, error: null });
  });

  it("soma de graus diferentes vira erro explícito, não exceção", () => {
    let sum: CanvasNode = createNode("sum");
    const zeroForm = createNode("zero-form"); // grau 0
    const oneForm = createNode("one-form"); // grau 1
    sum = setSocket(sum, sum.id, "left", zeroForm);
    sum = setSocket(sum, sum.id, "right", oneForm);

    const result = evaluateNode(sum, COORDS, METRIC);
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

    const result = evaluateNode(d, COORDS, METRIC);
    expect(result.error).toBeNull();
    expect(result.form?.degree).toBe(3);
  });

  it("d(dx) = 0, calculado através da árvore", () => {
    let d: CanvasNode = createNode("d");
    const leaf = createNode("one-form");
    d = setSocket(d, d.id, "child", leaf);

    const result = evaluateNode(d, COORDS, METRIC);
    expect(result.form && isZeroForm(result.form)).toBe(true);
  });

  it("campo vetorial fora do soquete 'field' de ι vira erro explícito, não 'incompleta' silenciosa", () => {
    let wedge: CanvasNode = createNode("wedge");
    const field = createNode("vector-field");
    const oneForm = createNode("one-form");
    wedge = setSocket(wedge, wedge.id, "left", field);
    wedge = setSocket(wedge, wedge.id, "right", oneForm);

    const result = evaluateNode(wedge, COORDS, METRIC);
    expect(result.form).toBeNull();
    expect(result.error).toMatch(/campo vetorial/i);
  });

  it("ι exige um bloco vector-field no soquete 'field' — outro tipo ali é 'incompleta'", () => {
    let interior: CanvasNode = createNode("interior");
    const notAField = createNode("zero-form");
    const oneForm = createNode("one-form");
    interior = setSocket(interior, interior.id, "field", notAField);
    interior = setSocket(interior, interior.id, "form", oneForm);

    expect(evaluateNode(interior, COORDS, METRIC)).toEqual({ form: null, error: null });
  });

  it("ι[∂ₓ; dx∧dy] = dy, calculado através da árvore", () => {
    let interior: CanvasNode = createNode("interior");
    const field = createNode("vector-field"); // componentes padrão {x: 1}

    let wedge: CanvasNode = createNode("wedge");
    const left = createNode("one-form"); // x
    const right = { ...createNode("one-form"), tag: "y" };
    wedge = setSocket(wedge, wedge.id, "left", left);
    wedge = setSocket(wedge, wedge.id, "right", right);

    interior = setSocket(interior, interior.id, "field", field);
    interior = setSocket(interior, interior.id, "form", wedge);

    const result = evaluateNode(interior, COORDS, METRIC);
    expect(result.error).toBeNull();
    expect(result.form && formsEqual(result.form, basisForm("y"))).toBe(true);
  });

  it("ι[2∂ₓ+3∂ᵧ; dx∧dy] = 2dy-3dx — campo vetorial com múltiplos componentes, editado via updateVectorComponent", () => {
    let interior: CanvasNode = createNode("interior");
    let field = createNode("vector-field"); // começa em {x: 1}
    field = { ...field, components: { x: 2, y: 3 } };

    let wedge: CanvasNode = createNode("wedge");
    const left = createNode("one-form"); // x
    const right = { ...createNode("one-form"), tag: "y" };
    wedge = setSocket(wedge, wedge.id, "left", left);
    wedge = setSocket(wedge, wedge.id, "right", right);

    interior = setSocket(interior, interior.id, "field", field);
    interior = setSocket(interior, interior.id, "form", wedge);

    const result = evaluateNode(interior, COORDS, METRIC);
    expect(result.error).toBeNull();
    // ι_(2∂x+3∂y)(dx∧dy) = 2·ι_∂x(dx∧dy) + 3·ι_∂y(dx∧dy) = 2·dy + 3·(-dx) = 2dy - 3dx
    const expected = formAdd(
      formWedge(scalarForm(num(2)), basisForm("y"), COORDS),
      formWedge(scalarForm(num(-3)), basisForm("x"), COORDS),
    );
    expect(result.form && formsEqual(result.form, expected)).toBe(true);
  });

  it("⋆dx calculado através da árvore bate com o motor chamado direto", () => {
    let hodge: CanvasNode = createNode("hodge");
    const leaf = createNode("one-form"); // x
    hodge = setSocket(hodge, hodge.id, "child", leaf);

    const result = evaluateNode(hodge, COORDS, METRIC);
    const expected = hodgeStar(METRIC, COORDS, basisForm("x"));
    expect(result.error).toBeNull();
    expect(result.form && formsEqual(result.form, expected)).toBe(true);
  });

  it("⟨dx, ∂ₓ⟩ = 1 — pareamento de uma 1-forma com o vetor de base correspondente", () => {
    let pairing: CanvasNode = createNode("pairing");
    const form = createNode("one-form"); // x
    const vector = createNode("vector-field"); // {x: 1}
    pairing = setSocket(pairing, pairing.id, "form", form);
    pairing = setSocket(pairing, pairing.id, "vector", vector);

    const result = evaluateNode(pairing, COORDS, METRIC);
    expect(result.error).toBeNull();
    expect(result.form && formsEqual(result.form, scalarForm(num(1)))).toBe(true);
  });

  it("⟨dx, ∂ᵧ⟩ = 0 — pareamento de covetor e vetor em direções diferentes", () => {
    let pairing: CanvasNode = createNode("pairing");
    const form = createNode("one-form"); // x
    const vector = { ...createNode("vector-field"), components: { y: 1 } };
    pairing = setSocket(pairing, pairing.id, "form", form);
    pairing = setSocket(pairing, pairing.id, "vector", vector);

    const result = evaluateNode(pairing, COORDS, METRIC);
    expect(result.error).toBeNull();
    expect(result.form && isZeroForm(result.form)).toBe(true);
  });

  it("pareamento com uma forma de grau ≠ 1 vira erro explícito", () => {
    let pairing: CanvasNode = createNode("pairing");
    let wedgeForm: CanvasNode = createNode("wedge");
    const left = createNode("one-form");
    const right = { ...createNode("one-form"), tag: "y" };
    wedgeForm = setSocket(wedgeForm, wedgeForm.id, "left", left);
    wedgeForm = setSocket(wedgeForm, wedgeForm.id, "right", right);
    const vector = createNode("vector-field");

    pairing = setSocket(pairing, pairing.id, "form", wedgeForm);
    pairing = setSocket(pairing, pairing.id, "vector", vector);

    const result = evaluateNode(pairing, COORDS, METRIC);
    expect(result.form).toBeNull();
    expect(result.error).toMatch(/grau 1/);
  });

  it("1-forma e vetor continuam usáveis normalmente fora do pareamento (∧ e ι)", () => {
    const dx = createNode("one-form");
    const wedgeResult = evaluateNode(dx, COORDS, METRIC);
    expect(wedgeResult.form && formsEqual(wedgeResult.form, basisForm("x"))).toBe(true);
  });
});
