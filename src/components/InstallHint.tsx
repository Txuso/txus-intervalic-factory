import { Download, EllipsisVertical, Share, SquarePlus } from 'lucide-react'
import { useEffect, useState, type ReactNode } from 'react'
import { useT } from '../i18n'
import { canPromptInstall, onInstallAvailabilityChange, platform, promptInstall, type Platform } from '../install'

interface Props {
  open: boolean
  onClose: () => void
}

/** Explica cómo añadir la app a la pantalla de inicio, con los pasos de cada plataforma */
export function InstallHint({ open, onClose }: Props) {
  const t = useT()
  const [canPrompt, setCanPrompt] = useState(canPromptInstall)
  useEffect(() => onInstallAvailabilityChange(() => setCanPrompt(canPromptInstall())), [])
  const p = platform()
  if (!open || !p) return null

  const icons: Record<Platform, ReactNode[]> = {
    ios: [<Share key="a" />, <SquarePlus key="b" />],
    android: [<EllipsisVertical key="a" />, <SquarePlus key="b" />],
  }
  const steps = t.install.steps[p]

  const install = async () => {
    if (await promptInstall()) onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center animate-fade-in bg-black/70 px-4 pb-safe sm:items-center" onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="install-title"
        className="animate-pop mb-4 w-full max-w-sm overflow-hidden rounded-2xl bg-panel shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="rope h-[5px]" />
        <div className="flex flex-col items-center px-6 pt-6 text-center">
          <img src="/pwa-192.png" alt="" width={84} height={84} className="rounded-2xl" />
          <h2 id="install-title" className="mt-4 text-3xl leading-tight">
            {t.install.title}
          </h2>
          <p className="mt-2 text-xl leading-snug text-muted">{t.install.intro}</p>
        </div>

        <ol className="mx-6 mt-5 space-y-3">
          {steps.map((step, i) => (
            <li key={i} className="flex items-center gap-3 rounded-xl bg-bg px-4 py-3 text-xl leading-tight">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent text-lg text-black">{i + 1}</span>
              <span className="min-w-0 flex-1">{step}</span>
              {icons[p][i] && <span className="shrink-0 text-accent [&>svg]:h-6 [&>svg]:w-6">{icons[p][i]}</span>}
            </li>
          ))}
        </ol>

        <div className={`grid gap-3 p-5 ${canPrompt ? 'grid-cols-2' : 'grid-cols-1'}`}>
          <button onClick={onClose} className="rounded-xl bg-btn py-3 text-2xl active:opacity-70">
            {canPrompt ? t.install.later : t.install.gotIt}
          </button>
          {canPrompt && (
            <button onClick={install} className="flex items-center justify-center gap-2 rounded-xl bg-accent py-3 text-2xl text-black active:opacity-70">
              <Download className="h-5 w-5" />
              {t.install.now}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
