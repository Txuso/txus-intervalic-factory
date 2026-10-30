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
    <div className="pointer-events-none absolute top-[12%] bottom-[6%] left-[18px] w-[18px]" aria-hidden>
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
      {/* Escalador: monigote con los brazos arriba y su cara (grande) como cabeza */}
      <div
        className="absolute left-[-19px] z-10 h-[54px] w-[56px] transition-[bottom] duration-300 ease-linear"
        style={{ bottom: `calc(${p * 100}% - 22px)` }}
      >
        <svg width="56" height="54" viewBox="0 0 56 54" className="absolute inset-0">
          <path
            d="M28 32v10M28 31 9 19l-1-10M28 31l19-12 1-10M28 42l-7 6v6M28 42l7 5 1 6"
            stroke="#000"
            strokeWidth="2.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
        </svg>
        <span className="absolute inset-x-0 top-0 flex justify-center">
          {findClimber(climberId) ? (
            <span className="flex rounded-full ring-2 ring-black">
              <ClimberAvatar climberId={climberId} size={34} />
            </span>
          ) : (
            <span className="text-[32px] leading-none">😣</span>
          )}
        </span>
      </div>
    </div>
  )
}
