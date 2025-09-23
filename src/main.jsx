import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from "react-router"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClient } from './app/queryClient.js'
import { initDbIfNeeded } from './app/db/index.js'
import { Toaster } from 'react-hot-toast'
import App from './app/App.jsx'
import './styles/index.css'

// Start MSW 
const { worker } = await import("./app/mocks/browser");
worker.start();


await initDbIfNeeded();

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <App />
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: '#241d22ff',
              color: '#eae9fc',
              border: '1px solid #343434ff',
            },
          }}
        />
      </BrowserRouter>
    </QueryClientProvider>
  </StrictMode>,
)
