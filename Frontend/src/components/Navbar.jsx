import React from 'react';
import LOGO from '../assets/LOGO.png';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useUser } from '../context/UserContext';
import { useExam } from '../context/ExamContext';
import { LogOut, LayoutDashboard, UserCircle, BookOpen, Menu, X, Flame } from 'lucide-react';
import ThemeToggle from './ThemeToggle';

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isLoggedIn, setIsLoggedIn, userDetails, setUserDetails, backend_url, fetchUserDashboardData, dashboardData } = useUser();
  const { setActiveList } = useExam();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  const handleLogOut = async () => {
    if (!userDetails) return;
    try {
      const { data } = await axios.post(`${backend_url}/api/auth/${userDetails.role}/logout`);
      if (data.success) {
        setIsLoggedIn(false);
        setUserDetails(null);
        toast.success(data.message);
        navigate('/');
      }
    } catch (err) {
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

  const handleDashboardClick = () => {
    if (userDetails?.role === 'admin') {
      navigate(`/admin-page`);
    } else {
      if (location.pathname === '/dashboard') {
        fetchUserDashboardData();
      } else {
        navigate(`/dashboard`);
      }
    }
  }

  return (
    <nav className="w-full bg-white dark:bg-slate-900 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 sticky top-0 z-50 shadow-sm transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">

          {/* Logo Section */}
          <div onClick={handleLogoClick} className="flex items-center gap-3 cursor-pointer group">
            <div className="relative">
              <div className="absolute inset-0 bg-blue-500 rounded-full blur/20 group-hover:blur/40 transition-all opacity-20"></div>
              <img src={LOGO} alt="logo" className="w-12 h-12 relative transform group-hover:scale-105 group-hover:rotate-6 transition-all duration-300 object-contain" />
            </div>
            <div className="font-bold text-2xl tracking-tight text-slate-800 dark:text-white flex items-center transition-colors">
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
              <button onClick={() => handleDashboardClick()} className="flex items-center gap-2 text-slate-600 dark:text-slate-300 hover:text-cyan-600 dark:hover:text-cyan-400 font-semibold transition-colors duration-200 text-sm tracking-wide">
                <LayoutDashboard size={18} />
                My Dashboard
              </button>
            )}
          </div>

          {/* Right Login/Signup/Profile & Theme Toggle */}
          <div className="flex items-center gap-4">
            {userDetails?.role === 'user' && isLoggedIn && (
              <div className="flex items-center gap-1.5 select-none cursor-pointer py-1 mx-2">
                {(dashboardData?.currentStreak || 0) > 0 ? (
                  <div className='hover:bg-orange-500/10 rounded-xl px-3 py-2 transition-colors duration-200 flex justify-center items-center gap-1.5'>
                    <Flame className="w-6 h-6 text-orange-500 fill-orange-500" />
                    <span className="text-orange-500 dark:text-orange-400 font-semibold text-sm sm:text-lg leading-none">
                      {dashboardData.currentStreak}
                    </span>
                  </div>
                ) : (
                  <div className="flex items-center justify-center gap-1.5 hover:bg-slate-500/10 rounded-xl px-3 py-2 transition-colors duration-200">
                    <Flame className="w-6 h-6 text-slate-400 dark:text-slate-500" />
                    <span className="text-slate-400 dark:text-slate-500 font-semibold text-sm sm:text-lg leading-none">
                      0
                    </span>
                  </div>
                )}
              </div>
            )}
            <ThemeToggle />
            {!isLoggedIn ? (
              <div className="hidden sm:flex items-center gap-3">
                <button onClick={() => navigate('/login')} className="px-5 py-2.5 rounded-xl text-slate-700 dark:text-slate-200 font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 border border-transparent hover:border-slate-200 dark:hover:border-slate-700 transition-all text-sm tracking-wide">
                  Login
                </button>
                <button onClick={() => navigate('/signup')} className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 dark:bg-indigo-600 dark:hover:bg-indigo-500 text-white font-semibold shadow hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 text-sm tracking-wide border border-transparent">
                  Sign Up
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-4">

                {/* User Profile */}
                <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 cursor-pointer hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 dark:from-indigo-500 dark:to-cyan-400 text-white font-bold flex justify-center items-center text-sm shadow-sm">
                    {userDetails?.name ? userDetails.name.substring(0, 1).toUpperCase() : 'U'}
                  </div>
                  <span className="text-sm font-semibold text-slate-700 dark:text-slate-300 hidden sm:block pr-2">
                    {userDetails?.name ? userDetails.name.split(' ')[0] : 'User'}
                  </span>
                </div>
                <button onClick={handleLogOut} className="hidden sm:block p-2.5 rounded-xl text-slate-500 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors border border-transparent">
                  <LogOut size={20} />
                </button>
              </div>
            )}

            {/* Hamburger Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2.5 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 transition-all md:hidden block"
            >
              {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Menu Panel */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 pt-2 pb-4 space-y-2 transition-all duration-300">
          <button onClick={() => { handleExamClick(); setIsMobileMenuOpen(false); }} className="w-full text-left flex items-center gap-2 py-3 px-4 rounded-xl text-slate-600 dark:text-slate-300 font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
            <BookOpen size={18} />
            Explore Exams
          </button>
          {userDetails?.role === 'admin' && (
            <button onClick={() => { navigate('/admin-page'); setIsMobileMenuOpen(false); }} className="w-full text-left flex items-center gap-2 py-3 px-4 rounded-xl text-slate-600 dark:text-slate-300 font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
              <LayoutDashboard size={18} />
              Admin Dashboard
            </button>
          )}
          {userDetails?.role === 'user' && (
            <button onClick={() => { handleDashboardClick(); setIsMobileMenuOpen(false); }} className="w-full text-left flex items-center gap-2 py-3 px-4 rounded-xl text-slate-600 dark:text-slate-300 font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
              <LayoutDashboard size={18} />
              My Dashboard
            </button>
          )}
          {!isLoggedIn ? (
            <div className="flex flex-col gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <button onClick={() => { navigate('/login'); setIsMobileMenuOpen(false); }} className="w-full py-2.5 rounded-xl text-slate-700 dark:text-slate-200 font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 transition-all text-center">
                Login
              </button>
              <button onClick={() => { navigate('/signup'); setIsMobileMenuOpen(false); }} className="w-full py-2.5 rounded-xl bg-blue-600 dark:bg-indigo-600 text-white font-semibold text-center hover:bg-blue-700 dark:hover:bg-indigo-500 shadow transition-all">
                Sign Up
              </button>
            </div>
          ) : (
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 sm:hidden">
              <button onClick={() => { handleLogOut(); setIsMobileMenuOpen(false); }} className="w-full text-left flex items-center gap-2 py-3 px-4 rounded-xl text-red-600 dark:text-red-400 font-semibold hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors">
                <LogOut size={18} />
                Logout
              </button>
            </div>
          )}
        </div>
      )}
    </nav>
  );
}

export default Navbar;