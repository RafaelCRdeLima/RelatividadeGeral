/**
 * Árvore de blocos colocados no canvas livre — a "AST visual" separada do
 * motor de cálculo (src/algebra). Um CanvasNode descreve o que o usuário
 * montou; `evaluate.ts` percorre essa árvore e chama o motor para saber o
 * que ela significa. Operadores têm soquetes que podem estar vazios (null)
 * — uma expressão incompleta é um estado válido da árvore, não um erro.
 */

export type CanvasNode =
  | { kind: "zero-form"; id: string; tag: string }
  | { kind: "one-form"; id: string; tag: string }
  // combinação linear de vetores de base: coeficiente numérico por
  // coordenada, ausente = 0 (ex.: {x: 2, y: -1} representa 2∂ₓ - ∂ᵧ).
  | { kind: "vector-field"; id: string; components: Record<string, number> }
  | { kind: "wedge"; id: string; left: CanvasNode | null; right: CanvasNode | null }
  | { kind: "sum"; id: string; left: CanvasNode | null; right: CanvasNode | null }
  | { kind: "d"; id: string; child: CanvasNode | null }
  | { kind: "interior"; id: string; field: CanvasNode | null; form: CanvasNode | null }
  | { kind: "hodge"; id: string; child: CanvasNode | null }
  // emparelhamento ⟨ω,X⟩ entre uma 1-forma e um vetor — o caso grau-1 do
  // produto interior, mas dedicado e rotulado como o conceito fundamental
  // que é (covetor = funcional linear sobre vetores), não uma aplicação
  // avançada de ι. 1-formas e vetores continuam livres para uso normal
  // (∧, d, ι) quando não emparelhados — este é só mais um operador.
  | { kind: "pairing"; id: string; form: CanvasNode | null; vector: CanvasNode | null };

export type PaletteKind = CanvasNode["kind"];
export type Slot = "left" | "right" | "child" | "field" | "form" | "vector";

let counter = 0;
export function resetIdCounterForTests(): void {
  counter = 0;
}
function nextId(): string {
  counter += 1;
  return `n${counter}`;
}

export function createNode(kind: "zero-form"): Extract<CanvasNode, { kind: "zero-form" }>;
export function createNode(kind: "one-form"): Extract<CanvasNode, { kind: "one-form" }>;
export function createNode(kind: "vector-field"): Extract<CanvasNode, { kind: "vector-field" }>;
export function createNode(kind: "wedge"): Extract<CanvasNode, { kind: "wedge" }>;
export function createNode(kind: "sum"): Extract<CanvasNode, { kind: "sum" }>;
export function createNode(kind: "d"): Extract<CanvasNode, { kind: "d" }>;
export function createNode(kind: "interior"): Extract<CanvasNode, { kind: "interior" }>;
export function createNode(kind: "hodge"): Extract<CanvasNode, { kind: "hodge" }>;
export function createNode(kind: "pairing"): Extract<CanvasNode, { kind: "pairing" }>;
export function createNode(kind: PaletteKind): CanvasNode;
export function createNode(kind: PaletteKind): CanvasNode {
  switch (kind) {
    case "zero-form":
      return { kind, id: nextId(), tag: "f" };
    case "one-form":
      return { kind, id: nextId(), tag: "x" };
    case "vector-field":
      return { kind, id: nextId(), components: { x: 1 } };
    case "wedge":
      return { kind, id: nextId(), left: null, right: null };
    case "sum":
      return { kind, id: nextId(), left: null, right: null };
    case "d":
      return { kind, id: nextId(), child: null };
    case "interior":
      return { kind, id: nextId(), field: null, form: null };
    case "hodge":
      return { kind, id: nextId(), child: null };
    case "pairing":
      return { kind, id: nextId(), form: null, vector: null };
  }
}

function children(node: CanvasNode): { slot: Slot; value: CanvasNode | null }[] {
  switch (node.kind) {
    case "wedge":
    case "sum":
      return [
        { slot: "left", value: node.left },
        { slot: "right", value: node.right },
      ];
    case "d":
    case "hodge":
      return [{ slot: "child", value: node.child }];
    case "interior":
      return [
        { slot: "field", value: node.field },
        { slot: "form", value: node.form },
      ];
    case "pairing":
      return [
        { slot: "form", value: node.form },
        { slot: "vector", value: node.vector },
      ];
    default:
      return [];
  }
}

/** Preenche o soquete `slot` do nó `targetId`, em qualquer profundidade, sem mutar a árvore original. */
export function setSocket(node: CanvasNode, targetId: string, slot: Slot, value: CanvasNode): CanvasNode {
  if (node.id === targetId) {
    if (children(node).some((c) => c.slot === slot)) {
      return { ...node, [slot]: value };
    }
    return node;
  }
  const result = { ...node };
  for (const child of children(node)) {
    if (child.value) {
      (result as Record<string, unknown>)[child.slot] = setSocket(child.value, targetId, slot, value);
    }
  }
  return result;
}

/** Encontra o nó com o id dado em qualquer profundidade, ou null se não existir aqui. */
export function findNode(node: CanvasNode, targetId: string): CanvasNode | null {
  if (node.id === targetId) return node;
  for (const child of children(node)) {
    if (child.value) {
      const found = findNode(child.value, targetId);
      if (found) return found;
    }
  }
  return null;
}

/** Encontra o id do pai e o nome do soquete onde targetId está encaixado (não a raiz — a raiz não tem pai nesta árvore). */
export function locateNode(node: CanvasNode, targetId: string): { parentId: string; slot: Slot } | null {
  for (const child of children(node)) {
    if (child.value?.id === targetId) {
      return { parentId: node.id, slot: child.slot };
    }
    if (child.value) {
      const found = locateNode(child.value, targetId);
      if (found) return found;
    }
  }
  return null;
}

/** Esvazia (remove) o nó com o id dado, onde quer que esteja na árvore. */
export function removeNode(node: CanvasNode, targetId: string): CanvasNode {
  const result = { ...node };
  for (const child of children(node)) {
    if (!child.value) continue;
    (result as Record<string, unknown>)[child.slot] =
      child.value.id === targetId ? null : removeNode(child.value, targetId);
  }
  return result;
}

/** Atualiza a tag de um bloco-folha (0-forma ou 1-forma) em qualquer profundidade. */
export function updateTag(node: CanvasNode, targetId: string, tag: string): CanvasNode {
  if (node.id === targetId && (node.kind === "zero-form" || node.kind === "one-form")) {
    return { ...node, tag };
  }
  const result = { ...node };
  for (const child of children(node)) {
    if (child.value) {
      (result as Record<string, unknown>)[child.slot] = updateTag(child.value, targetId, tag);
    }
  }
  return result;
}

/** Atualiza um componente do bloco "vetor" com o id dado, em qualquer profundidade. */
export function updateVectorComponent(node: CanvasNode, targetId: string, coord: string, value: number): CanvasNode {
  if (node.id === targetId && node.kind === "vector-field") {
    return { ...node, components: { ...node.components, [coord]: value } };
  }
  const result = { ...node };
  for (const child of children(node)) {
    if (child.value) {
      (result as Record<string, unknown>)[child.slot] = updateVectorComponent(child.value, targetId, coord, value);
    }
  }
  return result;
}
