import { History, LayoutGrid, Pause, Pencil, Play, RotateCcw, Settings } from 'lucide-react'
import { useEffect, useState } from 'react'
import { ChalkBurst } from '../components/ChalkBurst'
import { ClimberAvatar } from '../components/ClimberAvatar'
import { useConfirm } from '../components/ConfirmDialog'
import { ProgressRing } from '../components/ProgressRing'
import { Quickdraws } from '../components/Quickdraws'
import { RouteProgress } from '../components/RouteProgress'
import { formatTime } from '../domain/format'
import { findClimber, ME_ID } from '../domain/climbers'
import { fallTarget } from '../domain/route'
import { clippedCount, lastCall, PHASE_COLOR } from '../domain/sequence'
import type { TimerConfig } from '../domain/types'
import type { TimerView } from '../hooks/useTimerEngine'
import { useT } from '../i18n'

interface Props {
  config: TimerConfig
  view: TimerView
  onStart: () => void
  onPause: () => void
  onResume: () => void
  onReset: () => void
  onOpenLibrary: () => void
  onOpenHistory: () => void
  onOpenSettings: () => void
  onEdit: () => void
}

/** Lo que dura la caída antes de volver al inicio (bajada + rebote en la cuerda) */
const FALL_MS = 1500

const iconBtn = 'flex h-11 w-10 items-center justify-center text-accent active:opacity-60'

