import { useEffect, useRef } from 'react'

const DURATION = 2600
const COUNT = 90

/**
 * Explosión de magnesio: nubes blancas que salen del centro y caen. Se ejecuta al montar.
 * Las nubes llevan un borde gris suave para verse también sobre el panel amarillo, y con
 * "Reducir movimiento" activado aparecen y se desvanecen sin desplazarse.
 */
export function ChalkBurst() {
  const ref = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const still = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const canvas = ref.current
    const ctx = canvas?.getContext('2d')
    if (!canvas || !ctx) return
    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    const w = (canvas.width = Math.round(window.innerWidth * dpr))
    const h = (canvas.height = Math.round(window.innerHeight * dpr))
    const cx = w / 2
    const cy = h * 0.42
    const parts = Array.from({ length: COUNT }, () => {
      const a = Math.random() * Math.PI * 2
      // Velocidades en px por segundo: el movimiento no depende de los Hz de la pantalla
      const v = (120 + Math.random() * 520) * dpr
      const spread = still ? Math.random() * Math.min(w, h) * 0.45 : 0
      return {
        x: cx + Math.cos(a) * spread,
        y: cy + Math.sin(a) * spread,
        vx: still ? 0 : Math.cos(a) * v,
        vy: still ? 0 : Math.sin(a) * v - 180 * dpr,
        r: (6 + Math.random() * 16) * dpr,
      }
    })

    let raf = 0
    let start = 0
    let last = 0
    const frame = (now: number) => {
      if (!start) start = last = now
      const k = (now - start) / DURATION
      const dt = Math.min(0.05, (now - last) / 1000)
      last = now
      ctx.clearRect(0, 0, w, h)
      if (k >= 1) return
      const alpha = still ? Math.sin(Math.PI * k) : 1 - k
      for (const p of parts) {
        p.vx *= 1 - 1.6 * dt
        p.vy = p.vy * (1 - 1.6 * dt) + 420 * dpr * dt
        p.x += p.vx * dt
        p.y += p.vy * dt
        const r = p.r * (1 + k * 1.5)
        const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, r)
        g.addColorStop(0, `rgba(255,255,255,${0.95 * alpha})`)
        g.addColorStop(0.6, `rgba(245,245,245,${0.7 * alpha})`)
        g.addColorStop(1, `rgba(160,160,160,0)`)
        ctx.fillStyle = g
        ctx.beginPath()
        ctx.arc(p.x, p.y, r, 0, Math.PI * 2)
        ctx.fill()
        ctx.strokeStyle = `rgba(0,0,0,${0.12 * alpha})`
        ctx.lineWidth = dpr
        ctx.stroke()
      }
      raf = requestAnimationFrame(frame)
    }
    raf = requestAnimationFrame(frame)
    return () => cancelAnimationFrame(raf)
  }, [])

  return <canvas ref={ref} className="pointer-events-none fixed inset-0 z-30 h-full w-full" aria-hidden />
}
