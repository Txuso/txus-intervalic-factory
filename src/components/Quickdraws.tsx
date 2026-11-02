import { useEffect, useRef, useState } from 'react'
import { Quickdraw } from './Holds'

interface Props {
  total: number
  clipped: number
}

/** Fila de cintas exprés: una por chapa del largo actual, chapadas en amarillo */
export function Quickdraws({ total, clipped }: Props) {
  // La cinta recién chapada hace la animación de "clip"
  const prev = useRef(clipped)
  const [popped, setPopped] = useState<number | null>(null)
  useEffect(() => {
    const grew = clipped > prev.current
    prev.current = clipped
    if (!grew) return
    setPopped(clipped - 1)
    const id = setTimeout(() => setPopped(null), 600)
    return () => clearTimeout(id)
  }, [clipped])

  // Más de 12 cintas: se encogen para caber en una línea
  const size = total > 12 ? Math.max(14, Math.floor(300 / total)) : 28
  return (
    <div className="flex items-end justify-center gap-[3px] px-4 pt-2" aria-label={`${clipped}/${total}`}>
      {Array.from({ length: total }, (_, i) => (
        <span key={i} className={`flex origin-top ${i === popped ? 'animate-clip' : ''}`}>
          <Quickdraw size={size} color={i < clipped ? 'var(--color-accent)' : '#555'} />
        </span>
      ))}
    </div>
  )
}
