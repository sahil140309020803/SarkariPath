import React from 'react';
import { ClipboardCheck, FileText, Trophy, TrendingUp, ChevronRight } from 'lucide-react';

const ExamReadinessCard = ({ completedTopicsCount, totalTopicsCount, onViewDetailedProgress }) => {
    const readinessPercentage = totalTopicsCount > 0 ? Math.round((completedTopicsCount / totalTopicsCount) * 100) : 0;
    const pendingTopicsCount = totalTopicsCount - completedTopicsCount;

    return (
        <div
            onClick={onViewDetailedProgress}
            className="group relative w-full h-full bg-white dark:bg-slate-800/80 backdrop-blur-md border border-slate-200 dark:border-slate-700 rounded-3xl p-5 sm:p-6 overflow-hidden shadow-xl dark:shadow-none flex flex-col justify-between cursor-pointer transition-all duration-500 hover:-translate-y-1 hover:border-indigo-500/50 hover:shadow-2xl dark:hover:shadow-[0_8px_30px_rgba(0,0,0,0.5)]"
        >
            {/* Background Effects */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-[80px] -translate-y-1/4 translate-x-1/4 pointer-events-none"></div>
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-emerald-500/5 rounded-full blur-[60px] translate-y-1/4 -translate-x-1/4 pointer-events-none"></div>

            {/* Animated Grid Pattern */}
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAwIDEwIEwgNDAgMTAgTSAxMCAwIEwgMTAgNDAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgyNTUsIDI1NSwgMjU1LCAwLjAzKSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmurlCtncmlkKSIvPjwvc3ZnPg==')] opacity-[0.03] dark:opacity-[0.05] pointer-events-none"></div>

            {/* Header */}
            <div className="flex justify-between items-start relative z-10 mb-5">
                <div className="flex items-center gap-4">
                    <div className="size-12 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-100 dark:border-indigo-500/20 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shadow-sm transition-colors shrink-0">
                        <ClipboardCheck size={24} />
                    </div>
                    <div>
                        <h2 className="text-xl sm:text-2xl font-bold text-slate-800 dark:text-white tracking-tight transition-colors">Exam Readiness</h2>
                        <p className="text-slate-500 dark:text-slate-400 text-xs max-w-[250px] transition-colors leading-tight mt-0.5">Track your syllabus coverage</p>
                    </div>
                </div>

            </div>

            {/* Inner Content Box */}
            <div className="bg-slate-50/50 dark:bg-slate-900/40 backdrop-blur-sm border border-slate-100 dark:border-slate-700/50 rounded-2xl p-4 sm:p-5 relative z-10 flex flex-col sm:flex-row items-center gap-6 shadow-inner dark:shadow-none transition-colors h-auto sm:h-[10.5rem]">

                {/* Circular Ring */}
                <div className="relative size-28 shrink-0">
                    <svg className="size-full" viewBox="0 0 36 36">
                        <path
                            className="text-slate-200 dark:text-slate-800 transition-colors"
                            strokeWidth="3.5"
                            stroke="currentColor"
                            fill="none"
                            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        />
                        <path
                            className="transition-all duration-1000 ease-out"
                            strokeDasharray={`${readinessPercentage}, 100`}
                            strokeWidth="3.5"
                            strokeLinecap="round"
                            stroke="url(#readiness-gradient)"
                            fill="none"
                            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        />
                        <defs>
                            <linearGradient id="readiness-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                <stop offset="0%" stopColor="#818cf8" />
                                <stop offset="100%" stopColor="#34d399" />
                            </linearGradient>
                        </defs>
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-2xl font-bold text-slate-800 dark:text-white leading-none tracking-tight transition-colors">{readinessPercentage}%</span>
                        <span className="text-[9px] text-slate-500 dark:text-slate-400 mt-1 font-medium transition-colors text-center leading-tight">Syllabus<br />Covered</span>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="flex-1 w-full flex flex-col gap-2.5">

                    {/* Top Row: Completed & Pending */}
                    <div className="grid grid-cols-2 gap-2.5">
                        {/* Completed */}
                        <div className="flex flex-col justify-center py-2 px-3.5 rounded-xl bg-white dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/50 shadow-sm dark:shadow-none transition-colors">
                            <div className="flex items-center gap-2 mb-1">
                                <div className="text-emerald-500">
                                    <ClipboardCheck size={13} />
                                </div>
                                <span className="text-[9px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider transition-colors">Completed</span>
                            </div>
                            <span className="text-base font-bold text-slate-800 dark:text-white transition-colors">{completedTopicsCount}</span>
                        </div>
                        {/* Pending */}
                        <div className="flex flex-col justify-center py-2 px-3.5 rounded-xl bg-white dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/50 shadow-sm dark:shadow-none transition-colors">
                            <div className="flex items-center gap-2 mb-1">
                                <div className="text-rose-500">
                                    <FileText size={13} />
                                </div>
                                <span className="text-[9px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider transition-colors">Pending</span>
                            </div>
                            <span className="text-base font-bold text-slate-800 dark:text-white transition-colors">{pendingTopicsCount}</span>
                        </div>
                    </div>

                    {/* Total Topics */}
                    <div className="flex items-center justify-between p-3 rounded-xl bg-white dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/50 shadow-sm dark:shadow-none transition-colors">
                        <div className="flex items-center gap-3">
                            <div className="text-indigo-500">
                                <Trophy size={14} />
                            </div>
                            <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider transition-colors">Total Topics</span>
                        </div>
                        <span className="text-sm font-bold text-slate-800 dark:text-white transition-colors">{totalTopicsCount}</span>
                    </div>

                </div>
            </div>

            {/* Bottom Balance Button */}
            <div className="relative z-10 mt-auto">
                <button
                    onClick={onViewDetailedProgress}
                    className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-emerald-600 hover:from-indigo-500 hover:to-emerald-500 shadow-lg dark:shadow-[0_0_20px_rgba(79,70,229,0.2)] dark:group-hover:shadow-[0_0_25px_rgba(79,70,229,0.4)] text-white text-sm font-semibold flex items-center justify-center gap-2 transition-all group"
                >
                    <TrendingUp size={16} className="group-hover:-translate-y-0.5 transition-transform" />
                    View Detailed Progress
                    <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
                </button>
            </div>
        </div>
    );
};

export default ExamReadinessCard;
