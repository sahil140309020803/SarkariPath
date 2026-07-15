import React from 'react';
import LOGO from '../assets/LOGO.png';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useUser } from '../context/UserContext';
import { useExam } from '../context/ExamContext';
import { LogOut, LayoutDashboard, UserCircle, BookOpen, Menu, X, Flame, Search } from 'lucide-react';
import ThemeToggle from './ThemeToggle';
import { trackEvent } from '../utils/analytics';
import { clearUser, trackEvent as clarityTrackEvent } from '../utils/clarity';

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isLoggedIn, setIsLoggedIn, userDetails, setUserDetails, backend_url, fetchUserDashboardData, dashboardData } = useUser();
  const { setActiveList, setIsExamDataFetched, examCatList } = useExam();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  const [searchQuery, setSearchQuery] = React.useState('');
  const [showResults, setShowResults] = React.useState(false);

  const searchContainerRef = React.useRef(null);
  const mobileSearchContainerRef = React.useRef(null);

  // Flatten all exams from categories list dynamically
  const allExams = React.useMemo(() => {
    if (!examCatList || !Array.isArray(examCatList)) return [];
    const exams = [];
    examCatList.forEach(category => {
      if (category.Exams && Array.isArray(category.Exams)) {
        category.Exams.forEach(exam => {
          exams.push({
            _id: exam._id,
            name: exam.Name,
            categoryName: category.Name
          });
        });
      }
    });
    return exams;
  }, [examCatList]);

  // Filter exams based on search query
  const filteredExams = React.useMemo(() => {
    if (!searchQuery.trim()) return [];
    const query = searchQuery.toLowerCase();
    return allExams.filter(exam => exam.name.toLowerCase().includes(query));
  }, [searchQuery, allExams]);

  // Check if today a test has been attempted
  const hasAttemptedToday = React.useMemo(() => {
    if (!dashboardData || !Array.isArray(dashboardData.dailyStatistics)) return false;

    // Get current local date string in YYYY-MM-DD format
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    const todayStr = `${year}-${month}-${day}`;

    const todayEntry = dashboardData.dailyStatistics.find(entry => entry.date === todayStr);
    return todayEntry ? (todayEntry.testsAttempted > 0) : false;
  }, [dashboardData]);

  const createSlug = (text) => {
    return text.replaceAll(' ', '-');
  };

  const handleExamSelect = async (examName) => {
    setSearchQuery('');
    setShowResults(false);
    setActiveList(null);
    setIsExamDataFetched(null);
    // Brief delay for smoother transitions
    await new Promise(resolve => setTimeout(resolve, 250));
    navigate(`/c/${createSlug(examName)}`);
  };

  React.useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        (searchContainerRef.current && !searchContainerRef.current.contains(event.target)) &&
        (mobileSearchContainerRef.current && !mobileSearchContainerRef.current.contains(event.target))
      ) {
        setShowResults(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleLogOut = async () => {
    if (!userDetails) return;
    try {
      const { data } = await axios.post(`${backend_url}/api/auth/${userDetails.role}/logout`);
      if (data.success) {
        trackEvent('logout');
        clarityTrackEvent('logout');
        clearUser();
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
      <div className="max-w-[85rem] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">

          <div className="flex items-center gap-4 lg:gap-16">
            {/* Logo Section */}
            <div onClick={handleLogoClick} className="flex items-center cursor-pointer group gap-2 sm:gap-4">
              <img src={LOGO} alt="logo" className="max-[23rem]:w-8 max-[23rem]:h-8 w-10 h-10  transform group-hover:scale-105 group-hover:rotate-6 transition-all duration-300" />
              <div className="font-bold max-[23rem]:text-xl text-2xl tracking-tight text-slate-800 dark:text-white flex items-center transition-colors">
                Sarkari<span className="text-blue-600 dark:text-cyan-400">Path</span>
              </div>
            </div>

            {/* Center Navigation Actions */}
            <div className="hidden lg:flex items-center gap-4 lg:gap-8">
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
          </div>



          {/* Right Login/Signup/Profile & Theme Toggle */}
          <div className="flex items-center gap-2 lg:gap-4">

            {/* Desktop Search Bar */}
            <div ref={searchContainerRef} className="hidden md:block relative w-40 lg:w-56 xl:w-72">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search Exams..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setShowResults(true);
                  }}
                  onFocus={() => setShowResults(true)}
                  className="w-full bg-slate-100/50  dark:bg-slate-800 text-slate-800 dark:text-slate-200 pl-10 pr-4 py-2 rounded-xl text-sm border border-slate-300/80 dark:border-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:focus:ring-cyan-400 focus:border-transparent transition-all"
                />
                <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
              </div>

              {/* Dropdown Results */}
              {showResults && filteredExams.length > 0 && (
                <div className="absolute left-0 right-0 mt-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl z-50 max-h-60 overflow-y-auto custom-scrollbar transition-all divide-y divide-slate-100 dark:divide-slate-800">
                  {filteredExams.map((exam) => (
                    <div
                      key={exam._id}
                      onClick={() => handleExamSelect(exam.name)}
                      className="px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-800/60 cursor-pointer transition-colors text-left"
                    >
                      <div className="font-semibold text-slate-800 dark:text-slate-100 text-sm">
                        {exam.name}
                      </div>
                      <div className="text-[10px] text-slate-450 dark:text-slate-500 uppercase tracking-widest font-bold mt-0.5">
                        {exam.categoryName}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* No results message */}
              {showResults && searchQuery.trim() && filteredExams.length === 0 && (
                <div className="absolute left-0 right-0 mt-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl z-50 p-4 text-center text-slate-500 dark:text-slate-400 text-xs">
                  No exams found matching "{searchQuery}"
                </div>
              )}
            </div>
            {userDetails?.role === 'user' && isLoggedIn && (
              <div className="flex items-center gap-1.5 select-none cursor-pointer py-1">
                {(dashboardData?.currentStreak || 0) > 0 ? (
                  <div className={`rounded-xl px-3 py-2 transition-colors duration-200 flex items-center justify-center gap-1.5 ${hasAttemptedToday ? 'hover:bg-orange-500/10' : 'hover:bg-slate-500/10'}`}>
                    <Flame className={`lg:w-6 lg:h-6 w-5 h-5 transition-colors ${hasAttemptedToday ? 'text-orange-500 fill-orange-500' : 'text-slate-400 dark:text-slate-500'}`} />
                    <div className={`font-semibold text-lg leading-none mt-[0.2rem] lg:mt-0 transition-colors ${hasAttemptedToday ? 'text-orange-500 dark:text-orange-400' : 'text-slate-400 dark:text-slate-500'}`}>
                      {dashboardData.currentStreak}
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-center gap-1.5 hover:bg-slate-500/10 rounded-xl px-3 py-2 transition-colors duration-200">
                    <Flame className="w-6 h-6 text-slate-400 dark:text-slate-500" />
                    <span className="text-slate-400 dark:text-slate-500  sm:text-lg leading-none font-semibold text-lg mt-[0.2rem] lg:mt-0 transition-colors">
                      0
                    </span>
                  </div>
                )}
              </div>
            )}
            <ThemeToggle />
            {!isLoggedIn ? (
              <div className="hidden md:flex items-center gap-2 lg:gap-3">
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
                <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 cursor-pointer hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 dark:from-indigo-500 dark:to-cyan-400 text-white font-bold flex justify-center items-center text-sm shadow-sm">
                    {userDetails?.name ? userDetails.name.substring(0, 1).toUpperCase() : 'U'}
                  </div>
                  <span className="text-sm font-semibold text-slate-700 dark:text-slate-300 hidden lg:block pr-2">
                    {userDetails?.name ? userDetails.name.split(' ')[0] : 'User'}
                  </span>
                </div>
                <button onClick={handleLogOut} className="hidden lg:block p-2.5 rounded-xl text-slate-500 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors border border-transparent">
                  <LogOut size={20} />
                </button>
              </div>
            )}

            {/* Hamburger Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2.5 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 transition-all lg:hidden block"
            >
              {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Menu Panel */}
      {isMobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 pt-3 pb-5 space-y-4 transition-all duration-300">

          {/* Mobile Search */}
          <div ref={mobileSearchContainerRef} className="relative w-full">
            <div className="relative">
              <input
                type="text"
                placeholder="Search exams..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setShowResults(true);
                }}
                onFocus={() => setShowResults(true)}
                className="w-full bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 pl-10 pr-4 py-2.5 rounded-xl text-sm border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-cyan-400 focus:border-transparent transition-all"
              />
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
            </div>

            {/* Dropdown Results */}
            {showResults && filteredExams.length > 0 && (
              <div className="absolute left-0 right-0 mt-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl z-50 max-h-60 overflow-y-auto custom-scrollbar divide-y divide-slate-100 dark:divide-slate-800">
                {filteredExams.map((exam) => (
                  <div
                    key={exam._id}
                    onClick={() => {
                      handleExamSelect(exam.name);
                      setIsMobileMenuOpen(false);
                    }}
                    className="px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-800/60 cursor-pointer transition-colors text-left"
                  >
                    <div className="font-semibold text-slate-800 dark:text-slate-100 text-sm">
                      {exam.name}
                    </div>
                    <div className="text-[10px] text-slate-450 dark:text-slate-500 uppercase tracking-widest font-bold mt-0.5">
                      {exam.categoryName}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* No results message */}
            {showResults && searchQuery.trim() && filteredExams.length === 0 && (
              <div className="absolute left-0 right-0 mt-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl z-50 p-4 text-center text-slate-500 dark:text-slate-400 text-xs">
                No exams found matching "{searchQuery}"
              </div>
            )}
          </div>
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
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 lg:hidden">
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