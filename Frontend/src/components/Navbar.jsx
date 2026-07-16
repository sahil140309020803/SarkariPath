import React from 'react';
import LOGO from '../assets/LOGO.png';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useUser } from '../context/UserContext';
import { useExam } from '../context/ExamContext';
import { LogOut, LayoutDashboard, BookOpen, Flame, Search } from 'lucide-react';
import ThemeToggle from './ThemeToggle';
import { trackEvent } from '../utils/analytics';
import { clearUser, trackEvent as clarityTrackEvent } from '../utils/clarity';

// ─── Animated Hamburger / Close icon ────────────────────────────────────────
const HamburgerIcon = ({ isOpen }) => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 20 20"
    fill="none"
    aria-hidden="true"
    className="overflow-visible"
  >
    {/* Top bar */}
    <line
      x1="2" y1="5" x2="21" y2="5"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      style={{
        transformOrigin: '10px 5px',
        transition: 'transform 300ms cubic-bezier(0.16,1,0.3,1), opacity 200ms ease',
        transform: isOpen ? 'rotate(45deg) translateY(5px)' : 'rotate(0deg) translateY(0)',
        opacity: 1,
      }}
    />
    {/* Middle bar */}
    <line
      x1="2" y1="10" x2="21" y2="10"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      style={{
        transformOrigin: '10px 10px',
        transition: 'opacity 200ms ease, transform 300ms cubic-bezier(0.16,1,0.3,1)',
        opacity: isOpen ? 0 : 1,
        transform: isOpen ? 'scaleX(0)' : 'scaleX(1)',
      }}
    />
    {/* Bottom bar */}
    <line
      x1="2" y1="15" x2="21" y2="15"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      style={{
        transformOrigin: '10px 15px',
        transition: 'transform 300ms cubic-bezier(0.16,1,0.3,1), opacity 200ms ease',
        transform: isOpen ? 'rotate(-45deg) translateY(-5px)' : 'rotate(0deg) translateY(0)',
        opacity: 1,
      }}
    />
  </svg>
);

