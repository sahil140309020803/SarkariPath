import React, { useEffect, useMemo, useState } from 'react';
import { Search, Bell, Flame, Trophy, BookOpen, BarChart2, Check, ArrowUpRight, Target, Moon, Sun, LayoutDashboard } from 'lucide-react';
import axios from 'axios'; 
import { useAuth } from '../context/AuthContext';
import { useParams, useNavigate } from 'react-router-dom';
import ThemeToggle from '../components/ThemeToggle';
import LOGO from '../assets/LOGO.png';

const Navbar = ({ user, streak }) => {
  const navigate = useNavigate();
  return (
    <nav className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border-b border-slate-200 dark:border-slate-800 px-6 py-4 flex items-center justify-between sticky top-0 z-50 transition-colors duration-300">
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
            <span className="text-sm font-bold tracking-wide">{streak} Day Streak</span>
          </div>
          <div className="w-10 h-10 bg-gradient-to-tr from-blue-500 to-indigo-500 dark:from-indigo-500 dark:to-purple-500 rounded-full flex items-center justify-center text-white font-semibold cursor-pointer shadow-md dark:shadow-lg dark:shadow-indigo-500/20 hover:ring-2 ring-white dark:ring-slate-900 ring-offset-2 ring-offset-slate-100 dark:ring-offset-slate-900 transition-all">
            {user ? user.name.substring(0,2).toUpperCase() : 'US'}
          </div>
        </div>
      </div>
    </nav>
  );
};

const ProfileCard = ({ user, totalSolved }) => {
  const getLevel = (count) => {
    const c = count || 0;
    if (c >= 1000) return "Grandmaster";
    if (c >= 500) return "Master";
    if (c >= 200) return "Expert";
    if (c >= 50) return "Achiever";
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
            <span className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-cyan-400 dark:to-indigo-400 transition-colors drop-shadow-sm">{getLevel(totalSolved)}</span>
        </div>
        <div className="flex items-center justify-center gap-1.5 mt-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider relative z-10">
          <div className="h-px w-4 bg-slate-300 dark:bg-slate-700"></div>
          {totalSolved || 0} Solved
          <div className="h-px w-4 bg-slate-300 dark:bg-slate-700"></div>
        </div>
      </div>

      <button className="w-full py-3 bg-slate-100 dark:bg-gradient-to-r dark:from-slate-700 dark:to-slate-800 hover:bg-slate-200 dark:hover:from-slate-600 dark:hover:to-slate-700 text-slate-700 dark:text-white rounded-xl font-semibold transition-all shadow-sm dark:shadow border border-slate-200 dark:border-slate-600">
        Edit Profile
      </button>
    </div>
  );
};

