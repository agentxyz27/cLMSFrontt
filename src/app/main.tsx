import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { AuthProvider } from '../providers/authProvider'
import ErrorBoundary from '../shared/components/errorBoundary.tsx'
import { TooltipProvider } from '@/components/ui/tooltip.tsx'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import '@/shared/components/interactions/dragMatch/skins'
import './index.css'
import App from './App.tsx'

const queryClient = new QueryClient()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <ErrorBoundary>
            <TooltipProvider>    
              <App />
            </TooltipProvider>
          </ErrorBoundary>
        </AuthProvider>
      </QueryClientProvider>
    </BrowserRouter>
  </StrictMode>
)