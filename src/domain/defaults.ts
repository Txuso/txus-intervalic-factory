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

/** Entrenos que trae la app para todo el mundo. El id fijo evita ofrecerlos dos veces. */
export function presetConfigs(): TimerConfig[] {
  return [
    {
      id: 'preset-preventives',
      name: 'Preventives',
      prepare: 5,
      work: 10,
      rest: 10,
      rounds: 10,
      cycles: 2,
      cycleRest: 20,
      cooldown: 0,
      grade: randomGrade(),
      climberId: 'ondra',
    },
  ]
}

/**
 * Añade los entrenos predefinidos que este usuario aún no ha recibido. Cada uno se ofrece
 * una sola vez (si lo borra no vuelve) y no se duplica si ya tiene uno con el mismo nombre.
 */
export function withPresets(list: TimerConfig[], offered: string[]): { list: TimerConfig[]; offered: string[] } {
  const names = new Set(list.map((c) => c.name.trim().toLowerCase()))
  const fresh = presetConfigs().filter(
    (p) => !offered.includes(p.id) && !list.some((c) => c.id === p.id) && !names.has(p.name.toLowerCase()),
  )
  return {
    list: [...list, ...fresh],
    offered: [...offered, ...presetConfigs().map((p) => p.id).filter((id) => !offered.includes(id))],
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
