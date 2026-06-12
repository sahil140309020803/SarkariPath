import React from 'react';
import FeatureCard from './FeatureCard';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Sparkles, BrainCircuit, Target, ArrowRight } from 'lucide-react';

const Header = () => {
    const navigate = useNavigate();
    const { isLoggedIn, userDetails } = useAuth();
    const name = userDetails?.name || '';

    return (
        <div className="relative overflow-hidden bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 w-full flex flex-col justify-center items-center py-24 px-4 md:px-8 transition-colors duration-300">
            {/* Background Effects */}
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-600/20 rounded-full mix-blend-screen filter blur-3xl opacity-50 animate-pulse"></div>
            <div className="absolute top-0 right-1/4 w-96 h-96 bg-cyan-500/20 rounded-full mix-blend-screen filter blur-3xl opacity-50 animate-pulse" style={{ animationDelay: '2s' }}></div>
            <div className="absolute -bottom-12 left-1/2 w-96 h-96 bg-purple-600/20 rounded-full mix-blend-screen filter blur-3xl opacity-50 animate-pulse" style={{ animationDelay: '4s' }}></div>

            <div className="relative z-10 max-w-7xl mx-auto flex flex-col lg:flex-row items-center justify-between gap-16 w-full">
                {/* Text Content */}
                <div className="flex-1 flex flex-col items-center lg:items-start text-center lg:text-left gap-8 lg:ml-6">
                    {isLoggedIn && (
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/80 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-medium backdrop-blur-md shadow-sm dark:shadow-black/20 -mb-2 transition-colors">
                            👋 Welcome back, <span className="text-slate-900 dark:text-white font-semibold">{name}</span>
                        </div>
                    )}
                    
                    <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight text-slate-800 dark:text-white leading-[1.15] transition-colors">
                        Your Gateway to <br/>
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-indigo-400 to-purple-400 inline-block animate-pulse">
                            Government Exams
                        </span>
                    </h1>
                    
                    <p className="text-lg md:text-xl text-slate-600 dark:text-slate-400 max-w-2xl leading-relaxed transition-colors">
                        Master government exam preparation with <strong className="text-slate-900 dark:text-slate-200">AI-powered mock tests</strong>, subject-wise practice, and topic-focused learning designed specifically for your success.
                    </p>
                    
                    <div className="flex flex-col sm:flex-row items-center gap-4 mt-2 w-full sm:w-auto">
                        {!isLoggedIn ? (
                            <button onClick={() => navigate('/signup')} className="w-full sm:w-auto px-8 py-4 rounded-xl bg-gradient-to-r from-indigo-500 to-blue-500 hover:opacity-90 text-white font-semibold flex items-center justify-center gap-2 transform hover:-translate-y-1 transition-all duration-300 shadow-md">
                                Start Free Prep <ArrowRight size={20} />
                            </button>
                        ) : (
                             <button onClick={() => navigate(`/dashboard/${userDetails.email}`)} className="w-full sm:w-auto px-8 py-4 rounded-xl bg-gradient-to-r from-indigo-500 to-blue-500 hover:opacity-90 text-white font-semibold flex items-center justify-center gap-2 transform hover:-translate-y-1 transition-all duration-300 shadow-md">
                                View Dashboard <ArrowRight size={20} />
                            </button>
                        )}
                        <button onClick={() => navigate('/#exam-categories')} className="w-full sm:w-auto px-8 py-4 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-white font-semibold flex items-center justify-center gap-2 border border-slate-200 dark:border-slate-700 transform hover:-translate-y-1 transition-all duration-300 shadow-sm">
                            Explore Exams
                        </button>
                    </div>
                    
                    <div className="flex items-center gap-3 mt-4 text-sm text-slate-600 dark:text-slate-400 font-medium bg-white/40 dark:bg-slate-800/40 px-5 py-2.5 rounded-lg border border-slate-200/60 dark:border-slate-700/60 backdrop-blur-sm transition-colors">
                        <Sparkles size={16} className="text-yellow-400" />
                        Powered by Advanced Generative AI
                    </div>
                </div>

                {/* Feature Cards Grid */}
                <div className="flex-1 w-full max-w-lg lg:max-w-xl">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                        <div className="space-y-5 pt-0 sm:pt-12">
                            <FeatureCard icon={<Target className="text-cyan-400" size={28}/>} title="Full Mock Tests" content="Experience the real exam format with timed full-length assessments." delay="0" />
                            <FeatureCard icon={<BrainCircuit className="text-purple-400" size={28}/>} title="Topic-wise Learning" content="Instantly formulate a custom test focused on any niche topic." delay="200" />
                        </div>
                        <div className="space-y-5">
                            <FeatureCard icon={<Sparkles className="text-indigo-400" size={28}/>} title="AI Subject Practice" content="Master fundamentals through AI-generated questions adapting to you." delay="100" />
                            <div className="rounded-2xl bg-gradient-to-br from-indigo-100/60 to-purple-100/60 dark:from-indigo-900/60 dark:to-purple-900/60 border border-slate-200/50 dark:border-slate-700/50 p-6 shadow-xl relative overflow-hidden flex flex-col justify-center items-center h-[15rem] transition-colors">
                                <div className="absolute inset-0 opacity-40 dark:opacity-20 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-white via-transparent to-transparent"></div>
                                <div className="flex flex-col items-center z-10">
                                   <div className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-b from-indigo-600 to-slate-400 dark:from-white dark:to-slate-400 mb-2 tracking-tighter transition-colors">10k+</div>
                                   <div className="text-sm text-indigo-700 dark:text-indigo-200 font-medium text-center tracking-wide uppercase transition-colors">Questions Solved Today</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Header;