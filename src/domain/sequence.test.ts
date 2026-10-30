import { describe, expect, it } from 'vitest'
import { buildSequence, pickPhrase, totalDuration } from './sequence'
import { formatTime } from './format'
import type { TimerConfig } from './types'

const base: TimerConfig = {
  id: 'x', name: 'Test', grade: '7a',
  prepare: 5, work: 30, rest: 5, rounds: 8, cycles: 3, cycleRest: 4, cooldown: 0,
}

describe('buildSequence', () => {
  it('cuadra con la captura de Timer Plus (13:58 con 5 s de preparación)', () => {
    expect(totalDuration(base)).toBe(838)
    expect(formatTime(totalDuration(base))).toBe('13:58')
  })

  it('genera el orden de fases correcto y omite el último descanso de cada ciclo', () => {
    const seq = buildSequence({ ...base, rounds: 2, cycles: 2, cooldown: 60 })
    expect(seq.map((p) => p.type)).toEqual([
      'prepare', 'work', 'rest', 'work', 'cycleRest', 'work', 'rest', 'work', 'cooldown',
    ])
  })

  it('omite las fases con duración 0', () => {
    const seq = buildSequence({ ...base, prepare: 0, rest: 0, cycleRest: 0, rounds: 2, cycles: 2 })
    expect(seq.map((p) => p.type)).toEqual(['work', 'work', 'work', 'work'])
  })

  it('calcula rondas y ciclos restantes', () => {
    const seq = buildSequence({ ...base, rounds: 2, cycles: 2 })
    expect(seq.map((p) => [p.type, p.roundsLeft, p.cyclesLeft])).toEqual([
      ['prepare', 2, 2],
      ['work', 2, 2], ['rest', 1, 2], ['work', 1, 2],
      ['cycleRest', 2, 1],
      ['work', 2, 1], ['rest', 1, 1], ['work', 1, 1],
    ])
  })
})

describe('formatTime', () => {
  it('formatea minutos y horas', () => {
    expect(formatTime(0)).toBe('00:00')
    expect(formatTime(75)).toBe('01:15')
    expect(formatTime(3725)).toBe('1:02:05')
  })
})

describe('pickPhrase', () => {
  it('nunca repite la última frase cuando hay varias', () => {
    for (let last = 0; last < 6; last++) {
      for (const r of [0, 0.2, 0.5, 0.8, 0.999]) {
        const i = pickPhrase(6, last, () => r)
        expect(i).not.toBe(last)
        expect(i).toBeGreaterThanOrEqual(0)
        expect(i).toBeLessThan(6)
      }
    }
  })

  it('con una sola frase devuelve siempre 0', () => {
    expect(pickPhrase(1, 0)).toBe(0)
  })
})
