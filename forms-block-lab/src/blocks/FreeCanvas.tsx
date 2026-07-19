import { useState, type ReactNode } from "react";
import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  useDraggable,
  useDroppable,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import { Block } from "./Block";
import { MathTag } from "./MathTag";
import { useCoords, useMetric } from "./CoordsContext";
import {
  createNode,
  findNode,
  locateNode,
  removeNode,
  setSocket,
  updateTag,
  updateVectorComponent,
  type CanvasNode,
  type PaletteKind,
} from "./canvasModel";
import { evaluateNode } from "./evaluate";
import { formToLatex } from "../algebra/form";

type SocketSlot = "left" | "right" | "child" | "field" | "form" | "vector";

const PALETTE: { kind: PaletteKind; label: string; name: string; background: string }[] = [
  { kind: "zero-form", label: "0-forma", name: "0-forma — função escalar", background: "var(--fb-neutral)" },
  { kind: "one-form", label: "1-forma", name: "1-forma — covetor básico (ex.: dx)", background: "var(--fb-orange)" },
  { kind: "vector-field", label: "vetor", name: "Campo vetorial de base (ex.: ∂/∂x)", background: "var(--fb-violet)" },
  { kind: "wedge", label: "∧", name: "Produto wedge (∧) — produto exterior", background: "var(--fb-cyan)" },
  { kind: "sum", label: "+", name: "Soma (+) — só entre formas de mesmo grau", background: "var(--fb-cyan)" },
  { kind: "d", label: "d", name: "Derivada exterior (d)", background: "var(--fb-cyan)" },
  { kind: "interior", label: "ι", name: "Produto interior / contração (ι)", background: "var(--fb-cyan)" },
  { kind: "hodge", label: "⋆", name: "Dual de Hodge (⋆)", background: "var(--fb-cyan)" },
  {
    kind: "pairing",
    label: "⟨,⟩",
    name: "Pareamento ⟨ω,X⟩ — 1-forma aplicada a um vetor, dá escalar",
    background: "var(--fb-cyan)",
  },
];

function PaletteItem({
  kind,
  label,
  name,
  background,
  armed,
  onClick,
}: {
  kind: PaletteKind;
  label: string;
  name: string;
  background: string;
  armed: boolean;
  onClick: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: `palette-${kind}`,
    data: { paletteKind: kind },
  });
  const style = transform ? { transform: `translate(${transform.x}px, ${transform.y}px)` } : undefined;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      onClick={onClick}
      title={name}
      aria-label={name}
      className={`fb-palette-item ${isDragging ? "fb-dragging" : ""} ${armed ? "fb-armed" : ""}`}
    >
      <Block width={90} height={52} background={background}>
        <span className="fb-op-symbol">{label}</span>
      </Block>
    </div>
  );
}

/**
 * Torna um bloco-folha já colocado arrastável para OUTRO soquete vazio
 * (mover, não copiar). Só folhas são arrastáveis nesta versão — permitir
 * arrastar operadores inteiros exigiria lidar com draggables aninhados
 * (um bloco dentro de outro), o que é ambíguo no dnd-kit sem mais
 * infraestrutura; mover uma folha já cobre o caso mais comum ("coloquei
 * dx no soquete errado").
 */
function DraggableLeaf({
  nodeId,
  className,
  title,
  children,
}: {
  nodeId: string;
  className: string;
  title?: string;
  children: ReactNode;
}) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: nodeId,
    data: { existingNodeId: nodeId },
  });
  const style = transform ? { transform: `translate(${transform.x}px, ${transform.y}px)` } : undefined;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      title={title}
      className={`${className} ${isDragging ? "fb-dragging" : ""}`}
    >
      {children}
    </div>
  );
}

