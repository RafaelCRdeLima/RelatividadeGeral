import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import type { Metric } from "../algebra/form";

/**
 * Carta ativa do protótipo — antes era a constante fixa COORDS; agora é
 * estado escolhido pelo usuário na barra de contexto, mas continua sendo
 * só uma lista de nomes de coordenada passada explicitamente para o motor
 * (`formWedge`, `exteriorDerivative`) — nenhuma função do motor mudou.
 *
 * A métrica é presa ao preset por enquanto (trocar a carta já escolhe a
 * métrica associada) em vez de um seletor independente — simplificação
 * deliberada para não multiplicar combinações carta×métrica sem sentido
 * físico na UI. "Esféricas" usa métrica euclidiana como placeholder: a
 * métrica esférica real (g_θθ=r², g_φφ=r²sin²θ) depende de posição, e o
 * motor de Hodge star só aceita métricas diagonais constantes por ora.
 */
export interface ChartPreset {
  id: string;
  label: string;
  coords: string[];
  metric: Metric;
}

export const CHART_PRESETS: ChartPreset[] = [
  { id: "2d", label: "2D cartesiana (ℝ²)", coords: ["x", "y"], metric: { x: 1, y: 1 } },
  { id: "3d", label: "3D cartesiana (ℝ³)", coords: ["x", "y", "z"], metric: { x: 1, y: 1, z: 1 } },
  {
    id: "spacetime",
    label: "Espaço-tempo (1+3)",
    coords: ["t", "x", "y", "z"],
    metric: { t: -1, x: 1, y: 1, z: 1 },
  },
  {
    id: "spherical",
    label: "Esféricas (r, θ, φ)",
    coords: ["r", "theta", "phi"],
    metric: { r: 1, theta: 1, phi: 1 }, // placeholder — não é a métrica esférica real
  },
];

const DEFAULT_PRESET_ID = "3d";

interface CoordsContextValue {
  presetId: string;
  coords: string[];
  metric: Metric;
  setPresetId: (id: string) => void;
}

const CoordsContext = createContext<CoordsContextValue | null>(null);

export function CoordsProvider({ children }: { children: ReactNode }) {
  const [presetId, setPresetId] = useState(DEFAULT_PRESET_ID);
  const preset = useMemo(
    () => CHART_PRESETS.find((p) => p.id === presetId) ?? CHART_PRESETS[0],
    [presetId],
  );

  const value = useMemo(
    () => ({ presetId, coords: preset.coords, metric: preset.metric, setPresetId }),
    [presetId, preset],
  );

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

/** Operadores que dependem de métrica (Hodge star) usam este hook. */
export function useMetric(): Metric {
  return useCoordsContext().metric;
}

/** A barra de contexto também precisa ler/trocar o preset selecionado. */
export function useCoordsSelector(): CoordsContextValue {
  return useCoordsContext();
}
