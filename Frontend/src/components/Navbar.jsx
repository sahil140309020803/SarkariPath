import React, { useContext } from 'react'
import LOGO from '../assets/LOGO.png';
import { Link, NavLink, useNavigate } from 'react-router-dom';
// import { AppContent } from '../context/AppContext';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';
import { useExam } from '../context/ExamContext';

const Navbar = () => {
  const navigate = useNavigate();
  // const { scrollToExams, activeList, setActiveList, isLoggedIn, setIsLoggedIn, userDetails, setUserDetails, backend_url } = useContext(AppContent);

  const { isLoggedIn, setIsLoggedIn, userDetails, setUserDetails, backend_url } = useAuth();
  const {
    setActiveList,
} = useExam();

  // const handleScroll = () => {
  //   navigate('/');
  //   setActiveList(null);
  //   scrollToExams.current.scrollIntoView({ behavior: 'smooth' });
  // }

  const handleLogOut = async () => {
    if(!userDetails)
      return;
    try {
      const { data } = await axios.post(`${backend_url}/api/auth/${userDetails.role}/logout`);
      if(data.success) {
        setIsLoggedIn(false);
        setUserDetails(null);
        toast.success(data.message);
        navigate('/');
      }
    }catch(err) {
      toast.error("Error logging out. Please try again.");
    }
  }

  const handleLogoClick = () => {
    setActiveList(null);
    navigate('/');
  }
  const handleExamClick = () => {
    setActiveList(null);
    navigate("/#exam-categories")
  }
  // console.log('User Details in Navbar:', userDetails);

  return (
    <div className='min-w-full flex justify-between items-center border-b rounded border-blue-900 pl-7 pr-10 pt-1 pb-1 sticky top-0 shadow-xl shadow-blue-100 z-1 bg-white'>
      {/* Logo Section */}
      <div onClick={() => handleLogoClick()}  className='flex justify-center items-center group cursor-pointer'>
        <img src={LOGO} alt="logo" className='w-12 group-hover:rotate-360 transition-all duration-1200'/>
        <div className='font-bold text-2xl text-blue-900 group-hover:bg-blend-overlay'>SarkariPath</div>
      </div>

      {/* Exam Categories */}
      <div className='flex justify-center items-center gap-5'>
        <div onClick={() => handleExamClick()} className='font-semibold text-[18px] p-[5px] rounded pr-3 pl-3 text-blue-900 cursor-pointer hover:text-blue-500 transition-colors duration-400'>Exams</div>
        {userDetails && userDetails.role === 'admin' && <div onClick={() => navigate('/admin-page')} className='font-semibold text-[18px] p-[5px] rounded pr-3 pl-3 text-blue-900 cursor-pointer hover:text-blue-500 transition-colors duration-400'>Admin Dashboard</div>}
      </div>

      {/* Login/SignUp Section */}
      {!isLoggedIn && <div className='flex justify-between items-center gap-10'>
        <button onClick={() => navigate('/login')} className='border border-blue-900 p-[6px] pr-4 pl-4 rounded-xl text-blue-800 hover:bg-blue-700 hover:text-white transition-all duration-600 cursor-pointer font-semibold ease-in-out'>Login</button>
        <button onClick={() => navigate('/signup')} className='border border-blue-900 p-[6px] pr-4 pl-4 rounded-xl text-white bg-blue-700 hover:bg-white hover:text-blue-800 transition-all duration-600 cursor-pointer font-semibold'>Sign Up</button>
      </div>}
      {isLoggedIn && <div className='flex gap-5'>
        <div className='size-10 rounded-full bg-linear-to-t from-sky-500 to-indigo-600 text-white font-semibold text-xl pb-0.5 cursor-pointer flex justify-center items-center'>{userDetails && (userDetails.name.split(" ").length > 1 ? userDetails.name.split(" ")[0][0] + userDetails.name.split(" ")[1][0] : userDetails.name[0])}</div>
        <button onClick={handleLogOut} className='border border-blue-900 p-[6px] pr-4 pl-4 rounded-xl text-blue-800 hover:bg-linear-to-r hover:from-blue-600 hover:to-blue-500 hover:text-white transition-all duration-600 cursor-pointer font-semibold ease-in-out'>Logout</button>
      </div>}
    </div>
  )
}

export default Navbar;