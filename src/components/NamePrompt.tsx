import { useEffect, useRef, useState } from 'react'
import { BottomSheet } from './BottomSheet'

interface Props {
  open: boolean
  title: string
  initial?: string
  onCancel: () => void
  onConfirm: (name: string) => void
}

export function NamePrompt({ open, title, initial = '', onCancel, onConfirm }: Props) {
  const [name, setName] = useState(initial)
  const input = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (open) {
      setName(initial)
      setTimeout(() => input.current?.focus(), 50)
    }
  }, [open, initial])

  const confirm = () => name.trim() && onConfirm(name.trim())

  return (
    <BottomSheet open={open} title={title} onCancel={onCancel} onConfirm={confirm} confirmLabel="Guardar">
      <input
        ref={input}
        value={name}
        onChange={(e) => setName(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && confirm()}
        placeholder="Ej. Suspensiones densidad"
        className="w-full rounded-lg bg-bg px-4 py-3 text-3xl uppercase text-white outline-none placeholder:text-muted/60"
      />
    </BottomSheet>
  )
}
