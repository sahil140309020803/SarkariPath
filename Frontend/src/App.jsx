import React, { useContext } from 'react'
import { Route, Routes } from 'react-router-dom'
import Home from './pages/Home'
import Authentication from './pages/Authentication'
import ExamDash from './pages/ExamDash'
import { ToastContainer } from 'react-toastify'
// import { AppContent } from './context/AppContext'
import BeautifulLoadingScreen from './components/BeautifulLoadingScreen'
import AdminPage from './pages/AdminPage'
import { useAuth } from './context/AuthContext'
import TestInstruction from './components/Test Window/TestInstruction'
import TestWindow from './pages/TestWindow'
import Analysis from './pages/Analysis'
import UserDashboard from './pages/UserDashboard'
import VerifyEmail from './pages/VerifyEmail'
import ForgotPassword from './pages/ForgotPassword'

const App = () => {
  const { isLoading } = useAuth();

  return (
    <div>

      <ToastContainer />
      <Routes>
        <Route path='/' element={<Home />} />
        <Route path='/signup' element={<Authentication initialIsLogin={false} />} />
        <Route path='/login' element={<Authentication initialIsLogin={true} />} />
        <Route path='/verify-email' element={<VerifyEmail />} />
        <Route path='/forgot-password' element={<ForgotPassword />} />
        <Route path='/admin-page' element={<AdminPage />} />
        <Route path='/dashboard/:userId' element={<UserDashboard />} />
        <Route path='/:exam_cat/:exam_name' element={<ExamDash />} />
        <Route path='/tests/:testID'>
          <Route path='' element={<TestInstruction />} />
          <Route path='live-test' element={<TestWindow />} />
        </Route>
        <Route path='/analysis/:submissionId' element={<Analysis />} />
      </Routes>
      {isLoading && <BeautifulLoadingScreen message="Initializing session..." />}
    </div>
  )
}

export default App;