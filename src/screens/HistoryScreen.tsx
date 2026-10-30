import { Check, RotateCcw, Save, Square, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { ClimberAvatar } from '../components/ClimberAvatar'
import { NamePrompt } from '../components/NamePrompt'
import { ScreenHeader } from '../components/ScreenHeader'
import { formatDate, formatTime } from '../domain/format'
import type { HistoryEntry } from '../domain/types'
import { HISTORY_MAX, useStore } from '../storage/store'
import { summary } from './LibraryScreen'

interface Props {
  onBack: () => void
  onRepeat: (e: HistoryEntry) => void
}

export function HistoryScreen({ onBack, onRepeat }: Props) {
  const { history, saveHistoryAsConfig, deleteHistory } = useStore()
  const [saving, setSaving] = useState<HistoryEntry | null>(null)
  const [savedId, setSavedId] = useState<string | null>(null)

  return (
    <div className="rock no-scrollbar h-full overflow-y-auto">
      <ScreenHeader title="Historial" onBack={onBack} />
      <p className="px-4 pt-3 text-lg text-muted">Últimos {HISTORY_MAX} entrenos</p>

      {history.length === 0 && <p className="px-4 py-16 text-center text-2xl text-muted">Aún no hay entrenos</p>}

      <ul className="pb-safe">
        {history.map((h) => (
          <li key={h.id} className="border-b border-line px-4 py-4">
            <div className="flex items-start justify-between gap-3">
              <ClimberAvatar climberId={h.config.climberId} size={44} />
              <div className="min-w-0 flex-1">
                <div className="truncate text-3xl leading-none">
                  {h.config.name} {h.config.grade && <span className="text-white/60">{h.config.grade}</span>}
                </div>
                <div className="mt-1 text-lg leading-none text-muted">
                  {formatDate(h.startedAt)} · {summary(h.config)}
                </div>
              </div>
              <span
                className={`flex shrink-0 items-center gap-1 rounded-md px-2 py-1 text-lg leading-none text-black ${h.completed ? 'bg-work' : 'bg-rest'}`}
              >
                {h.completed ? <Check className="h-4 w-4" strokeWidth={3} /> : <Square className="h-3 w-3 fill-current" />}
                {h.completed ? 'Encadenado' : 'Proyecto'}
              </span>
            </div>

            <div className="mt-3 flex items-center gap-4 text-xl">
              <span className="tabular">
                {formatTime(h.elapsed)} <span className="text-muted">/ {formatTime(h.total)}</span>
              </span>
              <span className="tabular text-rounds">
                Chapas {h.roundsDone}/{h.totalRounds}
              </span>
            </div>

            <div className="mt-3 flex gap-3">
              <button onClick={() => onRepeat(h)} className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-btn py-3 text-xl text-accent active:opacity-70">
                <RotateCcw className="h-5 w-5" />
                Repetir
              </button>
              <button
                onClick={() => setSaving(h)}
                disabled={savedId === h.id}
                className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-btn py-3 text-xl text-work active:opacity-70 disabled:text-muted"
              >
                <Save className="h-5 w-5" />
                {savedId === h.id ? 'Guardado' : 'Guardar'}
              </button>
              <button
                onClick={() => confirm('¿Eliminar este entreno del historial?') && deleteHistory(h.id)}
                aria-label="Eliminar"
                className="flex w-14 items-center justify-center rounded-lg bg-btn text-rest active:opacity-70"
              >
                <Trash2 className="h-5 w-5" />
              </button>
            </div>
          </li>
        ))}
      </ul>

      <NamePrompt
        open={!!saving}
        title="Guardar entreno"
        initial={saving?.config.name}
        onCancel={() => setSaving(null)}
        onConfirm={(name) => {
          if (saving && saveHistoryAsConfig(saving.id, name)) setSavedId(saving.id)
          setSaving(null)
        }}
      />
    </div>
  )
}
