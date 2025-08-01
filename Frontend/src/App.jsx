import React from 'react'
import { Route, Routes } from 'react-router-dom'
import Home from './pages/Home'
import Signup from './pages/Signup'
import Login from './pages/Login'
import ExamDash from './pages/ExamDash'

const App = () => {
  return (
    <Routes>
      <Route path='/' element={<Home />} />
      <Route path='/signup' element={<Signup />} />
      <Route path='/login' element={<Login />} />
      <Route path='/:exam_cat/:exam_name' element={<ExamDash />} />
    </Routes>
  )
}

export default App;