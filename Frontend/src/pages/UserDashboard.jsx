import React, { useEffect, useMemo, useState } from 'react';
import { Search, Bell, Flame, Trophy, BookOpen, BarChart2, Check } from 'lucide-react';
import axios from 'axios'; 
import { useAuth } from '../context/AuthContext';
import { useParams } from 'react-router-dom';

const Navbar = ({ user, streak }) => {
  return (
    <nav className="bg-[#1e293b] border-b border-slate-700 px-6 py-3 flex items-center justify-between sticky top-0 z-50">
      <div className="flex items-center gap-8">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold text-xl">S</div>
          <span className="text-xl font-bold text-white tracking-tight">Sarkari<span className="text-indigo-400">Path</span></span>
        </div>
        <div className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-400">
          <a href="#" className="text-white hover:text-indigo-400 transition-colors">Dashboard</a>
          <a href="#" className="hover:text-indigo-400 transition-colors">Exams</a>
          <a href="#" className="hover:text-indigo-400 transition-colors">Mock Tests</a>
        </div>
      </div>
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 bg-orange-900/30 text-orange-400 px-3 py-1.5 rounded-full border border-orange-900/50">
            <Flame className="w-4 h-4 fill-orange-500" />
            <span className="text-sm font-bold">{streak}</span>
          </div>
          <div className="w-9 h-9 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-700 font-medium cursor-pointer">
            {user ? user.name.substring(0,2).toUpperCase() : 'US'}
          </div>
        </div>
      </div>
    </nav>
  );
};

const ProfileCard = ({ user }) => {
  if (!user) return <div className="animate-pulse bg-[#1e293b] h-64 rounded-2xl"></div>;

  return (
    <div className="bg-[#1e293b] rounded-2xl p-6 border border-slate-700 flex flex-col items-center text-center">
      <div className="w-24 h-24 bg-teal-500 rounded-2xl flex items-center justify-center text-3xl font-bold text-white mb-4 shadow-lg shadow-teal-500/20">
        {user.name.substring(0,2).toUpperCase()}
      </div>
      <h2 className="text-xl font-bold text-white">{user.name}</h2>
      <p className="text-slate-400 text-sm mb-4">{user.handle}</p>
      
      <div className="mb-6">
        <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Rank</p>
        <p className="text-2xl font-bold text-white">{user.rank.toLocaleString()}</p>
        <p className="text-xs text-slate-500">of {user.rankTotal.toLocaleString()}</p>
      </div>

      <button className="w-full py-2.5 bg-teal-600 hover:bg-teal-500 text-white rounded-lg font-medium transition-colors shadow-lg shadow-teal-900/50">
        Edit Profile
      </button>
    </div>
  );
};

