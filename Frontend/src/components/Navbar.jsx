import React from 'react';
import LOGO from '../assets/LOGO.png';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';
import { useExam } from '../context/ExamContext';
import { LogOut, LayoutDashboard, UserCircle, BookOpen } from 'lucide-react';
import ThemeToggle from './ThemeToggle';

const Navbar = () => {
  const navigate = useNavigate();
  const { isLoggedIn, setIsLoggedIn, userDetails, setUserDetails, backend_url } = useAuth();
  const { setActiveList } = useExam();

  const handleLogOut = async () => {
    if(!userDetails) return;
    try {
      const { data } = await axios.post(`${backend_url}/api/auth/${userDetails.role}/logout`);
      if(data.success) {
        setIsLoggedIn(false);
        setUserDetails(null);
        toast.success(data.message);
        navigate('/');
      }
    } catch(err) {
      toast.error("Error logging out. Please try again.");
    }
  }

  const handleLogoClick = () => {
    setActiveList(null);
    navigate('/');
  }

  const handleExamClick = () => {
    setActiveList(null);
    navigate("/#exam-categories");
  }

  return (
    <nav className="w-full bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 sticky top-0 z-50 shadow-sm transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          
          {/* Logo Section */}
          <div onClick={handleLogoClick} className="flex items-center gap-3 cursor-pointer group">
            <div className="relative">
              <div className="absolute inset-0 bg-blue-500 rounded-full blur/20 group-hover:blur/40 transition-all opacity-20"></div>
              <img src={LOGO} alt="logo" className="w-12 h-12 relative transform group-hover:scale-105 group-hover:rotate-6 transition-all duration-300 object-contain"/>
            </div>
            <div className="font-extrabold text-2xl tracking-tight text-slate-800 dark:text-white flex items-center transition-colors">
              Sarkari<span className="text-blue-600 dark:text-cyan-400">Path</span>
            </div>
          </div>

          {/* Center Navigation Actions */}
          <div className="hidden md:flex items-center gap-8">
            <button onClick={handleExamClick} className="flex items-center gap-2 text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-cyan-400 font-semibold transition-colors duration-200 text-sm tracking-wide">
               <BookOpen size={18} />
               Explore Exams
            </button>
            {userDetails?.role === 'admin' && (
              <button onClick={() => navigate('/admin-page')} className="flex items-center gap-2 text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 font-semibold transition-colors duration-200 text-sm tracking-wide">
                <LayoutDashboard size={18} />
                Admin Dashboard
              </button>
            )}
            {userDetails?.role === 'user' && (
              <button onClick={() => navigate(`/dashboard/${userDetails.email}`)} className="flex items-center gap-2 text-slate-600 dark:text-slate-300 hover:text-cyan-600 dark:hover:text-cyan-400 font-semibold transition-colors duration-200 text-sm tracking-wide">
                <LayoutDashboard size={18} />
                My Dashboard
              </button>
            )}
          </div>

          {/* Right Login/Signup/Profile & Theme Toggle */}
          <div className="flex items-center gap-4">
            <ThemeToggle />
            {!isLoggedIn ? (
              <div className="flex items-center gap-3">
                <button onClick={() => navigate('/login')} className="px-5 py-2.5 rounded-xl text-slate-700 dark:text-slate-200 font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 border border-transparent hover:border-slate-200 dark:hover:border-slate-700 transition-all text-sm tracking-wide">
                  Login
                </button>
                <button onClick={() => navigate('/signup')} className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 dark:bg-indigo-600 dark:hover:bg-indigo-500 text-white font-semibold shadow hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 text-sm tracking-wide border border-transparent">
                  Sign Up
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 cursor-pointer hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 dark:from-indigo-500 dark:to-cyan-400 text-white font-bold flex justify-center items-center text-sm shadow-sm">
                    {userDetails?.name ? userDetails.name.substring(0, 2).toUpperCase() : 'U'}
                  </div>
                  <span className="text-sm font-semibold text-slate-700 dark:text-slate-300 hidden sm:block pr-2">
                    {userDetails?.name ? userDetails.name.split(' ')[0] : 'User'}
                  </span>
                </div>
                <button onClick={handleLogOut} className="p-2.5 rounded-xl text-slate-500 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors border border-transparent">
                  <LogOut size={20} />
                </button>
              </div>
            )}
          </div>

        </div>
      </div>
    </nav>
  );
}

export default Navbar;