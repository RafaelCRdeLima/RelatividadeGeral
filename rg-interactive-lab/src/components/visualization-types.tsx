export type LabValue = number | string | boolean;
export type LabVisualState = Record<string, LabValue>;
export type ChangeKind = "slider" | "number" | "toggle" | "drag";

export interface VisualizationProps {
  state: LabVisualState;
  onChange: (key: string, value: LabValue, kind?: ChangeKind) => void;
}

export const number = (state: LabVisualState, key: string): number => Number(state[key] ?? 0);

export function RangeControl(props: { label: string; name: string; min: number; max: number; step?: number; value: number; onChange: VisualizationProps["onChange"] }) {
  return <label className="range-control"><span>{props.label}<output>{props.value.toFixed(2).replace(".", ",")}</output></span><input aria-label={props.label} type="range" min={props.min} max={props.max} step={props.step ?? 0.1} value={props.value} onChange={event => props.onChange(props.name, Number(event.target.value), "slider")} /></label>;
}

export function NumberControl(props: { label: string; name: string; value: number; onChange: VisualizationProps["onChange"] }) {
  return <label className="number-control"><span>{props.label}</span><input aria-label={props.label} type="number" step="0.1" value={props.value} onChange={event => props.onChange(props.name, Number(event.target.value), "number")} /></label>;
}
