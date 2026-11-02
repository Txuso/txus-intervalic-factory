import { findClimber } from '../domain/climbers'
import { boltPositions } from '../domain/route'
import { ClimberAvatar } from './ClimberAvatar'

interface Props {
  /** 0..1 */
  progress: number
  /** Series del entreno: una chapa por serie en la vía (entre 3 y 16) */
  bolts: number
  /** Si se cae: posición (0..1) donde queda colgado. Baja de golpe y rebota en la cuerda */
  fallTo?: number
  /** Su cara es la cabeza del muñeco; sin escalador, un emoji esforzándose */
  climberId?: string
}

/** Croquis vertical: un escalador sube por la vía hasta la reunión según el progreso total */
export function RouteProgress({ progress, bolts, climberId, fallTo }: Props) {
  const falling = fallTo !== undefined
  const p = Math.min(1, Math.max(0, falling ? fallTo : progress))
  return (
    <div className="pointer-events-none absolute top-[12%] bottom-[6%] left-[12px] w-[18px]" aria-hidden>
      {/* Reunión */}
      <svg className="absolute -top-[18px] left-0" width="18" height="16" viewBox="0 0 18 16">
        <circle cx="5" cy="4" r="2.4" fill="none" stroke="#000" strokeWidth="1.6" opacity=".55" />
        <circle cx="13" cy="4" r="2.4" fill="none" stroke="#000" strokeWidth="1.6" opacity=".55" />
        <path d="M5 6.4 9 13l4-6.6" fill="none" stroke="#000" strokeWidth="1.6" opacity=".55" />
      </svg>
      {/* Cuerda: hecha hasta el escalador más marcada */}
      <div className="absolute inset-y-0 left-[8px] w-[2px] rounded bg-black/20" />
      <div className="absolute bottom-0 left-[8px] w-[2px] rounded bg-black/60" style={{ height: `${p * 100}%` }} />
      {boltPositions(bolts).map((at, i) => {
        return (
          <span
            key={i}
            className="absolute left-[5px] h-[8px] w-[8px] rounded-full border-2 border-black"
            style={{ bottom: `${at * 100}%`, opacity: at <= p ? 0.75 : 0.3 }}
          />
        )
      })}
      {/* Escalador: monigote con los brazos arriba y su cara (34 px) como cabeza.
          Puede pasar por encima del primer dígito de la cuenta atrás */}
      <div
        className={`absolute left-[-15px] z-10 h-[52px] w-[48px] transition-[bottom] ${
          falling ? 'animate-rope-bounce duration-[450ms] ease-[cubic-bezier(0.55,0,1,0.45)]' : 'duration-300 ease-linear'
        } motion-reduce:transition-none`}
        style={{ bottom: `calc(${p * 100}% - 20px)` }}
      >
        <svg width="48" height="52" viewBox="0 0 48 52" className="absolute inset-0">
          <path
            d="M24 32v10M24 33 7 21 4 9M24 33l17-12 3-12M24 42l-6 5v4M24 42l6 4 1 5"
            stroke="#000"
            strokeWidth="2.6"
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
            <span className="text-[31px] leading-none">😣</span>
          )}
        </span>
      </div>
    </div>
  )
}
