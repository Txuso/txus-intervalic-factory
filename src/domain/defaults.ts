import { newId } from './format'
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
  }
}

export const DEFAULT_SETTINGS: Settings = {
  beeps: true,
  voice: true,
  vibration: true,
  volume: 0.8,
  keepAwake: true,
}
