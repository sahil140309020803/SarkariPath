import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App.jsx'
import { UserProvider } from './context/UserContext.jsx'
import { ExamProvider } from './context/ExamContext.jsx'
import { TestWindowProvider } from './context/TestWindowContext.jsx'
import { TestAnalysisProvider } from './context/TestAnalysisContext.jsx'
import { ThemeProvider } from './context/ThemeContext.jsx'
import { GoogleOAuthProvider } from '@react-oauth/google'
import { Analytics } from "@vercel/analytics/react"

createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
      <UserProvider>
        <ExamProvider>
          <TestWindowProvider>
            <TestAnalysisProvider>
              <ThemeProvider>
                <App />
                <Analytics />
              </ThemeProvider>
            </TestAnalysisProvider>
          </TestWindowProvider>
        </ExamProvider>
      </UserProvider>
    </GoogleOAuthProvider>
  </BrowserRouter>
)
