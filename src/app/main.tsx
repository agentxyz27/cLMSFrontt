import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { AuthProvider } from '../providers/authProvider'
import { ThemeProvider } from '../providers/themeProvider.tsx'
import AppBackground from '../shared/components/ui/AppBackground.tsx'
import ErrorBoundary from '../shared/components/errorBoundary.tsx'
import './index.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <ErrorBoundary>
            <AppBackground />
            <App />
          </ErrorBoundary>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  </StrictMode>
)