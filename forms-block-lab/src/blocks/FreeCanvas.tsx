import { useState } from "react";
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
import { useCoords } from "./CoordsContext";
import { createNode, removeNode, setSocket, updateTag, type CanvasNode, type PaletteKind } from "./canvasModel";
import { evaluateNode } from "./evaluate";
import { formToLatex } from "../algebra/form";

const PALETTE: { kind: PaletteKind; label: string; background: string }[] = [
  { kind: "zero-form", label: "0-forma", background: "var(--fb-neutral)" },
  { kind: "one-form", label: "1-forma", background: "var(--fb-orange)" },
  { kind: "wedge", label: "∧", background: "var(--fb-cyan)" },
  { kind: "sum", label: "+", background: "var(--fb-cyan)" },
  { kind: "d", label: "d", background: "var(--fb-cyan)" },
];

function PaletteItem({
  kind,
  label,
  background,
  armed,
  onClick,
}: {
  kind: PaletteKind;
  label: string;
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
      className={`fb-palette-item ${isDragging ? "fb-dragging" : ""} ${armed ? "fb-armed" : ""}`}
    >
      <Block width={90} height={52} background={background}>
        <span className="fb-op-symbol">{label}</span>
      </Block>
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

function NodeView({
  node,
  onDelete,
  onTagChange,
  armed,
  onSocketClick,
}: {
  node: CanvasNode;
  onDelete: (id: string) => void;
  onTagChange: (id: string, tag: string) => void;
  armed: boolean;
  onSocketClick: (socketId: string) => void;
}) {
  if (node.kind === "zero-form" || node.kind === "one-form") {
    const isForm = node.kind === "one-form";
    return (
      <div className="fb-canvas-node">
        <Block width={100} height={60} degreeOut={isForm ? 1 : 0} background={isForm ? "var(--fb-orange)" : "var(--fb-neutral)"}>
          <MathTag
            value={isForm ? `d${node.tag}` : node.tag}
            editable
            onChange={(next) => onTagChange(node.id, isForm ? next.replace(/^d/, "") : next)}
          />
        </Block>
        <button className="fb-delete" onClick={() => onDelete(node.id)} aria-label="Remover bloco">
          ×
        </button>
      </div>
    );
  }

  if (node.kind === "wedge" || node.kind === "sum") {
    return (
      <div className="fb-canvas-node fb-canvas-branch">
        {node.left ? (
          <NodeView node={node.left} onDelete={onDelete} onTagChange={onTagChange} armed={armed} onSocketClick={onSocketClick} />
        ) : (
          <EmptySocket socketId={`${node.id}:left`} armable={armed} onClick={() => onSocketClick(`${node.id}:left`)} />
        )}
        <Block width={48} height={60} background="var(--fb-cyan)">
          <span className="fb-op-symbol">{node.kind === "wedge" ? "∧" : "+"}</span>
        </Block>
        {node.right ? (
          <NodeView node={node.right} onDelete={onDelete} onTagChange={onTagChange} armed={armed} onSocketClick={onSocketClick} />
        ) : (
          <EmptySocket socketId={`${node.id}:right`} armable={armed} onClick={() => onSocketClick(`${node.id}:right`)} />
        )}
        <button className="fb-delete" onClick={() => onDelete(node.id)} aria-label="Remover bloco">
          ×
        </button>
      </div>
    );
  }

  // d
  return (
    <div className="fb-canvas-node fb-canvas-branch">
      <Block width={48} height={60} background="var(--fb-cyan)">
        <span className="fb-op-symbol">d</span>
      </Block>
      <span className="fb-paren" aria-hidden="true">
        (
      </span>
      {node.child ? (
        <NodeView node={node.child} onDelete={onDelete} onTagChange={onTagChange} armed={armed} onSocketClick={onSocketClick} />
      ) : (
        <EmptySocket socketId={`${node.id}:child`} armable={armed} onClick={() => onSocketClick(`${node.id}:child`)} />
      )}
      <span className="fb-paren" aria-hidden="true">
        )
      </span>
      <button className="fb-delete" onClick={() => onDelete(node.id)} aria-label="Remover bloco">
        ×
      </button>
    </div>
  );
}

export function FreeCanvas() {
  const [root, setRoot] = useState<CanvasNode | null>(null);
  const [armedKind, setArmedKind] = useState<PaletteKind | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor),
  );

  function placeAt(socketId: string, kind: PaletteKind) {
    const newNode = createNode(kind);
    if (socketId === "root") {
      setRoot(newNode);
      return;
    }
    const [targetId, slot] = socketId.split(":") as [string, "left" | "right" | "child"];
    setRoot((prev) => (prev ? setSocket(prev, targetId, slot, newNode) : prev));
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over) return;
    const paletteKind = (active.data.current as { paletteKind?: PaletteKind } | undefined)?.paletteKind;
    if (!paletteKind) return;
    placeAt(over.id as string, paletteKind);
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
    setRoot((prev) => {
      if (!prev) return prev;
      if (prev.id === targetId) return null;
      return removeNode(prev, targetId);
    });
  }

  function handleTagChange(targetId: string, tag: string) {
    setRoot((prev) => (prev ? updateTag(prev, targetId, tag) : prev));
  }

  const coords = useCoords();
  const result = evaluateNode(root, coords);

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
              background={item.background}
              armed={armedKind === item.kind}
              onClick={() => handlePaletteClick(item.kind)}
            />
          ))}
          {armedKind && <p className="fb-armed-hint">Clique num soquete vazio para encaixar.</p>}
        </aside>

        <div className="fb-canvas-area">
          {root ? (
            <NodeView
              node={root}
              onDelete={handleDelete}
              onTagChange={handleTagChange}
              armed={armedKind !== null}
              onSocketClick={handleSocketClick}
            />
          ) : (
            <EmptySocket socketId="root" armable={armedKind !== null} onClick={() => handleSocketClick("root")} />
          )}
        </div>

        <aside className="fb-expression-panel">
          <h3>Expressão atual</h3>
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
        </aside>
      </div>
    </DndContext>
  );
}
