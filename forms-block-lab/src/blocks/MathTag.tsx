import { useEffect, useRef, useState } from "react";
import katex from "katex";

interface MathTagProps {
  value: string;
  editable?: boolean;
  onChange?: (next: string) => void;
}

export function MathTag({ value, editable = false, onChange }: MathTagProps) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => setDraft(value), [value]);
  useEffect(() => {
    if (editing) inputRef.current?.focus();
  }, [editing]);

  if (editing) {
    return (
      <input
        ref={inputRef}
        className="fb-tag-input"
        value={draft}
        onPointerDown={(event) => event.stopPropagation()}
        onChange={(event) => setDraft(event.target.value)}
        onBlur={() => {
          setEditing(false);
          const next = draft.trim() || value;
          setDraft(next);
          onChange?.(next);
        }}
        onKeyDown={(event) => {
          // impede que Enter/Espaço/Escape borbulhem até um ancestral
          // arrastável (dnd-kit) e sejam interpretados como ativação de
          // arraste por teclado — isto é edição de texto, não drag.
          event.stopPropagation();
          if (event.key === "Enter") inputRef.current?.blur();
          if (event.key === "Escape") {
            setDraft(value);
            setEditing(false);
          }
        }}
      />
    );
  }

  const html = katex.renderToString(draft, { throwOnError: false });

  return (
    <span
      className={`fb-tag ${editable ? "fb-tag-editable" : ""}`}
      role={editable ? "button" : undefined}
      tabIndex={editable ? 0 : undefined}
      onClick={() => editable && setEditing(true)}
      onKeyDown={(event) => {
        if (editable && (event.key === "Enter" || event.key === " ")) {
          event.preventDefault();
          // mesma razão do input: Espaço é a tecla padrão de ativação de
          // arraste do dnd-kit — sem isto, focar+apertar espaço numa tag
          // dispararia edição de texto e drag por teclado ao mesmo tempo.
          event.stopPropagation();
          setEditing(true);
        }
      }}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
