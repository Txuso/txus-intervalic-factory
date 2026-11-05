import { useEffect, useState } from 'react'
import { setVoiceLang, setVolume } from './audio/audio'
import { newId } from './domain/format'
import { defaultConfig } from './domain/defaults'
import { randomGrade } from './domain/grades'
import type { TimerConfig } from './domain/types'
import { useTimerEngine } from './hooks/useTimerEngine'
import { InstallHint } from './components/InstallHint'
import { useWakeLock } from './hooks/useWakeLock'
import { useT } from './i18n'
import { shouldOfferInstall } from './install'
import { EditorScreen } from './screens/EditorScreen'
import { HistoryScreen } from './screens/HistoryScreen'
import { LibraryScreen } from './screens/LibraryScreen'
import { SettingsScreen } from './screens/SettingsScreen'
import { TimerScreen } from './screens/TimerScreen'
import { useStore } from './storage/store'

const INSTALL_HINT_KEY = 'tif.installHint'

type Screen =
  | { name: 'timer' }
  | { name: 'library' }
  | { name: 'history' }
  | { name: 'settings' }
  | { name: 'editor'; config: TimerConfig; isNew: boolean; back: 'timer' | 'library' }

// Posición horizontal de cada pantalla respecto al temporizador, según el lado de la cabecera
// donde está su botón. La nueva entra por la derecha si está más a la derecha que la anterior.
const SIDE: Record<Screen['name'], number> = { library: -1, history: -1, timer: 0, settings: 1, editor: 1 }

export default function App() {
  const store = useStore()
  const { current, settings } = store
  const t = useT()
  const [nav, setNav] = useState<{ screen: Screen; fromLeft: boolean }>({ screen: { name: 'timer' }, fromLeft: false })
  const screen = nav.screen
  const setScreen = (next: Screen) => setNav((n) => ({ screen: next, fromLeft: SIDE[next.name] < SIDE[n.screen.name] }))
  const timer = useTimerEngine(current, settings, store.addHistory, t)
  const active = timer.view.status === 'running' || timer.view.status === 'paused'

  useEffect(() => setVolume(settings.volume), [settings.volume])
  useEffect(() => {
    setVoiceLang(t.voiceLang)
    document.documentElement.lang = settings.language
  }, [t.voiceLang, settings.language])
  useEffect(() => {
    document.documentElement.dataset.rock = settings.rock
  }, [settings.rock])
  useWakeLock(settings.keepAwake && active)

  // Primera visita desde el navegador del móvil: explica cómo instalarla (tras la pantalla de carga)
  const [installOpen, setInstallOpen] = useState(false)
  useEffect(() => {
    if (!shouldOfferInstall()) return
    try {
      if (localStorage.getItem(INSTALL_HINT_KEY)) return
    } catch {
      // Sin almacenamiento: se muestra igualmente
    }
    const id = setTimeout(() => setInstallOpen(true), 1400)
    return () => clearTimeout(id)
  }, [])
  const closeInstall = () => {
    setInstallOpen(false)
    try {
      localStorage.setItem(INSTALL_HINT_KEY, '1')
    } catch {
      // Sin almacenamiento: volverá a salir la próxima vez
    }
  }

  const toTimer = () => setScreen({ name: 'timer' })
  const select = (c: TimerConfig) => {
    store.setCurrent(c)
    toTimer()
  }

  let content
  switch (screen.name) {
    case 'library':
      content = (
        <LibraryScreen
          onBack={toTimer}
          onSelect={select}
          onEdit={(c) => setScreen({ name: 'editor', config: c, isNew: false, back: 'library' })}
          onDuplicate={(c) => store.upsertConfig({ ...c, id: newId(), name: `${c.name} (${t.copySuffix})`, grade: randomGrade() })}
          onNew={() => setScreen({ name: 'editor', config: { ...defaultConfig(), name: '' }, isNew: true, back: 'library' })}
        />
      )
      break
    case 'history':
      content = <HistoryScreen onBack={toTimer} onRepeat={(e) => select(e.config)} />
      break
    case 'settings':
      content = <SettingsScreen onBack={toTimer} />
      break
    case 'editor':
      content = (
        <EditorScreen
          initial={screen.config}
          isNew={screen.isNew}
          onCancel={() => setScreen(screen.back === 'timer' ? { name: 'timer' } : { name: 'library' })}
          onSave={(c, asNew) => {
            const saved = asNew ? { ...c, id: newId(), grade: randomGrade() } : c
            store.upsertConfig(saved)
            select(saved)
          }}
        />
      )
      break
    default:
      content = (
        <TimerScreen
          config={current}
          view={timer.view}
          onStart={timer.start}
          onPause={timer.pause}
          onResume={timer.resume}
          onReset={timer.reset}
          onOpenLibrary={() => setScreen({ name: 'library' })}
          onOpenHistory={() => setScreen({ name: 'history' })}
          onOpenSettings={() => setScreen({ name: 'settings' })}
          onEdit={() => setScreen({ name: 'editor', config: current, isNew: false, back: 'timer' })}
        />
      )
  }

  return (
    <>
      <div key={screen.name} className={`h-full ${nav.fromLeft ? 'animate-screen-from-left' : 'animate-screen-from-right'}`}>
        {content}
      </div>
      <Splash />
      <InstallHint open={installOpen} onClose={closeInstall} />
    </>
  )
}

function Splash() {
  return (
    <div className="animate-splash pointer-events-none fixed inset-0 z-50 flex flex-col items-center justify-center bg-bg">
      <img src="/logo-512.png" alt="" width={220} height={220} />
      <div className="mt-5 text-4xl tracking-wide text-accent">Txus Intervalic Factory</div>
    </div>
  )
}
