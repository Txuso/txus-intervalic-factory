import { createContext, useCallback, useContext, useRef, useState, type ReactNode } from 'react'
import { useT } from '../i18n'

interface ConfirmOptions {
  title: string
  message?: string
  confirmLabel: string
  /** Acción destructiva: botón en rojo */
  danger?: boolean
}

type Confirm = (opts: ConfirmOptions) => Promise<boolean>

const ConfirmContext = createContext<Confirm | null>(null)

/** Sustituye a window.confirm con un diálogo con los colores de la app */
export function ConfirmProvider({ children }: { children: ReactNode }) {
  const t = useT()
  const [opts, setOpts] = useState<ConfirmOptions | null>(null)
  // Ya respondido: se queda en pantalla hasta que acaba la animación de salida
  const [closing, setClosing] = useState(false)
  const resolver = useRef<(ok: boolean) => void>(undefined)

  const confirm = useCallback<Confirm>((o) => {
    setOpts(o)
    setClosing(false)
    return new Promise((resolve) => {
      resolver.current = resolve
    })
  }, [])

  const close = (ok: boolean) => {
    resolver.current?.(ok)
    resolver.current = undefined
    setClosing(true)
  }

  return (
    <ConfirmContext.Provider value={confirm}>
      {children}
      {opts && (
        <div
          className={`fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-6 ${closing ? 'animate-fade-out pointer-events-none' : 'animate-fade-in'}`}
          onClick={() => close(false)}
          onAnimationEnd={(e) => {
            if (closing && e.target === e.currentTarget) {
              setOpts(null)
              setClosing(false)
            }
          }}
        >
          <div
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="confirm-title"
            className={`${closing ? 'animate-pop-out' : 'animate-pop'} w-full max-w-sm overflow-hidden rounded-2xl bg-panel shadow-2xl`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="rope h-[5px]" />
            <div className="px-6 pt-6 pb-5 text-center">
              <h2 id="confirm-title" className="text-3xl leading-tight">
                {opts.title}
              </h2>
              {opts.message && <p className="mt-2 text-xl leading-snug text-muted">{opts.message}</p>}
            </div>
            <div className="grid grid-cols-2 gap-3 px-5 pb-5">
              <button onClick={() => close(false)} className="rounded-xl bg-btn py-3 text-2xl active:opacity-70">
                {t.cancel}
              </button>
              <button
                onClick={() => close(true)}
                className={`rounded-xl py-3 text-2xl text-black active:opacity-70 ${opts.danger ? 'bg-rest' : 'bg-accent'}`}
              >
                {opts.confirmLabel}
              </button>
            </div>
          </div>
        </div>
      )}
    </ConfirmContext.Provider>
  )
}

export function useConfirm(): Confirm {
  const ctx = useContext(ConfirmContext)
  if (!ctx) throw new Error('useConfirm fuera de ConfirmProvider')
  return ctx
}
