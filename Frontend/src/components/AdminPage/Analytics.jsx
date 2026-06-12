import React, { useEffect, useRef, useState } from 'react';
import Chart from 'chart.js/auto';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';

const Analytics = () => {
    const engagementRef = useRef(null);
    const funnelRef = useRef(null);
    const popularityRef = useRef(null);
    const { backend_url } = useAuth();

    const [data, setData] = useState({
        overallStats: { avgScore: 0, avgTime: 0, completionRate: 0 },
        dailyActivity: [],
        funnelData: [0, 0],
        categoryPopularity: []
    });

    useEffect(() => {
        const fetchAnalytics = async () => {
            try {
                const response = await axios.get(`${backend_url}/api/admin/analytics`, { withCredentials: true });
                if (response.data.success) {
                    setData(response.data);
                }
            } catch (error) {
                console.error("Failed to fetch analytics:", error);
            }
        };
        fetchAnalytics();
    }, [backend_url]);

    useEffect(() => {
        const charts = [];
        
        if (engagementRef.current && data.dailyActivity.length > 0) {
            const labels = data.dailyActivity.map(item => item._id);
            const activeUsers = data.dailyActivity.map(item => item.count);

            charts.push(new Chart(engagementRef.current.getContext('2d'), { 
                type: 'line', 
                data: { 
                    labels: labels, 
                    datasets: [{ 
                        label: 'Active Submissions', 
                        data: activeUsers, 
                        borderColor: 'rgba(99, 102, 241, 1)', 
                        backgroundColor: 'rgba(99, 102, 241, 0.1)', 
                        fill: true, 
                        tension: 0.4 
                    }] 
                }, 
                options: { responsive: true, maintainAspectRatio: false, scales: { y: { beginAtZero: true }, x: { grid: { display: false } } }, plugins: { legend: { display: false } } } 
            }));
        }

        if (funnelRef.current && data.funnelData.length > 0) {
            charts.push(new Chart(funnelRef.current.getContext('2d'), { 
                type: 'bar', 
                data: { 
                    labels: ['Tests Started', 'Tests Completed'], 
                    datasets: [{ 
                        label: 'Count', 
                        data: data.funnelData, 
                        backgroundColor: ['rgba(59, 130, 246, 0.7)', 'rgba(34, 197, 94, 0.7)'], 
                        borderRadius: 5 
                    }] 
                }, 
                options: { responsive: true, maintainAspectRatio: false, scales: { x: { grid: { display: false } }, y: { grid: { display: false } } }, plugins: { legend: { display: false } } } 
            }));
        }

        if (popularityRef.current && data.categoryPopularity.length > 0) {
            charts.push(new Chart(popularityRef.current.getContext('2d'), { 
                type: 'doughnut', 
                data: { 
                    labels: data.categoryPopularity.map(cat => cat._id), 
                    datasets: [{ 
                        data: data.categoryPopularity.map(cat => cat.count), 
                        backgroundColor: ['#6366F1', '#22C55E', '#3B82F6', '#F59E0B', '#EF4444', '#10B981'], 
                    }] 
                }, 
                options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'right' } } } 
            }));
        }
        
        return () => charts.forEach(chart => chart.destroy());
    }, [data]);

    const formatTime = (seconds) => {
        if (!seconds) return '0m 0s';
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}m ${secs}s`;
    };

    return (
        <div>
            <h2 className="text-3xl font-bold text-gray-800 dark:text-white mb-6 transition-colors">Analytics Dashboard</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-6">
                <div className="p-6 rounded-xl border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm dark:shadow-none transition-colors"><p className="text-sm font-medium text-gray-500 dark:text-slate-400 transition-colors">Average Score</p><p className="text-3xl font-bold text-indigo-600 dark:text-indigo-400 mt-1 transition-colors">{Math.round(data.overallStats.avgScore)}%</p></div>
                <div className="p-6 rounded-xl border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm dark:shadow-none transition-colors"><p className="text-sm font-medium text-gray-500 dark:text-slate-400 transition-colors">Avg. Time per Test</p><p className="text-3xl font-bold text-teal-600 dark:text-teal-400 mt-1 transition-colors">{formatTime(data.overallStats.avgTime)}</p></div>
                <div className="p-6 rounded-xl border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm dark:shadow-none transition-colors"><p className="text-sm font-medium text-gray-500 dark:text-slate-400 transition-colors">Test Completion Rate</p><p className="text-3xl font-bold text-green-600 dark:text-green-400 mt-1 transition-colors">{Math.round(data.overallStats.completionRate)}%</p></div>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                <div className="lg:col-span-3 bg-white dark:bg-slate-900 p-6 rounded-xl border border-gray-200 dark:border-slate-800 shadow-sm dark:shadow-none transition-colors"><h3 className="text-lg font-semibold text-gray-700 dark:text-slate-200 mb-4 transition-colors">Daily Active Submissions (Last 30 Days)</h3><div className="h-80"><canvas ref={engagementRef}></canvas></div></div>
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-gray-200 dark:border-slate-800 shadow-sm dark:shadow-none transition-colors"><h3 className="text-lg font-semibold text-gray-700 dark:text-slate-200 mb-4 transition-colors">Test Performance Funnel</h3><div className="h-40"><canvas ref={funnelRef}></canvas></div></div>
                    <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-gray-200 dark:border-slate-800 shadow-sm dark:shadow-none transition-colors"><h3 className="text-lg font-semibold text-gray-700 dark:text-slate-200 mb-4 transition-colors">Category Popularity</h3><div className="h-40"><canvas ref={popularityRef}></canvas></div></div>
                </div>
            </div>
        </div>
    );
};

export default Analytics;