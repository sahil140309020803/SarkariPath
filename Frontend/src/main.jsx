import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App.jsx'
import { AuthProvider } from './context/AuthContext.jsx'
import { ExamProvider } from './context/ExamContext.jsx'
import { TestWindowProvider } from './context/TestWindowContext.jsx'
import { TestAnalysisProvider } from './context/TestAnalysisContext.jsx'
import { ThemeProvider } from './context/ThemeContext.jsx'
import { GoogleOAuthProvider } from '@react-oauth/google'

createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
      <AuthProvider>
        <ExamProvider>
          <TestWindowProvider>
            <TestAnalysisProvider>
              <ThemeProvider>
                <App />
              </ThemeProvider>
            </TestAnalysisProvider>
          </TestWindowProvider>
        </ExamProvider>
      </AuthProvider>
    </GoogleOAuthProvider>
  </BrowserRouter>
)
