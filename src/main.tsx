import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { registerSW } from 'virtual:pwa-register'
import App from './App'
import { ConfirmProvider } from './components/ConfirmDialog'
import { StoreProvider } from './storage/store'
import { initViewport } from './viewport'
import './styles.css'

registerSW({ immediate: true })
initViewport()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <StoreProvider>
      <ConfirmProvider>
        <App />
      </ConfirmProvider>
    </StoreProvider>
  </StrictMode>,
)
