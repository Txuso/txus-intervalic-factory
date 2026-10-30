import { findClimber } from '../domain/climbers'

interface Props {
  climberId?: string
  size: number
  ring?: boolean
}

/** Foto redonda del escalador, o sus iniciales si falta la foto. Nada si no hay escalador. */
export function ClimberAvatar({ climberId, size, ring }: Props) {
  const c = findClimber(climberId)
  if (!c) return null
  const border = ring ? 'ring-2 ring-accent' : ''
  return c.photo ? (
    <img
      src={c.photo}
      alt={c.name}
      width={size}
      height={size}
      draggable={false}
      className={`shrink-0 rounded-full object-cover ${border}`}
      style={{ width: size, height: size }}
    />
  ) : (
    <span
      className={`flex shrink-0 items-center justify-center rounded-full text-black ${border}`}
      style={{ width: size, height: size, background: c.color, fontSize: size * 0.42 }}
    >
      {c.initials}
    </span>
  )
}
