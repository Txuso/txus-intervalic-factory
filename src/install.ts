// Detección de la app instalada y del aviso de instalación del navegador (Chrome en Android)

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

export type Platform = 'ios' | 'android'

export function isStandalone(): boolean {
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    (navigator as Navigator & { standalone?: boolean }).standalone === true
  )
}

/** Móvil en el que tiene sentido instalar la app; null en ordenador */
export function platform(): Platform | null {
  const ua = navigator.userAgent
  if (/iPad|iPhone|iPod/.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)) return 'ios'
  if (/Android/i.test(ua)) return 'android'
  return null
}

/** Mostrar las instrucciones de instalación: solo en móvil y si no está ya instalada */
export function shouldOfferInstall(): boolean {
  return platform() !== null && !isStandalone()
}

let deferred: BeforeInstallPromptEvent | null = null
const listeners = new Set<() => void>()

// Chrome lanza este evento muy pronto: se guarda para ofrecer un botón "Instalar" propio
window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault()
  deferred = e as BeforeInstallPromptEvent
  listeners.forEach((l) => l())
})
window.addEventListener('appinstalled', () => {
  deferred = null
  listeners.forEach((l) => l())
})

export function canPromptInstall(): boolean {
  return deferred !== null
}

export function onInstallAvailabilityChange(cb: () => void): () => void {
  listeners.add(cb)
  return () => listeners.delete(cb)
}

/** Abre el diálogo nativo de instalación. Devuelve true si el usuario la instaló. */
export async function promptInstall(): Promise<boolean> {
  if (!deferred) return false
  const e = deferred
  deferred = null
  await e.prompt()
  const { outcome } = await e.userChoice
  listeners.forEach((l) => l())
  return outcome === 'accepted'
}