function EmptySocket({ socketId, armable, onClick }: { socketId: string; armable: boolean; onClick: () => void }) {
  const { setNodeRef, isOver } = useDroppable({ id: socketId });
  return (
    <div
      ref={setNodeRef}
      onClick={onClick}
      className={`fb-empty-socket ${isOver ? "fb-empty-socket-over" : ""} ${armable ? "fb-empty-socket-armable" : ""}`}
    >
      {armable ? "clique aqui" : "solte aqui"}
    </div>
  );
}

/** Soquete já preenchido, mas ainda assim soltável — arrastar um bloco-folha
 * pra cima troca as posições (swap), em vez de exigir mover pra um espaço
 * vazio primeiro. */
function FilledSocket({ socketId, children }: { socketId: string; children: ReactNode }) {
  const { setNodeRef, isOver } = useDroppable({ id: socketId });
  return (
    <div ref={setNodeRef} className={`fb-filled-socket ${isOver ? "fb-filled-socket-over" : ""}`}>
      {children}
    </div>
  );
}

interface NodeViewProps {
  node: CanvasNode;
  onDelete: (id: string) => void;
  onTagChange: (id: string, tag: string) => void;
  onVectorChange: (id: string, coord: string, value: number) => void;
  armed: boolean;
  onSocketClick: (socketId: string) => void;
}

function Slot({ node, socketPrefix, slot, ...rest }: NodeViewProps & { socketPrefix: string; slot: SocketSlot }) {
  const socketId = `${socketPrefix}:${slot}`;
  const child = (node as unknown as Record<SocketSlot, CanvasNode | null>)[slot];
  return child ? (
    <FilledSocket socketId={socketId}>
      <NodeView node={child} {...rest} />
    </FilledSocket>
  ) : (
    <EmptySocket socketId={socketId} armable={rest.armed} onClick={() => rest.onSocketClick(socketId)} />
  );
}

