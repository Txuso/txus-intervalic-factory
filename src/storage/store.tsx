import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { DEFAULT_SETTINGS, defaultConfig, normalizeConfig, withPresets } from '../domain/defaults'
import { newId } from '../domain/format'
import type { HistoryEntry, Settings, TimerConfig } from '../domain/types'

const KEYS = {
  configs: 'tif.configs',
  history: 'tif.history',
  settings: 'tif.settings',
  current: 'tif.current',
  presets: 'tif.presets',
}
export const HISTORY_MAX = 10
const EXPORT_VERSION = 1

function load<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T) : fallback
  } catch {
    return fallback
  }
}

function save(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    // Almacenamiento lleno o bloqueado: la app sigue funcionando en memoria
  }
}

interface InitialState {
  configs: TimerConfig[]
  current: TimerConfig
}

function initialState(): InitialState {
  const stored = load<TimerConfig[] | null>(KEYS.configs, null)
  const { list, offered } = withPresets((stored ?? [defaultConfig()]).map(normalizeConfig), load<string[]>(KEYS.presets, []))
  save(KEYS.presets, offered)
  if (stored) {
    const saved = load<TimerConfig>(KEYS.current, list[0] ?? defaultConfig())
    return { configs: list, current: list.find((c) => c.id === saved.id) ?? normalizeConfig(saved) }
  }
  return { configs: list, current: list[0] }
}

interface StoreValue {
  configs: TimerConfig[]
  history: HistoryEntry[]
  settings: Settings
  current: TimerConfig
  setCurrent: (c: TimerConfig) => void
  upsertConfig: (c: TimerConfig) => void
  deleteConfig: (id: string) => void
  addHistory: (e: HistoryEntry) => void
  deleteHistory: (id: string) => void
  saveHistoryAsConfig: (entryId: string, name: string) => TimerConfig | undefined
  updateSettings: (patch: Partial<Settings>) => void
  exportData: () => string
  importData: (json: string) => void
}

const StoreContext = createContext<StoreValue | null>(null)

export function StoreProvider({ children }: { children: ReactNode }) {
  const [init] = useState(initialState)
  const [configs, setConfigs] = useState<TimerConfig[]>(init.configs)
  const [current, setCurrent] = useState<TimerConfig>(init.current)
  const [history, setHistory] = useState<HistoryEntry[]>(() => load(KEYS.history, []))
  const [settings, setSettings] = useState<Settings>(() => ({ ...DEFAULT_SETTINGS, ...load(KEYS.settings, {}) }))

  useEffect(() => save(KEYS.configs, configs), [configs])
  useEffect(() => save(KEYS.current, current), [current])
  useEffect(() => save(KEYS.history, history), [history])
  useEffect(() => save(KEYS.settings, settings), [settings])

  const upsertConfig = useCallback((c: TimerConfig) => {
    setConfigs((list) => (list.some((x) => x.id === c.id) ? list.map((x) => (x.id === c.id ? c : x)) : [...list, c]))
    setCurrent((cur) => (cur.id === c.id ? c : cur))
  }, [])

  const deleteConfig = useCallback((id: string) => {
    setConfigs((list) => list.filter((x) => x.id !== id))
  }, [])

  const addHistory = useCallback((e: HistoryEntry) => {
    setHistory((list) => [e, ...list].slice(0, HISTORY_MAX))
  }, [])

  const deleteHistory = useCallback((id: string) => {
    setHistory((list) => list.filter((h) => h.id !== id))
  }, [])

  const saveHistoryAsConfig = useCallback(
    (entryId: string, name: string) => {
      const entry = history.find((h) => h.id === entryId)
      if (!entry) return undefined
      const config: TimerConfig = normalizeConfig({ ...entry.config, id: newId(), name })
      setConfigs((list) => [...list, config])
      return config
    },
    [history],
  )

  const updateSettings = useCallback((patch: Partial<Settings>) => {
    setSettings((s) => ({ ...s, ...patch }))
  }, [])

  const exportData = useCallback(
    () => JSON.stringify({ app: 'txus-intervalic-factory', version: EXPORT_VERSION, configs, history, settings }, null, 2),
    [configs, history, settings],
  )

  const importData = useCallback((json: string) => {
    const data = JSON.parse(json)
    if (data?.app !== 'txus-intervalic-factory' || !Array.isArray(data.configs)) {
      throw new Error('El archivo no es una copia de Txus Intervalic Factory')
    }
    setConfigs(data.configs.map(normalizeConfig))
    setHistory(Array.isArray(data.history) ? data.history.slice(0, HISTORY_MAX) : [])
    if (data.settings) setSettings({ ...DEFAULT_SETTINGS, ...data.settings })
    if (data.configs[0]) setCurrent(normalizeConfig(data.configs[0]))
  }, [])

  const value = useMemo<StoreValue>(
    () => ({
      configs, history, settings, current, setCurrent, upsertConfig, deleteConfig,
      addHistory, deleteHistory, saveHistoryAsConfig, updateSettings, exportData, importData,
    }),
    [configs, history, settings, current, upsertConfig, deleteConfig, addHistory, deleteHistory, saveHistoryAsConfig, updateSettings, exportData, importData],
  )

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>
}

export function useStore(): StoreValue {
  const ctx = useContext(StoreContext)
  if (!ctx) throw new Error('useStore fuera de StoreProvider')
  return ctx
}
