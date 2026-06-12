import React from 'react';
import { Sparkles, BrainCircuit, ArrowRight, Zap } from 'lucide-react';

const AITopicSummarizerCard = ({ onClick }) => {
    return (
        <div 
            onClick={onClick}
            className="group relative w-full h-full bg-white dark:bg-slate-800/80 backdrop-blur-md border border-slate-200 dark:border-slate-700 rounded-3xl p-5 sm:p-6 overflow-hidden shadow-xl dark:shadow-none flex flex-col justify-between cursor-pointer transition-all duration-500 hover:-translate-y-1 hover:border-fuchsia-500/50 hover:shadow-2xl dark:hover:shadow-[0_8px_30px_rgba(0,0,0,0.5)]"
        >
            {/* Background Effects */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-fuchsia-500/10 rounded-full blur-[80px] -translate-y-1/4 translate-x-1/4 transition-transform duration-700 group-hover:scale-110 pointer-events-none"></div>
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-indigo-500/10 rounded-full blur-[60px] translate-y-1/4 -translate-x-1/4 pointer-events-none"></div>
            
            {/* Animated Grid Pattern */}
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAwIDEwIEwgNDAgMTAgTSAxMCAwIEwgMTAgNDAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgyNTUsIDI1NSwgMjU1LCAwLjAzKSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmurlCtncmlkKSIvPjwvc3ZnPg==')] opacity-[0.03] dark:opacity-[0.05] pointer-events-none"></div>

            {/* Content Top */}
            <div className="relative z-10">
                <div className="flex justify-between items-start">
                    <div className="size-12 rounded-xl bg-fuchsia-50 dark:bg-fuchsia-500/10 border border-fuchsia-100 dark:border-fuchsia-500/20 flex items-center justify-center text-fuchsia-600 dark:text-fuchsia-400 shadow-sm transition-colors shrink-0">
                        <BrainCircuit size={24} />
                    </div>
                    <div className="px-3 py-1 rounded-full bg-fuchsia-50 dark:bg-fuchsia-500/10 border border-fuchsia-200 dark:border-fuchsia-500/20 flex items-center gap-1.5 shadow-sm">
                        <Sparkles size={12} className="text-fuchsia-500 dark:text-fuchsia-400 animate-pulse" />
                        <span className="text-[10px] font-bold uppercase tracking-wider text-fuchsia-600 dark:text-fuchsia-400">Powered by AI</span>
                    </div>
                </div>

                <div className="mt-5">
                    <h2 className="text-xl sm:text-2xl font-bold text-slate-800 dark:text-white tracking-tight transition-colors">
                        AI Topic Summarizer
                    </h2>
                    <p className="mt-1.5 text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed max-w-sm transition-colors">
                        Struggling with a complex concept? Let our advanced AI instantly generate clear insights and targeted study points.
                    </p>
                </div>
            </div>

            {/* Center Decorative Visual */}
            <div className="relative z-10 flex-1 flex items-center justify-center py-6 pointer-events-none">
                <div className="relative flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
                    {/* Glowing Orbs */}
                    <div className="absolute size-24 rounded-full bg-fuchsia-500/20 blur-xl animate-pulse"></div>
                    <div className="absolute size-16 rounded-full bg-indigo-500/20 blur-lg animate-pulse" style={{ animationDelay: '1.5s' }}></div>
                    
                    {/* Inner Nodes */}
                    <div className="absolute -top-5 -left-8 size-3 rounded-full bg-fuchsia-400/80 shadow-[0_0_15px_rgba(232,121,249,0.8)]"></div>
                    <div className="absolute -bottom-4 -right-6 size-2 rounded-full bg-indigo-400/80 shadow-[0_0_15px_rgba(129,140,248,0.8)]"></div>
                    <div className="absolute top-8 -right-10 size-2.5 rounded-full bg-pink-400/80 shadow-[0_0_15px_rgba(244,114,182,0.8)]"></div>
                    
                    {/* Central Icon */}
                    <div className="size-16 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-700 shadow-2xl flex items-center justify-center text-slate-400 dark:text-slate-500 relative z-10 transform -rotate-6 group-hover:rotate-0 transition-all duration-500">
                        <Zap size={28} className="text-fuchsia-500 dark:text-fuchsia-400 filter drop-shadow-[0_0_8px_rgba(217,70,239,0.5)]" />
                    </div>
                </div>
            </div>

            {/* CTA Button */}
            <div className="relative z-10 mt-auto">
                <button className="w-full py-3 rounded-xl bg-gradient-to-r from-fuchsia-600 to-indigo-600 hover:from-fuchsia-500 hover:to-indigo-500 shadow-lg dark:shadow-[0_0_20px_rgba(192,38,211,0.2)] dark:group-hover:shadow-[0_0_25px_rgba(192,38,211,0.4)] text-white text-sm font-semibold flex items-center justify-center gap-2 transition-all">
                    <Sparkles size={16} className="group-hover:rotate-12 transition-transform" />
                    Launch AI Assistant
                    <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                </button>
            </div>
        </div>
    );
};

export default AITopicSummarizerCard;
