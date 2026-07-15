import React, { useEffect, useRef, useState } from 'react';
import Chart from 'chart.js/auto';
import axios from 'axios';
import { useUser } from '../../context/UserContext';
import {
    Users, Activity, RefreshCw, Zap, Monitor, Clock,
    FileText, Trophy, TrendingUp, Search
} from 'lucide-react';
import BeautifulLoadingScreen from '../BeautifulLoadingScreen';

const Analytics = () => {
    // Refs for visitor/session analytics charts
    const durationChartRef = useRef(null);
    const trafficChartRef = useRef(null);
    const testAttemptsChartRef = useRef(null);

    const { backend_url } = useUser();
    const [loading, setLoading] = useState(true);

    // Visitor and Session statistics state
    const [visitorStats, setVisitorStats] = useState({
        totalVisitors: 0,
        onlineUsers: 0,
        returningVisitors: 0,
        newVisitorsToday: 0,
        totalRegisteredUsers: 0,
        registrationsToday: 0,
        conversionRate: 0,
        websiteVisits: 0,
        avgTimePerUser: 0,
        testsAttemptedToday: 0,
        totalTestsAttempted: 0,
        returningVisitorsToday: 0,
        todayWebsiteVisits: 0
    });

    const [visitorGraphs, setVisitorGraphs] = useState([]);

    // Auto-refresh timer state
    const [countdown, setCountdown] = useState(120);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [isInitialLoading, setIsInitialLoading] = useState(true);

    // User Management table states
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('all'); // 'all', 'online', 'offline'
    const [usersList, setUsersList] = useState([]);
    const [usersLoading, setUsersLoading] = useState(false);

    const fetchAllAnalytics = async (isBackground = false) => {
        if (!isBackground) {
            setLoading(true);
        } else {
            setIsRefreshing(true);
        }
        try {
            const [cardsRes, graphsRes, usersRes] = await Promise.all([
                axios.get(`${backend_url}/api/admin/visitor-analytics/cards`, { withCredentials: true }),
                axios.get(`${backend_url}/api/admin/visitor-analytics/graphs`, { withCredentials: true }),
                axios.get(`${backend_url}/api/admin/visitor-analytics/users?search=${encodeURIComponent(searchQuery)}&status=${statusFilter}`, { withCredentials: true })
            ]);

            if (cardsRes.data.success) {
                setVisitorStats(cardsRes.data.stats);
            }
            if (graphsRes.data.success) {
                setVisitorGraphs(graphsRes.data.chartData);
            }
            if (usersRes.data.success) {
                setUsersList(usersRes.data.users);
            }
        } catch (error) {
            console.error("Failed to fetch analytics metrics:", error);
        } finally {
            setLoading(false);
            setIsRefreshing(false);
            setIsInitialLoading(false);
        }
    };

    // Separated user fetch function for instant search/filter responsiveness
    const fetchUsers = async (search = '', status = 'all') => {
        setUsersLoading(true);
        try {
            const queryParams = [];
            if (search) queryParams.push(`search=${encodeURIComponent(search)}`);
            if (status !== 'all') queryParams.push(`status=${status}`);

            const queryString = queryParams.length > 0 ? `?${queryParams.join('&')}` : '';
            const { data } = await axios.get(`${backend_url}/api/admin/visitor-analytics/users${queryString}`, { withCredentials: true });

            if (data.success) {
                setUsersList(data.users);
            }
        } catch (error) {
            console.error("Failed to fetch analytics users:", error);
        } finally {
            setUsersLoading(false);
        }
    };

    useEffect(() => {
        fetchAllAnalytics(false);
    }, [backend_url]);

    // Timer loop for background refreshes
    useEffect(() => {
        if (loading || isInitialLoading) return;

        const interval = setInterval(() => {
            setCountdown(prev => {
                if (prev <= 1) {
                    fetchAllAnalytics(true);
                    return 120;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(interval);
    }, [loading, isInitialLoading, backend_url]);

    // Fetch user table data on query updates (debounced slightly to avoid keypress hammer)
    useEffect(() => {
        if (isInitialLoading) return;
        const delayDebounceFn = setTimeout(() => {
            fetchUsers(searchQuery, statusFilter);
        }, 300);

        return () => clearTimeout(delayDebounceFn);
    }, [searchQuery, statusFilter]);

    const handleManualRefresh = () => {
        fetchAllAnalytics(true);
        setCountdown(120);
    };

    // Render visitor charts
    useEffect(() => {
        const charts = [];

        // 1. Average Session Duration (Past 7 Days)
        if (durationChartRef.current && visitorGraphs.length > 0) {
            const ctx = durationChartRef.current.getContext('2d');
            charts.push(new Chart(ctx, {
                type: 'line',
                data: {
                    labels: visitorGraphs.map(item => item.date),
                    datasets: [{
                        label: 'Avg Time Spent / User (Minutes)',
                        data: visitorGraphs.map(item => item.avgTimePerUser),
                        borderColor: '#10b981', // emerald-500
                        backgroundColor: 'rgba(16, 185, 129, 0.1)',
                        fill: true,
                        tension: 0.35,
                        borderWidth: 2
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                        y: { beginAtZero: true, grid: { color: 'rgba(148, 163, 184, 0.1)' }, ticks: { color: '#94a3b8' } },
                        x: { grid: { display: false }, ticks: { color: '#94a3b8' } }
                    },
                    plugins: {
                        legend: { display: false }
                    }
                }
            }));
        }

        // 2. Visitors vs Registrations (Past 7 Days)
        if (trafficChartRef.current && visitorGraphs.length > 0) {
            const ctx = trafficChartRef.current.getContext('2d');
            charts.push(new Chart(ctx, {
                type: 'line',
                data: {
                    labels: visitorGraphs.map(item => item.date),
                    datasets: [
                        {
                            label: 'New Visitors',
                            data: visitorGraphs.map(item => item.visitors),
                            borderColor: '#3b82f6', // blue-500
                            backgroundColor: 'transparent',
                            tension: 0.35,
                            borderWidth: 2
                        },
                        {
                            label: 'Registrations',
                            data: visitorGraphs.map(item => item.registrations),
                            borderColor: '#8b5cf6', // violet-500
                            backgroundColor: 'transparent',
                            tension: 0.35,
                            borderWidth: 2
                        }
                    ]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                        y: { beginAtZero: true, grid: { color: 'rgba(148, 163, 184, 0.1)' }, ticks: { color: '#94a3b8' } },
                        x: { grid: { display: false }, ticks: { color: '#94a3b8' } }
                    },
                    plugins: {
                        legend: {
                            labels: { color: '#94a3b8', boxWidth: 12, usePointStyle: true }
                        }
                    }
                }
            }));
        }

        // 3. Daily Test Attempts (Past 7 Days)
        if (testAttemptsChartRef.current && visitorGraphs.length > 0) {
            const ctx = testAttemptsChartRef.current.getContext('2d');
            charts.push(new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: visitorGraphs.map(item => item.date),
                    datasets: [{
                        label: 'Tests Attempted',
                        data: visitorGraphs.map(item => item.testAttempts),
                        backgroundColor: '#f59e0b', // amber-500
                        borderRadius: 6
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                        y: { beginAtZero: true, grid: { color: 'rgba(148, 163, 184, 0.1)' }, ticks: { color: '#94a3b8' } },
                        x: { grid: { display: false }, ticks: { color: '#94a3b8' } }
                    },
                    plugins: {
                        legend: { display: false }
                    }
                }
            }));
        }

        return () => {
            charts.forEach(chart => chart.destroy());
        };
    }, [visitorGraphs]);

    if (loading) {
        return <BeautifulLoadingScreen message="Loading Platform Analytics..." />;
    }

    return (
        <div className="space-y-10">
            {/* Header section with auto-refresh */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                <div>
                    <h2 className="text-3xl font-bold text-gray-800 dark:text-white transition-colors">Visitor & Session Analytics</h2>
                    <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">Real-time visitor telemetry and user metrics</p>
                </div>
                <div className="flex items-center gap-3 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-xl px-4 py-2 shadow-sm text-sm">
                    <div className="flex items-center gap-2 text-gray-600 dark:text-slate-350">
                        <Clock size={16} className={`text-indigo-500 ${isRefreshing ? 'animate-spin' : 'animate-pulse'}`} />
                        <span>Auto-refresh in <strong className="font-semibold text-indigo-600 dark:text-indigo-400">{countdown}s</strong></span>
                    </div>
                    <span className="w-px h-4 bg-gray-200 dark:bg-slate-800"></span>
                    <button
                        onClick={handleManualRefresh}
                        disabled={isRefreshing}
                        className="text-gray-500 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400 transition-colors p-1 hover:bg-gray-50 dark:hover:bg-slate-800 rounded-lg flex items-center justify-center disabled:opacity-50"
                        title="Refresh Now"
                    >
                        <RefreshCw size={15} className={isRefreshing ? 'animate-spin' : ''} />
                    </button>
                </div>
            </div>

            {/* 8 KPI Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
                {/* Total Visitors */}
                <div className="p-6 rounded-xl border border-gray-200 dark:border-slate-800 flex items-center justify-between bg-gradient-to-br from-indigo-50/50 dark:from-slate-800 to-white dark:to-slate-900 transition-all duration-300 hover:shadow-lg shadow-sm dark:hover:shadow-md dark:hover:shadow-indigo-500/10">
                    <div>
                        <p className="text-sm font-medium text-gray-500 dark:text-slate-400">Total Visitors</p>
                        <p className="text-3xl font-bold text-gray-800 dark:text-white mt-1">{visitorStats.totalVisitors}</p>
                    </div>
                    <div className="flex flex-col items-end">
                        <span className="text-[10px] font-bold text-gray-400 dark:text-slate-500 uppercase tracking-wider">Today</span>
                        <div className="flex items-center gap-1 text-emerald-500 dark:text-emerald-400 font-bold text-xl mt-0.5">
                            <TrendingUp size={25} />
                            <span>+{visitorStats.newVisitorsToday}</span>
                        </div>
                    </div>
                </div>

                {/* Online Users */}
                <div className="p-6 rounded-xl border border-gray-200 dark:border-slate-800 flex items-center justify-between bg-gradient-to-br from-emerald-50/50 dark:from-slate-800 to-white dark:to-slate-900 transition-all duration-300 hover:shadow-lg shadow-sm dark:hover:shadow-md dark:hover:shadow-indigo-500/10">
                    <div>
                        <p className="text-sm font-medium text-gray-500 dark:text-slate-400 flex items-center">
                            <span className="relative flex h-2 w-2 mr-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                            </span>
                            Online Users
                        </p>
                        <p className="text-3xl font-bold text-gray-800 dark:text-white mt-1">{visitorStats.onlineUsers}</p>
                    </div>
                    <div className="bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 p-3 rounded-full">
                        <Activity size={24} />
                    </div>
                </div>

                {/* Returning Visitors */}
                <div className="p-6 rounded-xl border border-gray-200 dark:border-slate-800 flex items-center justify-between bg-gradient-to-br from-teal-50/50 dark:from-slate-800 to-white dark:to-slate-900 transition-all duration-300 hover:shadow-lg shadow-sm dark:hover:shadow-md dark:hover:shadow-indigo-500/10">
                    <div>
                        <p className="text-sm font-medium text-gray-500 dark:text-slate-400">Returning Visitors</p>
                        <p className="text-3xl font-bold text-gray-800 dark:text-white mt-1">{visitorStats.returningVisitors}</p>
                    </div>
                    <div className="flex flex-col items-end">
                        <span className="text-[10px] font-bold text-gray-400 dark:text-slate-500 uppercase tracking-wider">Today</span>
                        <div className="flex items-center gap-1 text-emerald-500 dark:text-emerald-400 font-bold text-xl mt-0.5">
                            <TrendingUp size={25} />
                            <span>+{visitorStats.returningVisitorsToday || 0}</span>
                        </div>
                    </div>
                </div>

                {/* Total Registered Users */}
                <div className="p-6 rounded-xl border border-gray-200 dark:border-slate-800 flex items-center justify-between bg-gradient-to-br from-indigo-50/50 dark:from-slate-800 to-white dark:to-slate-900 transition-all duration-300 hover:shadow-lg shadow-sm dark:hover:shadow-md dark:hover:shadow-indigo-500/10">
                    <div>
                        <p className="text-sm font-medium text-gray-500 dark:text-slate-400">Total Registered Users</p>
                        <p className="text-3xl font-bold text-gray-800 dark:text-white mt-1">{visitorStats.totalRegisteredUsers}</p>
                    </div>
                    <div className="flex flex-col items-end">
                        <span className="text-[10px] font-bold text-gray-400 dark:text-slate-500 uppercase tracking-wider">Today</span>
                        <div className="flex items-center gap-1 text-emerald-500 dark:text-emerald-400 font-bold text-xl mt-0.5">
                            <TrendingUp size={25} />
                            <span>+{visitorStats.registrationsToday}</span>
                        </div>
                    </div>
                </div>

                {/* Conversion Rate */}
                <div className="p-6 rounded-xl border border-gray-200 dark:border-slate-800 flex items-center justify-between bg-gradient-to-br from-cyan-50/50 dark:from-slate-800 to-white dark:to-slate-900 transition-all duration-300 hover:shadow-lg shadow-sm dark:hover:shadow-md dark:hover:shadow-indigo-500/10">
                    <div>
                        <p className="text-sm font-medium text-gray-500 dark:text-slate-400">Conversion Rate</p>
                        <p className="text-3xl font-bold text-gray-800 dark:text-white mt-1">{visitorStats.conversionRate}%</p>
                    </div>
                    <div className="bg-cyan-100 dark:bg-cyan-500/20 text-cyan-600 dark:text-cyan-400 p-3 rounded-full">
                        <Zap size={24} />
                    </div>
                </div>

                {/* Website Visits */}
                <div className="p-6 rounded-xl border border-gray-200 dark:border-slate-800 flex items-center justify-between bg-gradient-to-br from-purple-50/50 dark:from-slate-800 to-white dark:to-slate-900 transition-all duration-300 hover:shadow-lg shadow-sm dark:hover:shadow-md dark:hover:shadow-indigo-500/10">
                    <div>
                        <p className="text-sm font-medium text-gray-500 dark:text-slate-400">Website Visits</p>
                        <p className="text-3xl font-bold text-gray-800 dark:text-white mt-1">{visitorStats.websiteVisits}</p>
                    </div>
                    <div className="flex flex-col items-end">
                        <span className="text-[10px] font-bold text-gray-400 dark:text-slate-500 uppercase tracking-wider">Today</span>
                        <div className="flex items-center gap-1 text-emerald-500 dark:text-emerald-400 font-bold text-xl mt-0.5">
                            <TrendingUp size={25} />
                            <span>+{visitorStats.todayWebsiteVisits || 0}</span>
                        </div>
                    </div>
                </div>

                {/* Average Time Spent Per User */}
                <div className="p-6 rounded-xl border border-gray-200 dark:border-slate-800 flex items-center justify-between bg-gradient-to-br from-rose-50/50 dark:from-slate-800 to-white dark:to-slate-900 transition-all duration-300 hover:shadow-lg shadow-sm dark:hover:shadow-md dark:hover:shadow-indigo-500/10">
                    <div>
                        <p className="text-sm font-medium text-gray-500 dark:text-slate-400">Avg. Time Spent / User</p>
                        <p className="text-3xl font-bold text-gray-800 dark:text-white mt-1">
                            {Math.floor(visitorStats.avgTimePerUser / 60)}m {visitorStats.avgTimePerUser % 60}s
                        </p>
                    </div>
                    <div className="bg-rose-100 dark:bg-rose-500/20 text-rose-600 dark:text-rose-400 p-3 rounded-full">
                        <Clock size={24} />
                    </div>
                </div>

                {/* Total Tests Attempted */}
                <div className="p-6 rounded-xl border border-gray-200 dark:border-slate-800 flex items-center justify-between bg-gradient-to-br from-yellow-50/50 dark:from-slate-800 to-white dark:to-slate-900 transition-all duration-300 hover:shadow-lg shadow-sm dark:hover:shadow-md dark:hover:shadow-indigo-500/10">
                    <div>
                        <p className="text-sm font-medium text-gray-500 dark:text-slate-400">Total Tests Attempted</p>
                        <p className="text-3xl font-bold text-gray-800 dark:text-white mt-1">{visitorStats.totalTestsAttempted}</p>
                    </div>
                    <div className="flex flex-col items-end">
                        <span className="text-[10px] font-bold text-gray-400 dark:text-slate-500 uppercase tracking-wider">Today</span>
                        <div className="flex items-center gap-1 text-emerald-500 dark:text-emerald-400 font-bold text-xl mt-0.5">
                            <TrendingUp size={25} />
                            <span>+{visitorStats.testsAttemptedToday}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* 3 New Graphs Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                {/* Average Time Spent Per User */}
                <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-gray-200 dark:border-slate-800 shadow-sm dark:shadow-none transition-colors flex flex-col h-80">
                    <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-4 transition-colors">Avg Time Spent / User (Last 7 Days)</h3>
                    <div className="flex-1 w-full relative">
                        {visitorGraphs.length > 0 ? (
                            <canvas ref={durationChartRef}></canvas>
                        ) : (
                            <div className="flex flex-col items-center justify-center text-gray-400 dark:text-slate-500 h-full">
                                <p className="text-sm font-medium">No duration data available.</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Visitors vs Registrations */}
                <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-gray-200 dark:border-slate-800 shadow-sm dark:shadow-none transition-colors flex flex-col h-80">
                    <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-4 transition-colors">Visitors vs Registrations (Last 7 Days)</h3>
                    <div className="flex-1 w-full relative">
                        {visitorGraphs.length > 0 ? (
                            <canvas ref={trafficChartRef}></canvas>
                        ) : (
                            <div className="flex flex-col items-center justify-center text-gray-400 dark:text-slate-500 h-full">
                                <p className="text-sm font-medium">No visitor data available.</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Daily Test Attempts */}
                <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-gray-200 dark:border-slate-800 shadow-sm dark:shadow-none transition-colors flex flex-col h-80">
                    <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-4 transition-colors">Daily Test Attempts (Last 7 Days)</h3>
                    <div className="flex-1 w-full relative">
                        {visitorGraphs.length > 0 ? (
                            <canvas ref={testAttemptsChartRef}></canvas>
                        ) : (
                            <div className="flex flex-col items-center justify-center text-gray-400 dark:text-slate-500 h-full">
                                <p className="text-sm font-medium">No test attempt data available.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* User Management Section */}
            <div className="bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-800 shadow-sm p-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                    <div>
                        <h3 className="text-xl font-bold text-gray-800 dark:text-white">User Analytics & Management</h3>
                        <p className="text-sm text-gray-500 dark:text-slate-400 mt-0.5">Track active learning and engagement metrics per student</p>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
                        {/* Search field */}
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="Search by name or email..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full sm:w-64 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl pl-10 pr-4 py-2 text-sm outline-none focus:border-indigo-500 transition-colors text-gray-850 dark:text-white"
                            />
                            <Search className="absolute left-3 top-2.5 text-gray-400" size={16} />
                        </div>

                        {/* Status filter buttons */}
                        <div className="flex items-center bg-gray-100 dark:bg-slate-800 p-1 rounded-xl border border-gray-250/50 dark:border-slate-700/50">
                            <button
                                onClick={() => setStatusFilter('all')}
                                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${statusFilter === 'all' ? 'bg-white dark:bg-slate-900 shadow text-indigo-600 dark:text-indigo-400' : 'text-gray-500 hover:text-gray-700 dark:hover:text-slate-350'}`}
                            >
                                All
                            </button>
                            <button
                                onClick={() => setStatusFilter('online')}
                                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 ${statusFilter === 'online' ? 'bg-white dark:bg-slate-900 shadow text-indigo-600 dark:text-indigo-400' : 'text-gray-500 hover:text-gray-700 dark:hover:text-slate-350'}`}
                            >
                                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span>
                                Online
                            </button>
                            <button
                                onClick={() => setStatusFilter('offline')}
                                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 ${statusFilter === 'offline' ? 'bg-white dark:bg-slate-900 shadow text-indigo-600 dark:text-indigo-400' : 'text-gray-500 hover:text-gray-700 dark:hover:text-slate-350'}`}
                            >
                                <span className="w-1.5 h-1.5 bg-gray-400 rounded-full"></span>
                                Offline
                            </button>
                        </div>
                    </div>
                </div>

                {/* Table Container with Max Height and Scrollbar */}
                <div className="overflow-x-auto max-h-[460px] overflow-y-auto pr-1 custom-scrollbar">
                    {usersLoading ? (
                        <div className="flex flex-col items-center justify-center py-12">
                            <div className="w-8 h-8 border-4 border-dashed border-indigo-500 border-t-transparent rounded-full animate-spin mb-3"></div>
                            <p className="text-sm text-gray-500 dark:text-slate-450">Updating user listings...</p>
                        </div>
                    ) : usersList.length === 0 ? (
                        <div className="text-center py-12 text-gray-400 dark:text-slate-500">
                            <p className="text-sm font-medium">No users match your criteria.</p>
                        </div>
                    ) : (
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="text-[11px] font-bold text-gray-400 dark:text-slate-500 uppercase tracking-wider border-b border-gray-200 dark:border-slate-800/80">
                                    <th className="py-3 px-4 sticky top-0 bg-white dark:bg-slate-900 z-10 border-b border-gray-250 dark:border-slate-800/85">Name</th>
                                    <th className="py-3 px-4 sticky top-0 bg-white dark:bg-slate-900 z-10 border-b border-gray-250 dark:border-slate-800/85">Email</th>
                                    <th className="py-3 px-4 sticky top-0 bg-white dark:bg-slate-900 z-10 border-b border-gray-250 dark:border-slate-800/85">Status</th>
                                    <th className="py-3 px-4 text-right sticky top-0 bg-white dark:bg-slate-900 z-10 border-b border-gray-250 dark:border-slate-800/85">Visits</th>
                                    <th className="py-3 px-4 text-right sticky top-0 bg-white dark:bg-slate-900 z-10 border-b border-gray-250 dark:border-slate-800/85">Today's Active Time</th>
                                    <th className="py-3 px-4 text-right sticky top-0 bg-white dark:bg-slate-900 z-10 border-b border-gray-250 dark:border-slate-800/85">Weekly Active Time</th>
                                    <th className="py-3 px-4 text-right sticky top-0 bg-white dark:bg-slate-900 z-10 border-b border-gray-250 dark:border-slate-800/85">Tests Attempted</th>
                                </tr>
                            </thead>
                            <tbody>
                                {usersList.map((user) => (
                                    <tr key={user.id} className="border-b border-gray-100 dark:border-slate-800/60 hover:bg-gray-50/50 dark:hover:bg-slate-800/20 text-sm transition-colors text-gray-700 dark:text-slate-350">
                                        <td className="py-3 px-4 font-semibold text-gray-800 dark:text-slate-100">{user.name}</td>
                                        <td className="py-3 px-4 text-gray-600 dark:text-slate-400">{user.email}</td>
                                        <td className="py-3 px-4">
                                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold ${user.status === 'Online' ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400' : 'bg-slate-100 text-slate-600 dark:bg-slate-800/60 dark:text-slate-400'}`}>
                                                <span className={`w-1.5 h-1.5 rounded-full ${user.status === 'Online' ? 'bg-emerald-500 animate-pulse' : 'bg-slate-500'}`}></span>
                                                {user.status}
                                            </span>
                                        </td>
                                        <td className="py-3 px-4 text-right font-medium text-gray-800 dark:text-slate-200">{user.visits}</td>
                                        <td className="py-3 px-4 text-right text-gray-600 dark:text-slate-400">{user.todayActiveTime}</td>
                                        <td className="py-3 px-4 text-right text-gray-600 dark:text-slate-400">{user.weeklyActiveTime}</td>
                                        <td className="py-3 px-4 text-right font-semibold text-indigo-600 dark:text-indigo-400">{user.testsAttempted}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Analytics;