export type Vector2 = [number, number];
export type Matrix2 = [[number, number], [number, number]];

export const dot = (a: Vector2, b: Vector2): number => a[0] * b[0] + a[1] * b[1];

export const matVec = (matrix: Matrix2, vector: Vector2): Vector2 => [
  matrix[0][0] * vector[0] + matrix[0][1] * vector[1],
  matrix[1][0] * vector[0] + matrix[1][1] * vector[1],
];

export const matMul = (a: Matrix2, b: Matrix2): Matrix2 => [
  [a[0][0] * b[0][0] + a[0][1] * b[1][0], a[0][0] * b[0][1] + a[0][1] * b[1][1]],
  [a[1][0] * b[0][0] + a[1][1] * b[1][0], a[1][0] * b[0][1] + a[1][1] * b[1][1]],
];

export function inverse2(matrix: Matrix2): Matrix2 {
  const determinant = matrix[0][0] * matrix[1][1] - matrix[0][1] * matrix[1][0];
  if (Math.abs(determinant) < 1e-12) throw new Error("A matriz não é inversível.");
  return [
    [matrix[1][1] / determinant, -matrix[0][1] / determinant],
    [-matrix[1][0] / determinant, matrix[0][0] / determinant],
  ];
}

export function rotation(angleDegrees: number): Matrix2 {
  const angle = angleDegrees * Math.PI / 180;
  return [[Math.cos(angle), Math.sin(angle)], [-Math.sin(angle), Math.cos(angle)]];
}

export const transformComponents = (vector: Vector2, angleDegrees: number): Vector2 => matVec(rotation(angleDegrees), vector);

export function dualBasis(basis: Matrix2): Matrix2 {
  return inverse2(basis);
}

export const applyOneForm = (oneForm: Vector2, vector: Vector2): number => dot(oneForm, vector);
export const contract = (upper: Vector2, lower: Vector2): number => dot(upper, lower);
export const lowerIndex = (metric: Matrix2, vector: Vector2): Vector2 => matVec(metric, vector);
export const raiseIndex = (metric: Matrix2, oneForm: Vector2): Vector2 => matVec(inverse2(metric), oneForm);
export const normSquared = (metric: Matrix2, vector: Vector2): number => dot(vector, lowerIndex(metric, vector));
export const isSymmetric = (metric: Matrix2, tolerance = 1e-10): boolean => Math.abs(metric[0][1] - metric[1][0]) <= tolerance;
export const isPositiveDefinite = (metric: Matrix2): boolean => isSymmetric(metric) && metric[0][0] > 0 && metric[0][0] * metric[1][1] - metric[0][1] ** 2 > 0;

export function parseNumber(value: string): number | null {
  const normalized = value.trim().replace(",", ".");
  if (!/^[+-]?(?:\d+(?:\.\d*)?|\.\d+)$/.test(normalized)) return null;
  const result = Number(normalized);
  return Number.isFinite(result) ? result : null;
}

export function isNumericallyCorrect(options: {
  submitted: number;
  expected: number;
  absoluteTolerance?: number;
  relativeTolerance?: number;
}): boolean {
  const absoluteTolerance = options.absoluteTolerance ?? 1e-2;
  const relativeTolerance = options.relativeTolerance ?? 1e-2;
  const difference = Math.abs(options.submitted - options.expected);
  return difference <= absoluteTolerance || difference <= relativeTolerance * Math.max(Math.abs(options.expected), 1);
}
