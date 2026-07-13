import { applyOneForm } from "../lib/math";
import { RangeControl, number, type VisualizationProps } from "./visualization-types";

const expressions = [
  { formula: "Aᵢ + Bᵢ", verdict: "válida · covetor", detail: "O índice livre i coincide nos dois termos." },
  { formula: "Aᵢ + Bⁱ", verdict: "inválida", detail: "Soma um covetor com um vetor sem usar a métrica." },
  { formula: "Tⁱⱼ vʲ", verdict: "válida · vetor", detail: "j é mudo; i permanece livre." },
  { formula: "Tⁱⱼ vᵏ", verdict: "válida · tensor de ordem 3", detail: "i, j e k estão livres; não há contração." },
  { formula: "AᵢBⁱ + CⱼDʲ", verdict: "válida · escalar", detail: "Cada termo é uma contração completa." },
];

export function EinsteinNotationLab({ state, onChange }: VisualizationProps) {
  const dimension = Math.round(number(state,"dimension"));
  const a=[2,-1,3,4], b=[1,3,-2,0.5]; const terms=a.slice(0,dimension).map((value,index)=>value*b[index]);
  return <div className="index-stage"><div className="index-expression"><span>A<sub className="dummy">i</sub></span><span>B<sup className="dummy">i</sup></span><b>=</b><strong>{terms.map((term,index)=>`A${index+1}B${index+1}`).join(" + ")}</strong></div><div className="index-legend"><span><i className="dummy-dot"/> índice mudo: i</span><span>resultado: escalar</span></div><RangeControl label="Dimensão da soma" name="dimension" min={2} max={4} step={1} value={dimension} onChange={onChange}/><div className="sum-result">Σ = {terms.map(term=>term.toFixed(1)).join(" + ")} = <b>{terms.reduce((sum,value)=>sum+value,0).toFixed(1)}</b></div></div>;
}

export function ExpressionValidatorLab({ state, onChange }: VisualizationProps) {
  const selected=Math.min(expressions.length-1,Math.max(0,Math.round(number(state,"expression")))); const expression=expressions[selected];
  return <div className="expression-lab"><div className="expression-tabs">{expressions.map((item,index)=><button className={selected===index?"active":""} key={item.formula} onClick={()=>onChange("expression",index,"toggle")}>{index+1}</button>)}</div><div className="expression-focus">{expression.formula}</div><div className={`verdict ${expression.verdict.includes("inválida")?"invalid":"valid"}`}><strong>{expression.verdict}</strong><p>{expression.detail}</p></div><p className="index-rule">Leia cada termo separadamente: índices repetidos são somados; os que sobram precisam coincidir.</p></div>;
}

export function TensorProductLab({ state, onChange }: VisualizationProps) {
  const contracted=Boolean(state.contracted), x=number(state,"x"),y=number(state,"y"),ox=number(state,"omegaX"),oy=number(state,"omegaY");
  const matrix=[[x*ox,x*oy],[y*ox,y*oy]], scalar=applyOneForm([ox,oy],[x,y]);
  return <div className="tensor-machine"><div className="object-chip upper">v<sup>i</sup><small>vetor</small></div><span className="machine-symbol">{contracted?"⋅":"⊗"}</span><div className="object-chip lower">ω<sub>{contracted?"i":"j"}</sub><small>one-form</small></div><button className="operation-toggle" onClick={()=>onChange("contracted",!contracted,"toggle")}>{contracted?"Mostrar produto tensorial":"Contrair índices"}</button>{contracted?<div className="tensor-output scalar"><small>nenhum índice livre</small><strong>{x.toFixed(1)}·{ox.toFixed(1)} + {y.toFixed(1)}·{oy.toFixed(1)} = {scalar.toFixed(2)}</strong><span>escalar</span></div>:<div className="tensor-output"><small>índices livres i, j</small><strong>⌈ {matrix[0].map(v=>v.toFixed(1)).join("  ")} ⌉<br/>⌊ {matrix[1].map(v=>v.toFixed(1)).join("  ")} ⌋</strong><span>tensor (1,1)</span></div>}</div>;
}
