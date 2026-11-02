import { describe, expect, it } from 'vitest'
import { boltPositions, FALL_SLACK, fallTarget } from './route'
import { buildSequence, clippedCount, lastCall } from './sequence'
import type { TimerConfig } from './types'

const cfg: TimerConfig = { id: 'x', name: 'T', grade: '7a', prepare: 5, work: 10, rest: 5, rounds: 3, cycles: 2, cycleRest: 20, cooldown: 0 }

describe('fallTarget', () => {
  it('cae un poco por debajo de la última chapa pasada', () => {
    const bolts = boltPositions(6) // 1/7 … 6/7
    expect(fallTarget(0.5, 6)).toBeCloseTo(bolts[2] - FALL_SLACK)
  })
  it('sin chapas por debajo cae al suelo', () => {
    expect(fallTarget(0.05, 6)).toBe(0)
  })
})

describe('clippedCount', () => {
  const seq = buildSequence(cfg)
  const at = (type: string, n = 0) => seq.filter((p) => p.type === type)[n]
  it('va chapando una cinta por serie', () => {
    expect(clippedCount(at('prepare'), 3, 'running')).toBe(0)
    expect(clippedCount(at('work', 0), 3, 'running')).toBe(0)
    expect(clippedCount(at('rest', 0), 3, 'running')).toBe(1)
    expect(clippedCount(at('work', 2), 3, 'running')).toBe(2)
  })
  it('en la reunión el largo terminado sale entero chapado', () => {
    expect(clippedCount(at('cycleRest'), 3, 'running')).toBe(3)
  })
  it('en reposo ninguna y al encadenar todas', () => {
    expect(clippedCount(at('work'), 3, 'idle')).toBe(0)
    expect(clippedCount(undefined, 3, 'finished')).toBe(3)
  })
})

describe('lastCall', () => {
  const works = buildSequence(cfg).filter((p) => p.type === 'work')
  it('avisa en la última chapa de cada largo y al empezar el último largo', () => {
    expect(works.map((p) => lastCall(p, 3, 2))).toEqual([null, null, 'lastClip', 'lastPitch', null, 'lastClip'])
  })
  it('sin avisos con una sola chapa y un solo largo', () => {
    const one = buildSequence({ ...cfg, rounds: 1, cycles: 1 }).filter((p) => p.type === 'work')
    expect(one.map((p) => lastCall(p, 1, 1))).toEqual([null])
  })
  it('con una chapa por largo solo avisa del último largo', () => {
    const w = buildSequence({ ...cfg, rounds: 1, cycles: 3 }).filter((p) => p.type === 'work')
    expect(w.map((p) => lastCall(p, 1, 3))).toEqual([null, null, 'lastPitch'])
  })
  it('las fases que no son de esfuerzo nunca avisan', () => {
    expect(lastCall(buildSequence(cfg)[0], 3, 2)).toBeNull()
  })
})
