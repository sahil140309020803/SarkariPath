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


createRoot(document.getElementById('root')).render(
  <BrowserRouter>
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
  </BrowserRouter>
)
