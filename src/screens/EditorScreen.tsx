import { Camera, Dices, UserRound } from 'lucide-react'
import { useRef, useState, type ReactNode } from 'react'
import { BottomSheet } from '../components/BottomSheet'
import { ClimberAvatar } from '../components/ClimberAvatar'
import { ChalkBag, Crimp, Jug, Pinch, Pocket, Quickdraw, Sloper } from '../components/Holds'
import { ParamRow } from '../components/ParamRow'
import { WheelPicker } from '../components/WheelPicker'
import { CLIMBERS, findClimber, ME_ID } from '../domain/climbers'
import { formatTime } from '../domain/format'
import { randomGrade } from '../domain/grades'
import { fileToAvatar, setMyPhoto, useMyPhoto } from '../domain/myPhoto'
import { totalDuration } from '../domain/sequence'
import type { TimerConfig } from '../domain/types'
import { useT } from '../i18n'
import type { Dict } from '../i18n/types'

type TimeKey = 'prepare' | 'work' | 'rest' | 'cycleRest' | 'cooldown'
type CountKey = 'rounds' | 'cycles'
type Field =
  | { key: TimeKey; kind: 'time'; title: string; subtitle: string; icon: ReactNode; min: number }
  | { key: CountKey; kind: 'count'; title: string; subtitle: string; icon: ReactNode; min: number }

const SIXTY = Array.from({ length: 60 }, (_, i) => i)
const COUNTS = Array.from({ length: 99 }, (_, i) => i + 1)
const pad = (n: number) => String(n).padStart(2, '0')

function fields(c: TimerConfig, t: Dict): Field[] {
  const f = t.fields
  return [
    { key: 'prepare', kind: 'time', title: f.prepare.title, subtitle: f.prepare.sub, icon: <ChalkBag color="var(--color-prepare)" />, min: 0 },
    { key: 'work', kind: 'time', title: f.work.title, subtitle: f.work.sub, icon: <Jug color="var(--color-work)" />, min: 1 },
    { key: 'rest', kind: 'time', title: f.rest.title, subtitle: f.rest.sub, icon: <Sloper color="var(--color-rest)" />, min: 0 },
    { key: 'rounds', kind: 'count', title: f.rounds.title, subtitle: f.rounds.sub, icon: <span className="flex w-[30px] justify-center"><Quickdraw color="var(--color-rounds)" size={30} /></span>, min: 1 },
    { key: 'cycles', kind: 'count', title: f.cycles.title, subtitle: f.cycles.sub(c.rounds), icon: <Pinch color="var(--color-cycles)" />, min: 1 },
    { key: 'cycleRest', kind: 'time', title: f.cycleRest.title, subtitle: f.cycleRest.sub, icon: <Crimp color="var(--color-cycles)" />, min: 0 },
    { key: 'cooldown', kind: 'time', title: f.cooldown.title, subtitle: f.cooldown.sub, icon: <Pocket color="var(--color-cooldown)" />, min: 0 },
  ]
}

interface Props {
  initial: TimerConfig
  isNew: boolean
  onCancel: () => void
  onSave: (config: TimerConfig, asNew: boolean) => void
}

