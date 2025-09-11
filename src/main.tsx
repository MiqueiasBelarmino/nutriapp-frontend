
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Global error handler
window.addEventListener('error', (event) => {
  console.error('Global error:', event.error)
})

window.addEventListener('unhandledrejection', (event) => {
  console.error('Unhandled promise rejection:', event.reason)
})

const container = document.getElementById('root')

if (!container) {
  throw new Error('Root element not found')
}

const root = createRoot(container)

try {
  root.render(
    <StrictMode>
      <App />
    </StrictMode>
  )
} catch (error) {
  console.error('Failed to render app:', error)

  // Fallback rendering
  container.innerHTML = `
    <div style="
      min-height: 100vh; 
      display: flex; 
      align-items: center; 
      justify-content: center; 
      background-color: #f9fafb;
      font-family: system-ui, -apple-system, sans-serif;
    ">
      <div style="
        background: white; 
        padding: 2rem; 
        border-radius: 0.5rem; 
        box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
        text-align: center;
        max-width: 400px;
      ">
        <div style="font-size: 3rem; margin-bottom: 1rem;">⚠️</div>
        <h1 style="font-size: 1.5rem; font-weight: bold; margin-bottom: 1rem; color: #374151;">
          Erro de Inicialização
        </h1>
        <p style="color: #6b7280; margin-bottom: 1.5rem;">
          Não foi possível carregar a aplicação. Por favor, recarregue a página.
        </p>
        <button 
          onclick="window.location.reload()" 
          style="
            background-color: #10b981; 
            color: white; 
            padding: 0.5rem 1.5rem; 
            border-radius: 0.375rem; 
            border: none; 
            cursor: pointer;
            font-size: 1rem;
          "
        >
          Recarregar
        </button>
      </div>
    </div>
  `
}
