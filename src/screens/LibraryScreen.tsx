import { Copy, Pencil, Timer, Trash2 } from 'lucide-react'
import { Brand } from '../components/Brand'
import { ClimberAvatar } from '../components/ClimberAvatar'
import { useConfirm } from '../components/ConfirmDialog'
import { ScreenHeader } from '../components/ScreenHeader'
import { formatTime } from '../domain/format'
import { totalDuration } from '../domain/sequence'
import type { TimerConfig } from '../domain/types'
import { useT } from '../i18n'
import type { Dict } from '../i18n/types'
import { useStore } from '../storage/store'

interface Props {
  onBack: () => void
  onSelect: (c: TimerConfig) => void
  onEdit: (c: TimerConfig) => void
  onDuplicate: (c: TimerConfig) => void
  onNew: () => void
}

export function summary(c: TimerConfig, t: Dict) {
  const cycles = c.cycles > 1 ? ` · ${t.cyclesSummary(c.cycles)}` : ''
  return `${c.rounds}× ${formatTime(c.work)} / ${formatTime(c.rest)}${cycles}`
}

export function LibraryScreen({ onBack, onSelect, onEdit, onDuplicate, onNew }: Props) {
  const { configs, current, deleteConfig } = useStore()
  const t = useT()
  const confirm = useConfirm()

  const remove = async (c: TimerConfig) => {
    if (await confirm({ title: t.deleteTitle(c.name), message: t.deleteMessage, confirmLabel: t.delete, danger: true })) deleteConfig(c.id)
  }

  return (
    <div className="rock no-scrollbar h-full overflow-y-auto">
      <ScreenHeader title={t.myWorkouts} onBack={onBack} />
      <Brand size={110} />

      <ul>
        {configs.map((c) => (
          <li key={c.id} className="flex items-center border-b border-line">
            <button onClick={() => onSelect(c)} className="flex min-w-0 flex-1 items-center gap-3 px-4 py-4 text-left active:bg-white/5">
              {c.climberId ? (
                <ClimberAvatar climberId={c.climberId} size={44} ring={c.id === current.id} />
              ) : (
                <span className="flex w-[44px] shrink-0 justify-center">
                  <span
                    className="h-4 w-4 rounded-full"
                    style={{ background: c.id === current.id ? 'var(--color-accent)' : 'var(--color-btn)' }}
                  />
                </span>
              )}
              <span className="min-w-0 flex-1">
                <span className="block truncate text-[1.7rem] leading-none">
                  {c.name} <span className="text-white/60">{c.grade}</span>
                </span>
                <span className="mt-1 block text-base leading-none text-muted">
                  {summary(c, t)} · <span className="text-accent">{formatTime(totalDuration(c))}</span>
                </span>
              </span>
            </button>
            <div className="flex pr-1 text-muted">
              <button className="p-2 active:text-white" onClick={() => onEdit(c)} aria-label={t.aria.edit}>
                <Pencil className="h-5 w-5" />
              </button>
              <button className="p-2 active:text-white" onClick={() => onDuplicate(c)} aria-label={t.aria.duplicate}>
                <Copy className="h-5 w-5" />
              </button>
              <button className="p-2 active:text-rest" onClick={() => remove(c)} aria-label={t.delete}>
                <Trash2 className="h-5 w-5" />
              </button>
            </div>
          </li>
        ))}
      </ul>

      <div className="pb-safe px-4 pt-5">
        <button onClick={onNew} className="flex w-full items-center justify-center gap-3 rounded-xl bg-btn py-5 text-2xl active:opacity-70">
          <Timer className="h-7 w-7" />
          {t.addNew}
        </button>
      </div>
    </div>
  )
}
