import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { cueFinish, cuePhase, cueTick, unlockAudio } from '../audio/audio'
import { newId } from '../domain/format'
import { buildSequence, PHASE_VOICE } from '../domain/sequence'
import type { HistoryEntry, Phase, Settings, TimerConfig } from '../domain/types'

export type TimerStatus = 'idle' | 'running' | 'paused' | 'finished'

export interface TimerView {
  status: TimerStatus
  phase: Phase | undefined
  next: Phase | undefined
  /** Segundos restantes de la fase (redondeado hacia arriba) */
  phaseLeft: number
  /** 0..1 dentro de la fase actual */
  phaseProgress: number
  totalLeft: number
  elapsed: number
  roundsLeft: number
  cyclesLeft: number
}

const TICK_MS = 100

/**
 * El tiempo se calcula a partir del instante de fin de la fase (performance.now),
 * nunca contando ticks, así no acumula deriva y se resincroniza si el móvil
 * congela la app en segundo plano.
 */
export function useTimerEngine(
  config: TimerConfig,
  settings: Settings,
  onRecord: (entry: HistoryEntry) => void,
) {
  const seq = useMemo(() => buildSequence(config), [config])
  // suffix[i] = suma de duraciones desde la fase i hasta el final
  const suffix = useMemo(() => {
    const s = new Array<number>(seq.length + 1).fill(0)
    for (let i = seq.length - 1; i >= 0; i--) s[i] = s[i + 1] + seq[i].duration
    return s
  }, [seq])

  const [status, setStatus] = useState<TimerStatus>('idle')
  const [index, setIndex] = useState(0)
  const [remainingMs, setRemainingMs] = useState(() => (seq[0]?.duration ?? 0) * 1000)

  const statusRef = useRef(status)
  const indexRef = useRef(0)
  const endAtRef = useRef(0)
  const pausedLeftRef = useRef(0)
  const startedAtRef = useRef(0)
  const lastTickSecRef = useRef<number | null>(null)
  const settingsRef = useRef(settings)
  const seqRef = useRef(seq)
  const configRef = useRef(config)
  const onRecordRef = useRef(onRecord)
  settingsRef.current = settings
  onRecordRef.current = onRecord

  const go = (s: TimerStatus) => {
    statusRef.current = s
    setStatus(s)
  }

  const elapsedAt = useCallback((idx: number, leftMs: number) => {
    const sq = seqRef.current
    let sum = 0
    for (let i = 0; i < idx && i < sq.length; i++) sum += sq[i].duration
    if (sq[idx]) sum += sq[idx].duration - leftMs / 1000
    return Math.max(0, Math.round(sum))
  }, [])

  const record = useCallback((completed: boolean, idx: number, leftMs: number) => {
    const sq = seqRef.current
    const cfg = configRef.current
    const total = sq.reduce((a, p) => a + p.duration, 0)
    const elapsed = completed ? total : elapsedAt(idx, leftMs)
    if (elapsed < 1) return
    const roundsDone = completed
      ? cfg.rounds * cfg.cycles
      : sq.slice(0, idx).filter((p) => p.type === 'work').length
    onRecordRef.current({
      id: newId(),
      startedAt: startedAtRef.current,
      endedAt: Date.now(),
      config: cfg,
      elapsed,
      total,
      completed,
      roundsDone,
      totalRounds: cfg.rounds * cfg.cycles,
    })
  }, [elapsedAt])

  const resetState = useCallback((sq: Phase[]) => {
    go('idle')
    indexRef.current = 0
    setIndex(0)
    setRemainingMs((sq[0]?.duration ?? 0) * 1000)
  }, [])

  // Si cambia la configuración se descarta la sesión en curso (guardándola como parada)
  useEffect(() => {
    if (configRef.current === config) return
    const st = statusRef.current
    if (st === 'running' || st === 'paused') {
      const left = st === 'running' ? endAtRef.current - performance.now() : pausedLeftRef.current
      record(false, indexRef.current, left)
    }
    configRef.current = config
    seqRef.current = seq
    resetState(seq)
  }, [config, seq, record, resetState])

  const tick = useCallback(() => {
    if (statusRef.current !== 'running') return
    const sq = seqRef.current
    const now = performance.now()
    let idx = indexRef.current
    let end = endAtRef.current
    let changed = false

    while (now >= end) {
      idx++
      if (idx >= sq.length) {
        go('finished')
        indexRef.current = sq.length - 1
        setIndex(sq.length - 1)
        setRemainingMs(0)
        cueFinish(settingsRef.current)
        record(true, sq.length - 1, 0)
        return
      }
      end += sq[idx].duration * 1000
      changed = true
    }

    const phase = sq[idx]
    const left = end - now
    const secLeft = Math.ceil(left / 1000)
    if (changed) {
      indexRef.current = idx
      endAtRef.current = end
      lastTickSecRef.current = null
      setIndex(idx)
      cuePhase(settingsRef.current, PHASE_VOICE[phase.type])
    } else if (secLeft >= 1 && secLeft <= 3 && secLeft < phase.duration && lastTickSecRef.current !== secLeft) {
      lastTickSecRef.current = secLeft
      cueTick(settingsRef.current)
    }
    setRemainingMs(left)
  }, [record])

  useEffect(() => {
    if (status !== 'running') return
    const id = setInterval(tick, TICK_MS)
    const onVisible = () => document.visibilityState === 'visible' && tick()
    document.addEventListener('visibilitychange', onVisible)
    return () => {
      clearInterval(id)
      document.removeEventListener('visibilitychange', onVisible)
    }
  }, [status, tick])

  const start = useCallback(() => {
    const sq = seqRef.current
    if (!sq.length) return
    unlockAudio()
    indexRef.current = 0
    endAtRef.current = performance.now() + sq[0].duration * 1000
    startedAtRef.current = Date.now()
    lastTickSecRef.current = null
    setIndex(0)
    setRemainingMs(sq[0].duration * 1000)
    go('running')
    cuePhase(settingsRef.current, PHASE_VOICE[sq[0].type])
  }, [])

  const pause = useCallback(() => {
    if (statusRef.current !== 'running') return
    pausedLeftRef.current = Math.max(0, endAtRef.current - performance.now())
    setRemainingMs(pausedLeftRef.current)
    go('paused')
  }, [])

  const resume = useCallback(() => {
    if (statusRef.current !== 'paused') return
    unlockAudio()
    endAtRef.current = performance.now() + pausedLeftRef.current
    go('running')
  }, [])

  /** Vuelve al inicio; si había un entreno a medias lo guarda en el historial como parado */
  const reset = useCallback(() => {
    const st = statusRef.current
    if (st === 'running' || st === 'paused') {
      const left = st === 'running' ? endAtRef.current - performance.now() : pausedLeftRef.current
      record(false, indexRef.current, left)
    }
    resetState(seqRef.current)
  }, [record, resetState])

  const phase = seq[index]
  const phaseLeft = status === 'finished' ? 0 : Math.ceil(Math.max(0, remainingMs) / 1000)
  const view: TimerView = {
    status,
    phase,
    next: status === 'finished' ? undefined : seq[index + 1],
    phaseLeft,
    phaseProgress: phase && status !== 'idle' ? Math.min(1, 1 - remainingMs / (phase.duration * 1000)) : 0,
    totalLeft: status === 'finished' ? 0 : Math.ceil(Math.max(0, remainingMs) / 1000 + (suffix[index + 1] ?? 0)),
    elapsed: status === 'finished' ? suffix[0] : elapsedAt(index, remainingMs),
    roundsLeft: status === 'finished' ? 0 : (phase?.roundsLeft ?? 0),
    cyclesLeft: status === 'finished' ? 0 : (phase?.cyclesLeft ?? 0),
  }

  return { view, start, pause, resume, reset }
}
