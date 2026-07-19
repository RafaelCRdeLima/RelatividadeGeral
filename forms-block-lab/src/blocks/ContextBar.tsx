import { CHART_PRESETS, useCoordsSelector } from "./CoordsContext";

export function ContextBar() {
  const { presetId, coords, setPresetId } = useCoordsSelector();

  return (
    <div className="fb-context-bar">
      <label className="fb-context-field">
        <span>Carta ativa</span>
        <select value={presetId} onChange={(event) => setPresetId(event.target.value)}>
          {CHART_PRESETS.map((preset) => (
            <option key={preset.id} value={preset.id}>
              {preset.label}
            </option>
          ))}
        </select>
      </label>

      <div className="fb-context-field">
        <span>Coordenadas ativas</span>
        <div className="fb-coord-chips">
          {coords.map((name) => (
            <span key={name} className="fb-coord-chip">
              {name}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
