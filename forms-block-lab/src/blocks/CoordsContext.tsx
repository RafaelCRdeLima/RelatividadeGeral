import { createContext, useContext, useMemo, useState, type ReactNode } from "react";

/**
 * Carta ativa do protótipo — antes era a constante fixa COORDS; agora é
 * estado escolhido pelo usuário na barra de contexto, mas continua sendo
 * só uma lista de nomes de coordenada passada explicitamente para o motor
 * (`formWedge`, `exteriorDerivative`) — nenhuma função do motor mudou.
 */
export interface ChartPreset {
  id: string;
  label: string;
  coords: string[];
}

export const CHART_PRESETS: ChartPreset[] = [
  { id: "2d", label: "2D cartesiana (ℝ²)", coords: ["x", "y"] },
  { id: "3d", label: "3D cartesiana (ℝ³)", coords: ["x", "y", "z"] },
  { id: "spacetime", label: "Espaço-tempo (1+3)", coords: ["t", "x", "y", "z"] },
  { id: "spherical", label: "Esféricas (r, θ, φ)", coords: ["r", "theta", "phi"] },
];

const DEFAULT_PRESET_ID = "3d";

interface CoordsContextValue {
  presetId: string;
  coords: string[];
  setPresetId: (id: string) => void;
}

const CoordsContext = createContext<CoordsContextValue | null>(null);

export function CoordsProvider({ children }: { children: ReactNode }) {
  const [presetId, setPresetId] = useState(DEFAULT_PRESET_ID);
  const coords = useMemo(
    () => CHART_PRESETS.find((preset) => preset.id === presetId)?.coords ?? CHART_PRESETS[0].coords,
    [presetId],
  );

  const value = useMemo(() => ({ presetId, coords, setPresetId }), [presetId, coords]);

  return <CoordsContext.Provider value={value}>{children}</CoordsContext.Provider>;
}

function useCoordsContext(): CoordsContextValue {
  const ctx = useContext(CoordsContext);
  if (!ctx) throw new Error("useCoords precisa estar dentro de <CoordsProvider>.");
  return ctx;
}

/** A maioria dos componentes só precisa da lista de coordenadas ativas. */
export function useCoords(): string[] {
  return useCoordsContext().coords;
}

/** A barra de contexto também precisa ler/trocar o preset selecionado. */
export function useCoordsSelector(): CoordsContextValue {
  return useCoordsContext();
}
