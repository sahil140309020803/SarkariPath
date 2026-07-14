import React, { useEffect, useMemo, useState, useRef } from 'react';
import {
  Flame, Trophy, BookOpen, BarChart2, Calendar, Clock,
  UserCheck, ShieldCheck, TrendingUp, CheckCircle2, Edit3
} from 'lucide-react';
import Chart from 'chart.js/auto';
import { useUser } from '../context/UserContext';
import { useNavigate } from 'react-router-dom';
import BeautifulLoadingScreen from '../components/BeautifulLoadingScreen';
import Navbar from '../components/Navbar';
import { toast } from 'react-toastify';
import axios from 'axios';

const UserDashboard = () => {
  const {
    dashboardData,
    dashboardLoading: loading,
    dashboardError,
    fetchUserDashboardData,
    userDetails,
    setUserDetails,
    backend_url
  } = useUser();

  const navigate = useNavigate();

  const testsChartRef = useRef(null);
  const timeChartRef = useRef(null);
  const testsChartInstance = useRef(null);
  const timeChartInstance = useRef(null);

  const [showEditModal, setShowEditModal] = useState(false);
  const [editName, setEditName] = useState('');
  const [editUsername, setEditUsername] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    fetchUserDashboardData();
  }, []);

  useEffect(() => {
    if (showEditModal) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [showEditModal]);

  const handleOpenEditModal = () => {
    setEditName(userDetails?.name || '');
    setEditUsername(userDetails?.username || userDetails?.email?.split('@')[0] || '');
    setShowEditModal(true);
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    if (!editName.trim() || !editUsername.trim()) {
      toast.error("Name and username cannot be empty.");
      return;
    }

    const cleanUser = editUsername.toLowerCase().trim().replace(/[^a-z0-9_]/g, '');
    if (cleanUser !== editUsername) {
      toast.error("Username can only contain letters, numbers, and underscores.");
      return;
    }

    setIsUpdating(true);
    try {
      const response = await axios.post(`${backend_url}/api/auth/user/update-profile`, {
        name: editName.trim(),
        username: cleanUser
      }, { withCredentials: true });

      if (response.data.success) {
        toast.success(response.data.message);
        setUserDetails(prev => ({
          ...prev,
          name: response.data.user.name,
          username: response.data.user.username
        }));
        setShowEditModal(false);
      } else {
        toast.error(response.data.message || "Failed to update profile.");
      }
    } catch (err) {
      console.error(err);
      toast.error("An error occurred while updating profile.");
    } finally {
      setIsUpdating(false);
    }
  };

  // Compute stats for the last 7 calendar days
  const last7DaysData = useMemo(() => {
    const dates = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      dates.push(`${year}-${month}-${day}`);
    }

    const dailyStats = dashboardData?.dailyStatistics || [];
    const statsMap = new Map(dailyStats.map(s => [s.date, s]));

    return dates.map(dateStr => {
      const entry = statsMap.get(dateStr);
      const d = new Date(dateStr);
      const label = d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
      return {
        label,
        testsAttempted: entry?.testsAttempted || 0,
        studyMinutes: entry?.studyMinutes || 0
      };
    });
  }, [dashboardData?.dailyStatistics]);

  // Compute tests taken this week
  const testsThisWeek = useMemo(() => {
    return last7DaysData.reduce((sum, d) => sum + d.testsAttempted, 0);
  }, [last7DaysData]);

  // Compute study minutes this week
  const studyTimeThisWeek = useMemo(() => {
    return last7DaysData.reduce((sum, d) => sum + d.studyMinutes, 0);
  }, [last7DaysData]);
  const hoursStudyThisWeek = Math.floor(studyTimeThisWeek / 60);
  const minutesStudyThisWeek = studyTimeThisWeek % 60;

  // Compute total study minutes
  const totalStudyMinutes = useMemo(() => {
    return (dashboardData?.dailyStatistics || []).reduce((acc, h) => acc + h.studyMinutes, 0);
  }, [dashboardData?.dailyStatistics]);
  const hoursStudy = Math.floor(totalStudyMinutes / 60);
  const minutesStudy = totalStudyMinutes % 60;

  // Get top 3 exam preparation progress (fallback to default mock values if empty)
  const syllabusProgress = useMemo(() => {
    const dbProgress = dashboardData?.syllabusProgress || [];
    if (dbProgress.length > 0) {
      return [...dbProgress]
        .sort((a, b) => b.percentage - a.percentage)
        .slice(0, 3);
    }
    return [];
  }, [dashboardData?.syllabusProgress]);

  // Initialize and update charts
  useEffect(() => {
    if (loading || dashboardError || !dashboardData) return;

    const labels = last7DaysData.map(d => d.label);
    const testsData = last7DaysData.map(d => d.testsAttempted);
    const timeData = last7DaysData.map(d => d.studyMinutes);

    const isDark = document.documentElement.classList.contains('dark');
    const gridColor = isDark ? 'rgba(51, 65, 85, 0.4)' : 'rgba(226, 232, 240, 0.6)';
    const textColor = isDark ? '#94a3b8' : '#64748b';
    console.log(isDark);

    // 1. Tests Taken Chart
    if (testsChartRef.current) {
      if (testsChartInstance.current) {
        testsChartInstance.current.destroy();
      }

      const ctx = testsChartRef.current.getContext('2d');
      testsChartInstance.current = new Chart(ctx, {
        type: 'line',
        data: {
          labels,
          datasets: [{
            label: 'Tests Taken',
            data: testsData,
            borderColor: '#4f46e5', // indigo-600
            backgroundColor: 'rgba(79, 70, 229, 0.05)',
            fill: true,
            tension: 0.4,
            borderWidth: 2.5,
            pointBackgroundColor: '#4f46e5',
            pointHoverRadius: 6
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { display: false }
          },
          scales: {
            y: {
              grid: { display: true },
              ticks: { color: textColor, beginAtZero: true }
            },
            x: {
              grid: { display: false },
              ticks: { color: textColor }
            }
          }
        }
      });
    }

    // 2. Study Time Chart
    if (timeChartRef.current) {
      if (timeChartInstance.current) {
        timeChartInstance.current.destroy();
      }

      const ctx = timeChartRef.current.getContext('2d');
      timeChartInstance.current = new Chart(ctx, {
        type: 'bar',
        data: {
          labels,
          datasets: [{
            label: 'Minutes',
            data: timeData,
            backgroundColor: '#06b6d4', // cyan-500
            borderRadius: 4,
            barThickness: 12
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { display: false }
          },
          scales: {
            y: {
              grid: { display: true },
              ticks: { color: textColor, beginAtZero: true }
            },
            x: {
              grid: { display: false },
              ticks: { color: textColor }
            }
          }
        }
      });
    }

    return () => {
      if (testsChartInstance.current) testsChartInstance.current.destroy();
      if (timeChartInstance.current) timeChartInstance.current.destroy();
    };
  }, [loading, dashboardError, last7DaysData, dashboardData]);

  if (loading) {
    return <BeautifulLoadingScreen message="Loading dashboard..." />;
  }

  if (dashboardError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 transition-colors">
        <div className="text-center p-8 bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-red-100 dark:border-rose-900/30 max-w-md my-6">
          <div className="w-16 h-16 bg-red-100 dark:bg-red-950/30 text-red-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Trophy size={32} />
          </div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Error Loading Dashboard</h3>
          <p className="text-slate-650 dark:text-slate-400 mb-6 text-sm">{dashboardError}</p>
          <button
            onClick={fetchUserDashboardData}
            className="w-full bg-blue-600 dark:bg-indigo-655 text-white py-3 rounded-xl hover:bg-blue-700 dark:hover:bg-indigo-500 transition shadow-md font-bold cursor-pointer text-sm"
          >
            Retry Loading
          </button>
        </div>
      </div>
    );
  }

  const userInitials = userDetails?.name
    ? userDetails.name.substring(0, 1).toUpperCase()
    : 'SP';

  const joinedDate = userDetails?.createdAt
    ? new Date(userDetails.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })
    : 'N/A';

  const isEmailVerified = userDetails?.emailVerified ?? false;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 font-sans pb-16 relative transition-colors duration-300">

      {/* Background blobs for premium decoration */}
      <div className="fixed top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-15%] w-[45%] h-[45%] bg-blue-400/5 dark:bg-indigo-600/5 rounded-full filter blur-[120px] transition-colors duration-500"></div>
        <div className="absolute top-[20%] right-[-10%] w-[35%] h-[35%] bg-indigo-400/5 dark:bg-cyan-500/5 rounded-full filter blur-[120px] transition-colors duration-500"></div>
        <div className="absolute bottom-[-10%] left-[20%] w-[45%] h-[45%] bg-purple-400/5 dark:bg-purple-600/5 rounded-full filter blur-[120px] transition-colors duration-500"></div>
      </div>

      <div className="relative z-10">
        <Navbar />

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 space-y-8 animate-in fade-in duration-500">

          {/* =======================================================
              TOP HERO SECTION: USER CARD, SYLLABUS PROGRESS & STATS
             ======================================================= */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

            {/* Left Column: User Profile Card & Exam Preparation Progress */}
            <div className="lg:col-span-5 flex flex-col gap-6">

              {/* User Profile Card */}
              <div className="bg-gradient-to-br from-indigo-50/40 via-white to-blue-50/20 dark:from-slate-900 dark:via-slate-900 dark:to-indigo-950/20 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all duration-300 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/5 dark:bg-cyan-500/5 rounded-bl-full filter blur-md"></div>

                <div className="space-y-4 relative z-10">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-gradient-to-tr from-blue-500 to-indigo-600 dark:from-cyan-400 dark:to-indigo-500 rounded-2xl flex items-center justify-center text-3xl font-medium text-white shadow-md shadow-blue-200/80 dark:shadow-none transform group-hover:scale-102 transition-transform duration-300">
                      {userInitials}
                    </div>
                    <div>
                      <div className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider">Welcome Back</div>
                      <h2 className="text-xl font-bold text-slate-855 dark:text-white tracking-tight mt-0.5">{userDetails?.name}</h2>
                      <p className="text-slate-500 dark:text-slate-400 text-xs font-medium">@{userDetails?.username || userDetails?.email?.split('@')[0]}</p>
                    </div>
                  </div>

                  <div className="h-px bg-slate-150/80 dark:bg-slate-800/60"></div>

                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between text-xs font-semibold text-slate-550 dark:text-slate-400">
                      <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
                        <Calendar size={14} className="text-slate-400" />
                        <span>Joined Date</span>
                      </div>
                      <span className="text-slate-700 dark:text-slate-300">{joinedDate}</span>
                    </div>

                    <div className="flex items-center justify-between text-xs font-semibold text-slate-550 dark:text-slate-400">
                      <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
                        <ShieldCheck size={14} className="text-slate-400" />
                        <span>Email Verification</span>
                      </div>
                      {isEmailVerified ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-green-50/80 dark:bg-green-500/10 text-green-600 dark:text-green-400 border border-green-200/80 dark:border-green-500/20">
                          Verified
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-red-50/80 dark:bg-red-500/10 text-red-600 dark:text-red-400 border border-red-200/80 dark:border-red-500/20">
                          Unverified
                        </span>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={handleOpenEditModal}
                    className="w-full flex items-center justify-center gap-1.5 py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 dark:bg-cyan-500/10 text-white dark:text-cyan-400 font-bold text-xs border border-transparent dark:border-cyan-500/20 dark:hover:bg-cyan-500/20 dark:hover:border-cyan-400 transition-all duration-200 cursor-pointer shadow-sm hover:shadow-md"
                  >
                    <Edit3 size={13} />
                    Edit Profile
                  </button>
                </div>
              </div>

              {/* Exam Preparation Progress Card */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all duration-300">
                <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-5">Exam Preparation Progress</h3>

                <div className="space-y-4.5">
                  {syllabusProgress.map((item, idx) => (
                    <div key={idx} className="space-y-2">
                      <div className="flex justify-between text-xs font-semibold text-slate-700 dark:text-slate-400">
                        <span className="truncate max-w-[200px]" title={item.examName}>{item.examName}</span>
                        <span className="font-bold text-indigo-600 dark:text-cyan-400">{item.percentage}%</span>
                      </div>
                      <div className="h-2 w-full bg-slate-200/60 dark:bg-slate-800/60 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 dark:from-cyan-400 dark:to-indigo-500 rounded-full transition-all duration-500"
                          style={{ width: `${item.percentage}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>

            {/* Right Column: 2x2 Stats Grid */}
            <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-6">

              {/* Stat 1: Tests Taken */}
              <div className="bg-white dark:bg-slate-900 border-slate-200  border-l-4 border-l-blue-500 rounded-2xl p-6 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 flex flex-col justify-between h-[155px]">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Tests Taken</span>
                  <div className="p-2.5 bg-blue-50/80 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-xl">
                    <Trophy size={18} />
                  </div>
                </div>
                <div>
                  <h3 className="text-3xl font-bold text-slate-850 dark:text-white leading-none">{dashboardData?.testsAttempted || 0}</h3>
                  <div className="flex items-center justify-between mt-3 text-[11px] text-slate-450 dark:text-slate-500 font-semibold border-t border-slate-100 dark:border-slate-800/60 pt-2.5">
                    <span>Total Attempts</span>
                    <span className="text-blue-600 dark:text-cyan-450 bg-blue-50 dark:bg-cyan-950/20 px-2 py-0.5 rounded font-bold">This Week: {testsThisWeek}</span>
                  </div>
                </div>
              </div>

              {/* Stat 2: Average Score */}
              <div className="bg-white dark:bg-slate-900 border-slate-200  border-l-4 border-l-indigo-500 rounded-2xl p-6 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 flex flex-col justify-between h-[155px]">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Average Score</span>
                  <div className="p-2.5 bg-indigo-50/80 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-xl">
                    <BarChart2 size={18} />
                  </div>
                </div>
                <div>
                  <h3 className="text-3xl font-bold text-slate-850 dark:text-white leading-none">{dashboardData?.averageScore || 0}%</h3>
                  <div className="flex items-center justify-between mt-3 text-[11px] text-slate-450 dark:text-slate-500 font-semibold border-t border-slate-100 dark:border-slate-800/60 pt-2.5">
                    <span>Rolling Average</span>
                    <span className="text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/20 px-2 py-0.5 rounded font-bold">Accuracy base</span>
                  </div>
                </div>
              </div>

              {/* Stat 3: Current Streak */}
              <div className="bg-white dark:bg-slate-900 border-slate-200 border-l-4 border-l-orange-500 rounded-2xl p-6 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 flex flex-col justify-between h-[155px]">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Current Streak</span>
                  <div className="p-2.5 bg-orange-50/80 dark:bg-orange-500/10 text-orange-600 dark:text-orange-400 rounded-xl">
                    <Flame size={18} className="fill-orange-500" />
                  </div>
                </div>
                <div>
                  <h3 className="text-3xl font-bold text-slate-850 dark:text-white leading-none">
                    {dashboardData?.currentStreak || 0} <span className="text-xs font-bold text-slate-450 dark:text-slate-500 uppercase">Days</span>
                  </h3>
                  <div className="flex items-center justify-between mt-3 text-[11px] text-slate-450 dark:text-slate-500 font-semibold border-t border-slate-100 dark:border-slate-800/60 pt-2.5">
                    <span>Active Streak</span>
                    <span className="text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-950/20 px-2 py-0.5 rounded font-bold">Best: {dashboardData?.longestStreak || 0}d</span>
                  </div>
                </div>
              </div>

              {/* Stat 4: Study Time */}
              <div className="bg-white dark:bg-slate-900 border-slate-200 border-l-4 border-l-cyan-500 rounded-2xl p-6 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 flex flex-col justify-between h-[155px]">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Study Duration</span>
                  <div className="p-2.5 bg-cyan-50/80 dark:bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 rounded-xl">
                    <Clock size={18} />
                  </div>
                </div>
                <div>
                  <h3 className="text-3xl font-bold text-slate-850 dark:text-white leading-none flex items-end gap-2">
                    {hoursStudy}
                    <span className="text-xs font-bold text-slate-450 dark:text-slate-500 uppercase">Hrs</span>
                    {minutesStudy}
                    <span className="text-xs font-bold text-slate-450 dark:text-slate-500 uppercase">Mins</span>
                  </h3>
                  <div className="flex items-center justify-between mt-3 text-[11px] text-slate-450 dark:text-slate-500 font-semibold border-t border-slate-100 dark:border-slate-800/60 pt-2.5">
                    <span>Cumulative study</span>
                    <span className="text-cyan-600 dark:text-cyan-400 bg-cyan-50 dark:bg-cyan-900/20 px-2 py-0.5 rounded font-bold">This Week: {hoursStudyThisWeek} hrs {minutesStudyThisWeek}mins
                    </span>
                  </div>
                </div>
              </div>

            </div>

          </div>

          {/* =======================================================
              MIDDLE SECTION: DUAL CHARTS (TESTS TAKEN & STUDY TIME)
             ======================================================= */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

            {/* Chart 1: Tests Taken Chart */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden">
              <div className="flex justify-between items-center mb-4">
                <div>
                  <h3 className="text-xs font-bold text-slate-700 dark:text-slate-400 uppercase tracking-widest">Tests Attempted Trend</h3>
                  <p className="text-xs text-slate-600 dark:text-slate-500 mt-1 font-medium">Daily exam attempts over last 7 days</p>
                </div>
                <div className="p-2 bg-slate-50 dark:bg-slate-800/80 text-indigo-600 dark:text-indigo-400 border border-slate-150 dark:border-slate-700 rounded-xl">
                  <TrendingUp size={16} />
                </div>
              </div>
              <div className="h-60 w-full">
                <canvas ref={testsChartRef}></canvas>
              </div>
            </div>

            {/* Chart 2: Study Time Chart */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden">
              <div className="flex justify-between items-center mb-4">
                <div>
                  <h3 className="text-xs font-bold text-slate-700 dark:text-slate-400 uppercase tracking-widest">Study Time Distribution</h3>
                  <p className="text-xs text-slate-600 dark:text-slate-500 mt-1 font-medium">Daily practice minutes over last 7 days</p>
                </div>
                <div className="p-2 bg-slate-50 dark:bg-slate-800/80 text-cyan-600 dark:text-cyan-400 border border-slate-150 dark:border-slate-700 rounded-xl">
                  <BarChart2 size={16} />
                </div>
              </div>
              <div className="h-60 w-full">
                <canvas ref={timeChartRef}></canvas>
              </div>
            </div>

          </div>

          {/* =======================================================
              BOTTOM SECTION: RECENT TEST HISTORY (SLIDABLE FLOATING CARD ROWS)
             ======================================================= */}
          <div className="space-y-4">
            <div className="flex justify-between items-center px-2">
              <div>
                <h3 className="text-xs font-bold text-slate-800 dark:text-slate-400 uppercase tracking-widest">Recent Test History</h3>
                <p className="text-xs text-slate-600 dark:text-slate-500 mt-1 font-medium">Detailed records of your last 10 attempts</p>
              </div>
              <div className="p-2.5 bg-white dark:bg-slate-900 rounded-xl text-slate-500 border border-slate-200 dark:border-slate-800 shadow-sm">
                <BookOpen size={16} />
              </div>
            </div>

            {(!dashboardData?.recentActivity || dashboardData.recentActivity.length === 0) ? (
              <div className="text-center py-16 border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl bg-white dark:bg-slate-900 shadow-sm">
                <div className="bg-slate-100 dark:bg-slate-800 inline-block p-4 rounded-full mb-3 text-slate-400">
                  <BookOpen size={28} />
                </div>
                <p className="text-slate-550 dark:text-slate-455 font-medium">No tests taken yet. Start practicing and test your skills!</p>
              </div>
            ) : (
              <div className="space-y-3">
                {dashboardData.recentActivity.map((activity, idx) => (
                  <div
                    key={idx}
                    onClick={() => activity.id && navigate(`/analysis/${activity.id}`)}
                    className="flex flex-col md:flex-row md:items-center justify-between p-4.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 shadow-sm hover:shadow-md hover:border-blue-200 dark:hover:border-slate-700/80 hover:-translate-y-0.5 transition-all duration-300 gap-4 cursor-pointer"
                  >
                    {/* Left details */}
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-cyan-400 flex items-center justify-center font-bold text-xs shrink-0 shadow-inner">
                        {idx + 1}
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-800 dark:text-slate-200 text-sm leading-tight">{activity.title}</h4>
                        <p className="text-[10px] text-slate-600 dark:text-slate-500 font-semibold mt-1">
                          Attempted: {new Date(activity.time).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                        </p>
                      </div>
                    </div>

                    {/* Right details */}
                    <div className="flex flex-wrap items-center justify-between md:justify-end gap-5 md:gap-10 border-t border-slate-50 md:border-t-0 pt-3 md:pt-0 dark:border-slate-800/40">
                      <div className='flex flex-col items-center'>
                        <span className="text-[9px] text-slate-400 dark:text-slate-500 uppercase tracking-widest font-bold block">Score</span>
                        <span className="text-sm font-semibold text-slate-800 dark:text-slate-400">{activity.score}</span>
                      </div>

                      <div>
                        <span className="text-[9px] text-slate-400 dark:text-slate-500 uppercase tracking-widest font-bold block mb-0.5">Percentage</span>
                        <span className="inline-flex items-center justify-center font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30 px-2.5 py-1 rounded-lg text-xs">
                          {activity.percentage}%
                        </span>
                      </div>

                      <div>
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold bg-green-50/80 dark:bg-green-500/10 text-green-600 dark:text-green-400 border border-green-200/60 dark:border-green-500/25">
                          <CheckCircle2 size={11} className="text-green-500" />
                          Completed
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

          </div>

        </main>
      </div>

      {/* Edit Profile Modal */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-slate-100 dark:border-slate-800/80 flex justify-between items-center">
              <h3 className="text-base font-bold text-slate-850 dark:text-white">Edit Profile</h3>
              <button
                onClick={() => setShowEditModal(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-white text-lg font-bold"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleUpdateProfile} className="p-6 space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1.5">Email Address</label>
                <input
                  type="email"
                  value={userDetails?.email || ''}
                  disabled
                  className="w-full bg-slate-300/40 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-600 dark:text-slate-500 cursor-not-allowed outline-none font-medium select-none"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1.5">Full Name</label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  placeholder="Enter your name"
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-800 dark:text-slate-200 outline-none focus:border-blue-500 dark:focus:border-cyan-400 focus:ring-2 focus:ring-blue-500/10 dark:focus:ring-cyan-500/10 transition-all font-semibold"
                  required
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1.5">Username</label>
                <div className="relative flex items-center">
                  <span className="absolute left-4 text-slate-400 dark:text-slate-500 font-bold text-xs select-none">@</span>
                  <input
                    type="text"
                    value={editUsername}
                    onChange={(e) => setEditUsername(e.target.value.toLowerCase().replace(/\s/g, ''))}
                    placeholder="username"
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl pl-8 pr-4 py-2.5 text-xs text-slate-800 dark:text-slate-200 outline-none focus:border-blue-500 dark:focus:border-cyan-400 focus:ring-2 focus:ring-blue-500/10 dark:focus:ring-cyan-500/10 transition-all font-semibold"
                    required
                  />
                </div>
                <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1.5 font-medium leading-relaxed">
                  Only lowercase letters, numbers, and underscores allowed.
                </p>
              </div>

              <div className="flex gap-3 pt-3 border-t border-slate-100 dark:border-slate-800/80 mt-6">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="flex-1 py-2.5 text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-600 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUpdating}
                  className="flex-[2] py-2.5 bg-blue-600 hover:bg-blue-700 dark:bg-cyan-500 dark:hover:bg-cyan-600 text-white dark:text-slate-800 font-bold text-xs rounded-xl border border-transparent transition-all cursor-pointer flex items-center justify-center gap-2 shadow-sm animate-none"
                >
                  {isUpdating ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white dark:border-slate-950/30 dark:border-t-slate-950 rounded-full animate-spin"></div>
                  ) : (
                    "Save Changes"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserDashboard;