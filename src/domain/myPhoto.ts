import { useSyncExternalStore } from 'react'

// Foto del propio usuario como escalador ("Yo"). Solo se guarda en este dispositivo.
const KEY = 'tif.myPhoto'
const SIZE = 256

function read(): string | null {
  try {
    return localStorage.getItem(KEY)
  } catch {
    return null
  }
}

let photo = read()
const listeners = new Set<() => void>()

export function getMyPhoto(): string | null {
  return photo
}

export function setMyPhoto(dataUrl: string | null) {
  photo = dataUrl
  try {
    if (dataUrl) localStorage.setItem(KEY, dataUrl)
    else localStorage.removeItem(KEY)
  } catch {
    // Sin espacio o bloqueado: se usa solo en esta sesión
  }
  listeners.forEach((l) => l())
}

function subscribe(cb: () => void) {
  listeners.add(cb)
  return () => listeners.delete(cb)
}

/** La foto actual; los componentes se repintan al cambiarla */
export function useMyPhoto(): string | null {
  return useSyncExternalStore(subscribe, getMyPhoto)
}

/** Recorta la imagen en cuadrado por el centro y la reduce a 256 px (JPEG, ~20-30 KB) */
export async function fileToAvatar(file: File): Promise<string> {
  const url = URL.createObjectURL(file)
  try {
    const img = new Image()
    img.src = url
    await img.decode()
    const side = Math.min(img.naturalWidth, img.naturalHeight)
    const canvas = document.createElement('canvas')
    canvas.width = canvas.height = SIZE
    const ctx = canvas.getContext('2d')!
    ctx.drawImage(img, (img.naturalWidth - side) / 2, (img.naturalHeight - side) / 2, side, side, 0, 0, SIZE, SIZE)
    return canvas.toDataURL('image/jpeg', 0.85)
  } finally {
    URL.revokeObjectURL(url)
  }
}
