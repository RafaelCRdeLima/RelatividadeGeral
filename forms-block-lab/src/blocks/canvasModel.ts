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
  | { kind: "wedge"; id: string; left: CanvasNode | null; right: CanvasNode | null }
  | { kind: "sum"; id: string; left: CanvasNode | null; right: CanvasNode | null }
  | { kind: "d"; id: string; child: CanvasNode | null };

export type PaletteKind = CanvasNode["kind"];
type Slot = "left" | "right" | "child";

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
export function createNode(kind: "wedge"): Extract<CanvasNode, { kind: "wedge" }>;
export function createNode(kind: "sum"): Extract<CanvasNode, { kind: "sum" }>;
export function createNode(kind: "d"): Extract<CanvasNode, { kind: "d" }>;
export function createNode(kind: PaletteKind): CanvasNode;
export function createNode(kind: PaletteKind): CanvasNode {
  switch (kind) {
    case "zero-form":
      return { kind, id: nextId(), tag: "f" };
    case "one-form":
      return { kind, id: nextId(), tag: "x" };
    case "wedge":
      return { kind, id: nextId(), left: null, right: null };
    case "sum":
      return { kind, id: nextId(), left: null, right: null };
    case "d":
      return { kind, id: nextId(), child: null };
  }
}

/** Preenche o soquete `slot` do nó `targetId`, em qualquer profundidade, sem mutar a árvore original. */
export function setSocket(node: CanvasNode, targetId: string, slot: Slot, value: CanvasNode): CanvasNode {
  if (node.id === targetId) {
    if ((node.kind === "wedge" || node.kind === "sum") && (slot === "left" || slot === "right")) {
      return { ...node, [slot]: value };
    }
    if (node.kind === "d" && slot === "child") {
      return { ...node, child: value };
    }
    return node;
  }
  if (node.kind === "wedge" || node.kind === "sum") {
    return {
      ...node,
      left: node.left ? setSocket(node.left, targetId, slot, value) : node.left,
      right: node.right ? setSocket(node.right, targetId, slot, value) : node.right,
    };
  }
  if (node.kind === "d") {
    return { ...node, child: node.child ? setSocket(node.child, targetId, slot, value) : node.child };
  }
  return node;
}

/** Esvazia (remove) o nó com o id dado, onde quer que esteja na árvore. */
export function removeNode(node: CanvasNode, targetId: string): CanvasNode {
  if (node.kind === "wedge" || node.kind === "sum") {
    return {
      ...node,
      left: node.left?.id === targetId ? null : node.left ? removeNode(node.left, targetId) : node.left,
      right: node.right?.id === targetId ? null : node.right ? removeNode(node.right, targetId) : node.right,
    };
  }
  if (node.kind === "d") {
    return {
      ...node,
      child: node.child?.id === targetId ? null : node.child ? removeNode(node.child, targetId) : node.child,
    };
  }
  return node;
}

/** Atualiza a tag de um bloco-folha (0-forma ou 1-forma) em qualquer profundidade. */
export function updateTag(node: CanvasNode, targetId: string, tag: string): CanvasNode {
  if (node.id === targetId && (node.kind === "zero-form" || node.kind === "one-form")) {
    return { ...node, tag };
  }
  if (node.kind === "wedge" || node.kind === "sum") {
    return {
      ...node,
      left: node.left ? updateTag(node.left, targetId, tag) : node.left,
      right: node.right ? updateTag(node.right, targetId, tag) : node.right,
    };
  }
  if (node.kind === "d") {
    return { ...node, child: node.child ? updateTag(node.child, targetId, tag) : node.child };
  }
  return node;
}
