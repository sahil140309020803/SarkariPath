import React, { useEffect, useMemo, useState } from 'react';
import { Flame, Trophy, BookOpen, BarChart2, ArrowUpRight, LayoutDashboard, Menu, X, Calendar, Clock } from 'lucide-react';
import axios from 'axios'; 
import { useAuth } from '../context/AuthContext';
import { useParams, useNavigate } from 'react-router-dom';
import ThemeToggle from '../components/ThemeToggle';
import LOGO from '../assets/LOGO.png';
import BeautifulLoadingScreen from '../components/BeautifulLoadingScreen';

const Navbar = ({ user, streak }) => {
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  return (
    <nav className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border-b border-slate-200 dark:border-slate-800 px-6 py-4 sticky top-0 z-50 transition-colors duration-300">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-8">
          <div onClick={() => navigate('/')} className="flex items-center gap-2 cursor-pointer transition transform hover:scale-105 group">
            <div className="relative">
                <div className="absolute inset-0 bg-blue-500 rounded-full blur/20 group-hover:blur/40 transition-all opacity-20"></div>
                <img src={LOGO} alt="logo" className="w-10 h-10 relative transform group-hover:scale-105 group-hover:rotate-6 transition-all duration-300 object-contain"/>
            </div>
            <span className="text-xl font-bold text-slate-800 dark:text-white tracking-tight transition-colors">Sarkari<span className="text-blue-600 dark:text-cyan-400">Path</span></span>
          </div>
          <div className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-500 dark:text-slate-400">
            <a href="#" className="text-blue-600 dark:text-white bg-blue-50 dark:bg-slate-800 px-3 py-1.5 rounded-lg border border-blue-100 dark:border-slate-700 transition">Dashboard</a>
            <a href="#" className="hover:text-blue-600 dark:hover:text-cyan-400 transition-colors">Exams</a>
            <a href="#" className="hover:text-blue-600 dark:hover:text-cyan-400 transition-colors">Mock Tests</a>
          </div>
        </div>
        <div className="flex items-center gap-5">
          <ThemeToggle />
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 bg-orange-50 dark:bg-orange-500/10 text-orange-600 dark:text-orange-400 px-3 py-1.5 rounded-full border border-orange-200 dark:border-orange-500/20 shadow-sm dark:shadow-inner transition-colors">
              <Flame className="w-4 h-4 fill-orange-500" />
              <span className="text-sm font-bold tracking-wide">{streak || 0} Day Streak</span>
            </div>
            <div className="w-10 h-10 bg-gradient-to-tr from-blue-500 to-indigo-500 dark:from-indigo-500 dark:to-purple-500 rounded-full flex items-center justify-center text-white font-semibold cursor-pointer shadow-md dark:shadow-lg dark:shadow-indigo-500/20 hover:ring-2 ring-white dark:ring-slate-900 ring-offset-2 ring-offset-slate-100 dark:ring-offset-slate-900 transition-all">
              {user ? user.name.substring(0,2).toUpperCase() : 'US'}
            </div>
          </div>
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 transition-all rounded-lg md:hidden block"
          >
            {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 mt-4 pt-2 pb-2 space-y-2 flex flex-col">
          <a href="#" className="py-2.5 px-4 rounded-xl text-blue-600 dark:text-white bg-blue-50 dark:bg-slate-800 font-bold transition">Dashboard</a>
          <a href="#" className="py-2.5 px-4 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 font-semibold transition-colors">Exams</a>
          <a href="#" className="py-2.5 px-4 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 font-semibold transition-colors">Mock Tests</a>
        </div>
      )}
    </nav>
  );
};

