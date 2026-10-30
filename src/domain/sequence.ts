import type { Phase, PhaseType, TimerConfig } from './types'

/**
 * Orden: Prepárate → por ciclo (Entrenar + Descansar) × rondas, sin el descanso de la
 * última ronda → Descanso entre ciclos (salvo tras el último) → Enfriamiento.
 * Las fases de duración 0 se omiten.
 */
export function buildSequence(c: TimerConfig): Phase[] {
  const phases: Phase[] = []
  const push = (type: PhaseType, duration: number, round: number, cycle: number, roundsLeft: number, cyclesLeft: number) => {
    if (duration > 0) phases.push({ type, duration, round, cycle, roundsLeft, cyclesLeft })
  }

  push('prepare', c.prepare, 0, 0, c.rounds, c.cycles)
  for (let cycle = 1; cycle <= c.cycles; cycle++) {
    const cyclesLeft = c.cycles - cycle + 1
    for (let round = 1; round <= c.rounds; round++) {
      push('work', c.work, round, cycle, c.rounds - round + 1, cyclesLeft)
      if (round < c.rounds) push('rest', c.rest, round, cycle, c.rounds - round, cyclesLeft)
    }
    if (cycle < c.cycles) push('cycleRest', c.cycleRest, 0, cycle, c.rounds, cyclesLeft - 1)
  }
  push('cooldown', c.cooldown, 0, 0, 0, 0)
  return phases
}

export function totalDuration(c: TimerConfig): number {
  return buildSequence(c).reduce((sum, p) => sum + p.duration, 0)
}

export const PHASE_LABEL: Record<PhaseType, string> = {
  prepare: 'Magnesio',
  work: '¡Apreta!',
  rest: 'Reposa',
  cycleRest: 'Reunión',
  cooldown: 'Ir al bar',
}

/** Frases de voz por fase; se elige una al azar sin repetir la anterior */
export const PHASE_VOICE: Record<PhaseType, string[]> = {
  prepare: ['Magnesio'],
  // "Allez" escrito como suena: la voz española lo lee mal
  work: ['¡Apreta!', '¡Aupa!', '¡Vinga bou!', '¡Egurre!', '¡Alé!', '¡Venga, venga!'],
  rest: ['Reposa', 'Sacude'],
  cycleRest: ['Reunión'],
  cooldown: ['¡Ir al bar!'],
}

/** Índice al azar en [0, count) distinto de `last` cuando hay más de una opción */
export function pickPhrase(count: number, last: number, rnd: () => number = Math.random): number {
  if (count <= 1) return 0
  const i = Math.floor(rnd() * (count - 1))
  return i >= last && last >= 0 ? i + 1 : i
}

export const PHASE_COLOR: Record<PhaseType, string> = {
  prepare: 'var(--color-prepare)',
  work: 'var(--color-work)',
  rest: 'var(--color-rest)',
  cycleRest: 'var(--color-cycles)',
  cooldown: 'var(--color-cooldown)',
}