const SolvedProgress = ({ data }) => {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { const timer = setTimeout(() => setMounted(true), 100); return () => clearTimeout(timer); }, []);

  if (!data) return <div className="animate-pulse bg-white/50 dark:bg-slate-800/50 h-52 rounded-3xl border border-slate-200 dark:border-slate-700"></div>;

  const { totalSolved, totalQuestions, details } = data;
  
  const radius = 56;
  const circumference = 2 * Math.PI * radius;
  
  const easyPercent = details.easy.count / (totalQuestions || 1);
  const medPercent = details.medium.count / (totalQuestions || 1);
  const hardPercent = details.hard.count / (totalQuestions || 1);

  const easyStroke = circumference * easyPercent;
  const medStroke = circumference * medPercent;
  const hardStroke = circumference * hardPercent;

  return (
    <div className="bg-white/80 dark:bg-slate-800/50 backdrop-blur-sm rounded-3xl p-7 border border-slate-200 dark:border-slate-700 h-full flex flex-col sm:flex-row items-center justify-between gap-8 hover:border-blue-200 dark:hover:border-slate-600 transition-colors shadow-sm dark:shadow-none">
       <div className="relative w-44 h-44 flex-shrink-0">
          <svg className="w-full h-full transform -rotate-90 drop-shadow-xl" viewBox="0 0 130 130">
             <circle cx="65" cy="65" r={radius} fill="none" className="stroke-slate-100 dark:stroke-slate-800 transition-colors" strokeWidth="10" strokeLinecap="round"/>
             <circle cx="65" cy="65" r={radius} fill="none" stroke="#2dd4bf" strokeWidth="10" strokeLinecap="round" strokeDasharray={circumference} strokeDashoffset={mounted ? circumference - easyStroke : circumference} className="transition-all duration-1000 ease-out"/>
             <circle cx="65" cy="65" r={radius} fill="none" stroke="#facc15" strokeWidth="10" strokeLinecap="round" strokeDasharray={circumference} strokeDashoffset={mounted ? circumference - medStroke : circumference} className="transition-all duration-1000 ease-out delay-300" style={{ transformOrigin: 'center', transform: `rotate(${easyPercent * 360}deg)` }}/>
             <circle cx="65" cy="65" r={radius} fill="none" stroke="#ef4444" strokeWidth="10" strokeLinecap="round" strokeDasharray={circumference} strokeDashoffset={mounted ? circumference - hardStroke : circumference} className="transition-all duration-1000 ease-out delay-500" style={{ transformOrigin: 'center', transform: `rotate(${(easyPercent + medPercent) * 360}deg)` }}/>
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
             <div className="text-4xl font-black text-slate-800 dark:text-white leading-none tracking-tighter transition-colors">{totalSolved}</div>
             <div className="text-xs text-slate-400 font-medium mt-1 mb-2">/{totalQuestions}</div>
             <div className="flex items-center gap-1 bg-green-50 dark:bg-green-500/10 px-2.5 py-1 rounded-full border border-green-200 dark:border-green-500/20 transition-colors">
                <Check size={12} strokeWidth={3} className="text-green-500 dark:text-green-400" /> 
                <span className="text-green-600 dark:text-green-400 text-[10px] font-bold uppercase tracking-wider">Solved</span>
             </div>
          </div>
       </div>

       <div className="flex-1 space-y-3 w-full">
          {[
            { label: 'Easy', count: details.easy.count, total: details.easy.total, color: 'text-teal-600 dark:text-teal-400', bg: 'bg-teal-50 dark:bg-teal-400/10' },
            { label: 'Medium', count: details.medium.count, total: details.medium.total, color: 'text-yellow-600 dark:text-yellow-400', bg: 'bg-yellow-50 dark:bg-yellow-400/10' },
            { label: 'Hard', count: details.hard.count, total: details.hard.total, color: 'text-red-600 dark:text-red-400', bg: 'bg-red-50 dark:bg-red-400/10' }
          ].map((item, idx) => (
              <div key={idx} className="flex justify-between items-center p-3 rounded-xl bg-slate-50/80 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-700/50 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                 <span className={`text-xs font-bold uppercase tracking-wider ${item.color} ${item.bg} px-2 py-1 rounded-lg transition-colors`}>{item.label}</span>
                 <div className="text-right">
                    <span className="text-base font-bold text-slate-700 dark:text-white transition-colors">{item.count}</span>
                    <span className="text-xs text-slate-500 font-medium flex-nowrap"> /{item.total || 0}</span>
                 </div>
              </div>
          ))}
       </div>
    </div>
  );
};

