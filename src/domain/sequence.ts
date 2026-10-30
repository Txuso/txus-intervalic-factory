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
  prepare: 'Prepárate',
  work: 'Entrenar',
  rest: 'Descansar',
  cycleRest: 'Descanso entre ciclos',
  cooldown: 'Enfriamiento',
}

export const PHASE_VOICE: Record<PhaseType, string> = {
  prepare: 'Prepárate',
  work: '¡Entrenar!',
  rest: 'Descansar',
  cycleRest: 'Descanso entre ciclos',
  cooldown: 'Enfriamiento',
}

export const PHASE_COLOR: Record<PhaseType, string> = {
  prepare: 'var(--color-prepare)',
  work: 'var(--color-work)',
  rest: 'var(--color-rest)',
  cycleRest: 'var(--color-cycles)',
  cooldown: 'var(--color-cooldown)',
}
