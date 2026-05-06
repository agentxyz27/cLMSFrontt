import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { AuthProvider } from '../providers/authProvider'
import ErrorBoundary from '../shared/components/errorBoundary.tsx'
import { TooltipProvider } from '@/components/ui/tooltip.tsx'
import './index.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <ErrorBoundary>
          <TooltipProvider>    
            <App />
          </TooltipProvider>
        </ErrorBoundary>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>
)