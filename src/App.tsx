import { useEffect, useState } from 'react'
import { setVolume } from './audio/audio'
import { newId } from './domain/format'
import { defaultConfig } from './domain/defaults'
import { randomGrade } from './domain/grades'
import type { TimerConfig } from './domain/types'
import { useTimerEngine } from './hooks/useTimerEngine'
import { useWakeLock } from './hooks/useWakeLock'
import { EditorScreen } from './screens/EditorScreen'
import { HistoryScreen } from './screens/HistoryScreen'
import { LibraryScreen } from './screens/LibraryScreen'
import { SettingsScreen } from './screens/SettingsScreen'
import { TimerScreen } from './screens/TimerScreen'
import { useStore } from './storage/store'

type Screen =
  | { name: 'timer' }
  | { name: 'library' }
  | { name: 'history' }
  | { name: 'settings' }
  | { name: 'editor'; config: TimerConfig; isNew: boolean; back: 'timer' | 'library' }

export default function App() {
  const store = useStore()
  const { current, settings } = store
  const [screen, setScreen] = useState<Screen>({ name: 'timer' })
  const timer = useTimerEngine(current, settings, store.addHistory)
  const active = timer.view.status === 'running' || timer.view.status === 'paused'

  useEffect(() => setVolume(settings.volume), [settings.volume])
  useWakeLock(settings.keepAwake && active)

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
          onDuplicate={(c) => store.upsertConfig({ ...c, id: newId(), name: `${c.name} (copia)`, grade: randomGrade() })}
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
      {content}
      <Splash />
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
