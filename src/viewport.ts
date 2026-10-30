/**
 * En la PWA instalada de iOS la altura del viewport puede quedarse corta por abajo
 * (queda un hueco como si hubiera barra del navegador). Si pasa, forzamos la altura
 * real de la pantalla.
 */
function fitHeight() {
  const standalone =
    window.matchMedia('(display-mode: standalone)').matches ||
    (navigator as Navigator & { standalone?: boolean }).standalone === true
  const root = document.documentElement
  if (!standalone) {
    root.style.removeProperty('--app-h')
    return
  }
  // iOS no intercambia screen.width/height al girar el móvil
  const { width, height } = window.screen
  const landscape = window.innerWidth > window.innerHeight
  const screenH = landscape ? Math.min(width, height) : Math.max(width, height)
  const full = Math.max(window.innerHeight, screenH)
  root.style.setProperty('--app-h', `${full}px`)
}

export function initViewport() {
  fitHeight()
  window.addEventListener('resize', fitHeight)
  window.addEventListener('orientationchange', () => setTimeout(fitHeight, 200))
  window.addEventListener('pageshow', fitHeight)
}
