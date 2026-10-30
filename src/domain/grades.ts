const BASE = ['6a', '6b', '6c', '7a', '7b', '7c', '8a', '8b', '8c', '9a', '9b', '9c']

/** Grados franceses de 6a a 9c, con "+" */
export const GRADES = BASE.flatMap((g) => [g, `${g}+`]).filter((g) => g !== '9c+')

export function randomGrade(rnd: () => number = Math.random): string {
  return GRADES[Math.floor(rnd() * GRADES.length)]
}
