import { describe, expect, it } from 'vitest'
import { normalizeConfig, withPresets } from './defaults'
import { totalDuration } from './sequence'
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

describe('entrenos predefinidos', () => {
  const mine = { id: 'm', name: 'Tabata', prepare: 5, work: 20, rest: 10, rounds: 8, cycles: 1, cycleRest: 0, cooldown: 0, grade: '7a' }

  it('añade Preventives con sus valores y dura 06:45', () => {
    const { list, offered } = withPresets([mine], [])
    const p = list.find((c) => c.name === 'Preventives')!
    expect(p).toMatchObject({ prepare: 5, work: 10, rest: 10, rounds: 10, cycles: 2, cycleRest: 20, cooldown: 0, climberId: 'ondra' })
    expect(totalDuration(p)).toBe(405)
    expect(offered).toContain('preset-preventives')
  })

  it('no lo vuelve a añadir si ya se ofreció (aunque se haya borrado)', () => {
    expect(withPresets([mine], ['preset-preventives']).list).toHaveLength(1)
  })

  it('no lo duplica si ya hay uno con el mismo nombre', () => {
    const own = { ...mine, id: 'x', name: ' preventives ' }
    expect(withPresets([mine, own], []).list).toHaveLength(2)
  })
})