function NodeView({ node, onDelete, onTagChange, onVectorChange, armed, onSocketClick }: NodeViewProps) {
  const rest = { onDelete, onTagChange, onVectorChange, armed, onSocketClick };
  // hook no topo, incondicional — os "if" abaixo são só de renderização,
  // não podem esconder chamadas de hook (regra dos hooks do React).
  const coords = useCoords();

  if (node.kind === "zero-form" || node.kind === "one-form") {
    const isForm = node.kind === "one-form";
    const value = isForm ? `d${node.tag}` : node.tag;
    // 0-forma é uma função livre (não precisa ser coordenada); 1-forma
    // referencia uma coordenada da carta ativa por definição.
    const outOfChart = isForm && !coords.includes(node.tag);
    return (
      <DraggableLeaf
        nodeId={node.id}
        className={`fb-canvas-node ${outOfChart ? "fb-tag-out-of-chart" : ""}`}
        title={outOfChart ? `"${node.tag}" não é uma coordenada da carta ativa (${coords.join(", ")}).` : undefined}
      >
        <Block width={100} height={60} degreeOut={isForm ? 1 : 0} background={isForm ? "var(--fb-orange)" : "var(--fb-neutral)"}>
          <MathTag
            value={value}
            editable
            onChange={(next) => onTagChange(node.id, isForm ? next.replace(/^d/, "") : next)}
          />
        </Block>
        {outOfChart && (
          <span className="fb-tag-warning-badge" aria-hidden="true">
            ⚠
          </span>
        )}
        <button className="fb-delete" onClick={() => onDelete(node.id)} aria-label="Remover bloco">
          ×
        </button>
      </DraggableLeaf>
    );
  }

  if (node.kind === "vector-field") {
    return (
      <DraggableLeaf nodeId={node.id} className="fb-canvas-node">
        <Block width={Math.max(120, coords.length * 56)} height={60} background="var(--fb-violet)">
          <div className="fb-vector-editor">
            {coords.map((c) => (
              <label key={c} className="fb-vector-component">
                <span>∂{c}</span>
                <input
                  type="number"
                  value={node.components[c] ?? 0}
                  onChange={(event) => onVectorChange(node.id, c, Number(event.target.value) || 0)}
                  onKeyDown={(event) => event.stopPropagation()}
                />
              </label>
            ))}
          </div>
        </Block>
        <button className="fb-delete" onClick={() => onDelete(node.id)} aria-label="Remover bloco">
          ×
        </button>
      </DraggableLeaf>
    );
  }

  if (node.kind === "wedge" || node.kind === "sum") {
    return (
      <div className="fb-canvas-node fb-canvas-branch">
        <Slot node={node} socketPrefix={node.id} slot="left" {...rest} />
        <Block width={48} height={60} background="var(--fb-cyan)">
          <span className="fb-op-symbol">{node.kind === "wedge" ? "∧" : "+"}</span>
        </Block>
        <Slot node={node} socketPrefix={node.id} slot="right" {...rest} />
        <button className="fb-delete" onClick={() => onDelete(node.id)} aria-label="Remover bloco">
          ×
        </button>
      </div>
    );
  }

  if (node.kind === "d" || node.kind === "hodge") {
    return (
      <div className="fb-canvas-node fb-canvas-branch">
        <Block width={48} height={60} background="var(--fb-cyan)">
          <span className="fb-op-symbol">{node.kind === "d" ? "d" : "⋆"}</span>
        </Block>
        <span className="fb-paren" aria-hidden="true">(</span>
        <Slot node={node} socketPrefix={node.id} slot="child" {...rest} />
        <span className="fb-paren" aria-hidden="true">)</span>
        <button className="fb-delete" onClick={() => onDelete(node.id)} aria-label="Remover bloco">
          ×
        </button>
      </div>
    );
  }

  if (node.kind === "interior") {
    return (
      <div className="fb-canvas-node fb-canvas-branch">
        <Block width={40} height={60} background="var(--fb-cyan)">
          <span className="fb-op-symbol">ι</span>
        </Block>
        <span className="fb-paren" aria-hidden="true">[</span>
        <Slot node={node} socketPrefix={node.id} slot="field" {...rest} />
        <span className="fb-paren" aria-hidden="true">;</span>
        <Slot node={node} socketPrefix={node.id} slot="form" {...rest} />
        <span className="fb-paren" aria-hidden="true">]</span>
        <button className="fb-delete" onClick={() => onDelete(node.id)} aria-label="Remover bloco">
          ×
        </button>
      </div>
    );
  }

  // pairing (⟨,⟩)
  return (
    <div className="fb-canvas-node fb-canvas-branch">
      <span className="fb-paren" aria-hidden="true">⟨</span>
      <Slot node={node} socketPrefix={node.id} slot="form" {...rest} />
      <span className="fb-paren" aria-hidden="true">,</span>
      <Slot node={node} socketPrefix={node.id} slot="vector" {...rest} />
      <span className="fb-paren" aria-hidden="true">⟩</span>
      <button className="fb-delete" onClick={() => onDelete(node.id)} aria-label="Remover bloco">
        ×
      </button>
    </div>
  );
}

interface Equation {
  id: string;
  root: CanvasNode | null;
}

let equationCounter = 0;
function nextEquationId(): string {
  equationCounter += 1;
  return `eq${equationCounter}`;
}

/** Prefixo reservado para o soquete raiz de uma equação (não colide com
 * ids de nó, que vêm de canvasModel.ts no formato "n<número>"). */
const EQUATION_SOCKET_PREFIX = "eq:";

