import { Dices, UserRound } from 'lucide-react'
import { useState, type ReactNode } from 'react'
import { BottomSheet } from '../components/BottomSheet'
import { ClimberAvatar } from '../components/ClimberAvatar'
import { ChalkBag, Crimp, Jug, Pinch, Pocket, Quickdraw, Sloper } from '../components/Holds'
import { ParamRow } from '../components/ParamRow'
import { WheelPicker } from '../components/WheelPicker'
import { CLIMBERS, findClimber } from '../domain/climbers'
import { formatTime } from '../domain/format'
import { randomGrade } from '../domain/grades'
import { totalDuration } from '../domain/sequence'
import type { TimerConfig } from '../domain/types'

type TimeKey = 'prepare' | 'work' | 'rest' | 'cycleRest' | 'cooldown'
type CountKey = 'rounds' | 'cycles'
type Field =
  | { key: TimeKey; kind: 'time'; title: string; subtitle: string; icon: ReactNode; min: number }
  | { key: CountKey; kind: 'count'; title: string; subtitle: string; icon: ReactNode; min: number }

const SIXTY = Array.from({ length: 60 }, (_, i) => i)
const COUNTS = Array.from({ length: 99 }, (_, i) => i + 1)
const pad = (n: number) => String(n).padStart(2, '0')

function fields(c: TimerConfig): Field[] {
  return [
    { key: 'prepare', kind: 'time', title: 'Magnesio', subtitle: 'Cuenta atrás antes de empezar', icon: <ChalkBag color="var(--color-prepare)" />, min: 0 },
    { key: 'work', kind: 'time', title: 'Apreta', subtitle: 'Tiempo de esfuerzo de cada chapa', icon: <Jug color="var(--color-work)" />, min: 1 },
    { key: 'rest', kind: 'time', title: 'Reposa', subtitle: 'Descanso entre chapas', icon: <Sloper color="var(--color-rest)" />, min: 0 },
    { key: 'rounds', kind: 'count', title: 'Chapas', subtitle: 'Una chapa es apretar + reposar', icon: <span className="flex w-[30px] justify-center"><Quickdraw color="var(--color-rounds)" size={30} /></span>, min: 1 },
    { key: 'cycles', kind: 'count', title: 'Largos', subtitle: `Un largo son ${c.rounds} chapas`, icon: <Pinch color="var(--color-cycles)" />, min: 1 },
    { key: 'cycleRest', kind: 'time', title: 'Reunión', subtitle: 'Descanso entre largos', icon: <Crimp color="var(--color-cycles)" />, min: 0 },
    { key: 'cooldown', kind: 'time', title: 'Rapel', subtitle: 'Vuelta a la calma al terminar', icon: <Pocket color="var(--color-cooldown)" />, min: 0 },
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
  const [pickingClimber, setPickingClimber] = useState(false)
  const climber = findClimber(draft.climberId)

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
    <div className="rock flex h-full flex-col">
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

        <ParamRow
          icon={
            climber ? (
              <ClimberAvatar climberId={climber.id} size={30} />
            ) : (
              <UserRound className="h-[30px] w-[30px] shrink-0 rounded-full bg-btn p-1 text-muted" />
            )
          }
          title="Escalador"
          subtitle={climber ? climber.name : 'Elige una foto para este entreno'}
          value={climber ? '' : <span className="text-3xl text-muted">Ninguno</span>}
          onClick={() => setPickingClimber(true)}
        />
        <ParamRow
          icon={<Dices className="h-[30px] w-[30px] shrink-0 text-accent" />}
          title="Grado"
          subtitle="Al azar · toca para volver a tirar"
          value={<span className="text-accent">{draft.grade}</span>}
          onClick={() => setDraft((d) => ({ ...d, grade: randomGrade() }))}
        />

        {fields(draft).map((f) => (
          <ParamRow
            key={f.key}
            icon={f.icon}
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

      <BottomSheet open={pickingClimber} title="Escalador" confirmLabel="Listo" onCancel={() => setPickingClimber(false)} onConfirm={() => setPickingClimber(false)}>
        <div className="grid grid-cols-3 gap-4 pb-2">
          {[...CLIMBERS, undefined].map((c) => {
            const selected = draft.climberId === c?.id
            return (
              <button
                key={c?.id ?? 'none'}
                onClick={() => {
                  setDraft((d) => ({ ...d, climberId: c?.id }))
                  setPickingClimber(false)
                }}
                className="flex flex-col items-center gap-1 active:opacity-70"
              >
                {c ? (
                  <ClimberAvatar climberId={c.id} size={76} ring={selected} />
                ) : (
                  <span className={`flex h-[76px] w-[76px] items-center justify-center rounded-full bg-btn text-2xl text-muted ${selected ? 'ring-2 ring-accent' : ''}`}>—</span>
                )}
                <span className={`text-center text-lg leading-tight ${selected ? 'text-accent' : ''}`}>{c?.name ?? 'Ninguno'}</span>
              </button>
            )
          })}
        </div>
      </BottomSheet>

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
