/**
 * Gera o contorno jigsaw de um bloco como polígono de clip-path.
 *
 * O grau de entrada vira entalhes (material removido) na borda esquerda; o
 * grau de saída vira dentes (material adicionado) na borda direita. Ambos
 * usam a mesma função de borda porque, geometricamente, "dente" e "entalhe"
 * são o mesmo deslocamento para dentro do retângulo — a diferença de leitura
 * visual (macho vs. fêmea) vem só de qual borda (x=width vs. x=0) o
 * deslocamento parte.
 */

type Point = [number, number];

const TOOTH_DEPTH = 9;
const TOOTH_WIDTH = 14;

function edgePoints(yStart: number, yEnd: number, count: number, baseX: number): Point[] {
  if (count <= 0) return [[baseX, yEnd]];

  const points: Point[] = [];
  const descending = yEnd < yStart;
  const step = (yEnd - yStart) / (count + 1);
  const halfWidth = TOOTH_WIDTH / 2;

  for (let i = 1; i <= count; i++) {
    const centerY = yStart + step * i;
    const near = descending ? centerY + halfWidth : centerY - halfWidth;
    const far = descending ? centerY - halfWidth : centerY + halfWidth;
    points.push([baseX, near]);
    points.push([baseX + TOOTH_DEPTH, centerY]);
    points.push([baseX, far]);
  }

  points.push([baseX, yEnd]);
  return points;
}

export function blockClipPath(width: number, height: number, degreeIn: number, degreeOut: number): string {
  const points: Point[] = [
    [0, 0],
    [width, 0],
    ...edgePoints(0, height, degreeOut, width),
    [0, height],
    ...edgePoints(height, 0, degreeIn, 0),
  ];

  const css = points.map(([x, y]) => `${x}px ${y}px`).join(", ");
  return `polygon(${css})`;
}