const ProfileCard = ({ user, testsAttempted }) => {
  const getLevel = (count) => {
    if (count >= 100) return "Master";
    if (count >= 50) return "Expert";
    if (count >= 20) return "Achiever";
    return "Aspirant";
  };

  if (!user) return <div className="animate-pulse bg-white/50 dark:bg-slate-800/50 h-72 rounded-3xl border border-slate-200 dark:border-slate-700"></div>;

  return (
    <div className="bg-white/80 dark:bg-slate-800/50 backdrop-blur-sm rounded-3xl p-8 border border-slate-200 dark:border-slate-700 flex flex-col items-center text-center relative overflow-hidden group hover:border-blue-200 dark:hover:border-slate-600 transition-colors shadow-sm dark:shadow-none">
      <div className="absolute top-0 right-0 w-32 h-32 bg-blue-100/50 dark:bg-indigo-500/10 rounded-bl-full filter blur-xl transition-colors"></div>
      
      <div className="w-24 h-24 bg-gradient-to-br from-blue-400 to-indigo-500 dark:from-cyan-400 dark:to-indigo-500 rounded-[2rem] flex items-center justify-center text-3xl font-bold text-white mb-5 shadow-lg dark:shadow-xl dark:shadow-indigo-500/20 transform group-hover:scale-105 transition-transform">
        {user.name.substring(0,2).toUpperCase()}
      </div>
      <h2 className="text-2xl font-bold text-slate-800 dark:text-white tracking-tight transition-colors">{user.name}</h2>
      <p className="text-slate-500 dark:text-slate-400 text-sm mb-6 font-medium transition-colors">@{user.handle}</p>
      
      <div className="w-full bg-slate-50/80 dark:bg-slate-900/50 rounded-2xl p-4 mb-6 border border-slate-100 dark:border-slate-700/50 transition-all relative overflow-hidden group/level">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-indigo-500/5 opacity-0 group-hover/level:opacity-100 transition-opacity"></div>
        <p className="text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-[0.2em] font-black mb-1 transition-colors">Mastery Level</p>
        <div className="flex items-baseline justify-center gap-2 relative z-10">
            <span className="text-2xl sm:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-cyan-400 dark:to-indigo-400 transition-colors drop-shadow-sm">{getLevel(testsAttempted)}</span>
        </div>
        <div className="flex items-center justify-center gap-1.5 mt-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider relative z-10">
          <div className="h-px w-4 bg-slate-300 dark:bg-slate-700"></div>
          {testsAttempted || 0} Attempts
          <div className="h-px w-4 bg-slate-300 dark:bg-slate-700"></div>
        </div>
      </div>
    </div>
  );
};

const StatsCards = ({ testsAttempted, averageScore, currentStreak, longestStreak }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* Tests Attempted */}
      <div className="bg-white/80 dark:bg-slate-800/50 backdrop-blur-sm rounded-3xl p-6 border border-slate-200 dark:border-slate-700 flex items-center justify-between shadow-sm dark:shadow-none hover:border-blue-200 dark:hover:border-slate-600 transition-all">
        <div className="space-y-2">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Tests Taken</span>
          <h3 className="text-3xl font-black text-slate-800 dark:text-white">{testsAttempted}</h3>
          <p className="text-xs text-slate-400">Cumulative test counts</p>
        </div>
        <div className="p-4 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-2xl">
          <Trophy size={28} />
        </div>
      </div>

      {/* Average Score */}
      <div className="bg-white/80 dark:bg-slate-800/50 backdrop-blur-sm rounded-3xl p-6 border border-slate-200 dark:border-slate-700 flex items-center justify-between shadow-sm dark:shadow-none hover:border-blue-200 dark:hover:border-slate-600 transition-all">
        <div className="space-y-2">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Average Score</span>
          <h3 className="text-3xl font-black text-slate-800 dark:text-white">{averageScore}%</h3>
          <p className="text-xs text-slate-400">Rolling accuracy score</p>
        </div>
        <div className="p-4 bg-purple-50 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400 rounded-2xl">
          <BarChart2 size={28} />
        </div>
      </div>

      {/* Streaks */}
      <div className="bg-white/80 dark:bg-slate-800/50 backdrop-blur-sm rounded-3xl p-6 border border-slate-200 dark:border-slate-700 flex items-center justify-between shadow-sm dark:shadow-none hover:border-blue-200 dark:hover:border-slate-600 transition-all">
        <div className="space-y-2">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Streak Status</span>
          <h3 className="text-3xl font-black text-slate-800 dark:text-white">
            {currentStreak} <span className="text-xs font-bold text-slate-400 uppercase">Days</span>
          </h3>
          <p className="text-xs text-slate-400">Longest: <span className="font-bold text-orange-500">{longestStreak} days</span></p>
        </div>
        <div className="p-4 bg-orange-50 dark:bg-orange-500/10 text-orange-600 dark:text-orange-400 rounded-2xl">
          <Flame size={28} className="fill-orange-500" />
        </div>
      </div>
    </div>
  );
};

