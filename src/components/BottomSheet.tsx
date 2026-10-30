import type { ReactNode } from 'react'

interface Props {
  open: boolean
  title: string
  onCancel: () => void
  onConfirm: () => void
  confirmLabel?: string
  children: ReactNode
}

export function BottomSheet({ open, title, onCancel, onConfirm, confirmLabel = 'Aceptar', children }: Props) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-40 flex flex-col justify-end bg-black/60" onClick={onCancel}>
      <div className="animate-sheet rounded-t-2xl bg-panel pb-safe" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between border-b border-line px-5 py-4 text-xl">
          <button className="text-muted" onClick={onCancel}>
            Cancelar
          </button>
          <span className="text-2xl">{title}</span>
          <button className="text-work" onClick={onConfirm}>
            {confirmLabel}
          </button>
        </div>
        <div className="px-5 py-4">{children}</div>
      </div>
    </div>
  )
}
