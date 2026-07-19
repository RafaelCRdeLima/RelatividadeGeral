import { useState, type ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
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
import { exteriorDerivative, formToLatex, isZeroForm, scalarForm, type FormExpr } from "../algebra/form";
import { symbol } from "../algebra/scalar";

function DOperator() {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({ id: "d-operator" });
  const style = transform ? { transform: `translate(${transform.x}px, ${transform.y}px)` } : undefined;

  return (
    <div ref={setNodeRef} style={style} {...listeners} {...attributes} className={isDragging ? "fb-dragging" : ""}>
      <Block width={60} height={64} background="var(--fb-cyan)">
        <span className="fb-op-symbol">d</span>
      </Block>
    </div>
  );
}

function Target({ children }: { children: ReactNode }) {
  const { setNodeRef, isOver } = useDroppable({ id: "target" });
  return (
    <div ref={setNodeRef} className={`fb-target ${isOver ? "fb-target-over" : ""}`}>
      {children}
    </div>
  );
}

export function ExteriorDDemo() {
  const [tag, setTag] = useState("f");
  const [form, setForm] = useState<FormExpr>(() => scalarForm(symbol("f")));
  const [appliedCount, setAppliedCount] = useState(0);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor),
  );

  const coords = useCoords();

  // o motor decide se e quando colapsa — "zero" não é uma etapa roteirizada,
  // é o resultado real de aplicar exteriorDerivative duas vezes.
  const zero = isZeroForm(form);

  function handleDragEnd(event: DragEndEvent) {
    if (event.over?.id === "target" && appliedCount < 2) {
      setForm((current) => exteriorDerivative(current, coords));
      setAppliedCount((count) => count + 1);
    }
  }

  function updateTag(next: string) {
    setTag(next);
    setForm(scalarForm(symbol(next)));
  }

  function reset() {
    setForm(scalarForm(symbol(tag)));
    setAppliedCount(0);
  }

  const width = appliedCount === 0 ? 90 : zero ? 80 : 480;
  const background = appliedCount === 0 ? "var(--fb-neutral)" : zero ? "var(--fb-muted)" : "var(--fb-orange)";

  const captions = [
    "Uma 0-forma é uma função escalar. Arraste o operador d sobre o bloco para aplicá-lo.",
    "df é uma 1-forma calculada de verdade pelo motor — a soma das derivadas parciais vezes cada dx, não um rótulo fixo. Arraste d de novo para ver o que acontece.",
    "d²f = 0 — não é uma regra decorada, é o que o motor calculou: derivadas mistas comutam e a antissimetria do wedge cancela os termos cruzados.",
  ];

  return (
    <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
      <div className="fb-dstage-row">
        <Target>
          <AnimatePresence mode="wait">
            <motion.div
              key={appliedCount}
              initial={{ opacity: 0, scale: zero ? 1.2 : 0.7 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.4 }}
            >
              <Block width={width} height={64} degreeOut={form.degree} background={background}>
                {appliedCount === 0 ? (
                  <MathTag value={tag} editable onChange={updateTag} />
                ) : (
                  <MathTag value={formToLatex(form)} />
                )}
              </Block>
            </motion.div>
          </AnimatePresence>
        </Target>

        {appliedCount < 2 && <DOperator />}

        {appliedCount >= 2 && (
          <button className="fb-reset" onClick={reset}>
            Reiniciar
          </button>
        )}
      </div>

      <p className="fb-caption">{captions[Math.min(appliedCount, 2)]}</p>
    </DndContext>
  );
}