const SolvedProgress = ({ data }) => {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { const timer = setTimeout(() => setMounted(true), 100); return () => clearTimeout(timer); }, []);

  if (!data) return <div className="animate-pulse bg-[#1e293b] h-40 rounded-2xl"></div>;

  const { totalSolved, totalQuestions, details } = data;
  
  const radius = 50;
  const circumference = 2 * Math.PI * radius;
  
  const easyPercent = details.easy.count / (totalQuestions || 1);
  const medPercent = details.medium.count / (totalQuestions || 1);
  const hardPercent = details.hard.count / (totalQuestions || 1);

  const easyStroke = circumference * easyPercent;
  const medStroke = circumference * medPercent;
  const hardStroke = circumference * hardPercent;

  return (
    <div className="bg-[#1e293b] rounded-2xl p-6 border border-slate-700 h-full flex items-center justify-between gap-6">
       <div className="relative w-40 h-40 flex-shrink-0">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 120 120">
             <circle cx="60" cy="60" r={radius} fill="none" stroke="#334155" strokeWidth="8" strokeLinecap="round"/>
             <circle cx="60" cy="60" r={radius} fill="none" stroke="#2dd4bf" strokeWidth="8" strokeLinecap="round" strokeDasharray={circumference} strokeDashoffset={mounted ? circumference - easyStroke : circumference} className="transition-all duration-1000 ease-out"/>
             <circle cx="60" cy="60" r={radius} fill="none" stroke="#facc15" strokeWidth="8" strokeLinecap="round" strokeDasharray={circumference} strokeDashoffset={mounted ? circumference - medStroke : circumference} className="transition-all duration-1000 ease-out delay-300" style={{ transformOrigin: 'center', transform: `rotate(${easyPercent * 360}deg)` }}/>
             <circle cx="60" cy="60" r={radius} fill="none" stroke="#ef4444" strokeWidth="8" strokeLinecap="round" strokeDasharray={circumference} strokeDashoffset={mounted ? circumference - hardStroke : circumference} className="transition-all duration-1000 ease-out delay-500" style={{ transformOrigin: 'center', transform: `rotate(${(easyPercent + medPercent) * 360}deg)` }}/>
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
             <div className="text-3xl font-bold text-white leading-none tracking-tight">{totalSolved}</div>
             <div className="text-[10px] text-slate-500 font-medium mt-1 mb-1">/{totalQuestions}</div>
             <div className="flex items-center gap-1 bg-green-900/20 px-2 py-0.5 rounded-full border border-green-900/50">
                <Check size={10} strokeWidth={3} className="text-green-400" /> 
                <span className="text-green-400 text-[10px] font-bold uppercase">Solved</span>
             </div>
          </div>
       </div>

       <div className="flex-1 space-y-3 min-w-[140px]">
          <div className="flex justify-between items-center p-2 rounded-lg bg-[#253045] border border-slate-700/50">
             <span className="text-xs font-semibold text-teal-400">Easy</span>
             <div className="text-right">
                <span className="text-sm font-bold text-white">{details.easy.count}</span>
                <span className="text-xs text-slate-500">/{details.easy.total}</span>
             </div>
          </div>
          <div className="flex justify-between items-center p-2 rounded-lg bg-[#253045] border border-slate-700/50">
             <span className="text-xs font-semibold text-yellow-400">Med.</span>
             <div className="text-right">
                <span className="text-sm font-bold text-white">{details.medium.count}</span>
                <span className="text-xs text-slate-500">/{details.medium.total}</span>
             </div>
          </div>
          <div className="flex justify-between items-center p-2 rounded-lg bg-[#253045] border border-slate-700/50">
             <span className="text-xs font-semibold text-red-400">Hard</span>
             <div className="text-right">
                <span className="text-sm font-bold text-white">{details.hard.count}</span>
                <span className="text-xs text-slate-500">/{details.hard.total}</span>
             </div>
          </div>
       </div>
    </div>
  );
};

