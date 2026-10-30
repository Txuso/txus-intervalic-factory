import { findClimber } from '../domain/climbers'
import { ClimberAvatar } from './ClimberAvatar'

interface Props {
  /** 0..1 */
  progress: number
  /** Número de chapas que se dibujan en la vía */
  bolts: number
  /** Su cara es la cabeza del muñeco; sin escalador, un emoji esforzándose */
  climberId?: string
}

/** Croquis vertical: un escalador sube por la vía hasta la reunión según el progreso total */
export function RouteProgress({ progress, bolts, climberId }: Props) {
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
      {/* Escalador: monigote con los brazos arriba y su cara como cabeza */}
      <div
        className="absolute left-[-8px] h-[42px] w-[34px] transition-[bottom] duration-300 ease-linear"
        style={{ bottom: `calc(${p * 100}% - 21px)` }}
      >
        <svg width="34" height="42" viewBox="0 0 34 42" className="absolute inset-0">
          <path
            d="M17 22v10M17 24 6 13l-3-7M17 24l11-10 3-7M17 32l-5 5v4M17 32l5 4 1 5"
            stroke="#000"
            strokeWidth="2.4"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
        </svg>
        <span className="absolute top-0 left-1/2 flex -translate-x-1/2 items-center justify-center">
          {findClimber(climberId) ? (
            <span className="rounded-full ring-2 ring-black">
              <ClimberAvatar climberId={climberId} size={22} />
            </span>
          ) : (
            <span className="text-[21px] leading-none">😣</span>
          )}
        </span>
      </div>
    </div>
  )
}
