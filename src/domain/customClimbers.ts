import { useSyncExternalStore } from 'react'
import type { Climber } from './climbers'
import { newId } from './format'

// Escaladores que añade el usuario (nombre + foto). Solo se guardan en este dispositivo.
const KEY = 'tif.climbers'
const COLORS = ['#3aa8e4', '#f2392b', '#99ff4a', '#b57cff', '#ffff40']

interface Stored {
  id: string
  name: string
  photo?: string
}

function read(): Stored[] {
  try {
    const raw = localStorage.getItem(KEY)
    return raw ? (JSON.parse(raw) as Stored[]) : []
  } catch {
    return []
  }
}

const initials = (name: string) =>
  name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? '')
    .join('')

const toClimber = (s: Stored, i: number): Climber => ({ ...s, initials: initials(s.name), color: COLORS[i % COLORS.length] })

let stored = read()
let climbers = stored.map(toClimber)
const listeners = new Set<() => void>()

function commit(next: Stored[]) {
  stored = next
  climbers = next.map(toClimber)
  try {
    localStorage.setItem(KEY, JSON.stringify(next))
  } catch {
    // Sin espacio o bloqueado: se usan solo en esta sesión
  }
  listeners.forEach((l) => l())
}

export function getCustomClimbers(): Climber[] {
  return climbers
}

export function addCustomClimber(name: string, photo?: string): string {
  const id = newId()
  commit([...stored, { id, name, photo }])
  return id
}

export function updateCustomClimber(id: string, patch: { name: string; photo?: string }) {
  commit(stored.map((s) => (s.id === id ? { id, ...patch } : s)))
}

export function deleteCustomClimber(id: string) {
  commit(stored.filter((s) => s.id !== id))
}

function subscribe(cb: () => void) {
  listeners.add(cb)
  return () => listeners.delete(cb)
}

/** La lista actual; los componentes se repintan al cambiarla */
export function useCustomClimbers(): Climber[] {
  return useSyncExternalStore(subscribe, getCustomClimbers)
}
