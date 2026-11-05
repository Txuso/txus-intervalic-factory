import { useSyncExternalStore } from 'react'
import type { Settings } from '../domain/types'

let ctx: AudioContext | null = null
let createdAt = 0
let master: GainNode | null = null
let keepAlive: AudioBufferSourceNode | null = null
/** Hay un entreno en marcha: el audio tiene que estar vivo */
let active = false
/** Desde cuándo está parado el contexto (0 = en marcha) */
let stoppedSince = 0
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

const listeners = new Set<() => void>()
const notify = () => listeners.forEach((l) => l())

function applySession() {
  // Safari 17+: 'ambient' se mezcla con la música de otras apps (Spotify) en vez de pausarla.
  // Respeta el modo silencio del iPhone: es la configuración que cada uno tenga puesta.
  const session = (navigator as Navigator & { audioSession?: { type: string } }).audioSession
  if (session) session.type = 'ambient'
}

function createContext() {
  const Ctor = window.AudioContext ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
  const c = new Ctor()
  ctx = c
  createdAt = performance.now()
  stoppedSince = 0
  master = c.createGain()
  master.connect(c.destination)
  applyVolume()
  // iOS suspende o "interrumpe" el contexto cada vez que habla la voz, entra otra app de audio o la
  // app pasa a segundo plano. Se pide reanudarlo en cualquiera de esos estados: en una interrupción,
  // resume() espera a que acabe (p. ej. a que calle la voz) y entonces vuelve a sonar.
  // Si sigue parado pasado un rato, se avisa en pantalla (useAudioBlocked).
  c.onstatechange = () => {
    if (c !== ctx) return
    if (c.state === 'running') stoppedSince = 0
    else if (!stoppedSince) {
      stoppedSince = performance.now()
      setTimeout(notify, BLOCKED_MS + 100)
    }
    if (active && c.state !== 'running' && c.state !== 'closed') void c.resume().catch(() => {})
    notify()
  }
  // Recién creado puede tardar un instante en arrancar: el aviso solo cuenta pasado ese margen
  setTimeout(notify, FRESH_MS + 100)
}

const FRESH_MS = 1000
const isFresh = () => performance.now() - createdAt < FRESH_MS
/** Lo que puede durar una frase de la voz: una parada más corta no es un bloqueo */
const BLOCKED_MS = 3000

/**
 * Debe llamarse dentro de un gesto del usuario (toque en play): iOS solo permite
 * arrancar el audio y la voz así.
 */
export function unlockAudio() {
  applySession()

  // Un contexto que iOS ha dejado parado a veces no vuelve nunca con resume(), y solo se
  // arreglaba reiniciando la app: dentro del toque se cambia por uno nuevo
  if (ctx && ctx.state !== 'running' && !isFresh()) {
    const old = ctx
    const looping = !!keepAlive
    stopLoop()
    ctx = null
    void old.close().catch(() => {})
    createContext()
    if (looping) startLoop()
  }
  if (!ctx) createContext()
  if (ctx!.state !== 'running') void ctx!.resume().catch(() => {})
  notify()

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
  active = true
  startLoop()
  notify()
}

export function stopKeepAlive() {
  active = false
  stopLoop()
  notify()
}

function startLoop() {
  if (!ctx || keepAlive) return
  const src = ctx.createBufferSource()
  src.buffer = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate)
  src.loop = true
  src.connect(ctx.destination)
  src.start()
  keepAlive = src
}

function stopLoop() {
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
  if (c.state === 'running') {
    play(c, out)
    return
  }
  // Si iOS tarda en reanudarlo (o no lo hace nunca), el aviso se descarta: sonaría a destiempo
  const askedAt = performance.now()
  c.resume()
    .then(() => {
      if (c === ctx && performance.now() - askedAt < 500) play(c, out)
    })
    .catch(() => {})
}

/** Hay un entreno en marcha pero el audio está parado y hace falta un toque para reactivarlo */
function isBlocked() {
  return active && !!ctx && ctx.state !== 'running' && !isFresh() && !!stoppedSince && performance.now() - stoppedSince > BLOCKED_MS
}

function subscribe(cb: () => void) {
  listeners.add(cb)
  return () => listeners.delete(cb)
}

export function useAudioBlocked(): boolean {
  return useSyncExternalStore(subscribe, isBlocked)
}

// Cualquier toque durante el entreno reactiva el audio si iOS lo ha parado, no solo pausa/play.
// touchend es el evento que iOS acepta como gesto para el audio; click cubre el resto.
for (const type of ['touchend', 'click'] as const) {
  document.addEventListener(type, () => isBlocked() && unlockAudio(), { capture: true, passive: true })
}
// Al volver a primer plano iOS a veces deja reanudar sin toque, si ya acabó la interrupción
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'visible' && active && ctx && ctx.state !== 'running') void ctx.resume().catch(() => {})
})

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

// Referencia a la frase en curso: si el navegador la libera antes de acabar se pierde su fin
// y la cola de voz se queda atascada (pasa en Safari y Chrome)
let utterance: SpeechSynthesisUtterance | null = null

function speak(text: string) {
  if (!('speechSynthesis' in window)) return
  const say = () => {
    const u = new SpeechSynthesisUtterance(text)
    u.lang = voiceLang
    if (voice) u.voice = voice
    u.volume = volume
    u.rate = 1.05
    u.onend = () => {
      if (utterance === u) utterance = null
    }
    u.onerror = (e) => {
      if (utterance === u) utterance = null
      // Un fallo de verdad (no un cancel nuestro) puede dejar la cola bloqueada: se vacía
      if (e.error !== 'interrupted' && e.error !== 'canceled') speechSynthesis.cancel()
    }
    utterance = u
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
