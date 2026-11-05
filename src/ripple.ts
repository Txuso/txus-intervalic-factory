// Efecto ripple al pulsar cualquier botón: una onda que sale del punto tocado.
// Un único listener global, así no hay que tocar cada botón.
export function initRipple() {
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return
  document.addEventListener(
    'pointerdown',
    (e) => {
      const target = e.target as Element | null
      const el = target?.closest?.('button')
      if (!el || el.disabled) return
      const rect = el.getBoundingClientRect()
      const style = getComputedStyle(el)
      if (style.position === 'static') el.style.position = 'relative'

      // La capa recorta la onda a la forma del botón sin recortar su contenido
      const host = document.createElement('span')
      host.className = 'ripple-host'
      // Botones de solo icono, sin esquinas redondeadas: onda redonda
      if (parseFloat(style.borderTopLeftRadius) === 0 && rect.width <= 64 && rect.height <= 64) host.style.borderRadius = '9999px'

      const size = Math.hypot(rect.width, rect.height) * 2
      const wave = document.createElement('span')
      wave.className = 'ripple'
      wave.style.width = wave.style.height = `${size}px`
      wave.style.left = `${e.clientX - rect.left - size / 2}px`
      wave.style.top = `${e.clientY - rect.top - size / 2}px`
      // Color de lo que hay bajo el dedo: negro sobre el play amarillo, claro sobre los botones oscuros
      if (target !== el) wave.style.background = getComputedStyle(target!).color
      wave.addEventListener('animationend', () => host.remove())

      host.appendChild(wave)
      el.appendChild(host)
    },
    { passive: true },
  )
}
