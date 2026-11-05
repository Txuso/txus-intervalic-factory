import { Analytics } from '@vercel/analytics/react'
import { StrictMode } from 'react'
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

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <StoreProvider>
      <ConfirmProvider>
        <App />
        {/* Estadísticas anónimas de visitas (Vercel Web Analytics, sin cookies) */}
        <Analytics />
      </ConfirmProvider>
    </StoreProvider>
  </StrictMode>,
)
