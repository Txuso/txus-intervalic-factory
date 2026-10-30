export type PhaseType = 'prepare' | 'work' | 'rest' | 'cycleRest' | 'cooldown'

/** Configuración de un timer Tabata. Todas las duraciones en segundos. */
export interface TimerConfig {
  id: string
  name: string
  prepare: number
  work: number
  rest: number
  rounds: number
  cycles: number
  cycleRest: number
  cooldown: number
}

export interface Phase {
  type: PhaseType
  duration: number
  /** Ronda (1..rounds) para work/rest; 0 en el resto */
  round: number
  /** Ciclo (1..cycles); 0 para prepare/cooldown */
  cycle: number
  /** Lo que se muestra en "Rondas restantes" durante esta fase */
  roundsLeft: number
  /** Lo que se muestra en "Ciclos restantes" durante esta fase */
  cyclesLeft: number
}

export interface HistoryEntry {
  id: string
  startedAt: number
  endedAt: number
  config: TimerConfig
  /** Segundos entrenados (incluye preparación y descansos) */
  elapsed: number
  total: number
  completed: boolean
  roundsDone: number
  totalRounds: number
}

export interface Settings {
  beeps: boolean
  voice: boolean
  vibration: boolean
  /** 0..1 */
  volume: number
  keepAwake: boolean
}
