interface Props {
  /** 0..1 */
  progress: number
  /** Número de chapas que se dibujan en la vía */
  bolts: number
}

/** Croquis vertical: un escalador sube por la vía hasta la reunión según el progreso total */
export function RouteProgress({ progress, bolts }: Props) {
  const n = Math.min(Math.max(bolts, 3), 16)
  const p = Math.min(1, Math.max(0, progress))
  return (
    <div className="pointer-events-none absolute top-[12%] bottom-[6%] left-[6px] w-[18px]" aria-hidden>
      {/* Reunión */}
      <svg className="absolute -top-[18px] left-0" width="18" height="16" viewBox="0 0 18 16">
        <circle cx="5" cy="4" r="2.4" fill="none" stroke="#000" strokeWidth="1.6" opacity=".55" />
        <circle cx="13" cy="4" r="2.4" fill="none" stroke="#000" strokeWidth="1.6" opacity=".55" />
        <path d="M5 6.4 9 13l4-6.6" fill="none" stroke="#000" strokeWidth="1.6" opacity=".55" />
      </svg>
      {/* Cuerda: hecha hasta el escalador más marcada */}
      <div className="absolute inset-y-0 left-[8px] w-[2px] rounded bg-black/20" />
      <div className="absolute bottom-0 left-[8px] w-[2px] rounded bg-black/60" style={{ height: `${p * 100}%` }} />
      {Array.from({ length: n }, (_, i) => {
        const at = (i + 1) / (n + 1)
        return (
          <span
            key={i}
            className="absolute left-[5px] h-[8px] w-[8px] rounded-full border-2 border-black"
            style={{ bottom: `${at * 100}%`, opacity: at <= p ? 0.75 : 0.3 }}
          />
        )
      })}
      {/* Escalador */}
      <svg
        className="absolute left-[-3px] transition-[bottom] duration-300 ease-linear"
        style={{ bottom: `calc(${p * 100}% - 12px)` }}
        width="24"
        height="24"
        viewBox="0 0 24 24"
      >
        <circle cx="12" cy="4" r="2.6" fill="#000" />
        <path d="M12 7v7M12 9l-4-4M12 9l4-3M12 14l-4 4v3M12 14l4 3 1 3" stroke="#000" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      </svg>
    </div>
  )
}
