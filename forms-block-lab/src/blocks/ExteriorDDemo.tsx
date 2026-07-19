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

type Stage = 0 | 1 | 2;

const CAPTIONS: Record<Stage, string> = {
  0: "Uma 0-forma é uma função escalar. Arraste o operador d sobre o bloco para aplicá-lo.",
  1: "df é uma 1-forma — o grau subiu em 1 e apareceu um dente. Arraste d de novo para ver o que acontece.",
  2: "d²f = 0 — a derivada exterior aplicada duas vezes sempre se anula. É essa identidade que separa formas fechadas (dω=0) de exatas (ω=dη).",
};

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
  const [stage, setStage] = useState<Stage>(0);
  const [tag, setTag] = useState("f");

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor),
  );

  function handleDragEnd(event: DragEndEvent) {
    if (event.over?.id === "target" && stage < 2) {
      setStage((current) => (current + 1) as Stage);
    }
  }

  return (
    <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
      <div className="fb-dstage-row">
        <Target>
          <AnimatePresence mode="wait">
            {stage < 2 ? (
              <motion.div
                key={stage}
                initial={{ opacity: 0, scale: 0.7 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.4 }}
              >
                <Block
                  width={stage === 0 ? 90 : 130}
                  height={64}
                  degreeOut={stage}
                  background={stage === 0 ? "var(--fb-neutral)" : "var(--fb-orange)"}
                >
                  {stage === 0 ? (
                    <MathTag value={tag} editable onChange={setTag} />
                  ) : (
                    <MathTag value={`d${tag}`} />
                  )}
                </Block>
              </motion.div>
            ) : (
              <motion.div
                key="collapsed"
                initial={{ opacity: 1, scale: 1.2 }}
                animate={{ opacity: 0, scale: 0 }}
                transition={{ duration: 0.55, ease: "easeIn" }}
              >
                <Block width={130} height={64} degreeOut={2} background="var(--fb-orange-2)">
                  <MathTag value={`d(d${tag})`} />
                </Block>
              </motion.div>
            )}
          </AnimatePresence>
        </Target>

        {stage < 2 ? (
          <DOperator />
        ) : (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
            <Block width={70} height={64} background="var(--fb-muted)">
              <span className="fb-zero">0</span>
            </Block>
          </motion.div>
        )}

        {stage === 2 && (
          <button className="fb-reset" onClick={() => setStage(0)}>
            Reiniciar
          </button>
        )}
      </div>

      <p className="fb-caption">{CAPTIONS[stage]}</p>
    </DndContext>
  );
}