const CommunityStats = ({ stats }) => {
  if (!stats) return <div className="animate-pulse bg-white/50 dark:bg-slate-800/50 h-52 rounded-3xl border border-slate-200 dark:border-slate-700"></div>;

  return (
    <div className="bg-white/80 dark:bg-slate-800/50 backdrop-blur-sm rounded-3xl p-7 border border-slate-200 dark:border-slate-700 hover:border-blue-200 dark:hover:border-slate-600 transition-colors shadow-sm dark:shadow-none">
      <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-6">Global Statistics</h3>
      <div className="space-y-4">
        {[
            { icon: <Trophy size={20} />, label: 'Tests Taken', value: stats.tests, color: 'text-indigo-600 dark:text-indigo-400', bg: 'bg-indigo-50 dark:bg-indigo-500/10', border: 'border-indigo-100 dark:border-indigo-500/20' },
            { icon: <BookOpen size={20} />, label: 'Questions Solved', value: stats.questions, color: 'text-cyan-600 dark:text-cyan-400', bg: 'bg-cyan-50 dark:bg-cyan-500/10', border: 'border-cyan-100 dark:border-cyan-500/20' },
            { icon: <BarChart2 size={20} />, label: 'Average Score', value: `${stats.avgScore}%`, color: 'text-purple-600 dark:text-purple-400', bg: 'bg-purple-50 dark:bg-purple-500/10', border: 'border-purple-100 dark:border-purple-500/20' }
        ].map((stat, idx) => (
            <div key={idx} className="flex items-center justify-between p-3 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-900/40 transition-colors cursor-pointer group">
              <div className="flex items-center gap-4">
                <div className={`p-3 ${stat.bg} ${stat.color} border ${stat.border} rounded-xl transition-colors group-hover:scale-105`}>{stat.icon}</div>
                <p className="text-sm font-medium text-slate-600 dark:text-slate-300 group-hover:text-slate-800 dark:group-hover:text-white transition-colors">{stat.label}</p>
              </div>
              <span className="font-bold text-xl text-slate-800 dark:text-white tracking-tight transition-colors">{stat.value}</span>
            </div>
        ))}
      </div>
    </div>
  );
};

