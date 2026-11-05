import { useRef, useState, type ReactNode } from 'react'
import { useT } from '../i18n'

interface Props {
  open: boolean
  title: string
  onCancel: () => void
  onConfirm: () => void
  confirmLabel?: string
  children: ReactNode
}

export function BottomSheet(props: Props) {
  const t = useT()
  // Al cerrarse sigue montada hasta que acaba la animación de salida
  const [shown, setShown] = useState(props.open)
  if (props.open && !shown) setShown(true)
  // Mientras sale pinta lo último que mostró abierta: quien la usa suele vaciar su contenido al cerrarla
  const last = useRef(props)
  if (props.open) last.current = props
  if (!shown) return null

  const closing = !props.open
  const { title, onCancel, onConfirm, confirmLabel, children } = closing ? last.current : props
  return (
    <div
      className={`fixed inset-0 z-40 flex flex-col justify-end bg-black/60 ${closing ? 'animate-fade-out pointer-events-none' : 'animate-fade-in'}`}
      onClick={onCancel}
      onAnimationEnd={(e) => closing && e.target === e.currentTarget && setShown(false)}
    >
      <div className={`${closing ? 'animate-sheet-out' : 'animate-sheet'} rounded-t-2xl bg-panel pb-safe`} onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between border-b border-line px-5 py-4 text-xl">
          <button className="text-muted" onClick={onCancel}>
            {t.cancel}
          </button>
          <span className="text-2xl">{title}</span>
          <button className="text-work" onClick={onConfirm}>
            {confirmLabel ?? t.accept}
          </button>
        </div>
        <div className="px-5 py-4">{children}</div>
      </div>
    </div>
  )
}
