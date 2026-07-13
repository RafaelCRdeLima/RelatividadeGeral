import { applyOneForm, dualBasis, type Matrix2 } from "../lib/math";
import { NumberControl, RangeControl, number, type VisualizationProps } from "./visualization-types";

function OneFormSvg({ x, y, omegaX, omegaY, showVector = true }: { x: number; y: number; omegaX: number; omegaY: number; showVector?: boolean }) {
  const cx = 240, cy = 220, scale = 45;
  const norm = Math.hypot(omegaX, omegaY) || 1;
  const nx = omegaX / norm, ny = -omegaY / norm;
  const tx = -ny, ty = nx;
  return <svg className="lab-svg" viewBox="0 0 480 440" role="img" aria-label="One-form representado por linhas de nível"><defs><marker id="one-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0 0L10 5L0 10z"/></marker></defs>
    {Array.from({ length: 11 }, (_, index) => index - 5).map(level => { const ox = level * 28 * nx, oy = level * 28 * ny; return <line key={level} className={level === 0 ? "level zero" : "level"} x1={cx + ox - tx * 330} y1={cy + oy - ty * 330} x2={cx + ox + tx * 330} y2={cy + oy + ty * 330}/>; })}
    <line className="covector" x1={cx} y1={cy} x2={cx + nx * 110} y2={cy + ny * 110} markerEnd="url(#one-arrow)"/><text className="svg-label" x={cx + nx * 122} y={cy + ny * 122}>ω</text>
    {showVector && <><line className="vector" x1={cx} y1={cy} x2={cx + x * scale} y2={cy - y * scale} markerEnd="url(#one-arrow)"/><text className="svg-label" x={cx + x * scale + 8} y={cy - y * scale - 8}>v</text></>}
  </svg>;
}

export function OneFormLab({ state, onChange }: VisualizationProps) {
  const x = number(state,"x"), y = number(state,"y"), ox = number(state,"omegaX"), oy = number(state,"omegaY");
  const result = applyOneForm([ox, oy], [x, y]);
  return <div className="visual-layout"><OneFormSvg x={x} y={y} omegaX={ox} omegaY={oy}/><div className="control-panel"><div className="number-grid"><NumberControl label="v¹" name="x" value={x} onChange={onChange}/><NumberControl label="v²" name="y" value={y} onChange={onChange}/><NumberControl label="ω₁" name="omegaX" value={ox} onChange={onChange}/><NumberControl label="ω₂" name="omegaY" value={oy} onChange={onChange}/></div><div className="scalar-result"><small>emparelhamento</small><strong>ω(v) = {result.toFixed(2)}</strong><span>{ox.toFixed(1)}·{x.toFixed(1)} + {oy.toFixed(1)}·{y.toFixed(1)}</span></div></div></div>;
}

export function VectorVsOneFormLab({ state, onChange }: VisualizationProps) {
  const x=number(state,"x"), y=number(state,"y"), ox=number(state,"omegaX"), oy=number(state,"omegaY"), scale=number(state,"scale")||1;
  const vectorPrime:[number,number]=[x/scale,y],onePrime:[number,number]=[ox*scale,oy],invariant=applyOneForm([ox,oy],[x,y]),primeInvariant=applyOneForm(onePrime,vectorPrime);
  return <div className="split-object"><div><span className="object-label">Vetor ∈ V · one-form ∈ V*</span><OneFormSvg x={x} y={y} omegaX={ox} omegaY={oy}/></div><div className="control-panel"><RangeControl label="Escala da base e′₁ = λe₁" name="scale" min={0.5} max={2} step={0.05} value={scale} onChange={onChange}/><div className="comparison-table"><span>v′ (lei inversa)</span><b>({vectorPrime.map(v=>v.toFixed(2)).join(", ")})</b><span>ω′ (lei direta)</span><b>({onePrime.map(v=>v.toFixed(2)).join(", ")})</b><span>ω(v) = ω′(v′)</span><b className="invariant">{invariant.toFixed(2)} = {primeInvariant.toFixed(2)}</b></div></div></div>;
}

export function DualBasisLab({ state, onChange }: VisualizationProps) {
  const skew=number(state,"skew"); const basis: Matrix2=[[1,skew],[0,1]]; const dual=dualBasis(basis);
  return <div className="visual-layout"><svg className="lab-svg" viewBox="0 0 480 440" role="img" aria-label="Base oblíqua e sua base dual"><defs><marker id="dual-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0 0L10 5L0 10z"/></marker></defs><line className="axis" x1="40" y1="350" x2="440" y2="350"/><line className="axis" x1="110" y1="410" x2="110" y2="30"/><line className="basis basis-one" x1="110" y1="350" x2="300" y2="350" markerEnd="url(#dual-arrow)"/><line className="basis basis-two" x1="110" y1="350" x2={110+skew*190} y2="160" markerEnd="url(#dual-arrow)"/><text className="svg-label" x="306" y="345">e₁</text><text className="svg-label" x={120+skew*190} y="155">e₂</text>{Array.from({length:7},(_,i)=>i-3).map(n=><line key={`a${n}`} className="dual-level one" x1={110+n*48} y1="40" x2={110+n*48} y2="410"/>)}{Array.from({length:7},(_,i)=>i-3).map(n=><line key={`b${n}`} className="dual-level two" x1="30" y1={350+n*46+skew*80} x2="450" y2={350+n*46-skew*80}/>)}</svg><div className="control-panel"><RangeControl label="Obliquidade de e₂" name="skew" min={-0.9} max={0.9} step={0.05} value={skew} onChange={onChange}/><div className="pairing-matrix"><small>εⁱ(eⱼ)</small><strong>⌈ 1,00 0,00 ⌉<br/>⌊ 0,00 1,00 ⌋</strong><span>ε¹=({dual[0].map(v=>v.toFixed(2)).join(", ")})</span><span>ε²=({dual[1].map(v=>v.toFixed(2)).join(", ")})</span></div></div></div>;
}