const StudyHeatmap = ({ heatmapData }) => {
  const { months, totalSubmissions, activeDays, maxStreak } = useMemo(() => {
    if (!heatmapData) return { months: [], totalSubmissions: 0, activeDays: 0, maxStreak: 0 };
    const today = new Date();
    const activityMap = new Map();
    heatmapData.data.forEach(d => activityMap.set(d.date, d.intensity));
    const monthsData = [];
    let currentMonthDate = new Date(today);
    currentMonthDate.setMonth(currentMonthDate.getMonth() - 11);
    currentMonthDate.setDate(1); 
    for (let i = 0; i < 12; i++) {
        const year = currentMonthDate.getFullYear();
        const monthIndex = currentMonthDate.getMonth();
        const monthName = currentMonthDate.toLocaleString('default', { month: 'short' });
        const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
        const monthWeeks = [];
        let currentWeek = [];
        const firstDayOfMonth = new Date(year, monthIndex, 1);
        const startDayOfWeek = firstDayOfMonth.getDay(); 
        for (let p = 0; p < startDayOfWeek; p++) currentWeek.push(null);
        for (let d = 1; d <= daysInMonth; d++) {
            const dateObj = new Date(year, monthIndex, d);
            const dateStr = dateObj.toISOString().split('T')[0];
            const intensity = activityMap.get(dateStr) || 0;
            currentWeek.push({ date: dateObj, intensity });
            if (currentWeek.length === 7) {
                monthWeeks.push(currentWeek);
                currentWeek = [];
            }
        }
        if (currentWeek.length > 0) {
            while (currentWeek.length < 7) currentWeek.push(null);
            monthWeeks.push(currentWeek);
        }
        monthsData.push({ name: monthName, weeks: monthWeeks });
        currentMonthDate.setMonth(currentMonthDate.getMonth() + 1);
    }
    return { 
        months: monthsData, 
        totalSubmissions: heatmapData.totalSubmissions, 
        activeDays: heatmapData.activeDays, 
        maxStreak: heatmapData.maxStreak 
    };
  }, [heatmapData]);

  const getColor = (intensity) => {
     if (intensity === undefined) return "opacity-0";
     if (intensity === 0) return "bg-slate-100 dark:bg-slate-800 border-none dark:border dark:border-slate-700/50";
     switch(intensity) {
         case 1: return "bg-indigo-200 dark:bg-indigo-900 border-none dark:border break:border-indigo-800";
         case 2: return "bg-indigo-400 dark:bg-indigo-700 border-none dark:border break:border-indigo-600";
         case 3: return "bg-indigo-600 dark:bg-indigo-500 border-none dark:border break:border-indigo-400 shadow-sm shadow-indigo-200 dark:shadow-indigo-500/50";
         case 4: return "bg-blue-500 dark:bg-cyan-400 border-none dark:border break:border-cyan-300 shadow-sm shadow-blue-200 dark:shadow-cyan-400/50";
         default: return "bg-slate-100 dark:bg-slate-800";
     }
  };

  if (!heatmapData) return <div className="animate-pulse bg-white/50 dark:bg-slate-800/50 h-56 rounded-3xl border border-slate-200 dark:border-slate-700 w-full"></div>;

  return (
    <div className="bg-white/80 dark:bg-slate-800/50 backdrop-blur-sm rounded-3xl p-7 border border-slate-200 dark:border-slate-700 w-full text-slate-700 dark:text-slate-300 relative overflow-hidden shadow-sm dark:shadow-none transition-colors">
      <div className="absolute top-0 right-0 w-64 h-64 bg-blue-100/30 dark:bg-cyan-500/5 rounded-full filter blur-3xl translate-x-1/2 -translate-y-1/2 transition-colors"></div>
      
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4 relative z-10">
        <div>
          <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-1 tracking-tight transition-colors">{totalSubmissions} Submissions</h3>
          <p className="text-sm text-slate-500 font-medium">over the past 12 months</p>
        </div>
        <div className="flex items-center gap-4 bg-slate-50 dark:bg-slate-900/60 p-3 rounded-2xl border border-slate-100 dark:border-slate-700/50 transition-colors">
           <div className="px-3 border-r border-slate-200 dark:border-slate-700/50 transition-colors">
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-1">Active Days</p>
              <p className="text-lg text-slate-800 dark:text-white font-bold leading-none transition-colors">{activeDays}</p>
           </div>
           <div className="px-3">
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-1">Max Streak</p>
              <p className="text-lg text-slate-800 dark:text-white font-bold leading-none flex items-center gap-1 transition-colors">
                 {maxStreak} <Flame size={14} className="text-orange-500" />
              </p>
           </div>
        </div>
      </div>
      
      <div className="w-full overflow-x-auto pb-4 custom-scrollbar relative z-10">
        <div className="min-w-max flex gap-2">
            <div className="flex flex-col justify-between py-[2px] pr-3 text-[10px] text-slate-500 font-bold uppercase tracking-wider pt-6 sticky left-0 z-10 h-[8.5rem]" style={{ backgroundColor: 'inherit' }}>
                <span>Sun</span><span>Sat</span>
            </div>
            {months.map((month, mIndex) => (
                <div key={mIndex} className="flex flex-col gap-1.5">
                    <span className="text-[11px] font-semibold text-slate-400 h-5 pl-1">{month.name}</span>
                    <div className="grid grid-rows-7 grid-flow-col gap-[4px]">
                        {month.weeks.map((week, wIndex) => (
                            week.map((day, dIndex) => (
                                <div key={`${mIndex}-${wIndex}-${dIndex}`} 
                                     className={`w-3.5 h-3.5 rounded-[3px] transition-all hover:scale-125 hover:z-10 cursor-crosshair ${day === null ? 'opacity-0' : getColor(day.intensity)}`}
                                     title={day && day.date ? `${day.date.toDateString()}: ${day.intensity} tests` : ''}
                                ></div>
                            ))
                        ))}
                    </div>
                </div>
            ))}
        </div>
      </div>
    </div>
  );
};

