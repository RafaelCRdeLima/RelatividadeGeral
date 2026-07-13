import { motion } from "framer-motion";
import { transformComponents } from "../lib/math";
import { NumberControl, RangeControl, number, type VisualizationProps } from "./visualization-types";

const center = 240;
const scale = 48;
const point = (x: number, y: number) => ({ x: center + x * scale, y: center - y * scale });

function Grid() {
  return <>{Array.from({ length: 11 }, (_, index) => index - 5).map(value => <g key={value}><line className="grid" x1={point(value, 0).x} y1="20" x2={point(value, 0).x} y2="460"/><line className="grid" x1="20" y1={point(0, value).y} x2="460" y2={point(0, value).y}/></g>)}<line className="axis" x1="20" y1={center} x2="460" y2={center}/><line className="axis" x1={center} y1="20" x2={center} y2="460"/></>;
}

function Arrow({ x, y, className, label }: { x: number; y: number; className: string; label: string }) {
  const end = point(x, y);
  return <motion.g animate={{ opacity: 1 }} initial={{ opacity: 0 }}><line className={className} x1={center} y1={center} x2={end.x} y2={end.y} markerEnd="url(#arrow)"/><text className="svg-label" x={end.x + 9} y={end.y - 8}>{label}</text></motion.g>;
}

function VectorSvg({ x, y, angle = 0, decompose = false }: { x: number; y: number; angle?: number; decompose?: boolean }) {
  const radians = angle * Math.PI / 180;
  const length = 1.4;
  const e1 = point(length * Math.cos(radians), length * Math.sin(radians));
  const e2 = point(-length * Math.sin(radians), length * Math.cos(radians));
  const end = point(x, y);
  return <svg className="lab-svg" viewBox="0 0 480 480" role="img" aria-label="Vetor e bases no plano"><defs><marker id="arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M 0 0 L 10 5 L 0 10 z"/></marker></defs><Grid/>
    <line className="basis basis-one" x1={center} y1={center} x2={e1.x} y2={e1.y} markerEnd="url(#arrow)"/><line className="basis basis-two" x1={center} y1={center} x2={e2.x} y2={e2.y} markerEnd="url(#arrow)"/>
    <text className="svg-note" x={e1.x + 6} y={e1.y}>e′₁</text><text className="svg-note" x={e2.x + 6} y={e2.y}>e′₂</text>
    {decompose && <><line className="component" x1={center} y1={center} x2={end.x} y2={center}/><line className="component" x1={end.x} y1={center} x2={end.x} y2={end.y}/></>}
    <Arrow x={x} y={y} className="vector" label="v"/></svg>;
}

export function VectorComponentsLab({ state, onChange }: VisualizationProps) {
  const x = number(state, "x"), y = number(state, "y"), angle = number(state, "angle");
  const transformed = transformComponents([x, y], angle);
  return <div className="visual-layout"><VectorSvg x={x} y={y} angle={angle}/><div className="control-panel"><RangeControl label="Ângulo da base θ" name="angle" min={-90} max={90} step={1} value={angle} onChange={onChange}/><div className="live-math"><span>Vetor fixo</span><strong>v = ({x.toFixed(1)}, {y.toFixed(1)})</strong><span>Na base primada</span><strong>v′ = ({transformed[0].toFixed(2)}, {transformed[1].toFixed(2)})</strong><small>O comprimento permanece {Math.hypot(x, y).toFixed(2)}</small></div></div></div>;
}

export function VectorBuilderLab({ state, onChange }: VisualizationProps) {
  const x = number(state, "x"), y = number(state, "y");
  return <div className="visual-layout"><VectorSvg x={x} y={y} decompose/><div className="control-panel"><div className="number-grid"><NumberControl label="v¹" name="x" value={x} onChange={onChange}/><NumberControl label="v²" name="y" value={y} onChange={onChange}/></div><div className="live-math"><span>Combinação linear</span><strong>{x.toFixed(1)} e₁ {y >= 0 ? "+" : "−"} {Math.abs(y).toFixed(1)} e₂</strong><small>Arraste os valores por componentes positivas e negativas.</small></div></div></div>;
}

export function BasisTransformationLab({ state, onChange }: VisualizationProps) {
  const x = number(state, "x"), y = number(state, "y"), angle = number(state, "angle");
  const result = transformComponents([x, y], angle), c = Math.cos(angle * Math.PI / 180), s = Math.sin(angle * Math.PI / 180);
  return <div className="visual-layout"><VectorSvg x={x} y={y} angle={angle}/><div className="control-panel"><RangeControl label="Rotação θ" name="angle" min={-120} max={120} step={1} value={angle} onChange={onChange}/><div className="matrix-operation"><span className="matrix">⌈ {c.toFixed(2)} {s.toFixed(2)} ⌉<br/>⌊ {(-s).toFixed(2)} {c.toFixed(2)} ⌋</span><b>×</b><span className="column">⌈ {x.toFixed(1)} ⌉<br/>⌊ {y.toFixed(1)} ⌋</span><b>=</b><span className="column accent">⌈ {result[0].toFixed(2)} ⌉<br/>⌊ {result[1].toFixed(2)} ⌋</span></div></div></div>;
}
