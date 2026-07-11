import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Home, ArrowLeft, HelpCircle } from 'lucide-react';

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 transition-colors duration-500 overflow-hidden relative px-6">
      {/* Ambient background glows */}
      <div className="absolute top-1/4 left-1/4 w-80 h-80 bg-blue-500/10 dark:bg-indigo-500/10 rounded-full blur-[100px] pointer-events-none animate-pulse"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 dark:bg-fuchsia-500/10 rounded-full blur-[120px] pointer-events-none animate-pulse duration-5000"></div>

      <div className="relative z-10 max-w-xl text-center flex flex-col items-center gap-6">
        {/* Premium 4[?]4 design replacing the 0 with the help badge */}
        <div className="flex items-center justify-center select-none gap-2 sm:gap-4">
          <span className="text-[110px] sm:text-[170px] font-black tracking-tighter leading-none bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-500 dark:from-cyan-450 dark:to-indigo-500 drop-shadow-sm">
            4
          </span>
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 sm:p-5 rounded-[2rem] shadow-xl dark:shadow-[0_8px_30px_rgb(0,0,0,0.5)] rotate-12 animate-bounce flex items-center justify-center shrink-0">
            <HelpCircle className="w-10 h-10 sm:w-16 sm:h-16 text-indigo-650 dark:text-cyan-400" />
          </div>
          <span className="text-[110px] sm:text-[170px] font-black tracking-tighter leading-none bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 to-purple-600 dark:from-indigo-500 dark:to-fuchsia-500 drop-shadow-sm">
            4
          </span>
        </div>

        {/* Content text */}
        <div className="space-y-3">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-800 dark:text-white transition-colors">
            Oops! Path Not Found
          </h2>
          <p className="text-sm sm:text-base text-slate-500 dark:text-slate-400 font-medium max-w-md mx-auto leading-relaxed transition-colors">
            The page you are looking for doesn't exist, has been moved, or the exam name is invalid. Let's get you back on the right path.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto mt-4">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center justify-center gap-2 px-6 py-3.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-indigo-600 dark:hover:border-cyan-500 hover:bg-slate-50 dark:hover:bg-slate-800/80 rounded-2xl text-sm font-bold text-slate-700 dark:text-slate-350 transition-all hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            Go Back
          </button>
          
          <button
            onClick={() => navigate('/')}
            className="flex items-center justify-center gap-2 px-8 py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-cyan-500 dark:to-indigo-600 hover:from-blue-700 hover:to-indigo-700 dark:hover:from-cyan-400 dark:hover:to-indigo-500 text-white rounded-2xl text-sm font-extrabold transition-all hover:shadow-xl hover:shadow-indigo-500/10 hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
          >
            <Home className="w-4 h-4" />
            Back to Home
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
