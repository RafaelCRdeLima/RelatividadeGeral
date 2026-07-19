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
          setEditing(true);
        }
      }}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
