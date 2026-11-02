export type Lang = 'es' | 'eu' | 'ca' | 'en'

export const LANGS: { id: Lang; name: string }[] = [
  { id: 'es', name: 'Castellano' },
  { id: 'eu', name: 'Euskara' },
  { id: 'ca', name: 'Català' },
  { id: 'en', name: 'English' },
]

/** Primer idioma del navegador que tenga la app; si no, castellano */
export function detectLang(): Lang {
  const prefs = typeof navigator === 'undefined' ? [] : (navigator.languages ?? [navigator.language])
  for (const p of prefs) {
    const base = p?.slice(0, 2).toLowerCase()
    if (LANGS.some((l) => l.id === base)) return base as Lang
  }
  return 'es'
}
