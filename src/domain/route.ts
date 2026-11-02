// Geometría del croquis vertical: chapas repartidas a lo alto de la vía (0 = suelo, 1 = reunión)

/** Número de chapas que se dibujan: una por serie, entre 3 y 16 para que se distingan */
export function boltCount(series: number): number {
  return Math.min(Math.max(series, 3), 16)
}

export function boltPositions(series: number): number[] {
  const n = boltCount(series)
  return Array.from({ length: n }, (_, i) => (i + 1) / (n + 1))
}

/** Cuánto baja de la última chapa al caer (la cuerda estira) */
export const FALL_SLACK = 0.05

/** Donde queda colgado el escalador si se cae: un poco por debajo de la última chapa que pasó */
export function fallTarget(progress: number, series: number): number {
  const below = boltPositions(series).filter((b) => b <= progress)
  return below.length ? Math.max(0, below[below.length - 1] - FALL_SLACK) : 0
}
