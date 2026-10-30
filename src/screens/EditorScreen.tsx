import { useState } from 'react'
import { BottomSheet } from '../components/BottomSheet'
import { ParamRow } from '../components/ParamRow'
import { WheelPicker } from '../components/WheelPicker'
import { formatTime } from '../domain/format'
import { totalDuration } from '../domain/sequence'
import type { TimerConfig } from '../domain/types'

type TimeKey = 'prepare' | 'work' | 'rest' | 'cycleRest' | 'cooldown'
type CountKey = 'rounds' | 'cycles'
type Field =
  | { key: TimeKey; kind: 'time'; title: string; subtitle: string; color: string; min: number }
  | { key: CountKey; kind: 'count'; title: string; subtitle: string; color: string; min: number }

const SIXTY = Array.from({ length: 60 }, (_, i) => i)
const COUNTS = Array.from({ length: 99 }, (_, i) => i + 1)
const pad = (n: number) => String(n).padStart(2, '0')

function fields(c: TimerConfig): Field[] {
  return [
    { key: 'prepare', kind: 'time', title: 'Prepárate', subtitle: 'Cuenta atrás antes de empezar', color: 'var(--color-prepare)', min: 0 },
    { key: 'work', kind: 'time', title: 'Entrenar', subtitle: 'Hacer ejercicios durante este tiempo', color: 'var(--color-work)', min: 1 },
    { key: 'rest', kind: 'time', title: 'Descansar', subtitle: 'Descansar durante este tiempo', color: 'var(--color-rest)', min: 0 },
    { key: 'rounds', kind: 'count', title: 'Rondas', subtitle: 'Una ronda es ejercicio + descanso', color: 'var(--color-rounds)', min: 1 },
    { key: 'cycles', kind: 'count', title: 'Ciclos', subtitle: `Un ciclo son ${c.rounds} rondas`, color: 'var(--color-cycles)', min: 1 },
    { key: 'cycleRest', kind: 'time', title: 'Descansar entre ciclos', subtitle: 'Intervalo de recuperación', color: 'var(--color-cycles)', min: 0 },
    { key: 'cooldown', kind: 'time', title: 'Enfriamiento', subtitle: 'Vuelta a la calma al terminar', color: 'var(--color-cooldown)', min: 0 },
  ]
}

interface Props {
  initial: TimerConfig
  isNew: boolean
  onCancel: () => void
  onSave: (config: TimerConfig, asNew: boolean) => void
}

export function EditorScreen({ initial, isNew, onCancel, onSave }: Props) {
  const [draft, setDraft] = useState(initial)
  const [editing, setEditing] = useState<Field | null>(null)
  const [temp, setTemp] = useState({ min: 0, sec: 0, count: 1 })
  const [nameError, setNameError] = useState(false)

  const open = (f: Field) => {
    const v = draft[f.key]
    setTemp({ min: Math.floor(v / 60), sec: v % 60, count: v })
    setEditing(f)
  }

  const accept = () => {
    if (!editing) return
    const raw = editing.kind === 'time' ? temp.min * 60 + temp.sec : temp.count
    setDraft((d) => ({ ...d, [editing.key]: Math.max(editing.min, raw) }))
    setEditing(null)
  }

  const save = (asNew: boolean) => {
    const name = draft.name.trim()
    if (!name) {
      setNameError(true)
      return
    }
    onSave({ ...draft, name }, asNew)
  }

  return (
    <div className="flex h-full flex-col bg-bg">
      <header className="pt-safe bg-panel">
        <div className="flex items-center justify-between px-5 py-4 text-2xl">
          <button className="text-muted" onClick={onCancel}>
            Cancelar
          </button>
          <span className="text-3xl">{isNew ? 'Nuevo entreno' : 'Editar'}</span>
          <button className="text-work" onClick={() => save(false)}>
            Guardar
          </button>
        </div>
      </header>

      <div className="no-scrollbar flex-1 overflow-y-auto">
        <label className="block border-b border-line px-4 py-4">
          <span className={`text-lg ${nameError ? 'text-rest' : 'text-muted'}`}>
            {nameError ? 'Ponle un nombre al entreno' : 'Nombre'}
          </span>
          <input
            value={draft.name}
            onChange={(e) => {
              setNameError(false)
              setDraft((d) => ({ ...d, name: e.target.value }))
            }}
            placeholder="Ej. Intervalic intensiu"
            className="block w-full bg-transparent text-4xl uppercase text-white outline-none placeholder:text-muted/50"
          />
        </label>

        {fields(draft).map((f) => (
          <ParamRow
            key={f.key}
            color={f.color}
            title={f.title}
            subtitle={f.subtitle}
            value={f.kind === 'time' ? formatTime(draft[f.key]) : String(draft[f.key])}
            onClick={() => open(f)}
          />
        ))}

        <div className="flex items-center justify-between px-4 py-5">
          <span className="text-2xl text-muted">Duración total</span>
          <span className="tabular text-4xl text-accent">{formatTime(totalDuration(draft))}</span>
        </div>

        {!isNew && (
          <div className="px-4 pb-8">
            <button onClick={() => save(true)} className="w-full rounded-xl bg-btn py-4 text-2xl active:opacity-70">
              Guardar como nuevo
            </button>
          </div>
        )}
      </div>

      <BottomSheet open={!!editing} title={editing?.title ?? ''} onCancel={() => setEditing(null)} onConfirm={accept}>
        {editing?.kind === 'time' && (
          <div className="flex items-center justify-center gap-2">
            <WheelPicker values={SIXTY} value={temp.min} onChange={(min) => setTemp((t) => ({ ...t, min }))} format={pad} label="Min" />
            <span className="-mt-7 text-4xl">:</span>
            <WheelPicker values={SIXTY} value={temp.sec} onChange={(sec) => setTemp((t) => ({ ...t, sec }))} format={pad} label="Seg" />
          </div>
        )}
        {editing?.kind === 'count' && (
          <div className="flex justify-center">
            <WheelPicker values={COUNTS} value={temp.count} onChange={(count) => setTemp((t) => ({ ...t, count }))} />
          </div>
        )}
      </BottomSheet>
    </div>
  )
}