const RecentActivity = ({ activities }) => {
  if (!activities) return <div className="animate-pulse bg-white/50 dark:bg-slate-800/50 h-72 rounded-3xl border border-slate-200 dark:border-slate-700"></div>;

  return (
    <div className="bg-white/80 dark:bg-slate-800/50 backdrop-blur-sm rounded-3xl p-7 border border-slate-200 dark:border-slate-700 h-full shadow-sm dark:shadow-none transition-colors">
       <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-bold text-slate-800 dark:text-white tracking-tight transition-colors">Recent Activity</h3>
          <button className="text-xs font-semibold text-blue-600 dark:text-indigo-400 hover:text-blue-500 dark:hover:text-indigo-300 flex items-center gap-1 transition-colors">
             View All <ArrowUpRight size={14} />
          </button>
       </div>
       <div className="space-y-4">
          {activities.length === 0 ? (
             <div className="text-center py-8">
                 <div className="bg-slate-100 dark:bg-slate-800 inline-block p-4 rounded-full mb-3 transition-colors"><BookOpen className="text-slate-400 dark:text-slate-500" /></div>
                 <p className="text-slate-500 dark:text-slate-400 font-medium transition-colors">No tests taken yet. Start practicing!</p>
             </div>
          ) : activities.map((item, idx) => (
            <div key={idx} className="group flex items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/40 border border-slate-100 dark:border-slate-700/50 hover:bg-slate-100 dark:hover:bg-slate-800 hover:border-slate-200 dark:hover:border-slate-600 transition-all cursor-pointer shadow-sm hover:shadow-md dark:shadow-none">
               <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-indigo-500/10 dark:to-cyan-500/10 rounded-xl flex items-center justify-center text-blue-600 dark:text-cyan-400 border border-blue-100 dark:border-cyan-500/20 group-hover:scale-110 transition-transform">
                     <BookOpen size={20} />
                  </div>
                  <div>
                     <h4 className="font-bold text-slate-700 dark:text-slate-200 group-hover:text-blue-600 dark:group-hover:text-white transition-colors">{item.title}</h4>
                     <p className="text-xs text-slate-500 font-medium mt-0.5 transition-colors">{new Date(item.time).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })} • {item.qs}</p>
                  </div>
               </div>
               <div className="text-right">
                  <div className="text-xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 to-green-600 dark:from-green-400 dark:to-emerald-500">{item.score}</div>
                  <div className="text-[10px] uppercase tracking-wider font-bold text-slate-500 dark:text-slate-500">Score</div>
               </div>
            </div>
          ))}
       </div>
    </div>
  );
};

