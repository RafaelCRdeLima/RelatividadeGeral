import { beforeEach, describe, expect, it } from "vitest";
import {
  createNode,
  findNode,
  locateNode,
  removeNode,
  resetIdCounterForTests,
  setSocket,
  updateTag,
  updateVectorComponent,
} from "../../src/blocks/canvasModel";

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

  it("cria o operador de pareamento com soquetes 'form' e 'vector' vazios", () => {
    const pairing = createNode("pairing");
    expect(pairing).toMatchObject({ kind: "pairing", form: null, vector: null });
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

describe("findNode", () => {
  it("encontra um nó aninhado pelo id", () => {
    const wedge = createNode("wedge");
    const leaf = createNode("one-form");
    const tree = setSocket(wedge, wedge.id, "right", leaf);
    expect(findNode(tree, leaf.id)).toEqual(leaf);
  });

  it("retorna null quando o id não existe na árvore", () => {
    const wedge = createNode("wedge");
    expect(findNode(wedge, "id-que-nao-existe")).toBeNull();
  });
});

describe("locateNode", () => {
  it("encontra o pai e o soquete de um nó aninhado", () => {
    const wedge = createNode("wedge");
    const leaf = createNode("one-form");
    const tree = setSocket(wedge, wedge.id, "right", leaf);
    expect(locateNode(tree, leaf.id)).toEqual({ parentId: wedge.id, slot: "right" });
  });

  it("retorna null para a própria raiz (raiz não tem pai nesta árvore)", () => {
    const wedge = createNode("wedge");
    expect(locateNode(wedge, wedge.id)).toBeNull();
  });

  it("retorna null quando o id não existe", () => {
    const wedge = createNode("wedge");
    expect(locateNode(wedge, "id-que-nao-existe")).toBeNull();
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

describe("createNode('vector-field')", () => {
  it("começa com um único componente de base ({x: 1})", () => {
    const field = createNode("vector-field");
    expect(field.components).toEqual({ x: 1 });
  });
});

describe("updateVectorComponent", () => {
  it("define um novo componente sem apagar os existentes", () => {
    const field = createNode("vector-field"); // {x: 1}
    const updated = updateVectorComponent(field, field.id, "y", 3);
    expect(updated).toMatchObject({ components: { x: 1, y: 3 } });
  });

  it("sobrescreve um componente já existente", () => {
    const field = createNode("vector-field"); // {x: 1}
    const updated = updateVectorComponent(field, field.id, "x", -2);
    expect(updated).toMatchObject({ components: { x: -2 } });
  });

  it("atualiza em profundidade, dentro do soquete 'field' de um ι", () => {
    const interior = createNode("interior");
    const field = createNode("vector-field");
    const tree = setSocket(interior, interior.id, "field", field);
    const updated = updateVectorComponent(tree, field.id, "z", 5);
    if (updated.kind === "interior") {
      expect(updated.field?.kind === "vector-field" && updated.field.components).toEqual({ x: 1, z: 5 });
    } else {
      throw new Error("estrutura inesperada");
    }
  });
});
