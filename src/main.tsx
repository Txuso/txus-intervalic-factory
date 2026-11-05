import { Analytics } from '@vercel/analytics/react'
import { lazy, StrictMode, Suspense } from 'react'
import { createRoot } from 'react-dom/client'
import { registerSW } from 'virtual:pwa-register'
import App from './App'
import { ConfirmProvider } from './components/ConfirmDialog'
import { StoreProvider } from './storage/store'
import { initRipple } from './ripple'
import { initViewport } from './viewport'
import './styles.css'

registerSW({ immediate: true })
initViewport()
initRipple()

// Página oculta de diagnóstico del audio en iPhone: /?audiotest
const AudioTestScreen = lazy(() => import('./screens/AudioTestScreen').then((m) => ({ default: m.AudioTestScreen })))
const audioTest = new URLSearchParams(location.search).has('audiotest')

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <StoreProvider>
      <ConfirmProvider>
        {audioTest ? (
          <Suspense>
            <AudioTestScreen />
          </Suspense>
        ) : (
          <App />
        )}
        {/* Estadísticas anónimas de visitas (Vercel Web Analytics, sin cookies) */}
        <Analytics />
      </ConfirmProvider>
    </StoreProvider>
  </StrictMode>,
)