const SubjectMastery = ({ data }) => {
  if (!data) return <div className="animate-pulse bg-white/50 dark:bg-slate-800/50 h-72 rounded-3xl border border-slate-200 dark:border-slate-700"></div>;

  const colors = ['text-blue-500 dark:text-cyan-400', 'text-indigo-500 dark:text-indigo-400', 'text-purple-500 dark:text-purple-400'];
  const barColors = ['from-blue-400 to-blue-500 dark:from-cyan-400 dark:to-cyan-500', 'from-indigo-400 to-indigo-500 dark:from-indigo-400 dark:to-indigo-500', 'from-purple-400 to-purple-500 dark:from-purple-400 dark:to-purple-500'];

  return (
    <div className="bg-white/80 dark:bg-slate-800/50 backdrop-blur-sm rounded-3xl p-7 border border-slate-200 dark:border-slate-700 flex flex-col justify-between hover:border-blue-200 dark:hover:border-slate-600 transition-colors shadow-sm dark:shadow-none">
      <div className="mb-6">
         <h3 className="text-lg font-bold text-slate-800 dark:text-white tracking-tight transition-colors">Subject Mastery</h3>
         <p className="text-sm text-slate-500 dark:text-slate-400 font-medium mt-1 transition-colors">Based on recent tests</p>
      </div>
      <div className="space-y-6 flex-1 flex flex-col justify-center">
         {data.subjects.length > 0 ? data.subjects.map((sub, idx) => (
            <div key={idx} className="space-y-2">
                <div className="flex justify-between items-end">
                   <span className="text-sm text-slate-700 dark:text-slate-200 font-semibold transition-colors">{sub.subject}</span>
                   <span className={`${colors[idx % 3]} font-bold text-lg leading-none transition-colors`}>{sub.accuracy}%</span>
                </div>
                <div className="h-2.5 w-full bg-slate-100 dark:bg-slate-900 rounded-full overflow-hidden border border-slate-200 dark:border-slate-800 transition-colors">
                   <div className={`h-full bg-gradient-to-r ${barColors[idx % 3]} rounded-full shadow-[0_0_10px_rgba(0,0,0,0.1)] dark:shadow-[0_0_10px_rgba(0,0,0,0.5)] transition-colors`} style={{ width: `${sub.accuracy}%` }}></div>
                </div>
            </div>
         )) : (
             <div className="text-center text-slate-500 font-medium">Not enough data to calculate mastery.</div>
         )}
      </div>
      {data.focusArea !== "None" && (
        <div className="mt-6 pt-4 border-t border-slate-200 dark:border-slate-700/50 flex items-start gap-3 transition-colors">
            <div className="p-2 bg-orange-50 dark:bg-orange-500/10 text-orange-500 dark:text-orange-400 rounded-lg shrink-0 transition-colors">
               <Target size={18} />
            </div>
            <div>
               <p className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Suggested Focus Area</p>
               <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 mt-0.5 transition-colors">{data.focusArea}</p>
            </div>
        </div>
      )}
    </div>
  );
};

const UserDashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const { backend_url } = useAuth();
  const { userId } = useParams();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data } = await axios.get(`${backend_url}/api/dashboard/${userId}`);
        setDashboardData(data);
      } catch (error) {
        console.error("Failed to fetch dashboard data", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [backend_url, userId]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200 font-sans selection:bg-blue-200 dark:selection:bg-cyan-500/30 selection:text-slate-900 dark:selection:text-white pb-12 relative transition-colors duration-300">
      {/* Global Background Elements */}
      <div className="fixed top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
         <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-400/10 dark:bg-indigo-600/10 rounded-full filter blur-[100px] transition-colors duration-500"></div>
         <div className="absolute top-[20%] right-[-10%] w-[30%] h-[30%] bg-indigo-400/10 dark:bg-cyan-500/10 rounded-full filter blur-[100px] transition-colors duration-500"></div>
         <div className="absolute bottom-[-10%] left-[20%] w-[40%] h-[40%] bg-purple-400/10 dark:bg-purple-600/10 rounded-full filter blur-[100px] transition-colors duration-500"></div>
      </div>

      <div className="relative z-10">
        <Navbar user={dashboardData?.user} streak={dashboardData?.currentStreak} />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 grid grid-cols-1 lg:grid-cols-12 gap-6">
            
          {/* Left Column (Profile & Stats) */}
          <div className="lg:col-span-4 space-y-6">
            <ProfileCard user={dashboardData?.user} totalSolved={dashboardData?.solvedProgress?.totalSolved} />
            <CommunityStats stats={dashboardData?.communityStats} />
          </div>

          {/* Right Column (Charts & Activity) */}
          <div className="lg:col-span-8 space-y-6">
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-auto md:h-64">
                <SolvedProgress data={dashboardData?.solvedProgress} />
                <SubjectMastery data={dashboardData?.subjectMastery} />
             </div>
             
             <StudyHeatmap heatmapData={dashboardData?.heatmap} />
             
             <RecentActivity activities={dashboardData?.recentActivity} />
          </div>

        </div>
      </div>
    </div>
  );
};

export default UserDashboard;