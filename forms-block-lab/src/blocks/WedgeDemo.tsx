import { useState } from "react";
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

interface FormItem {
  id: string;
  tag: string;
}

type SlotId = "left" | "right";

function DraggableForm({
  item,
  slotId,
  onTagChange,
}: {
  item: FormItem;
  slotId: SlotId;
  onTagChange: (tag: string) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: item.id,
    data: { slotId },
  });
  const style = transform ? { transform: `translate(${transform.x}px, ${transform.y}px)` } : undefined;

  return (
    <div ref={setNodeRef} style={style} {...listeners} {...attributes} className={isDragging ? "fb-dragging" : ""}>
      <Block width={110} height={64} degreeOut={1} background="var(--fb-orange)">
        <MathTag value={`d${item.tag}`} editable onChange={(next) => onTagChange(next.replace(/^d/, ""))} />
      </Block>
    </div>
  );
}

function Slot({ id, children }: { id: SlotId; children: React.ReactNode }) {
  const { setNodeRef, isOver } = useDroppable({ id });
  return (
    <div ref={setNodeRef} className={`fb-slot ${isOver ? "fb-slot-over" : ""}`}>
      {children}
    </div>
  );
}

export function WedgeDemo() {
  const [slotItems, setSlotItems] = useState<Record<SlotId, FormItem>>({
    left: { id: "a", tag: "x" },
    right: { id: "b", tag: "y" },
  });
  const [signFlipped, setSignFlipped] = useState(false);
  const [flashKey, setFlashKey] = useState(0);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor),
  );

  const equal = slotItems.left.tag === slotItems.right.tag;

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over) return;
    const fromSlot = (active.data.current as { slotId: SlotId } | undefined)?.slotId;
    const toSlot = over.id as SlotId;
    if (!fromSlot || fromSlot === toSlot) return;

    setSlotItems((prev) => ({ ...prev, [fromSlot]: prev[toSlot], [toSlot]: prev[fromSlot] }));
    setSignFlipped((flipped) => !flipped);
    setFlashKey((key) => key + 1);
  }

  function updateTag(slot: SlotId, tag: string) {
    setSlotItems((prev) => ({ ...prev, [slot]: { ...prev[slot], tag } }));
  }

  return (
    <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
      <div className="fb-wedge-row">
        <Slot id="left">
          <DraggableForm item={slotItems.left} slotId="left" onTagChange={(tag) => updateTag("left", tag)} />
        </Slot>

        <Block width={60} height={64} background="var(--fb-cyan)">
          <span className="fb-op-symbol">∧</span>
        </Block>

        <Slot id="right">
          <DraggableForm item={slotItems.right} slotId="right" onTagChange={(tag) => updateTag("right", tag)} />
        </Slot>

        <span className="fb-arrow" aria-hidden="true">
          →
        </span>

        <AnimatePresence mode="wait">
          {equal ? (
            <motion.div
              key="zero"
              initial={{ opacity: 0, scale: 1.2 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.5 }}
            >
              <Block width={90} height={64} background="var(--fb-muted)">
                <span className="fb-zero">0</span>
              </Block>
            </motion.div>
          ) : (
            <motion.div key={flashKey} layout>
              <Block width={190} height={64} degreeIn={2} background="var(--fb-orange-2)">
                <span className={`fb-sign ${signFlipped ? "fb-sign-neg" : "fb-sign-pos"}`}>
                  {signFlipped ? "−" : "+"}
                </span>
                <MathTag value={`d${slotItems.left.tag} \\wedge d${slotItems.right.tag}`} />
              </Block>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <p className="fb-caption">
        {equal
          ? "Os dois índices ficaram iguais: dx∧dx = 0 é a antissimetria do produto wedge anulando o termo."
          : "Arraste um bloco sobre o outro para trocar a ordem — o sinal muda porque dx∧dy = −dy∧dx. Clique numa tag para editar o índice."}
      </p>
    </DndContext>
  );
}
