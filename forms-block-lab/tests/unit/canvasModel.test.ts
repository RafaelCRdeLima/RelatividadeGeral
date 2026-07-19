import { beforeEach, describe, expect, it } from "vitest";
import { createNode, removeNode, resetIdCounterForTests, setSocket, updateTag } from "../../src/blocks/canvasModel";

beforeEach(() => resetIdCounterForTests());

describe("createNode", () => {
  it("cria folhas com tag padrão e ids únicos", () => {
    const a = createNode("one-form");
    const b = createNode("one-form");
    expect(a.tag).toBe("x");
    expect(a.id).not.toBe(b.id);
  });

  it("cria operadores com soquetes vazios", () => {
    const wedge = createNode("wedge");
    expect(wedge).toMatchObject({ kind: "wedge", left: null, right: null });
    const d = createNode("d");
    expect(d).toMatchObject({ kind: "d", child: null });
  });
});

describe("setSocket", () => {
  it("preenche o soquete direto de um operador raiz", () => {
    const wedge = createNode("wedge");
    const leaf = createNode("one-form");
    const result = setSocket(wedge, wedge.id, "left", leaf);
    expect(result).toMatchObject({ kind: "wedge", left: { id: leaf.id }, right: null });
  });

  it("preenche um soquete aninhado sem mutar a árvore original", () => {
    const outer = createNode("d");
    const inner = createNode("wedge");
    const withInner = setSocket(outer, outer.id, "child", inner);
    const leaf = createNode("one-form");
    const withLeaf = setSocket(withInner, inner.id, "left", leaf);

    expect(withInner.kind === "d" && withInner.child?.kind === "wedge" && withInner.child.left).toBe(null);
    if (withLeaf.kind === "d" && withLeaf.child?.kind === "wedge") {
      expect(withLeaf.child.left?.id).toBe(leaf.id);
    } else {
      throw new Error("estrutura inesperada");
    }
  });
});

describe("removeNode", () => {
  it("esvazia um nó aninhado", () => {
    const wedge = createNode("wedge");
    const leaf = createNode("one-form");
    const filled = setSocket(wedge, wedge.id, "left", leaf);
    const cleared = removeNode(filled, leaf.id);
    expect(cleared).toMatchObject({ left: null });
  });
});

describe("updateTag", () => {
  it("atualiza a tag de uma folha em profundidade, preservando o resto", () => {
    const wedge = createNode("wedge");
    const leaf = createNode("one-form");
    const tree = setSocket(wedge, wedge.id, "right", leaf);
    const updated = updateTag(tree, leaf.id, "z");
    if (updated.kind === "wedge") {
      expect(updated.right?.kind === "one-form" && updated.right.tag).toBe("z");
      expect(updated.left).toBe(null);
    } else {
      throw new Error("estrutura inesperada");
    }
  });
});
