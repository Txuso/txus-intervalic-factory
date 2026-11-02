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
    <div className="pointer-events-none absolute top-[12%] bottom-[6%] left-[4px] w-[18px]" aria-hidden>
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
      {/* Escalador: monigote con los brazos arriba y su cara como cabeza. Estrecho (26 px)
          para que la cuenta atrás pueda ir centrada sin taparlo */}
      <div
        className="absolute left-[-4px] z-10 h-[36px] w-[26px] transition-[bottom] duration-300 ease-linear"
        style={{ bottom: `calc(${p * 100}% - 15px)` }}
      >
        <svg width="26" height="36" viewBox="0 0 26 36" className="absolute inset-0">
          <path
            d="M13 21v8M13 22 2 14 1 5M13 22l11-8 1-9M13 29l-4 4v3M13 29l4 3 1 4"
            stroke="#000"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
        </svg>
        <span className="absolute inset-x-0 top-0 flex justify-center">
          {findClimber(climberId) ? (
            <span className="flex rounded-full ring-2 ring-black">
              <ClimberAvatar climberId={climberId} size={22} />
            </span>
          ) : (
            <span className="text-[20px] leading-none">😣</span>
          )}
        </span>
      </div>
    </div>
  )
}
