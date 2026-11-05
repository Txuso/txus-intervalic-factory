import { useState } from 'react'

// Página oculta (/?audiotest) para encontrar en un iPhone real qué tipo de sesión de audio deja
// sonar los pitidos sin pausar la música de otras apps. Cada prueba usa un AudioContext nuevo.

type SessionType = 'auto' | 'ambient' | 'transient' | 'transient-solo' | 'playback'
const TYPES: SessionType[] = ['auto', 'ambient', 'transient', 'transient-solo', 'playback']

interface AudioSessionLike {
  type: string
  state?: string
}

const session = () => (navigator as Navigator & { audioSession?: AudioSessionLike }).audioSession

let ctx: AudioContext | null = null

export function AudioTestScreen() {
  const [log, setLog] = useState<string[]>([])
  const add = (line: string) => setLog((l) => [`${new Date().toLocaleTimeString()} ${line}`, ...l].slice(0, 60))

  const beep = (c: AudioContext, at: number) => {
    const osc = c.createOscillator()
    const env = c.createGain()
    osc.type = 'square'
    osc.frequency.value = 1320
    env.gain.setValueAtTime(0, at)
    env.gain.linearRampToValueAtTime(0.25, at + 0.01)
    env.gain.setValueAtTime(0.25, at + 0.2)
    env.gain.linearRampToValueAtTime(0, at + 0.23)
    osc.connect(env).connect(c.destination)
    osc.start(at)
    osc.stop(at + 0.25)
  }

  const run = (type: SessionType, withVoice: boolean) => {
    const s = session()
    if (s) s.type = type
    void ctx?.close().catch(() => {})
    const Ctor = window.AudioContext ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
    const c = new Ctor()
    ctx = c
    c.onstatechange = () => add(`  contexto: ${c.state}`)
    add(`▶ ${type}${withVoice ? ' + voz' : ''} · sesión ${s ? `${s.type} (${s.state ?? '?'})` : 'no soportada'}`)
    c.resume()
      .then(() => {
        add(`  contexto: ${c.state}`)
        const t0 = c.currentTime + 0.05
        // Tres pitidos; con voz, la frase va entre el primero y los otros dos
        beep(c, t0)
        beep(c, t0 + (withVoice ? 2.2 : 0.5))
        beep(c, t0 + (withVoice ? 2.7 : 1.0))
      })
      .catch((e) => add(`  error al reanudar: ${e}`))
    if (withVoice && 'speechSynthesis' in window) {
      setTimeout(() => {
        const u = new SpeechSynthesisUtterance('Apreta')
        u.lang = 'es-ES'
        u.onend = () => add(`  voz terminada · contexto ${c.state}`)
        speechSynthesis.speak(u)
      }, 500)
    }
    setTimeout(() => add(`  al final: contexto ${c.state}, sesión ${s ? `${s.type} (${s.state ?? '?'})` : '-'}`), 3500)
  }

  return (
    <div className="no-scrollbar h-full overflow-y-auto bg-bg px-4 pt-safe pb-safe font-sans text-white">
      <h1 className="pt-4 text-3xl">Prueba de audio</h1>
      <p className="mt-2 text-base leading-snug text-muted" style={{ letterSpacing: 0 }}>
        Pon música en Spotify. Prueba cada modo y fíjate en tres cosas: si suenan los 3 pitidos, si se oye la voz y si Spotify sigue sonando.
        Deja «playback» para el final, porque pausa Spotify.
      </p>
      <div className="mt-4 space-y-3">
        {TYPES.map((type) => (
          <div key={type} className="flex items-center gap-3">
            <span className="w-36 text-2xl">{type}</span>
            <button onClick={() => run(type, false)} className="flex-1 rounded-lg bg-btn py-3 text-xl text-accent">
              Pitidos
            </button>
            <button onClick={() => run(type, true)} className="flex-1 rounded-lg bg-btn py-3 text-xl text-accent">
              + voz
            </button>
          </div>
        ))}
      </div>
      <pre className="mt-5 text-xs leading-relaxed whitespace-pre-wrap text-muted" style={{ letterSpacing: 0 }}>
        {log.join('\n')}
      </pre>
    </div>
  )
}