export function FreeCanvas() {
  const [equations, setEquations] = useState<Equation[]>(() => [{ id: nextEquationId(), root: null }]);
  const [armedKind, setArmedKind] = useState<PaletteKind | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor),
  );

  /** Localização de um nó: raiz de uma equação (parentId null), ou soquete de um pai. */
  function locateInEquations(
    list: Equation[],
    nodeId: string,
  ): { equationId: string; parentId: string | null; slot: SocketSlot | null } | null {
    for (const eq of list) {
      if (!eq.root) continue;
      if (eq.root.id === nodeId) return { equationId: eq.id, parentId: null, slot: null };
      const found = locateNode(eq.root, nodeId);
      if (found) return { equationId: eq.id, parentId: found.parentId, slot: found.slot };
    }
    return null;
  }

  function locationToSocketId(location: { equationId: string; parentId: string | null; slot: SocketSlot | null }) {
    return location.parentId === null
      ? `${EQUATION_SOCKET_PREFIX}${location.equationId}`
      : `${location.parentId}:${location.slot}`;
  }

  function getNodeAtSocket(list: Equation[], socketId: string): CanvasNode | null {
    if (socketId.startsWith(EQUATION_SOCKET_PREFIX)) {
      const equationId = socketId.slice(EQUATION_SOCKET_PREFIX.length);
      return list.find((eq) => eq.id === equationId)?.root ?? null;
    }
    const [parentId, slot] = socketId.split(":") as [string, SocketSlot];
    for (const eq of list) {
      if (!eq.root) continue;
      const parent = findNode(eq.root, parentId);
      if (parent) return (parent as unknown as Record<SocketSlot, CanvasNode | null>)[slot] ?? null;
    }
    return null;
  }

  function detachNode(list: Equation[], nodeId: string): Equation[] {
    return list.map((eq) => {
      if (!eq.root) return eq;
      if (eq.root.id === nodeId) return { ...eq, root: null };
      return { ...eq, root: removeNode(eq.root, nodeId) };
    });
  }

  function placeAtSocketId(list: Equation[], socketId: string, value: CanvasNode): Equation[] {
    if (socketId.startsWith(EQUATION_SOCKET_PREFIX)) {
      const equationId = socketId.slice(EQUATION_SOCKET_PREFIX.length);
      return list.map((eq) => (eq.id === equationId ? { ...eq, root: value } : eq));
    }
    const [parentId, slot] = socketId.split(":") as [string, SocketSlot];
    return list.map((eq) => (eq.root ? { ...eq, root: setSocket(eq.root, parentId, slot, value) } : eq));
  }

  function placeAt(socketId: string, kind: PaletteKind) {
    setEquations((prev) => placeAtSocketId(prev, socketId, createNode(kind)));
  }

  /**
   * Move um nó já colocado para outro soquete. Se o destino já estiver
   * ocupado, troca as posições (swap) em vez de recusar — o ocupante
   * anterior vai parar onde o nó arrastado estava.
   */
  function handleMoveNode(nodeId: string, targetSocketId: string) {
    setEquations((prev) => {
      const sourceLocation = locateInEquations(prev, nodeId);
      if (!sourceLocation) return prev;
      const sourceNode = getNodeAtSocket(prev, locationToSocketId(sourceLocation));
      if (!sourceNode) return prev;

      const targetOccupant = getNodeAtSocket(prev, targetSocketId);
      if (targetOccupant?.id === nodeId) return prev; // soltou em cima de si mesmo

      let next = detachNode(prev, nodeId);
      if (targetOccupant) {
        next = detachNode(next, targetOccupant.id);
      }
      next = placeAtSocketId(next, targetSocketId, sourceNode);
      if (targetOccupant) {
        next = placeAtSocketId(next, locationToSocketId(sourceLocation), targetOccupant);
      }
      return next;
    });
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over) return;
    const data = active.data.current as { paletteKind?: PaletteKind; existingNodeId?: string } | undefined;
    if (data?.paletteKind) {
      placeAt(over.id as string, data.paletteKind);
      return;
    }
    if (data?.existingNodeId) {
      handleMoveNode(data.existingNodeId, over.id as string);
    }
  }

  function handlePaletteClick(kind: PaletteKind) {
    setArmedKind((current) => (current === kind ? null : kind));
  }

  function handleSocketClick(socketId: string) {
    if (!armedKind) return;
    placeAt(socketId, armedKind);
    setArmedKind(null);
  }

  function handleDelete(targetId: string) {
    setEquations((prev) =>
      prev.map((eq) => {
        if (!eq.root) return eq;
        if (eq.root.id === targetId) return { ...eq, root: null };
        return { ...eq, root: removeNode(eq.root, targetId) };
      }),
    );
  }

  function handleTagChange(targetId: string, tag: string) {
    setEquations((prev) => prev.map((eq) => (eq.root ? { ...eq, root: updateTag(eq.root, targetId, tag) } : eq)));
  }

  function handleVectorChange(targetId: string, coord: string, value: number) {
    setEquations((prev) =>
      prev.map((eq) => (eq.root ? { ...eq, root: updateVectorComponent(eq.root, targetId, coord, value) } : eq)),
    );
  }

  function handleAddEquation() {
    setEquations((prev) => [...prev, { id: nextEquationId(), root: null }]);
  }

  function handleRemoveEquation(equationId: string) {
    setEquations((prev) => (prev.length > 1 ? prev.filter((eq) => eq.id !== equationId) : prev));
  }

  const coords = useCoords();
  const metric = useMetric();

  return (
    <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
      <div className="fb-free-canvas">
        <aside className="fb-palette">
          <h3>Blocos</h3>
          {PALETTE.map((item) => (
            <PaletteItem
              key={item.kind}
              kind={item.kind}
              label={item.label}
              name={item.name}
              background={item.background}
              armed={armedKind === item.kind}
              onClick={() => handlePaletteClick(item.kind)}
            />
          ))}
          {armedKind && <p className="fb-armed-hint">Clique num soquete vazio para encaixar.</p>}

          <button className="fb-add-equation" onClick={handleAddEquation} title="Cria uma nova área de equação independente">
            + Nova equação
          </button>
        </aside>

        <div className="fb-canvas-area">
          {equations.map((eq, index) => (
            <div key={eq.id} className="fb-equation-row">
              <div className="fb-equation-header">
                <span>Equação {index + 1}</span>
                {equations.length > 1 && (
                  <button
                    className="fb-delete"
                    onClick={() => handleRemoveEquation(eq.id)}
                    aria-label={`Remover equação ${index + 1}`}
                  >
                    ×
                  </button>
                )}
              </div>
              <div className="fb-equation-tree">
                {eq.root ? (
                  <FilledSocket socketId={`${EQUATION_SOCKET_PREFIX}${eq.id}`}>
                    <NodeView
                      node={eq.root}
                      onDelete={handleDelete}
                      onTagChange={handleTagChange}
                      onVectorChange={handleVectorChange}
                      armed={armedKind !== null}
                      onSocketClick={handleSocketClick}
                    />
                  </FilledSocket>
                ) : (
                  <EmptySocket
                    socketId={`${EQUATION_SOCKET_PREFIX}${eq.id}`}
                    armable={armedKind !== null}
                    onClick={() => handleSocketClick(`${EQUATION_SOCKET_PREFIX}${eq.id}`)}
                  />
                )}
              </div>
            </div>
          ))}
        </div>

        <aside className="fb-expression-panel">
          <h3>Expressão atual</h3>
          {equations.map((eq, index) => {
            const result = evaluateNode(eq.root, coords, metric);
            return (
              <div key={eq.id} className="fb-expression-entry">
                {equations.length > 1 && <span className="fb-expression-entry-label">Equação {index + 1}</span>}
                {result.error && <p className="fb-error">{result.error}</p>}
                {!result.error && result.form && (
                  <div className="fb-expression-readout">
                    <MathTag value={formToLatex(result.form)} />
                    <span className="fb-degree-badge">grau {result.form.degree}</span>
                  </div>
                )}
                {!result.error && !result.form && (
                  <p className="fb-hint">Expressão incompleta — preencha os soquetes vazios.</p>
                )}
              </div>
            );
          })}
        </aside>
      </div>
    </DndContext>
  );
}
