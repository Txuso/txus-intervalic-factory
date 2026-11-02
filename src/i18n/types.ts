import type { PhaseType } from '../domain/types'

type Field = { title: string; sub: string }

export interface Dict {
  /** Para fechas, p. ej. 'es-ES' */
  locale: string
  /** Idioma de la voz sintética */
  voiceLang: string
  phase: Record<PhaseType, string>
  /** Frases de voz por fase; se elige una al azar sin repetir la anterior */
  voice: Record<PhaseType, string[]>
  voiceFinish: string
  voiceTest: string

  back: string
  cancel: string
  accept: string
  save: string
  done: string
  delete: string

  start: string
  pause: string
  resume: string
  again: string
  finished: string
  lastPhase: string
  /** "Has encadenado un 8a": texto antes y después del grado */
  sentGrade: { pre: string; post: string }
  roundsLeft: string
  cyclesLeft: string
  resetTitle: string
  resetMessage: string
  resetConfirm: string
  proud: (name: string) => string
  aria: { library: string; history: string; edit: string; settings: string; reset: string; duplicate: string }

  editTitle: string
  newTitle: string
  name: string
  nameRequired: string
  namePlaceholder: string
  climber: string
  climberNone: string
  climberPick: string
  grade: string
  gradeSub: string
  total: string
  saveAsNew: string
  fields: {
    prepare: Field
    work: Field
    rest: Field
    rounds: Field
    cycles: { title: string; sub: (rounds: number) => string }
    cycleRest: Field
    cooldown: Field
  }
  min: string
  sec: string

  myWorkouts: string
  addNew: string
  deleteTitle: (name: string) => string
  deleteMessage: string
  copySuffix: string
  cyclesSummary: (n: number) => string

  history: string
  lastN: (n: number) => string
  empty: string
  sent: string
  project: string
  roundsShort: string
  repeat: string
  saved: string
  saveWorkout: string
  deleteHistoryTitle: string

  settings: string
  alerts: string
  beeps: string
  beepsSub: string
  voiceTitle: string
  voiceSub: string
  vibration: string
  vibrationNote: { native: string; 'ios-haptic': string; none: string }
  volume: string
  test: string
  screen: string
  keepAwake: string
  keepAwakeSub: string
  language: string

  install: {
    title: string
    intro: string
    steps: { ios: string[]; android: string[] }
    now: string
    later: string
    gotIt: string
    settingsRow: string
    settingsSub: string
  }
}
