import { applyOneForm, inverse2, isPositiveDefinite, lowerIndex, normSquared, raiseIndex, type Matrix2 } from "../lib/math";
import { NumberControl, number, type VisualizationProps } from "./visualization-types";

function MetricControls({ state, onChange, includeVector = true, oneForm = false }: VisualizationProps & { includeVector?: boolean; oneForm?: boolean }) {
  return <div className="metric-controls"><div className="metric-input"><span>g =</span><div><NumberControl label="g₁₁" name="g11" value={number(state,"g11")} onChange={onChange}/><NumberControl label="g₁₂" name="g12" value={number(state,"g12")} onChange={onChange}/><NumberControl label="g₂₂" name="g22" value={number(state,"g22")} onChange={onChange}/></div></div>{includeVector&&<div className="number-grid"><NumberControl label={oneForm?"ω₁":"v¹"} name={oneForm?"omegaX":"x"} value={number(state,oneForm?"omegaX":"x")} onChange={onChange}/><NumberControl label={oneForm?"ω₂":"v²"} name={oneForm?"omegaY":"y"} value={number(state,oneForm?"omegaY":"y")} onChange={onChange}/></div>}</div>;
}

function metricFrom(state: VisualizationProps["state"]): Matrix2 { const a=number(state,"g11"),b=number(state,"g12"),d=number(state,"g22"); return [[a,b],[b,d]]; }

function MetricGeometry({ metric, vector }: { metric: Matrix2; vector: [number,number] }) {
  const positive=isPositiveDefinite(metric), angle=Math.atan2(vector[1],vector[0]), radius=65*Math.sqrt(Math.max(0.2,normSquared(metric,[Math.cos(angle),Math.sin(angle)])));
  return <svg className="metric-svg" viewBox="0 0 460 300" role="img" aria-label="Geometria induzida pela métrica"><defs><marker id="metric-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0 0L10 5L0 10z"/></marker></defs><line className="axis" x1="35" y1="150" x2="425" y2="150"/><line className="axis" x1="230" y1="25" x2="230" y2="275"/><ellipse className="metric-ellipse" cx="230" cy="150" rx={positive?105:145} ry={positive?70:25} transform={`rotate(${metric[0][1]*18} 230 150)`}/><line className="vector" x1="230" y1="150" x2={230+radius*Math.cos(angle)} y2={150-radius*Math.sin(angle)} markerEnd="url(#metric-arrow)"/><text className="svg-label" x={240+radius*Math.cos(angle)} y={140-radius*Math.sin(angle)}>v</text><text className={positive?"metric-status good":"metric-status bad"} x="25" y="30">{positive?"métrica positiva definida":"métrica inválida nesta atividade"}</text></svg>;
}

export function MetricLoweringLab({ state, onChange }: VisualizationProps) {
  const metric=metricFrom(state), vector:[number,number]=[number(state,"x"),number(state,"y")], valid=isPositiveDefinite(metric), lower=valid?lowerIndex(metric,vector):[NaN,NaN];
  return <div className="metric-layout"><MetricGeometry metric={metric} vector={vector}/><div className="control-panel"><MetricControls state={state} onChange={onChange}/><div className="matrix-operation compact"><span>g</span><b>×</b><span>⌈ {vector[0]} ⌉<br/>⌊ {vector[1]} ⌋</span><b>=</b><strong>{valid?`⌈ ${lower[0].toFixed(2)} ⌉\n⌊ ${lower[1].toFixed(2)} ⌋`:"—"}</strong></div><small>v♭ é o one-form que mede produtos escalares com v.</small></div></div>;
}

export function MetricRaisingLab({ state, onChange }: VisualizationProps) {
  const metric=metricFrom(state), valid=isPositiveDefinite(metric), omega:[number,number]=[number(state,"omegaX"),number(state,"omegaY")];
  const inverse=valid?inverse2(metric):[[NaN,NaN],[NaN,NaN]] as Matrix2, raised=valid?raiseIndex(metric,omega):[NaN,NaN];
  return <div className="metric-layout"><div className="sharp-animation"><div className="music-object">ω<sub>i</sub><small>one-form</small></div><span>g<sup>ij</sup><i>♯</i></span><div className="music-object vector-object">ω<sup>i</sup><small>vetor</small></div></div><div className="control-panel"><MetricControls state={state} onChange={onChange} oneForm/><div className="inverse-readout"><span>g⁻¹</span><strong>{valid?`⌈ ${inverse[0][0].toFixed(2)}  ${inverse[0][1].toFixed(2)} ⌉\n⌊ ${inverse[1][0].toFixed(2)}  ${inverse[1][1].toFixed(2)} ⌋`:"não disponível"}</strong><span>ω♯ = ({raised.map(v=>Number.isFinite(v)?v.toFixed(2):"—").join(", ")})</span></div></div></div>;
}

export function IntegratedChallengeLab({ state, onChange }: VisualizationProps) {
  const metric=metricFrom(state), vector:[number,number]=[number(state,"x"),number(state,"y")], omega:[number,number]=[number(state,"omegaX"),number(state,"omegaY")];
  const valid=isPositiveDefinite(metric), lower=valid?lowerIndex(metric,vector):[NaN,NaN], norm=valid?normSquared(metric,vector):NaN, pairing=applyOneForm(omega,vector), step=Math.round(number(state,"step"));
  const results=[{label:"1 · Contração",value:`ω(v) = ${pairing.toFixed(2)}`,type:"escalar"},{label:"2 · Descer índice",value:`vᵢ = (${lower.map(v=>v.toFixed(2)).join(", ")})`,type:"covetor"},{label:"3 · Calcular norma",value:`||v||² = ${norm.toFixed(2)}`,type:"escalar"},{label:"4 · Classificar",value:"gᵢⱼvʲ = vᵢ",type:"expressão válida"}];
  return <div className="integrated-lab"><MetricGeometry metric={metric} vector={vector}/><div className="challenge-steps">{results.map((result,index)=><button key={result.label} className={step===index?"active":""} onClick={()=>onChange("step",index,"toggle")}><small>{result.label}</small><strong>{result.value}</strong><span>{result.type}</span></button>)}</div></div>;
}
