import { newId } from './format'
import { randomGrade } from './grades'
import type { Settings, TimerConfig } from './types'

export function defaultConfig(): TimerConfig {
  return {
    id: newId(),
    name: 'Tabata',
    prepare: 5,
    work: 20,
    rest: 10,
    rounds: 8,
    cycles: 1,
    cycleRest: 0,
    cooldown: 0,
    grade: randomGrade(),
  }
}

/** Configs guardadas antes de existir el grado reciben uno */
export function normalizeConfig(c: TimerConfig): TimerConfig {
  return c.grade ? c : { ...c, grade: randomGrade() }
}

export const DEFAULT_SETTINGS: Settings = {
  beeps: true,
  voice: true,
  vibration: true,
  volume: 0.8,
  keepAwake: true,
}
