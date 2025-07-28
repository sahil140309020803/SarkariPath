import React, { useContext } from 'react'
import LOGO from '../assets/LOGO.png';
import { useNavigate } from 'react-router-dom'
import { AppContent } from '../context/AppContext';
const Navbar = () => {
  const navigate = useNavigate();
  const { scrollToExams } = useContext(AppContent);

  const handleScroll = () => {
    scrollToExams.current.scrollIntoView({ behavior: 'smooth' });
  }

  return (
    <div className='min-w-full flex justify-between items-center border-b rounded border-blue-900 pl-7 pr-10 pt-1 pb-1 sticky top-0 shadow-xl shadow-blue-100 z-10 bg-white'>
      {/* Logo Section */}
      <div onClick={() => navigate('/')}  className='flex justify-center items-center group cursor-pointer'>
        <img src={LOGO} alt="logo" className='w-12 group-hover:rotate-360 transition-all duration-1200'/>
        <div className='font-bold text-2xl text-blue-900 group-hover:bg-blend-overlay'>SarkariPath</div>
      </div>

      {/* Exam Categories */}
      <div>
        <button onClick={() => handleScroll()} className='font-semibold text-[19px] p-[5px] rounded pr-3 pl-3 text-blue-900 cursor-pointer hover:text-blue-500 hover:bg-[#e3ebff] transition-colors duration-400'>Exams</button>
      </div>

      {/* Login/SignUp Section */}
      <div className='flex justify-between items-center gap-10'>
        <button onClick={() => navigate('/login')} className='border border-blue-900 p-[6px] pr-4 pl-4 rounded-xl text-blue-800 hover:bg-blue-700 hover:text-white transition-all duration-600 cursor-pointer font-semibold ease-in-out'>Login</button>
        <button onClick={() => navigate('signup')} className='border border-blue-900 p-[6px] pr-4 pl-4 rounded-xl text-white bg-blue-700 hover:bg-white hover:text-blue-800 transition-all duration-600 cursor-pointer font-semibold'>Sign Up</button>
      </div>
    </div>
  )
}

export default Navbar;