import React, { useContext } from 'react'
import { Route, Routes, Navigate } from 'react-router-dom'
import Home from './pages/Home'
import Authentication from './pages/Authentication'
import ExamDash from './pages/ExamDash'
import { ToastContainer } from 'react-toastify'
// import { AppContent } from './context/AppContext'
import BeautifulLoadingScreen from './components/BeautifulLoadingScreen'
import AdminPage from './pages/AdminPage'
import { useUser } from './context/UserContext'
import TestInstruction from './components/Test Window/TestInstruction'
import TestWindow from './pages/TestWindow'
import Analysis from './pages/Analysis'
import UserDashboard from './pages/UserDashboard'
import VerifyEmail from './pages/VerifyEmail'
import ForgotPassword from './pages/ForgotPassword'
import ProtectedRoute from './components/ProtectedRoute'
import NotFound from './pages/NotFound'
import VisitorTracker from './components/VisitorTracker'
import AnalyticsTracker from './components/AnalyticsTracker'
import { initAnalytics } from './utils/analytics'
import { initClarity } from './utils/clarity'

// Initialize GA4 and Clarity once at application startup (safe to call in module scope)
initAnalytics();
initClarity();


const App = () => {
  const { isLoading } = useUser();

  return (
    <div>
      <VisitorTracker />
      <AnalyticsTracker />
      <ToastContainer autoClose={2000} />
      <Routes>
        {/* Public Routes */}
        <Route path='/' element={<Home />} />
        <Route path='/signup' element={<Authentication initialIsLogin={false} />} />
        <Route path='/login' element={<Authentication initialIsLogin={true} />} />
        <Route path='/verify-email' element={<VerifyEmail />} />
        <Route path='/forgot-password' element={<ForgotPassword />} />
        <Route path='/404' element={<NotFound />} />

        {/* Protected Routes */}
        <Route path='/admin-page' element={<ProtectedRoute><AdminPage /></ProtectedRoute>} />
        <Route path='/dashboard' element={<ProtectedRoute><UserDashboard /></ProtectedRoute>} />
        <Route path='/c/:exam_name' element={<ProtectedRoute><ExamDash /></ProtectedRoute>} />
        <Route path='/tests/:testID'>
          <Route path='' element={<ProtectedRoute><TestInstruction /></ProtectedRoute>} />
          <Route path='live-test' element={<ProtectedRoute><TestWindow /></ProtectedRoute>} />
        </Route>
        <Route path='/analysis/:submissionId' element={<ProtectedRoute><Analysis /></ProtectedRoute>} />

        {/* Fallback Wildcard Route */}
        <Route path='*' element={<Navigate to="/404" replace />} />
      </Routes>
      {isLoading && <BeautifulLoadingScreen message="Initializing SarkariPath..." />}
    </div>
  )
}

export default App;