import type { Settings } from '../domain/types'

let ctx: AudioContext | null = null
let master: GainNode | null = null
let volume = 0.8
let spanishVoice: SpeechSynthesisVoice | null = null

const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)

export const vibrationSupport: 'native' | 'ios-haptic' | 'none' =
  'vibrate' in navigator ? 'native' : isIOS ? 'ios-haptic' : 'none'

function pickVoice() {
  if (!('speechSynthesis' in window)) return
  const voices = speechSynthesis.getVoices()
  spanishVoice =
    voices.find((v) => v.lang === 'es-ES') ?? voices.find((v) => v.lang.startsWith('es')) ?? null
}
if ('speechSynthesis' in window) {
  pickVoice()
  speechSynthesis.addEventListener?.('voiceschanged', pickVoice)
}

/**
 * Debe llamarse dentro de un gesto del usuario (toque en play): iOS solo permite
 * arrancar el audio y la voz así.
 */
export function unlockAudio() {
  // Safari 17+: 'playback' hace que suene aunque el iPhone esté en modo silencio
  const session = (navigator as Navigator & { audioSession?: { type: string } }).audioSession
  if (session) session.type = 'playback'

  if (!ctx) {
    const Ctor = window.AudioContext ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
    ctx = new Ctor()
    master = ctx.createGain()
    master.connect(ctx.destination)
    applyVolume()
  }
  if (ctx.state !== 'running') void ctx.resume()

  if ('speechSynthesis' in window && !speechSynthesis.speaking) {
    const u = new SpeechSynthesisUtterance(' ')
    u.volume = 0
    speechSynthesis.speak(u)
  }
}

function applyVolume() {
  // Curva cuadrática: el slider se percibe más lineal
  if (master) master.gain.value = volume * volume
}

export function setVolume(v: number) {
  volume = Math.min(1, Math.max(0, v))
  applyVolume()
}

function tone(freq: number, ms: number, delayMs = 0) {
  if (!ctx || !master) return
  const t0 = ctx.currentTime + delayMs / 1000
  const osc = ctx.createOscillator()
  const env = ctx.createGain()
  osc.type = 'square'
  osc.frequency.value = freq
  env.gain.setValueAtTime(0, t0)
  env.gain.linearRampToValueAtTime(0.35, t0 + 0.01)
  env.gain.setValueAtTime(0.35, t0 + ms / 1000 - 0.03)
  env.gain.linearRampToValueAtTime(0, t0 + ms / 1000)
  osc.connect(env).connect(master)
  osc.start(t0)
  osc.stop(t0 + ms / 1000 + 0.02)
}

function speak(text: string) {
  if (!('speechSynthesis' in window)) return
  speechSynthesis.cancel()
  const u = new SpeechSynthesisUtterance(text)
  u.lang = 'es-ES'
  if (spanishVoice) u.voice = spanishVoice
  u.volume = volume
  u.rate = 1.05
  speechSynthesis.speak(u)
}

let hapticLabel: HTMLLabelElement | null = null
function iosHaptic() {
  // Truco iOS 18+: conmutar un <input type="checkbox" switch> produce un toque háptico
  if (!hapticLabel) {
    hapticLabel = document.createElement('label')
    hapticLabel.style.display = 'none'
    const input = document.createElement('input')
    input.type = 'checkbox'
    input.setAttribute('switch', '')
    hapticLabel.appendChild(input)
    document.body.appendChild(hapticLabel)
  }
  hapticLabel.click()
}

function vibrate(pattern: number[]) {
  if (vibrationSupport === 'native') {
    navigator.vibrate(pattern)
  } else if (vibrationSupport === 'ios-haptic') {
    // Un toque por cada pulso del patrón
    pattern.forEach((_, i) => {
      if (i % 2 === 0) setTimeout(iosHaptic, pattern.slice(0, i).reduce((a, b) => a + b, 0))
    })
  }
}

type AlertSettings = Pick<Settings, 'beeps' | 'voice' | 'vibration'>

/** Pitido corto de la cuenta atrás 3-2-1 */
export function cueTick(s: AlertSettings) {
  if (s.beeps) tone(880, 140)
  if (s.vibration) vibrate([80])
}

/** Inicio de una fase nueva */
export function cuePhase(s: AlertSettings, voiceText: string) {
  if (s.beeps) tone(1320, 450)
  if (s.voice) speak(voiceText)
  if (s.vibration) vibrate([300])
}

/** Fin del entreno */
export function cueFinish(s: AlertSettings) {
  if (s.beeps) {
    tone(1320, 200, 0)
    tone(1320, 200, 280)
    tone(1760, 600, 560)
  }
  if (s.voice) speak('¡Terminado! Buen trabajo')
  if (s.vibration) vibrate([300, 150, 300, 150, 600])
}

export function testSound(s: AlertSettings) {
  unlockAudio()
  if (s.beeps) tone(1320, 300)
  if (s.voice) speak('Volumen')
  if (s.vibration) vibrate([200])
}
