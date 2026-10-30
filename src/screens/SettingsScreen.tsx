import { Download, Upload, Volume2 } from 'lucide-react'
import { useRef, type ReactNode } from 'react'
import { testSound, vibrationSupport } from '../audio/audio'
import { Brand } from '../components/Brand'
import { ScreenHeader } from '../components/ScreenHeader'
import { Toggle } from '../components/Toggle'
import { useStore } from '../storage/store'

function Row({ title, subtitle, children }: { title: string; subtitle?: string; children: ReactNode }) {
  return (
    <div className="flex items-center gap-4 border-b border-line px-4 py-4">
      <div className="min-w-0 flex-1">
        <div className="text-3xl leading-none">{title}</div>
        {subtitle && <div className="mt-1 text-lg leading-tight text-muted">{subtitle}</div>}
      </div>
      {children}
    </div>
  )
}

const VIBRATION_NOTE = {
  native: 'Vibra al cambiar de fase y en la cuenta atrás',
  'ios-haptic': 'En iPhone es un toque suave (iOS 18 o superior)',
  none: 'No disponible en este dispositivo',
}

export function SettingsScreen({ onBack }: { onBack: () => void }) {
  const { settings, updateSettings, exportData, importData } = useStore()
  const fileInput = useRef<HTMLInputElement>(null)
  const audible = settings.beeps || settings.voice

  const doExport = async () => {
    const name = `txus-intervalic-${new Date().toISOString().slice(0, 10)}.json`
    const file = new File([exportData()], name, { type: 'application/json' })
    if (navigator.canShare?.({ files: [file] })) {
      try {
        await navigator.share({ files: [file], title: 'Txus Intervalic Factory' })
        return
      } catch {
        // Cancelado: se cae a la descarga normal
      }
    }
    const url = URL.createObjectURL(file)
    const a = document.createElement('a')
    a.href = url
    a.download = name
    a.click()
    URL.revokeObjectURL(url)
  }

  const doImport = async (file: File | undefined) => {
    if (!file) return
    if (!confirm('Se sustituirán tus entrenos, historial y ajustes por los del archivo. ¿Continuar?')) return
    try {
      importData(await file.text())
      alert('Datos importados')
    } catch (e) {
      alert(e instanceof Error ? e.message : 'No se pudo importar el archivo')
    }
  }

  return (
    <div className="rock no-scrollbar h-full overflow-y-auto">
      <ScreenHeader title="Ajustes" onBack={onBack} />
      <Brand size={110} />

      <h2 className="px-4 pt-2 pb-1 text-xl text-muted">Avisos</h2>
      <Row title="Pitidos" subtitle="Cuenta atrás 3-2-1 y cambio de fase">
        <Toggle checked={settings.beeps} onChange={(beeps) => updateSettings({ beeps })} />
      </Row>
      <Row title="Voz" subtitle="Anuncia cada fase: «¡Entrenar!», «Descansar»…">
        <Toggle checked={settings.voice} onChange={(voice) => updateSettings({ voice })} />
      </Row>
      <Row title="Vibración" subtitle={VIBRATION_NOTE[vibrationSupport]}>
        <Toggle
          checked={settings.vibration && vibrationSupport !== 'none'}
          disabled={vibrationSupport === 'none'}
          onChange={(vibration) => updateSettings({ vibration })}
        />
      </Row>

      <div className="border-b border-line px-4 py-4">
        <div className="flex items-center justify-between">
          <span className={`text-3xl leading-none ${audible ? '' : 'text-muted'}`}>Volumen</span>
          <span className="tabular text-3xl text-accent">{Math.round(settings.volume * 100)}%</span>
        </div>
        <div className="mt-4 flex items-center gap-4">
          <input
            type="range"
            min={0}
            max={100}
            value={Math.round(settings.volume * 100)}
            disabled={!audible}
            onChange={(e) => updateSettings({ volume: Number(e.target.value) / 100 })}
            className="volume flex-1"
            style={{ '--fill': `${settings.volume * 100}%` } as React.CSSProperties}
          />
          <button
            onClick={() => testSound(settings)}
            className="flex items-center gap-2 rounded-lg bg-btn px-4 py-2 text-xl text-accent active:opacity-70"
          >
            <Volume2 className="h-5 w-5" />
            Probar
          </button>
        </div>
      </div>

      <h2 className="px-4 pt-6 pb-1 text-xl text-muted">Pantalla</h2>
      <Row title="Mantener pantalla encendida" subtitle="Evita que el móvil se bloquee durante el entreno">
        <Toggle checked={settings.keepAwake} onChange={(keepAwake) => updateSettings({ keepAwake })} />
      </Row>

      <h2 className="px-4 pt-6 pb-1 text-xl text-muted">Copia de seguridad</h2>
      <div className="flex gap-3 px-4 py-3">
        <button onClick={doExport} className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-btn py-3 text-xl active:opacity-70">
          <Download className="h-5 w-5" />
          Exportar
        </button>
        <button onClick={() => fileInput.current?.click()} className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-btn py-3 text-xl active:opacity-70">
          <Upload className="h-5 w-5" />
          Importar
        </button>
        <input
          ref={fileInput}
          type="file"
          accept="application/json,.json"
          className="hidden"
          onChange={(e) => {
            void doImport(e.target.files?.[0])
            e.target.value = ''
          }}
        />
      </div>

      <p className="pb-safe px-4 pt-6 text-center text-lg text-muted">Txus Intervalic Factory · v{__APP_VERSION__}</p>
    </div>
  )
}
