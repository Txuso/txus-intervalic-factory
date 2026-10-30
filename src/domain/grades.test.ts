import { describe, expect, it } from 'vitest'
import { normalizeConfig } from './defaults'
import { GRADES, randomGrade } from './grades'
import type { TimerConfig } from './types'

describe('grados', () => {
  it('van de 6a a 9c', () => {
    expect(GRADES[0]).toBe('6a')
    expect(GRADES.at(-1)).toBe('9c')
    expect(GRADES).toContain('7c+')
  })

  it('randomGrade devuelve siempre un grado válido', () => {
    for (const r of [0, 0.5, 0.9999]) expect(GRADES).toContain(randomGrade(() => r))
  })

  it('las configs antiguas sin grado reciben uno y las que lo tienen lo conservan', () => {
    const old = { id: 'a', name: 'Vieja', prepare: 5, work: 20, rest: 10, rounds: 8, cycles: 1, cycleRest: 0, cooldown: 0 } as TimerConfig
    expect(GRADES).toContain(normalizeConfig(old).grade)
    expect(normalizeConfig({ ...old, grade: '8a' }).grade).toBe('8a')
  })
})