export function EditorScreen({ initial, isNew, onCancel, onSave }: Props) {
  const t = useT()
  const [draft, setDraft] = useState(initial)
  const [editing, setEditing] = useState<Field | null>(null)
  const [temp, setTemp] = useState({ min: 0, sec: 0, count: 1 })
  const [nameError, setNameError] = useState(false)
  const [pickingClimber, setPickingClimber] = useState(false)
  const climber = findClimber(draft.climberId)
  const myPhoto = useMyPhoto()
  const photoInput = useRef<HTMLInputElement>(null)

  const pickClimber = (id: string | undefined) => {
    setDraft((d) => ({ ...d, climberId: id }))
    setPickingClimber(false)
  }

  // Foto propia: se recorta en cuadrado y se guarda solo en este móvil
  const onPhoto = async (file: File | undefined) => {
    if (!file) return
    try {
      setMyPhoto(await fileToAvatar(file))
      pickClimber(ME_ID)
    } catch {
      // Formato que el navegador no sabe leer: se ignora
    }
  }

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
            {t.cancel}
          </button>
          <span className="text-3xl">{isNew ? t.newTitle : t.editTitle}</span>
          <button className="text-work" onClick={() => save(false)}>
            {t.save}
          </button>
        </div>
      </header>

      <div className="no-scrollbar flex-1 overflow-y-auto">
        <label className="block border-b border-line px-4 py-4">
          <span className={`text-lg ${nameError ? 'text-rest' : 'text-muted'}`}>
            {nameError ? t.nameRequired : t.name}
          </span>
          <input
            value={draft.name}
            onChange={(e) => {
              setNameError(false)
              setDraft((d) => ({ ...d, name: e.target.value }))
            }}
            placeholder={t.namePlaceholder}
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
          title={t.climber}
          subtitle={climber ? (climber.id === ME_ID ? t.me : climber.name) : t.climberPick}
          value={climber ? '' : <span className="text-3xl text-muted">{t.climberNone}</span>}
          onClick={() => setPickingClimber(true)}
        />
        <ParamRow
          icon={<Dices className="h-[30px] w-[30px] shrink-0 text-accent" />}
          title={t.grade}
          subtitle={t.gradeSub}
          value={<span className="text-accent">{draft.grade}</span>}
          onClick={() => setDraft((d) => ({ ...d, grade: randomGrade() }))}
        />

        {fields(draft, t).map((f) => (
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
          <span className="text-2xl text-muted">{t.total}</span>
          <span className="tabular text-4xl text-accent">{formatTime(totalDuration(draft))}</span>
        </div>

        {!isNew && (
          <div className="px-4 pb-8">
            <button onClick={() => save(true)} className="w-full rounded-xl bg-btn py-4 text-2xl active:opacity-70">
              {t.saveAsNew}
            </button>
          </div>
        )}
      </div>

      <BottomSheet open={pickingClimber} title={t.climber} confirmLabel={t.done} onCancel={() => setPickingClimber(false)} onConfirm={() => setPickingClimber(false)}>
        <div className="no-scrollbar max-h-[62vh] overflow-y-auto">
          <div className="grid grid-cols-4 gap-x-2 gap-y-4 pb-2">
            <button
              onClick={() => (myPhoto ? pickClimber(ME_ID) : photoInput.current?.click())}
              className="flex flex-col items-center gap-1 active:opacity-70"
            >
              {myPhoto ? (
                <ClimberAvatar climberId={ME_ID} size={64} ring={draft.climberId === ME_ID} />
              ) : (
                <span className="flex h-[64px] w-[64px] items-center justify-center rounded-full border-2 border-dashed border-accent text-accent">
                  <Camera className="h-7 w-7" />
                </span>
              )}
              <span className={`text-center text-lg leading-tight ${draft.climberId === ME_ID ? 'text-accent' : ''}`}>
                {myPhoto ? t.me : t.addPhoto}
              </span>
            </button>
            {[...CLIMBERS, undefined].map((c) => {
              const selected = draft.climberId === c?.id
              return (
                <button key={c?.id ?? 'none'} onClick={() => pickClimber(c?.id)} className="flex flex-col items-center gap-1 active:opacity-70">
                  {c ? (
                    <ClimberAvatar climberId={c.id} size={64} ring={selected} />
                  ) : (
                    <span
                      className={`flex h-[64px] w-[64px] items-center justify-center rounded-full bg-btn text-2xl text-muted ${selected ? 'ring-2 ring-accent' : ''}`}
                    >
                      —
                    </span>
                  )}
                  <span className={`text-center text-lg leading-tight ${selected ? 'text-accent' : ''}`}>{c?.name ?? t.climberNone}</span>
                </button>
              )
            })}
          </div>
          {myPhoto && (
            <div className="mt-3 grid grid-cols-2 gap-3">
              <button onClick={() => photoInput.current?.click()} className="rounded-lg bg-btn py-3 text-xl text-accent active:opacity-70">
                {t.changePhoto}
              </button>
              <button
                onClick={() => {
                  setMyPhoto(null)
                  if (draft.climberId === ME_ID) setDraft((d) => ({ ...d, climberId: undefined }))
                }}
                className="rounded-lg bg-btn py-3 text-xl text-rest active:opacity-70"
              >
                {t.removePhoto}
              </button>
            </div>
          )}
        </div>
        <input
          ref={photoInput}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            void onPhoto(e.target.files?.[0])
            e.target.value = ''
          }}
        />
      </BottomSheet>

      <BottomSheet open={!!editing} title={editing?.title ?? ''} onCancel={() => setEditing(null)} onConfirm={accept}>
        {editing?.kind === 'time' && (
          <div className="flex items-center justify-center gap-2">
            <WheelPicker values={SIXTY} value={temp.min} onChange={(min) => setTemp((prev) => ({ ...prev, min }))} format={pad} label={t.min} />
            <span className="-mt-7 text-4xl">:</span>
            <WheelPicker values={SIXTY} value={temp.sec} onChange={(sec) => setTemp((prev) => ({ ...prev, sec }))} format={pad} label={t.sec} />
          </div>
        )}
        {editing?.kind === 'count' && (
          <div className="flex justify-center">
            <WheelPicker values={COUNTS} value={temp.count} onChange={(count) => setTemp((prev) => ({ ...prev, count }))} />
          </div>
        )}
      </BottomSheet>
    </div>
  )
}
