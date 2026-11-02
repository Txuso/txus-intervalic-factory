import type { Settings } from '../domain/types'

let ctx: AudioContext | null = null
let master: GainNode | null = null
let keepAlive: AudioBufferSourceNode | null = null
let volume = 0.8
let voiceLang = 'es-ES'
let voice: SpeechSynthesisVoice | null = null

const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)

export const vibrationSupport: 'native' | 'ios-haptic' | 'none' =
  'vibrate' in navigator ? 'native' : isIOS ? 'ios-haptic' : 'none'

function pickVoice() {
  if (!('speechSynthesis' in window)) return
  const voices = speechSynthesis.getVoices()
  const base = voiceLang.slice(0, 2)
  // Sin voz del idioma (p. ej. euskera en iOS) se usa la española, que lo lee razonablemente
  voice =
    voices.find((v) => v.lang.replace('_', '-') === voiceLang) ??
    voices.find((v) => v.lang.startsWith(base)) ??
    voices.find((v) => v.lang.startsWith('es')) ??
    null
}
if ('speechSynthesis' in window) {
  pickVoice()
  speechSynthesis.addEventListener?.('voiceschanged', pickVoice)
}

/** Idioma de la voz, p. ej. 'eu-ES' */
export function setVoiceLang(lang: string) {
  voiceLang = lang
  pickVoice()
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
    // iOS suspende o "interrumpe" el contexto cuando habla la voz o entra otra app de audio:
    // en cuanto pasa, se intenta reanudar mientras haya un entreno en marcha
    ctx.onstatechange = () => {
      if (keepAlive && ctx && ctx.state !== 'running' && ctx.state !== 'closed') void ctx.resume().catch(() => {})
    }
  }
  if (ctx.state !== 'running') void ctx.resume().catch(() => {})

  if ('speechSynthesis' in window && !speechSynthesis.speaking && !speechSynthesis.pending) {
    const u = new SpeechSynthesisUtterance(' ')
    u.volume = 0
    speechSynthesis.speak(u)
  }
}

/**
 * Bucle de silencio mientras corre el entreno: mantiene viva la sesión de audio de iOS
 * para que no se apague entre aviso y aviso.
 */
export function startKeepAlive() {
  if (!ctx || !master || keepAlive) return
  const src = ctx.createBufferSource()
  src.buffer = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate)
  src.loop = true
  src.connect(ctx.destination)
  src.start()
  keepAlive = src
}

export function stopKeepAlive() {
  try {
    keepAlive?.stop()
  } catch {
    // Ya parado
  }
  keepAlive?.disconnect()
  keepAlive = null
}

function applyVolume() {
  // Curva cuadrática: el slider se percibe más lineal
  if (master) master.gain.value = volume * volume
}

export function setVolume(v: number) {
  volume = Math.min(1, Math.max(0, v))
  applyVolume()
}

/** Ejecuta `play` con el contexto en marcha, reanudándolo antes si iOS lo ha parado */
function withRunningContext(play: (c: AudioContext, out: GainNode) => void) {
  if (!ctx || !master) return
  const c = ctx
  const out = master
  if (c.state === 'running') play(c, out)
  else
    c.resume()
      .then(() => play(c, out))
      .catch(() => {})
}

function tone(freq: number, ms: number, delayMs = 0) {
  withRunningContext((c, out) => {
    const t0 = c.currentTime + delayMs / 1000
    const osc = c.createOscillator()
    const env = c.createGain()
    osc.type = 'square'
    osc.frequency.value = freq
    env.gain.setValueAtTime(0, t0)
    env.gain.linearRampToValueAtTime(0.35, t0 + 0.01)
    env.gain.setValueAtTime(0.35, t0 + ms / 1000 - 0.03)
    env.gain.linearRampToValueAtTime(0, t0 + ms / 1000)
    osc.connect(env).connect(out)
    osc.start(t0)
    osc.stop(t0 + ms / 1000 + 0.02)
  })
}

function speak(text: string) {
  if (!('speechSynthesis' in window)) return
  const say = () => {
    const u = new SpeechSynthesisUtterance(text)
    u.lang = voiceLang
    if (voice) u.voice = voice
    u.volume = volume
    u.rate = 1.05
    // Safari a veces deja la cola en pausa y no vuelve a hablar
    speechSynthesis.resume()
    speechSynthesis.speak(u)
  }
  // En Safari, speak() justo después de cancel() se ignora y la voz se queda muda:
  // solo se cancela si hay algo sonando, y se habla un instante después
  if (speechSynthesis.speaking || speechSynthesis.pending) {
    speechSynthesis.cancel()
    setTimeout(say, 80)
  } else {
    say()
  }
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
export function cueFinish(s: AlertSettings, voiceText: string) {
  if (s.beeps) {
    tone(1320, 200, 0)
    tone(1320, 200, 280)
    tone(1760, 600, 560)
  }
  if (s.voice) speak(voiceText)
  if (s.vibration) vibrate([300, 150, 300, 150, 600])
}

export function testSound(s: AlertSettings, voiceText: string) {
  unlockAudio()
  if (s.beeps) tone(1320, 300)
  if (s.voice) speak(voiceText)
  if (s.vibration) vibrate([200])
}