const CommunityStats = ({ stats }) => {
  if (!stats) return <div className="animate-pulse bg-[#1e293b] h-64 rounded-2xl"></div>;

  return (
    <div className="bg-[#1e293b] rounded-2xl p-6 border border-slate-700">
      <h3 className="text-sm font-bold text-slate-400 uppercase mb-4">Community Stats</h3>
      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-900/30 rounded-lg text-blue-400"><Trophy size={18} /></div>
            <div><p className="text-sm text-slate-400">Tests</p></div>
          </div>
          <span className="font-bold text-lg text-white">{stats.tests}</span>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-900/30 rounded-lg text-green-400"><BookOpen size={18} /></div>
            <div><p className="text-sm text-slate-400">Questions</p></div>
          </div>
          <span className="font-bold text-lg text-white">{stats.questions}</span>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-teal-900/30 rounded-lg text-teal-400"><BarChart2 size={18} /></div>
            <div><p className="text-sm text-slate-400">Avg Score</p></div>
          </div>
          <span className="font-bold text-lg text-white">{stats.avgScore}%</span>
        </div>
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
     if (intensity === 0) return "bg-[#1e293b] border border-slate-700";
     switch(intensity) {
         case 1: return "bg-[#0e4429]";
         case 2: return "bg-[#006d32]";
         case 3: return "bg-[#26a641]";
         case 4: return "bg-[#39d353]";
         default: return "bg-[#161b22]";
     }
  };

  if (!heatmapData) return <div className="animate-pulse bg-[#1e293b] h-48 rounded-2xl w-full"></div>;

  return (
    <div className="bg-[#1e293b] rounded-xl p-6 border border-slate-800 w-full text-slate-300">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
        <div className="text-white text-lg">
          <span className="font-semibold">{totalSubmissions}</span> submissions <span className="text-slate-500 text-sm">last year</span>
        </div>
        <div className="flex items-center gap-6 text-xs text-slate-400">
           <div>Active days: <span className="text-white font-semibold">{activeDays}</span></div>
           <div>Max streak: <span className="text-white font-semibold">{maxStreak}</span></div>
        </div>
      </div>
      <div className="w-full overflow-x-auto pb-2 custom-scrollbar">
        <div className="min-w-max flex gap-2">
            <div className="flex flex-col justify-between py-[2px] pr-2 text-[10px] text-slate-500 font-medium pt-5 sticky left-0 bg-[#1e293b] z-10 h-[7.75rem]">
                <span>Sun</span><span>Sat</span>
            </div>
            {months.map((month, mIndex) => (
                <div key={mIndex} className="flex flex-col gap-1">
                    <span className="text-xs text-slate-400 h-4 pl-0.5">{month.name}</span>
                    <div className="grid grid-rows-7 grid-flow-col gap-[3px]">
                        {month.weeks.map((week, wIndex) => (
                            week.map((day, dIndex) => (
                                <div key={`${mIndex}-${wIndex}-${dIndex}`} 
                                     className={`w-3 h-3 rounded-[2px] ${day === null ? 'opacity-0' : getColor(day.intensity)}`}
                                     title={day && day.date ? day.date.toDateString() : ''}
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
  if (!activities) return <div className="animate-pulse bg-[#1e293b] h-64 rounded-2xl"></div>;

  return (
    <div className="bg-[#1e293b] rounded-2xl p-6 border border-slate-700">
       <h3 className="text-lg font-bold text-white mb-6">Recent Activity</h3>
       <div className="space-y-4">
          {activities.length === 0 ? <p className="text-slate-500">No recent activity.</p> : 
           activities.map((item, idx) => (
            <div key={idx} className="flex items-center justify-between p-4 rounded-xl bg-[#253045] border border-slate-700/50 hover:border-slate-600 transition-colors">
               <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-teal-900/20 rounded-lg flex items-center justify-center text-teal-400 border border-teal-900/50">
                     <BookOpen size={20} />
                  </div>
                  <div>
                     <h4 className="font-semibold text-white">{item.title}</h4>
                     <p className="text-sm text-slate-400">{new Date(item.time).toLocaleDateString()}</p>
                  </div>
               </div>
               <div className="text-right">
                  <div className="text-xl font-bold text-green-400">{item.score}</div>
                  <div className="text-xs text-slate-500">Score</div>
               </div>
            </div>
          ))}
       </div>
    </div>
  );
};

const SubjectMastery = ({ data }) => {
  if (!data) return <div className="animate-pulse bg-[#1e293b] h-64 rounded-2xl"></div>;

  const colors = ['text-green-400', 'text-teal-400', 'text-orange-400'];
  const barColors = ['bg-green-500', 'bg-teal-500', 'bg-orange-500'];

  return (
    <div className="bg-[#1e293b] rounded-2xl p-6 border border-slate-700 flex flex-col justify-between">
      <div className="flex justify-between items-end mb-4">
         <h3 className="text-lg font-bold text-white">Subject Mastery</h3>
      </div>
      <div className="space-y-4">
         {data.subjects.map((sub, idx) => (
            <div key={idx} className="space-y-1.5">
                <div className="flex justify-between text-xs">
                   <span className="text-slate-300 font-medium">{sub.subject}</span>
                   <span className={`${colors[idx % 3]} font-bold`}>{sub.accuracy}%</span>
                </div>
                <div className="h-2 w-full bg-[#2d3a4f] rounded-full overflow-hidden">
                   <div className={`h-full ${barColors[idx % 3]} rounded-full`} style={{ width: `${sub.accuracy}%` }}></div>
                </div>
            </div>
         ))}
         <div className="pt-2 flex items-center gap-2 text-xs text-slate-500">
            <div className="w-1.5 h-1.5 rounded-full bg-orange-500"></div>
            <span>Focus area: {data.focusArea}</span>
         </div>
      </div>
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
        console.log(data);
      } catch (error) {
        console.error("Failed to fetch dashboard data", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="min-h-screen bg-[#0f172a] text-slate-200 font-sans selection:bg-teal-500 selection:text-white">
      <Navbar user={dashboardData?.user} streak={dashboardData?.currentStreak} />

      <div className="max-w-7xl mx-auto p-6 grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="space-y-6">
          <ProfileCard user={dashboardData?.user} />
          <CommunityStats stats={dashboardData?.communityStats} />
        </div>

        <div className="lg:col-span-3 space-y-6">
           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <SolvedProgress data={dashboardData?.solvedProgress} />
              <SubjectMastery data={dashboardData?.subjectMastery} />
           </div>
           <StudyHeatmap heatmapData={dashboardData?.heatmap} />
           <RecentActivity activities={dashboardData?.recentActivity} />
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;