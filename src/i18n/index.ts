import { useStore } from '../storage/store'
import { ca } from './ca'
import { en } from './en'
import { es } from './es'
import { eu } from './eu'
import type { Lang } from './lang'
import type { Dict } from './types'

export const DICTS: Record<Lang, Dict> = { es, eu, ca, en }

/** Textos en el idioma elegido en Ajustes */
export function useT(): Dict {
  return DICTS[useStore().settings.language] ?? es
}
