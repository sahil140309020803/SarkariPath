import React, { useEffect, useRef, useState } from 'react';
import Chart from 'chart.js/auto';
import { Users, CheckCircle, FileText, Sparkles, Eye, Trash2, PlusCircle, Settings2, Trophy, ArrowUpRight } from 'lucide-react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useUser } from '../../context/UserContext';

const Dashboard = () => {
    const chartRef = useRef(null);
    const { backend_url } = useUser();
    const [data, setData] = useState({
        stats: { totalUsers: 0, activeExams: 0, publishedTests: 0, aiQuizzes: 0 },
        testsPerExam: { labels: [], data: [] },
        testsUnderReview: []
    });

    // ==========================================
    // START: BULK DELETE QUIZZES STATE
    // ==========================================
    const [bulkDeleteDate, setBulkDeleteDate] = useState('');
    const [isBulkDeleting, setIsBulkDeleting] = useState(false);
    const [showBulkDeleteModal, setShowBulkDeleteModal] = useState(false);
    // ==========================================
    // END: BULK DELETE QUIZZES STATE
    // ==========================================

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const response = await axios.get(`${backend_url}/api/admin/dashboard`, { withCredentials: true });
                if (response.data.success) {
                    setData(response.data);
                }
            } catch (error) {
                console.error("Failed to fetch dashboard data:", error);
            }
        };
        fetchDashboardData();
    }, [backend_url]);

    useEffect(() => {
        if (data.testsPerExam && data.testsPerExam.labels.length > 0 && chartRef.current) {
            const ctx = chartRef.current.getContext('2d');

            // Destroy existing chart if it exists
            if (chartRef.current.chartInstance) {
                chartRef.current.chartInstance.destroy();
            }

            chartRef.current.chartInstance = new Chart(ctx, {
                type: 'doughnut',
                data: {
                    labels: data.testsPerExam.labels,
                    datasets: [{
                        label: 'Tests Generated',
                        data: data.testsPerExam.data,
                        backgroundColor: [
                            '#6366f1', // indigo-500
                            '#8b5cf6', // violet-500
                            '#ec4899', // pink-500
                            '#14b8a6', // teal-500
                            '#f59e0b', // amber-500
                            '#3b82f6'  // blue-500
                        ],
                        borderWidth: 0,
                        hoverOffset: 6,
                        spacing: 4
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    layout: {
                        padding: 10
                    },
                    plugins: {
                        legend: {
                            position: 'right',
                            labels: {
                                color: '#94a3b8',
                                padding: 15,
                                usePointStyle: true,
                                pointStyle: 'circle',
                                font: {
                                    family: "'Inter', sans-serif",
                                    size: 12,
                                    weight: '500'
                                }
                            }
                        },
                        tooltip: {
                            backgroundColor: '#1e293b',
                            padding: 14,
                            titleFont: { size: 14, family: "'Inter', sans-serif", weight: 'bold' },
                            bodyFont: { size: 13, family: "'Inter', sans-serif" },
                            cornerRadius: 10,
                            displayColors: true,
                            boxPadding: 4,
                            usePointStyle: true
                        }
                    },
                    cutout: '76%'
                }
            });
        }
    }, [data.testsPerExam]);
    const handleDownloadReport = () => {
        toast.info("Generating system report...");
        setTimeout(() => {
            toast.success("Platform Insights Report downloaded successfully!");
        }, 1500);
    };

    // ==========================================
    // START: BULK DELETE QUIZZES HANDLER
    // ==========================================
    const handleBulkDeleteQuizzes = async () => {
        if (!bulkDeleteDate) {
            toast.error("Please select a date");
            return;
        }

        const confirmDelete = window.confirm(`Are you sure you want to delete all quizzes and their data up to ${bulkDeleteDate}? This action cannot be undone.`);
        if (!confirmDelete) return;

        setIsBulkDeleting(true);
        try {
            const response = await axios.post(`${backend_url}/api/admin/test-generations/bulk-delete-quizzes`,
                { date: bulkDeleteDate },
                { withCredentials: true }
            );

            if (response.data.success) {
                toast.success(response.data.message);
                // Refresh dashboard data
                const dashRes = await axios.get(`${backend_url}/api/admin/dashboard`, { withCredentials: true });
                if (dashRes.data.success) {
                    setData(dashRes.data);
                }
                setBulkDeleteDate('');
                setShowBulkDeleteModal(false);
            } else {
                toast.error(response.data.message);
            }
        } catch (error) {
            console.error("Bulk delete error:", error);
            toast.error(error.response?.data?.message || "Failed to perform bulk deletion");
        } finally {
            setIsBulkDeleting(false);
        }
    };
    // ==========================================
    // END: BULK DELETE QUIZZES HANDLER
    // ==========================================

    return (
        <div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div className="p-6 rounded-xl border border-gray-200 dark:border-slate-800 flex items-center justify-between bg-gradient-to-br from-indigo-50 dark:from-slate-800 to-white dark:to-slate-900 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 shadow-sm dark:shadow-none"><div><p className="text-sm font-medium text-gray-500 dark:text-slate-400">Total Users</p><p className="text-3xl font-bold text-gray-800 dark:text-white mt-1">{data.stats.totalUsers}</p></div><div className="bg-indigo-100 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 p-3 rounded-full"><Users size={24} /></div></div>
                <div className="p-6 rounded-xl border border-gray-200 dark:border-slate-800 flex items-center justify-between bg-gradient-to-br from-green-50 dark:from-slate-800 to-white dark:to-slate-900 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 shadow-sm dark:shadow-none"><div><p className="text-sm font-medium text-gray-500 dark:text-slate-400">Active Exams</p><p className="text-3xl font-bold text-gray-800 dark:text-white mt-1">{data.stats.activeExams}</p></div><div className="bg-green-100 dark:bg-green-500/20 text-green-600 dark:text-green-400 p-3 rounded-full"><CheckCircle size={24} /></div></div>
                <div className="p-6 rounded-xl border border-gray-200 dark:border-slate-800 flex items-center justify-between bg-gradient-to-br from-blue-50 dark:from-slate-800 to-white dark:to-slate-900 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 shadow-sm dark:shadow-none"><div><p className="text-sm font-medium text-gray-500 dark:text-slate-400">Published Tests</p><p className="text-3xl font-bold text-gray-800 dark:text-white mt-1">{data.stats.publishedTests}</p></div><div className="bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 p-3 rounded-full"><FileText size={24} /></div></div>
                <div className="p-6 rounded-xl border border-gray-200 dark:border-slate-800 flex items-center justify-between bg-gradient-to-br from-yellow-50 dark:from-slate-800 to-white dark:to-slate-900 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 shadow-sm dark:shadow-none group relative">
                    <div>
                        <p className="text-sm font-medium text-gray-500 dark:text-slate-400">AI Quizzes</p>
                        <p className="text-3xl font-bold text-gray-800 dark:text-white mt-1">{data.stats.aiQuizzes}</p>
                    </div>
                    <div className="flex items-center gap-2">
                        {/* ========================================== */}
                        {/* START: BULK DELETE TRIGGER ICON */}
                        {/* ========================================== */}
                        <button 
                            onClick={() => setShowBulkDeleteModal(true)}
                            className="opacity-0 group-hover:opacity-100 p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-all duration-300"
                            title="Bulk Cleanup"
                        >
                            <Trash2 size={18} />
                        </button>
                        {/* ========================================== */}
                        {/* END: BULK DELETE TRIGGER ICON */}
                        {/* ========================================== */}
                        <div className="bg-yellow-100 dark:bg-yellow-500/20 text-yellow-600 dark:text-yellow-400 p-3 rounded-full">
                            <Sparkles size={24} />
                        </div>
                    </div>
                </div>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* 1. Tests Under Review */}
                <div className="lg:col-span-1 bg-white dark:bg-slate-900 p-6 rounded-xl border border-gray-200 dark:border-slate-800 shadow-sm dark:shadow-none transition-colors flex flex-col h-80">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-semibold text-gray-800 dark:text-white transition-colors">Tests Under Review</h3>
                        <span className="bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 py-1 px-3 rounded-full text-xs font-bold border border-amber-200 dark:border-amber-800">{data.testsUnderReview.length} Pending</span>
                    </div>
                    <div className="flex-1 overflow-y-auto pr-1 custom-scrollbar space-y-3">
                        {data.testsUnderReview.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-full text-gray-400 dark:text-slate-500">
                                <CheckCircle size={32} className="mb-2 opacity-20" />
                                <p className="text-sm font-medium">All caught up!</p>
                            </div>
                        ) : data.testsUnderReview.map((test, idx) => (
                            <div key={idx} className="flex justify-between items-center p-3 rounded-lg bg-gray-50 dark:bg-slate-800/50 hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors">
                                <div>
                                    <p className="font-semibold text-gray-800 dark:text-slate-200 text-sm truncate max-w-[150px] transition-colors" title={test.title}>{test.title}</p>
                                    <p className="text-xs text-gray-500 dark:text-slate-400 transition-colors mt-0.5">{test.examName}</p>
                                </div>
                                <div className="flex gap-1.5">
                                    <button className="p-1.5 text-green-600 bg-green-50 dark:bg-green-900/20 hover:bg-green-100 dark:hover:bg-green-900/40 rounded transition-colors" title="Publish"><CheckCircle size={16} /></button>
                                    <button className="p-1.5 text-red-600 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/40 rounded transition-colors" title="Discard"><Trash2 size={16} /></button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* 2. Graph: Tests Generated Per Exam */}
                <div className="lg:col-span-1 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-gray-200 dark:border-slate-800 shadow-sm dark:shadow-none transition-colors flex flex-col h-80 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500 opacity-[0.02] dark:opacity-5 rounded-full -translate-y-12 translate-x-12 blur-2xl"></div>
                    <div className="flex justify-between items-center mb-2 z-10 relative">
                        <h3 className="text-lg font-bold text-gray-800 dark:text-white transition-colors">Tests Generated by Exam</h3>
                    </div>
                    <div className="flex-1 w-full relative flex items-center justify-center pt-2 z-10">
                        {data.testsPerExam.labels.length > 0 ? (
                            <div className="w-full h-[220px]">
                                <canvas ref={chartRef}></canvas>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center text-gray-400 dark:text-slate-500 h-full">
                                <div className="w-16 h-16 border-4 border-dashed border-gray-200 dark:border-slate-700 rounded-full flex items-center justify-center mb-3">
                                    <Sparkles size={20} className="opacity-40" />
                                </div>
                                <p className="text-sm font-medium">No tests generated yet.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* ========================================== */}
            {/* START: BULK DELETE MODAL */}
            {/* ========================================== */}
            {showBulkDeleteModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-2xl border border-gray-200 dark:border-slate-800 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
                        <div className="p-6">
                            <div className="flex justify-between items-center mb-6">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-red-100 dark:bg-red-500/20 text-red-600 dark:text-red-400 rounded-lg">
                                        <Trash2 size={20} />
                                    </div>
                                    <h3 className="text-xl font-bold text-gray-800 dark:text-white">Bulk Quiz Cleanup</h3>
                                </div>
                                <button 
                                    onClick={() => setShowBulkDeleteModal(false)}
                                    className="p-1 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-full transition-colors text-gray-400 hover:text-gray-600 dark:hover:text-white"
                                >
                                    <PlusCircle size={24} className="rotate-45" />
                                </button>
                            </div>

                            <p className="text-sm text-gray-500 dark:text-slate-400 mb-6">
                                Select a date to permanently delete all AI Quizzes, their questions, and student submissions created on or before that day.
                            </p>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-[10px] font-bold text-gray-400 dark:text-slate-500 uppercase tracking-widest mb-2">Target Date Range (Up to)</label>
                                    <input 
                                        type="date" 
                                        value={bulkDeleteDate}
                                        onChange={(e) => setBulkDeleteDate(e.target.value)}
                                        className="w-full bg-gray-50 dark:bg-slate-800/50 border border-gray-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm outline-none focus:border-red-500 transition-colors dark:text-white"
                                    />
                                </div>

                                <div className="p-4 bg-red-50 dark:bg-red-500/5 border border-red-100 dark:border-red-500/20 rounded-xl">
                                    <div className="flex gap-3">
                                        <Settings2 size={16} className="text-red-500 shrink-0 mt-0.5" />
                                        <p className="text-xs text-red-600 dark:text-red-400 leading-relaxed font-medium">
                                            This action is irreversible. All related questions and student performance data will be completely removed from the system.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="p-6 bg-gray-50 dark:bg-slate-800/50 border-t border-gray-100 dark:border-slate-800 flex gap-3">
                            <button 
                                onClick={() => setShowBulkDeleteModal(false)}
                                className="flex-1 px-4 py-3 text-sm font-semibold text-gray-600 dark:text-slate-300 hover:bg-gray-200 dark:hover:bg-slate-700 rounded-xl transition-colors"
                            >
                                Cancel
                            </button>
                            <button 
                                onClick={handleBulkDeleteQuizzes}
                                disabled={isBulkDeleting || !bulkDeleteDate}
                                className="flex-[2] px-4 py-3 bg-red-500 hover:bg-red-600 disabled:opacity-50 text-white text-sm font-bold rounded-xl transition-all shadow-lg shadow-red-500/25 flex items-center justify-center gap-2"
                            >
                                {isBulkDeleting ? (
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                ) : (
                                    <>
                                        <Trash2 size={16} />
                                        Confirm Bulk Delete
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
            {/* ========================================== */}
            {/* END: BULK DELETE MODAL */}
            {/* ========================================== */}
        </div>
    );
};

export default Dashboard;