const StudyHistory = ({ dailyStatistics }) => {
  const totalMinutes = useMemo(() => {
    return (dailyStatistics || []).reduce((acc, h) => acc + h.studyMinutes, 0);
  }, [dailyStatistics]);

  const activeDays = dailyStatistics ? dailyStatistics.length : 0;

  return (
    <div className="bg-white/80 dark:bg-slate-800/50 backdrop-blur-sm rounded-3xl p-7 border border-slate-200 dark:border-slate-700 shadow-sm dark:shadow-none hover:border-blue-200 dark:hover:border-slate-600 transition-all">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="text-lg font-bold text-slate-800 dark:text-white tracking-tight">Study Performance</h3>
          <p className="text-xs text-slate-500">Log of daily practice durations</p>
        </div>
        <div className="flex items-center gap-4 bg-slate-50 dark:bg-slate-900/60 p-3 rounded-2xl border border-slate-100 dark:border-slate-700/50">
          <div className="px-3 border-r border-slate-200 dark:border-slate-700/50">
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Active Days</span>
            <p className="text-base text-slate-800 dark:text-white font-bold">{activeDays}</p>
          </div>
          <div className="px-3">
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Total Time</span>
            <p className="text-base text-slate-800 dark:text-white font-bold">{totalMinutes} Mins</p>
          </div>
        </div>
      </div>

      {dailyStatistics && dailyStatistics.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 max-h-[22rem] overflow-y-auto custom-scrollbar pr-2">
          {dailyStatistics.slice().sort((a,b) => b.date.localeCompare(a.date)).map((entry, idx) => (
            <div key={idx} className="bg-slate-50 dark:bg-slate-900/40 p-4 rounded-2xl border border-slate-100 dark:border-slate-700/50 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-xl">
                  <Calendar size={18} />
                </div>
                <div>
                  <h5 className="text-sm font-bold text-slate-800 dark:text-slate-250">{new Date(entry.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</h5>
                  <p className="text-[10px] text-slate-500 uppercase tracking-wide">{entry.testsAttempted || 0} {entry.testsAttempted === 1 ? 'Test' : 'Tests'} Taken</p>
                </div>
              </div>
              <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-350">
                <Clock size={16} className="text-slate-400" />
                <span className="font-bold text-sm">{entry.studyMinutes}m</span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-10 border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl">
          <Clock className="w-10 h-10 text-slate-300 dark:text-slate-650 mx-auto mb-3" />
          <p className="text-slate-500 dark:text-slate-450 font-medium">No study history recorded yet. Complete quizzes to log hours.</p>
        </div>
      )}
    </div>
  );
};

const RecentActivity = ({ activities }) => {
  if (!activities) return <div className="animate-pulse bg-white/50 dark:bg-slate-800/50 h-72 rounded-3xl border border-slate-200 dark:border-slate-700"></div>;

  return (
    <div className="bg-white/80 dark:bg-slate-800/50 backdrop-blur-sm rounded-3xl p-7 border border-slate-200 dark:border-slate-700 shadow-sm dark:shadow-none hover:border-blue-200 dark:hover:border-slate-600 transition-all">
       <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-bold text-slate-800 dark:text-white tracking-tight">Recent Activity</h3>
          <button className="text-xs font-semibold text-blue-600 dark:text-indigo-400 hover:text-blue-500 dark:hover:text-indigo-300 flex items-center gap-1">
             View All <ArrowUpRight size={14} />
          </button>
       </div>
       <div className="space-y-4">
          {activities.length === 0 ? (
             <div className="text-center py-10 border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl">
                 <div className="bg-slate-100 dark:bg-slate-800 inline-block p-4 rounded-full mb-3"><BookOpen className="text-slate-400 dark:text-slate-500" /></div>
                 <p className="text-slate-500 dark:text-slate-400 font-medium">No tests taken yet. Start practicing!</p>
             </div>
          ) : activities.map((item, idx) => (
            <div key={idx} className="group flex items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/40 border border-slate-100 dark:border-slate-700/50 hover:bg-slate-100 dark:hover:bg-slate-800 hover:border-slate-200 dark:hover:border-slate-600 transition-all shadow-sm hover:shadow-md dark:shadow-none">
               <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-indigo-500/10 dark:to-cyan-500/10 rounded-xl flex items-center justify-center text-blue-600 dark:text-cyan-400 border border-blue-100 dark:border-cyan-500/20 group-hover:scale-110 transition-transform">
                     <BookOpen size={20} />
                  </div>
                  <div>
                     <h4 className="font-bold text-slate-700 dark:text-slate-200 group-hover:text-blue-600 dark:group-hover:text-white transition-colors">{item.title}</h4>
                     <p className="text-xs text-slate-500 font-medium mt-0.5">{new Date(item.time).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })} • {item.qs}</p>
                  </div>
               </div>
               <div className="text-right">
                  <div className="text-xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 to-green-600 dark:from-green-400 dark:to-emerald-500">{item.score}</div>
                  <div className="text-[10px] uppercase tracking-wider font-bold text-slate-500">Accuracy</div>
               </div>
            </div>
          ))}
       </div>
    </div>
  );
};

const UserDashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [dashboardError, setDashboardError] = useState(null);
  const { backend_url } = useAuth();
  const { userId } = useParams();

  const fetchData = async () => {
    setLoading(true);
    setDashboardError(null);
    try {
      const { data } = await axios.get(`${backend_url}/api/dashboard/${userId}`);
      if (data.success === false) {
        setDashboardError(data.message || "Failed to load dashboard statistics.");
      } else {
        setDashboardData(data);
      }
    } catch (error) {
      console.error("Failed to fetch dashboard data", error);
      setDashboardError("Network error. Failed to load dashboard statistics.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [backend_url, userId]);

  if (loading) {
    return <BeautifulLoadingScreen message="Loading dashboard..." />;
  }

  if (dashboardError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 transition-colors">
        <div className="text-center p-8 bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-red-100 dark:border-rose-900/30 max-w-md my-6">
          <X size={48} className="text-red-500 dark:text-rose-500 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Error Loading Dashboard</h3>
          <p className="text-slate-650 dark:text-slate-400 mb-6 text-sm">{dashboardError}</p>
          <button
            onClick={fetchData}
            className="w-full bg-blue-600 dark:bg-indigo-650 text-white py-3 rounded-xl hover:bg-blue-700 dark:hover:bg-indigo-500 transition shadow-md font-bold cursor-pointer text-sm"
          >
            Retry Loading
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200 font-sans selection:bg-blue-200 dark:selection:bg-cyan-500/30 selection:text-slate-900 dark:selection:text-white pb-12 relative transition-colors duration-300">
      {/* Background blobs */}
      <div className="fixed top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
         <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-400/10 dark:bg-indigo-600/10 rounded-full filter blur-[100px] transition-colors duration-500"></div>
         <div className="absolute top-[20%] right-[-10%] w-[30%] h-[30%] bg-indigo-400/10 dark:bg-cyan-500/10 rounded-full filter blur-[100px] transition-colors duration-500"></div>
         <div className="absolute bottom-[-10%] left-[20%] w-[40%] h-[40%] bg-purple-400/10 dark:bg-purple-600/10 rounded-full filter blur-[100px] transition-colors duration-500"></div>
      </div>

      <div className="relative z-10">
        <Navbar user={dashboardData?.user} streak={dashboardData?.currentStreak} />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left profile block */}
          <div className="lg:col-span-4 space-y-6">
            <ProfileCard user={dashboardData?.user} testsAttempted={dashboardData?.testsAttempted} />
          </div>

          {/* Right stats and details blocks */}
          <div className="lg:col-span-8 space-y-6">
             <StatsCards 
                testsAttempted={dashboardData?.testsAttempted} 
                averageScore={dashboardData?.averageScore} 
                currentStreak={dashboardData?.currentStreak} 
                longestStreak={dashboardData?.longestStreak} 
             />
             <StudyHistory dailyStatistics={dashboardData?.dailyStatistics} />
             <RecentActivity activities={dashboardData?.recentActivity} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;