import { findClimber, ME_ID } from '../domain/climbers'
import { useMyPhoto } from '../domain/myPhoto'
import { useT } from '../i18n'

interface Props {
  climberId?: string
  size: number
  ring?: boolean
}

/** Foto redonda del escalador, o sus iniciales si falta la foto. Nada si no hay escalador. */
export function ClimberAvatar({ climberId, size, ring }: Props) {
  const t = useT()
  // Suscripción a la foto propia: al cambiarla se repintan todos los avatares de "Yo"
  useMyPhoto()
  const found = findClimber(climberId)
  if (!found) return null
  const c = found.id === ME_ID ? { ...found, name: t.me, initials: t.me.toUpperCase() } : found
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
