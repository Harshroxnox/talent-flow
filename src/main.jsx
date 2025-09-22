import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from "react-router"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClient } from './app/queryClient.js'
import App from './app/App.jsx'
import './styles/index.css'

// Start MSW only in development
if (import.meta.env.VITE_ENV === 'development') {
  const { worker } = await import("./app/mocks/browser");
  worker.start();
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </QueryClientProvider>
  </StrictMode>,
)
