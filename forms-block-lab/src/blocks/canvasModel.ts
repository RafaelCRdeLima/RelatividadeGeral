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
  | { kind: "vector-field"; id: string; tag: string }
  | { kind: "wedge"; id: string; left: CanvasNode | null; right: CanvasNode | null }
  | { kind: "sum"; id: string; left: CanvasNode | null; right: CanvasNode | null }
  | { kind: "d"; id: string; child: CanvasNode | null }
  | { kind: "interior"; id: string; field: CanvasNode | null; form: CanvasNode | null };

export type PaletteKind = CanvasNode["kind"];
type Slot = "left" | "right" | "child" | "field" | "form";

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
export function createNode(kind: PaletteKind): CanvasNode;
export function createNode(kind: PaletteKind): CanvasNode {
  switch (kind) {
    case "zero-form":
      return { kind, id: nextId(), tag: "f" };
    case "one-form":
      return { kind, id: nextId(), tag: "x" };
    case "vector-field":
      return { kind, id: nextId(), tag: "x" };
    case "wedge":
      return { kind, id: nextId(), left: null, right: null };
    case "sum":
      return { kind, id: nextId(), left: null, right: null };
    case "d":
      return { kind, id: nextId(), child: null };
    case "interior":
      return { kind, id: nextId(), field: null, form: null };
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
      return [{ slot: "child", value: node.child }];
    case "interior":
      return [
        { slot: "field", value: node.field },
        { slot: "form", value: node.form },
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

/** Atualiza a tag de um bloco-folha em qualquer profundidade. */
export function updateTag(node: CanvasNode, targetId: string, tag: string): CanvasNode {
  if (
    node.id === targetId &&
    (node.kind === "zero-form" || node.kind === "one-form" || node.kind === "vector-field")
  ) {
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