export function TimerScreen(p: Props) {
  const { view, config } = p
  const t = useT()
  const confirm = useConfirm()
  const climber = findClimber(config.climberId)
  const finished = view.status === 'finished'
  const active = view.status === 'running' || view.status === 'paused'
  const series = config.rounds * config.cycles
  // Al parar a medias el escalador se cae por la cuerda antes de volver al inicio
  const [fallTo, setFallTo] = useState<number | null>(null)
  const falling = fallTo !== null
  useEffect(() => {
    if (!falling) return
    const id = setTimeout(() => {
      setFallTo(null)
      p.onReset()
    }, FALL_MS)
    return () => clearTimeout(id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [falling])

  const panelColor = falling
    ? 'var(--color-rest)'
    : finished
      ? 'var(--color-accent)'
      : view.phase
        ? PHASE_COLOR[view.phase.type]
        : 'var(--color-btn)'

  const title = falling ? t.project : finished ? t.finished : view.phase ? t.phase[view.phase.type] : ''
  const call = view.status === 'idle' || finished || falling ? null : lastCall(view.phase, config.rounds, config.cycles)

  const center = {
    idle: { icon: <Play className="h-12 w-12 translate-x-0.5 fill-current" />, label: t.start, action: p.onStart },
    running: { icon: <Pause className="h-12 w-12 fill-current" />, label: t.pause, action: p.onPause },
    paused: { icon: <Play className="h-12 w-12 translate-x-0.5 fill-current" />, label: t.resume, action: p.onResume },
    finished: { icon: <RotateCcw className="h-12 w-12" strokeWidth={2.5} />, label: t.again, action: p.onStart },
  }[view.status]

  const reset = async () => {
    if (falling) return
    if (!active) return p.onReset()
    if (!(await confirm({ title: t.resetTitle, message: t.resetMessage, confirmLabel: t.resetConfirm, danger: true }))) return
    p.onPause()
    setFallTo(fallTarget(view.totalProgress, series))
  }

  return (
    <div className="rock flex h-full flex-col">
      <header className="pt-safe">
        <div className="flex items-center px-2 py-1">
          <div className="flex w-20">
            <button className={iconBtn} onClick={p.onOpenLibrary} aria-label={t.aria.library}>
              <LayoutGrid className="h-6 w-6" />
            </button>
            <button className={iconBtn} onClick={p.onOpenHistory} aria-label={t.aria.history}>
              <History className="h-6 w-6" />
            </button>
          </div>
          {/* Foto del escalador a la izquierda del nombre y el tiempo, ocupando las dos líneas */}
          <div className="flex min-w-0 flex-1 items-center justify-center gap-2 text-accent">
            <ClimberAvatar climberId={config.climberId} size={Math.round(Math.min(48, innerWidth * 0.11))} />
            <div className="min-w-0 text-center">
              <div className="truncate text-2xl leading-tight">{config.name}</div>
              <div className="flex items-baseline justify-center gap-2 leading-none">
                <span className="tabular text-4xl">{formatTime(finished ? view.elapsed : view.totalLeft)}</span>
                <span className="text-2xl text-white/70">{config.grade}</span>
              </div>
            </div>
          </div>
          <div className="flex w-20 justify-end">
            <button className={iconBtn} onClick={p.onEdit} aria-label={t.aria.edit}>
              <Pencil className="h-6 w-6" />
            </button>
            <button className={iconBtn} onClick={p.onOpenSettings} aria-label={t.aria.settings}>
              <Settings className="h-6 w-6" />
            </button>
          </div>
        </div>
      </header>

      <section
        className="relative mt-2 flex flex-1 flex-col items-center text-black transition-colors duration-300"
        style={{ background: panelColor }}
      >
        {(active || finished) && (
          <button
            onClick={reset}
            aria-label={t.aria.reset}
            className="absolute -top-5 right-4 z-10 flex h-12 w-12 items-center justify-center rounded-full border-2 border-bg bg-[#2a2a2a] text-accent active:opacity-70"
          >
            <RotateCcw className="h-6 w-6" />
          </button>
        )}
        {!finished && (
          <RouteProgress progress={view.totalProgress} bolts={series} climberId={config.climberId} fallTo={fallTo ?? undefined} />
        )}
        {finished && <ChalkBurst />}
        <div
          className="whitespace-nowrap pt-[1.5vh] leading-none"
          style={{ fontSize: `min(24vw, 10vh, ${88 / (title.length * 0.42)}vw)` }}
        >
          {title}
        </div>
        {call && (
          <div className="mt-1 rounded-full bg-black px-4 py-1 text-[min(6.5vw,3.2vh)] leading-none text-accent">{t[call]}</div>
        )}
        {finished ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-[1vh] px-4">
            {climber && (
              <>
                <ClimberAvatar climberId={climber.id} size={Math.round(Math.min(innerWidth * 0.32, innerHeight * 0.15))} ring />
                <div className="text-center text-[min(7vw,3.6vh)] leading-[1.05]">
                  {climber.id === ME_ID ? t.proudMe : t.proud(climber.name)}
                </div>
              </>
            )}
            <div className={`tabular leading-[0.9] ${climber ? 'text-[min(26vw,11vh)]' : 'text-[min(32vw,15vh)]'}`}>
              {formatTime(view.elapsed)}
            </div>
          </div>
        ) : (
          // Tan grande como quepa en el hueco del panel (el escalador puede pasar por encima):
          // el tamaño sale del ancho y alto de este contenedor. "00:00" en Bebas mide ~1,82 veces
          // su tamaño de letra de ancho y los dígitos ~0,72 de alto
          <div className="flex min-h-0 flex-1 items-center justify-center self-stretch [container-type:size]">
            <span className="tabular leading-none" style={{ fontSize: 'calc(min((100cqw - 8px) / 1.82, 125cqh) - 6px)' }}>
              {formatTime(view.phaseLeft)}
            </span>
          </div>
        )}
      </section>

      <section
        className="flex flex-col items-center py-2 text-black transition-colors duration-300"
        style={{ background: view.next ? PHASE_COLOR[view.next.type] : 'var(--color-btn)' }}
      >
        {view.next ? (
          <>
            <div className="text-[min(7vw,4vh)] leading-none">{t.phase[view.next.type]}</div>
            <div className="tabular text-[min(20vw,11vh)] leading-[0.95]">{formatTime(view.next.duration)}</div>
          </>
        ) : (
          <div className="py-2 text-[min(9vw,5vh)] leading-none text-white">
            {finished ? (
              <>
                {t.sentGrade.pre} <span className="text-accent">{config.grade}</span> {t.sentGrade.post}
              </>
            ) : (
              t.lastPhase
            )}
          </div>
        )}
      </section>

      <Quickdraws total={config.rounds} clipped={clippedCount(view.phase, config.rounds, view.status)} />

      <footer className="pb-safe grid grid-cols-3 items-center pt-2">
        <div className="flex flex-col items-center">
          <span className="tabular text-[min(20vw,11vh)] leading-none text-rounds">{view.roundsLeft}</span>
          <span className="text-center text-[min(5.5vw,1.25rem)] leading-tight">{t.roundsLeft}</span>
        </div>
        <div className="flex flex-col items-center">
          <button onClick={falling ? undefined : center.action} className="text-accent active:scale-95" aria-label={center.label}>
            {view.status === 'idle' || finished ? (
              <span className="flex h-[112px] w-[112px] items-center justify-center rounded-full bg-accent text-black">
                <span className="flex h-[96px] w-[96px] items-center justify-center rounded-full border-2 border-black">
                  {center.icon}
                </span>
              </span>
            ) : (
              <ProgressRing progress={view.phaseProgress} size={112} stroke={11}>
                {center.icon}
              </ProgressRing>
            )}
          </button>
          <span className="text-2xl text-accent">{center.label}</span>
        </div>
        <div className="flex flex-col items-center">
          <span className="tabular text-[min(20vw,11vh)] leading-none text-cycles">{view.cyclesLeft}</span>
          <span className="text-center text-[min(5.5vw,1.25rem)] leading-tight">{t.cyclesLeft}</span>
        </div>
      </footer>
    </div>
  )
}
