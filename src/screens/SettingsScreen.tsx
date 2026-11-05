import { ChevronRight, Volume2 } from 'lucide-react'
import { useState, type ReactNode } from 'react'
import { isIOS, testSound, vibrationSupport } from '../audio/audio'
import { Brand } from '../components/Brand'
import { InstallHint } from '../components/InstallHint'
import { ScreenHeader } from '../components/ScreenHeader'
import { Toggle } from '../components/Toggle'
import { useT } from '../i18n'
import { LANGS } from '../i18n/lang'
import { shouldOfferInstall } from '../install'
import type { RockType } from '../domain/types'
import { useStore } from '../storage/store'

const ROCKS: RockType[] = ['limestone', 'granite', 'sandstone']

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

export function SettingsScreen({ onBack }: { onBack: () => void }) {
  const { settings, updateSettings } = useStore()
  const t = useT()
  const audible = settings.beeps || settings.voice
  const [installOpen, setInstallOpen] = useState(false)

  return (
    <div className="rock no-scrollbar h-full overflow-y-auto">
      <ScreenHeader title={t.settings} onBack={onBack} />
      <Brand size={110} />

      <h2 className="px-4 pt-2 pb-1 text-xl text-muted">{t.language}</h2>
      <div className="grid grid-cols-2 gap-2 px-4 pt-1 pb-4">
        {LANGS.map((l) => (
          <button
            key={l.id}
            onClick={() => updateSettings({ language: l.id })}
            aria-pressed={settings.language === l.id}
            className={`rounded-xl py-3 text-2xl active:opacity-70 ${
              settings.language === l.id ? 'bg-accent text-black' : 'bg-btn text-white'
            }`}
          >
            {l.name}
          </button>
        ))}
      </div>

      <h2 className="px-4 pt-2 pb-1 text-xl text-muted">{t.rockTitle}</h2>
      <div className="grid grid-cols-3 gap-2 px-4 pt-1 pb-4">
        {ROCKS.map((r) => (
          <button
            key={r}
            onClick={() => updateSettings({ rock: r })}
            aria-pressed={settings.rock === r}
            className={`rock rock-${r} flex h-20 items-end justify-center rounded-xl pb-2 text-2xl active:opacity-70 ${
              settings.rock === r ? 'text-accent ring-2 ring-accent' : 'text-white ring-1 ring-line'
            }`}
          >
            {t.rocks[r]}
          </button>
        ))}
      </div>

      <h2 className="px-4 pt-2 pb-1 text-xl text-muted">{t.alerts}</h2>
      <Row title={t.beeps} subtitle={t.beepsSub}>
        <Toggle checked={settings.beeps} onChange={(beeps) => updateSettings({ beeps })} />
      </Row>
      <Row title={t.voiceTitle} subtitle={t.voiceSub}>
        <Toggle checked={settings.voice} onChange={(voice) => updateSettings({ voice })} />
      </Row>
      <Row title={t.vibration} subtitle={t.vibrationNote[vibrationSupport]}>
        <Toggle
          checked={settings.vibration && vibrationSupport !== 'none'}
          disabled={vibrationSupport === 'none'}
          onChange={(vibration) => updateSettings({ vibration })}
        />
      </Row>

      <div className="border-b border-line px-4 py-4">
        <div className="flex items-center justify-between">
          <span className={`text-3xl leading-none ${audible ? '' : 'text-muted'}`}>{t.volume}</span>
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
            onClick={() => testSound(settings, t.voiceTest)}
            className="flex items-center gap-2 rounded-lg bg-btn px-4 py-2 text-xl text-accent active:opacity-70"
          >
            <Volume2 className="h-5 w-5" />
            {t.test}
          </button>
        </div>
        {isIOS && <p className="mt-3 text-base leading-snug text-muted">{t.silentNote}</p>}
      </div>

      <h2 className="px-4 pt-6 pb-1 text-xl text-muted">{t.screen}</h2>
      <Row title={t.keepAwake} subtitle={t.keepAwakeSub}>
        <Toggle checked={settings.keepAwake} onChange={(keepAwake) => updateSettings({ keepAwake })} />
      </Row>

      {shouldOfferInstall() && (
        <button onClick={() => setInstallOpen(true)} className="block w-full text-left active:bg-white/5">
          <Row title={t.install.settingsRow} subtitle={t.install.settingsSub}>
            <ChevronRight className="h-6 w-6 shrink-0 text-muted" />
          </Row>
        </button>
      )}
      <InstallHint open={installOpen} onClose={() => setInstallOpen(false)} />

      <p className="pb-safe px-4 pt-6 text-center text-lg text-muted">Txus Intervalic Factory · v{__APP_VERSION__}</p>
    </div>
  )
}
