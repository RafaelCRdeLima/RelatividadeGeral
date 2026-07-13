import katex from "katex";

export function Formula({ children, display = true }: { children: string; display?: boolean }) {
  return <div className={display ? "formula display" : "formula"} dangerouslySetInnerHTML={{ __html: katex.renderToString(children, { displayMode: display, throwOnError: false, strict: false }) }} />;
}
