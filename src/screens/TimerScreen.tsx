import { History, LayoutGrid, Pause, Pencil, Play, RotateCcw, Settings } from 'lucide-react'
import { ProgressRing } from '../components/ProgressRing'
import { formatTime } from '../domain/format'
import { PHASE_COLOR, PHASE_LABEL } from '../domain/sequence'
import type { TimerConfig } from '../domain/types'
import type { TimerView } from '../hooks/useTimerEngine'

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

const iconBtn = 'flex h-11 w-11 items-center justify-center text-accent active:opacity-60'

export function TimerScreen(p: Props) {
  const { view, config } = p
  const finished = view.status === 'finished'
  const active = view.status === 'running' || view.status === 'paused'
  const panelColor = finished ? 'var(--color-accent)' : view.phase ? PHASE_COLOR[view.phase.type] : 'var(--color-btn)'

  const title = finished ? '¡Terminado!' : view.phase ? PHASE_LABEL[view.phase.type] : ''

  const center = {
    idle: { icon: <Play className="h-12 w-12 translate-x-0.5 fill-current" />, label: 'Empezar', action: p.onStart },
    running: { icon: <Pause className="h-12 w-12 fill-current" />, label: 'Pausa', action: p.onPause },
    paused: { icon: <Play className="h-12 w-12 translate-x-0.5 fill-current" />, label: 'Reanudar', action: p.onResume },
    finished: { icon: <RotateCcw className="h-12 w-12" strokeWidth={2.5} />, label: 'Otra vez', action: p.onStart },
  }[view.status]

  const reset = () => {
    if (active && !confirm('¿Terminar el entreno? Se guardará en el historial como parado.')) return
    p.onReset()
  }

  return (
    <div className="flex h-full flex-col bg-bg">
      <header className="pt-safe">
        <div className="flex items-center px-2 py-1">
          <div className="flex w-24">
            <button className={iconBtn} onClick={p.onOpenLibrary} aria-label="Mis entrenos">
              <LayoutGrid className="h-6 w-6" />
            </button>
            <button className={iconBtn} onClick={p.onOpenHistory} aria-label="Historial">
              <History className="h-6 w-6" />
            </button>
          </div>
          <div className="min-w-0 flex-1 text-center text-accent">
            <div className="truncate text-2xl leading-tight">{config.name}</div>
            <div className="tabular text-4xl leading-none">{formatTime(finished ? view.elapsed : view.totalLeft)}</div>
          </div>
          <div className="flex w-24 justify-end">
            <button className={iconBtn} onClick={p.onEdit} aria-label="Editar">
              <Pencil className="h-6 w-6" />
            </button>
            <button className={iconBtn} onClick={p.onOpenSettings} aria-label="Ajustes">
              <Settings className="h-6 w-6" />
            </button>
          </div>
        </div>
      </header>

      <section
        className="relative mt-2 flex flex-1 flex-col items-center justify-center text-black transition-colors duration-300"
        style={{ background: panelColor }}
      >
        {(active || finished) && (
          <button
            onClick={reset}
            aria-label="Reiniciar"
            className="absolute -top-5 right-4 flex h-12 w-12 items-center justify-center rounded-full border-2 border-bg bg-[#2a2a2a] text-accent active:opacity-70"
          >
            <RotateCcw className="h-6 w-6" />
          </button>
        )}
        <div className="whitespace-nowrap leading-none" style={{ fontSize: `min(24vw, 11vh, ${88 / (title.length * 0.42)}vw)` }}>
          {title}
        </div>
        <div className="tabular text-[min(50vw,28vh)] leading-[0.9]">
          {formatTime(finished ? view.elapsed : view.phaseLeft)}
        </div>
      </section>

      <section
        className="flex flex-col items-center py-2 text-black transition-colors duration-300"
        style={{ background: view.next ? PHASE_COLOR[view.next.type] : 'var(--color-btn)' }}
      >
        {view.next ? (
          <>
            <div className="text-[min(9vw,5vh)] leading-none">{PHASE_LABEL[view.next.type]}:</div>
            <div className="tabular text-[min(16vw,9vh)] leading-none">{formatTime(view.next.duration)}</div>
          </>
        ) : (
          <div className="py-2 text-[min(9vw,5vh)] leading-none text-white">{finished ? 'Buen trabajo' : 'Última fase'}</div>
        )}
      </section>

      <footer className="pb-safe grid grid-cols-3 items-center pt-4">
        <div className="flex flex-col items-center">
          <span className="tabular text-[min(20vw,11vh)] leading-none text-rounds">{view.roundsLeft}</span>
          <span className="text-center text-[min(5.5vw,1.25rem)] leading-tight">Rondas restantes</span>
        </div>
        <div className="flex flex-col items-center">
          <button onClick={center.action} className="text-accent active:scale-95" aria-label={center.label}>
            <ProgressRing progress={view.phaseProgress} size={110} stroke={11}>
              {center.icon}
            </ProgressRing>
          </button>
          <span className="text-xl text-accent">{center.label}</span>
        </div>
        <div className="flex flex-col items-center">
          <span className="tabular text-[min(20vw,11vh)] leading-none text-cycles">{view.cyclesLeft}</span>
          <span className="text-center text-[min(5.5vw,1.25rem)] leading-tight">Ciclos restantes</span>
        </div>
      </footer>
    </div>
  )
}
