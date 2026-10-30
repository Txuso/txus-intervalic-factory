// Iconos de presas y material de escalada (SVG 24×24, color por props)

interface Props {
  color: string
  size?: number
}

const BOLT = '#1a1a1a'

function Svg({ size = 30, children }: { size?: number; children: React.ReactNode }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className="shrink-0" aria-hidden>
      {children}
    </svg>
  )
}

/** Bolsa de magnesio */
export function ChalkBag({ color, size }: Props) {
  return (
    <Svg size={size}>
      <path d="M5 8h14l-1.2 12a2 2 0 0 1-2 1.8H8.2a2 2 0 0 1-2-1.8z" fill={color} />
      <path d="M4 5.5h16" stroke={color} strokeWidth="2.2" strokeLinecap="round" />
      <path d="M7 12c2 1.4 8 1.4 10 0" stroke={BOLT} strokeWidth="1.3" fill="none" opacity=".5" />
    </Svg>
  )
}

/** Cazo (jug) */
export function Jug({ color, size }: Props) {
  return (
    <Svg size={size}>
      <path d="M2.5 15c0-5.8 4.3-10 9.5-10s9.5 4.2 9.5 10c0 2-1.2 3.3-3.2 3.3h-1.6c0-3-2-5.3-4.7-5.3s-4.7 2.3-4.7 5.3H5.7c-2 0-3.2-1.3-3.2-3.3z" fill={color} />
      <circle cx="12" cy="9" r="1.5" fill={BOLT} />
    </Svg>
  )
}

/** Romo (sloper) */
export function Sloper({ color, size }: Props) {
  return (
    <Svg size={size}>
      <path d="M1.5 18.5C2.6 10.8 6.8 6 12 6s9.4 4.8 10.5 12.5z" fill={color} />
      <circle cx="12" cy="12.5" r="1.5" fill={BOLT} />
    </Svg>
  )
}

/** Regleta (crimp) */
export function Crimp({ color, size }: Props) {
  return (
    <Svg size={size}>
      <path d="M2 9.5h20v3.3a2.7 2.7 0 0 1-2.7 2.7H4.7A2.7 2.7 0 0 1 2 12.8z" fill={color} />
      <circle cx="12" cy="12.3" r="1.3" fill={BOLT} />
    </Svg>
  )
}

/** Pinza (pinch) */
export function Pinch({ color, size }: Props) {
  return (
    <Svg size={size}>
      <path d="M12 2c3.8 0 5.5 4.3 5.5 10S15.8 22 12 22s-5.5-4.3-5.5-10S8.2 2 12 2z" fill={color} />
      <circle cx="12" cy="12" r="1.5" fill={BOLT} />
    </Svg>
  )
}

/** Bidedo (pocket) */
export function Pocket({ color, size }: Props) {
  return (
    <Svg size={size}>
      <path d="M12 3c5.2 0 9 3.8 9 9s-3.8 9-9 9-9-3.8-9-9 3.8-9 9-9z" fill={color} />
      <ellipse cx="9.3" cy="12" rx="1.7" ry="2.6" fill={BOLT} />
      <ellipse cx="14.7" cy="12" rx="1.7" ry="2.6" fill={BOLT} />
    </Svg>
  )
}

/** Cinta exprés: mosquetón arriba, cinta y mosquetón abajo */
export function Quickdraw({ color, size }: Props) {
  return (
    <svg width={size ? size / 2 : 15} height={size ?? 30} viewBox="0 0 12 24" className="shrink-0" aria-hidden>
      <rect x="2" y="0.8" width="8" height="6.4" rx="3" fill="none" stroke={color} strokeWidth="1.6" />
      <rect x="4" y="7.5" width="4" height="9" rx="1" fill={color} />
      <rect x="2" y="16.8" width="8" height="6.4" rx="3" fill="none" stroke={color} strokeWidth="1.6" />
    </svg>
  )
}