// ─── Stagger delays for nav items ────────────────────────────────────────────
const STAGGER_DELAYS = [60, 120, 180, 240, 300, 360, 420];

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isLoggedIn, setIsLoggedIn, userDetails, setUserDetails, backend_url, fetchUserDashboardData, dashboardData } = useUser();
  const { setActiveList, setIsExamDataFetched, examCatList } = useExam();

  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
  const [isClosing, setIsClosing] = React.useState(false);

  const [searchQuery, setSearchQuery] = React.useState('');
  const [showResults, setShowResults] = React.useState(false);

  const searchContainerRef = React.useRef(null);
  const mobileSearchContainerRef = React.useRef(null);
  const closeTimerRef = React.useRef(null);

  // ─── Close helper: run close animation, then unmount ──────────────────────
  const closeMenu = React.useCallback(() => {
    if (!isMobileMenuOpen || isClosing) return;
    setIsClosing(true);
    closeTimerRef.current = setTimeout(() => {
      setIsMobileMenuOpen(false);
      setIsClosing(false);
    }, 240); // slightly less than animation duration
  }, [isMobileMenuOpen, isClosing]);

  // ─── Body scroll lock ─────────────────────────────────────────────────────
  React.useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.classList.add('menu-open');
    } else {
      document.body.classList.remove('menu-open');
    }
    return () => document.body.classList.remove('menu-open');
  }, [isMobileMenuOpen]);

  // ─── Escape key ──────────────────────────────────────────────────────────
  React.useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape' && isMobileMenuOpen) closeMenu(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [isMobileMenuOpen, closeMenu]);

  // ─── Cleanup close timer on unmount ──────────────────────────────────────
  React.useEffect(() => () => clearTimeout(closeTimerRef.current), []);

  // ─── Toggle hamburger ─────────────────────────────────────────────────────
  const toggleMenu = () => {
    if (isMobileMenuOpen) {
      closeMenu();
    } else {
      setIsClosing(false);
      setIsMobileMenuOpen(true);
    }
  };

  // ─── Navigate + close (with animation) ───────────────────────────────────
  const navigateAndClose = (fn) => {
    closeMenu();
    // wait for close animation, then act
    setTimeout(fn, 200);
  };

  // ─── Exam search ──────────────────────────────────────────────────────────
  const allExams = React.useMemo(() => {
    if (!examCatList || !Array.isArray(examCatList)) return [];
    const exams = [];
    examCatList.forEach(category => {
      if (category.Exams && Array.isArray(category.Exams)) {
        category.Exams.forEach(exam => {
          exams.push({ _id: exam._id, name: exam.Name, categoryName: category.Name });
        });
      }
    });
    return exams;
  }, [examCatList]);

  const filteredExams = React.useMemo(() => {
    if (!searchQuery.trim()) return [];
    const query = searchQuery.toLowerCase();
    return allExams.filter(exam => exam.name.toLowerCase().includes(query));
  }, [searchQuery, allExams]);

  const hasAttemptedToday = React.useMemo(() => {
    if (!dashboardData || !Array.isArray(dashboardData.dailyStatistics)) return false;
    const today = new Date();
    const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    const entry = dashboardData.dailyStatistics.find(e => e.date === todayStr);
    return entry ? entry.testsAttempted > 0 : false;
  }, [dashboardData]);

  const createSlug = (text) => text.replaceAll(' ', '-');

  const handleExamSelect = async (examName) => {
    setSearchQuery('');
    setShowResults(false);
    setActiveList(null);
    setIsExamDataFetched(null);
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
    return () => document.removeEventListener('mousedown', handleClickOutside);
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
    } catch {
      toast.error('Error logging out. Please try again.');
    }
  };

  const handleLogoClick = () => { setActiveList(null); navigate('/'); };
  const handleExamClick = () => { setActiveList(null); navigate('/#exam-categories'); };
  const handleDashboardClick = () => {
    if (userDetails?.role === 'admin') {
      navigate('/admin-page');
    } else if (location.pathname === '/dashboard') {
      fetchUserDashboardData();
    } else {
      navigate('/dashboard');
    }
  };

  // ─── Overlay click ────────────────────────────────────────────────────────
  const handleOverlayClick = () => closeMenu();

  // ─── Menu panel CSS class ─────────────────────────────────────────────────
  const menuPanelClass = isClosing ? 'mobile-menu-close' : 'mobile-menu-open';
  const overlayClass = isClosing ? 'mobile-overlay-close' : 'mobile-overlay-open';

  return (
    <nav className="w-full bg-white dark:bg-slate-900 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 sticky top-0 z-50 shadow-sm transition-all duration-300">
      <div className="max-w-[85rem] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">

          <div className="flex items-center gap-4 lg:gap-16">
            {/* Logo */}
            <div onClick={handleLogoClick} className="flex items-center cursor-pointer group gap-2 sm:gap-4">
              <img src={LOGO} alt="logo" className="max-[23rem]:w-8 max-[23rem]:h-8 w-10 h-10 transform group-hover:scale-105 group-hover:rotate-6 transition-all duration-300" />
              <div className="font-bold max-[23rem]:text-xl text-2xl tracking-tight text-slate-800 dark:text-white flex items-center transition-colors">
                Sarkari<span className="text-blue-600 dark:text-cyan-400">Path</span>
              </div>
            </div>

            {/* Desktop nav links */}
            <div className="hidden lg:flex items-center gap-4 lg:gap-8">
              <button onClick={handleExamClick} className="flex items-center gap-2 text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-cyan-400 font-semibold transition-colors duration-200 text-sm tracking-wide">
                <BookOpen size={18} /> Explore Exams
              </button>
              {userDetails?.role === 'admin' && (
                <button onClick={() => navigate('/admin-page')} className="flex items-center gap-2 text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 font-semibold transition-colors duration-200 text-sm tracking-wide">
                  <LayoutDashboard size={18} /> Admin Dashboard
                </button>
              )}
              {userDetails?.role === 'user' && (
                <button onClick={handleDashboardClick} className="flex items-center gap-2 text-slate-600 dark:text-slate-300 hover:text-cyan-600 dark:hover:text-cyan-400 font-semibold transition-colors duration-200 text-sm tracking-wide">
                  <LayoutDashboard size={18} /> My Dashboard
                </button>
              )}
            </div>
          </div>

          {/* Right section */}
          <div className="flex items-center gap-2 lg:gap-4">

            {/* Desktop Search */}
            <div ref={searchContainerRef} className="hidden md:block relative w-40 lg:w-56 xl:w-72">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search Exams..."
                  value={searchQuery}
                  onChange={(e) => { setSearchQuery(e.target.value); setShowResults(true); }}
                  onFocus={() => setShowResults(true)}
                  className="w-full bg-slate-100/50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 pl-10 pr-4 py-2 rounded-xl text-sm border border-slate-300/80 dark:border-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:focus:ring-cyan-400 focus:border-transparent transition-all"
                />
                <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
              </div>
              {showResults && filteredExams.length > 0 && (
                <div className="absolute left-0 right-0 mt-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl z-50 max-h-60 overflow-y-auto custom-scrollbar transition-all divide-y divide-slate-100 dark:divide-slate-800">
                  {filteredExams.map((exam) => (
                    <div key={exam._id} onClick={() => handleExamSelect(exam.name)} className="px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-800/60 cursor-pointer transition-colors text-left">
                      <div className="font-semibold text-slate-800 dark:text-slate-100 text-sm">{exam.name}</div>
                      <div className="text-[10px] text-slate-450 dark:text-slate-500 uppercase tracking-widest font-bold mt-0.5">{exam.categoryName}</div>
                    </div>
                  ))}
                </div>
              )}
              {showResults && searchQuery.trim() && filteredExams.length === 0 && (
                <div className="absolute left-0 right-0 mt-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl z-50 p-4 text-center text-slate-500 dark:text-slate-400 text-xs">
                  No exams found matching "{searchQuery}"
                </div>
              )}
            </div>

            {/* Streak */}
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
                    <span className="text-slate-400 dark:text-slate-500 sm:text-lg leading-none font-semibold text-lg mt-[0.2rem] lg:mt-0 transition-colors">0</span>
                  </div>
                )}
              </div>
            )}

            <ThemeToggle />

            {/* Desktop auth buttons */}
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

            {/* ─── Animated Hamburger Button ─────────────────────────────────── */}
            <button
              onClick={toggleMenu}
              aria-expanded={isMobileMenuOpen}
              aria-label={isMobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
              className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 transition-all lg:hidden block"
            >
              <HamburgerIcon isOpen={isMobileMenuOpen} />
            </button>
          </div>
        </div>
      </div>

      {/* ─── Blurred Backdrop Overlay ──────────────────────────────────────── */}
      {isMobileMenuOpen && (
        <div
          onClick={handleOverlayClick}
          aria-hidden="true"
          className={`lg:hidden fixed inset-0 top-20 z-40 bg-slate-900/40 dark:bg-slate-950/60 backdrop-blur-[2px] ${overlayClass}`}
        />
      )}

      {/* ─── Mobile Menu Panel ────────────────────────────────────────────── */}
      {isMobileMenuOpen && (
        <div
          className={`lg:hidden relative z-50 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 pt-3 pb-5 space-y-1 ${menuPanelClass}`}
        >
          {/* Mobile Search */}
          <div
            ref={mobileSearchContainerRef}
            className="relative w-full mobile-nav-item mb-3"
            style={{ animationDelay: `${STAGGER_DELAYS[0]}ms` }}
          >
            <div className="relative">
              <input
                type="text"
                placeholder="Search exams..."
                value={searchQuery}
                onChange={(e) => { setSearchQuery(e.target.value); setShowResults(true); }}
                onFocus={() => setShowResults(true)}
                className="w-full bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 pl-10 pr-4 py-2.5 rounded-xl text-sm border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-cyan-400 focus:border-transparent transition-all"
              />
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
            </div>
            {showResults && filteredExams.length > 0 && (
              <div className="absolute left-0 right-0 mt-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl z-50 max-h-60 overflow-y-auto custom-scrollbar divide-y divide-slate-100 dark:divide-slate-800">
                {filteredExams.map((exam) => (
                  <div
                    key={exam._id}
                    onClick={() => { handleExamSelect(exam.name); closeMenu(); }}
                    className="px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-800/60 cursor-pointer transition-colors text-left"
                  >
                    <div className="font-semibold text-slate-800 dark:text-slate-100 text-sm">{exam.name}</div>
                    <div className="text-[10px] text-slate-450 dark:text-slate-500 uppercase tracking-widest font-bold mt-0.5">{exam.categoryName}</div>
                  </div>
                ))}
              </div>
            )}
            {showResults && searchQuery.trim() && filteredExams.length === 0 && (
              <div className="absolute left-0 right-0 mt-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl z-50 p-4 text-center text-slate-500 dark:text-slate-400 text-xs">
                No exams found matching "{searchQuery}"
              </div>
            )}
          </div>

          {/* Explore Exams */}
          <button
            onClick={() => navigateAndClose(handleExamClick)}
            className="mobile-nav-item w-full text-left flex items-center gap-3 py-3 px-4 rounded-xl text-slate-600 dark:text-slate-300 font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-blue-600 dark:hover:text-cyan-400 transition-all duration-200 group"
            style={{ animationDelay: `${STAGGER_DELAYS[1]}ms` }}
          >
            <BookOpen size={18} className="group-hover:scale-110 transition-transform duration-200" />
            Explore Exams
          </button>

          {/* Admin Dashboard */}
          {userDetails?.role === 'admin' && (
            <button
              onClick={() => navigateAndClose(() => navigate('/admin-page'))}
              className="mobile-nav-item w-full text-left flex items-center gap-3 py-3 px-4 rounded-xl text-slate-600 dark:text-slate-300 font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all duration-200 group"
              style={{ animationDelay: `${STAGGER_DELAYS[2]}ms` }}
            >
              <LayoutDashboard size={18} className="group-hover:scale-110 transition-transform duration-200" />
              Admin Dashboard
            </button>
          )}

          {/* My Dashboard */}
          {userDetails?.role === 'user' && (
            <button
              onClick={() => navigateAndClose(handleDashboardClick)}
              className="mobile-nav-item w-full text-left flex items-center gap-3 py-3 px-4 rounded-xl text-slate-600 dark:text-slate-300 font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-cyan-600 dark:hover:text-cyan-400 transition-all duration-200 group"
              style={{ animationDelay: `${STAGGER_DELAYS[2]}ms` }}
            >
              <LayoutDashboard size={18} className="group-hover:scale-110 transition-transform duration-200" />
              My Dashboard
            </button>
          )}

          {/* Auth section */}
          {!isLoggedIn ? (
            <div
              className="mobile-nav-item flex flex-col gap-2 pt-3 mt-1 border-t border-slate-100 dark:border-slate-800"
              style={{ animationDelay: `${STAGGER_DELAYS[3]}ms` }}
            >
              <button
                onClick={() => navigateAndClose(() => navigate('/login'))}
                className="w-full py-2.5 rounded-xl text-slate-700 dark:text-slate-200 font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 transition-all text-center"
              >
                Login
              </button>
              <button
                onClick={() => navigateAndClose(() => navigate('/signup'))}
                className="w-full py-2.5 rounded-xl bg-blue-600 dark:bg-indigo-600 text-white font-semibold text-center hover:bg-blue-700 dark:hover:bg-indigo-500 shadow transition-all"
              >
                Sign Up
              </button>
            </div>
          ) : (
            <div
              className="mobile-nav-item pt-3 mt-1 border-t border-slate-100 dark:border-slate-800"
              style={{ animationDelay: `${STAGGER_DELAYS[3]}ms` }}
            >
              <button
                onClick={() => navigateAndClose(handleLogOut)}
                className="w-full text-left flex items-center gap-3 py-3 px-4 rounded-xl text-red-600 dark:text-red-400 font-semibold hover:bg-red-50 dark:hover:bg-red-500/10 transition-all duration-200 group"
              >
                <LogOut size={18} className="group-hover:scale-110 transition-transform duration-200" />
                Logout
              </button>
            </div>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;