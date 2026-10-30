import { Quickdraw } from './Holds'

interface Props {
  total: number
  clipped: number
}

/** Fila de cintas exprés: una por chapa del largo actual, chapadas en amarillo */
export function Quickdraws({ total, clipped }: Props) {
  // Más de 12 cintas: se encogen para caber en una línea
  const size = total > 12 ? Math.max(14, Math.floor(300 / total)) : 28
  return (
    <div className="flex items-end justify-center gap-[3px] px-4 pt-2" aria-label={`${clipped} de ${total} chapas`}>
      {Array.from({ length: total }, (_, i) => (
        <Quickdraw key={i} size={size} color={i < clipped ? 'var(--color-accent)' : '#555'} />
      ))}
    </div>
  )
}
