import { useLayoutEffect, useRef } from 'react'

const ITEM = 48
const VISIBLE = 5

interface Props {
  values: number[]
  value: number
  onChange: (v: number) => void
  format?: (v: number) => string
  label?: string
}

/** Rueda de selección tipo iOS hecha con scroll-snap */
export function WheelPicker({ values, value, onChange, format = String, label }: Props) {
  const ref = useRef<HTMLDivElement>(null)
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined)

  useLayoutEffect(() => {
    const idx = Math.max(0, values.indexOf(value))
    if (ref.current) ref.current.scrollTop = idx * ITEM
    // Solo al montar: después manda el scroll del usuario
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const onScroll = () => {
    clearTimeout(timer.current)
    timer.current = setTimeout(() => {
      const el = ref.current
      if (!el) return
      const idx = Math.min(values.length - 1, Math.max(0, Math.round(el.scrollTop / ITEM)))
      if (values[idx] !== value) onChange(values[idx])
    }, 80)
  }

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-24" style={{ height: ITEM * VISIBLE }}>
        <div
          className="pointer-events-none absolute inset-x-0 rounded-lg bg-btn"
          style={{ top: ITEM * 2, height: ITEM }}
        />
        <div
          ref={ref}
          onScroll={onScroll}
          className="no-scrollbar relative h-full snap-y snap-mandatory overflow-y-auto"
          style={{ paddingTop: ITEM * 2, paddingBottom: ITEM * 2 }}
        >
          {values.map((v) => (
            <div
              key={v}
              className={`tabular flex snap-center items-center justify-center text-4xl ${v === value ? 'text-white' : 'text-muted'}`}
              style={{ height: ITEM }}
            >
              {format(v)}
            </div>
          ))}
        </div>
        <div className="pointer-events-none absolute inset-x-0 top-0 h-20 bg-gradient-to-b from-panel to-transparent" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-panel to-transparent" />
      </div>
      {label && <span className="mt-1 text-lg text-muted">{label}</span>}
    </div>
  )
}
