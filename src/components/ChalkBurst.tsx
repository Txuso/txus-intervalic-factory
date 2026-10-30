import { useEffect, useRef } from 'react'

const DURATION = 1600
const COUNT = 140

/** Explosión de magnesio: partículas blancas que salen del centro y caen. Se ejecuta al montar. */
export function ChalkBurst() {
  const ref = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const canvas = ref.current
    const ctx = canvas?.getContext('2d')
    if (!canvas || !ctx) return
    const dpr = window.devicePixelRatio || 1
    const w = (canvas.width = window.innerWidth * dpr)
    const h = (canvas.height = window.innerHeight * dpr)
    const parts = Array.from({ length: COUNT }, () => {
      const a = Math.random() * Math.PI * 2
      const v = (2 + Math.random() * 9) * dpr
      return {
        x: w / 2,
        y: h * 0.42,
        vx: Math.cos(a) * v,
        vy: Math.sin(a) * v - 3 * dpr,
        r: (1.5 + Math.random() * 5) * dpr,
      }
    })
    const t0 = performance.now()
    let raf = 0
    const frame = (t: number) => {
      const k = (t - t0) / DURATION
      ctx.clearRect(0, 0, w, h)
      if (k >= 1) return
      for (const p of parts) {
        p.x += p.vx
        p.y += p.vy
        p.vx *= 0.96
        p.vy = p.vy * 0.96 + 0.25 * dpr
        ctx.globalAlpha = (1 - k) * 0.85
        ctx.fillStyle = '#fff'
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.r * (1 + k), 0, Math.PI * 2)
        ctx.fill()
      }
      raf = requestAnimationFrame(frame)
    }
    raf = requestAnimationFrame(frame)
    return () => cancelAnimationFrame(raf)
  }, [])

  return <canvas ref={ref} className="pointer-events-none fixed inset-0 z-30 h-full w-full" aria-hidden />
}
