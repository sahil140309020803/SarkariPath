import React from 'react';

const BeautifulLoadingScreen = ({ message = 'Fetching resources...' }) => {
  return (
    <div className="fixed inset-0 z-[999] flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-950 transition-colors duration-500 overflow-hidden">
      {/* Background soft ambient glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-blue-500/10 dark:bg-indigo-650/10 rounded-full blur-[80px] pointer-events-none"></div>

      <div className="relative flex flex-col items-center gap-4 text-center px-4">
        {/* Single Sleek Spinner Ring with Bolt Icon inside */}
        <div className="relative flex items-center justify-center w-16 h-16">
          {/* Rotating spinner track */}
          <div className="absolute inset-0 rounded-full border-[3px] border-slate-200 dark:border-slate-805"></div>
          <div className="absolute inset-0 rounded-full border-[3px] border-transparent border-t-blue-600 dark:border-t-cyan-400 animate-spin"></div>
          
          {/* Centered Icon */}
          <div className="relative z-10 flex items-center justify-center">
            <svg 
              className="w-6 h-6 text-blue-600 dark:text-cyan-400 animate-pulse" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor" 
              strokeWidth="2.5"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
        </div>

        {/* Text Details with minimal gaps */}
        <div className="space-y-1 mt-1">
          <div className="text-base sm:text-lg font-black text-slate-800 dark:text-slate-100 tracking-tight transition-colors">
            {message}
          </div>
          <p className="text-[9px] text-slate-400 dark:text-slate-550 font-bold uppercase tracking-[0.2em] animate-pulse">
            Connecting to Database
          </p>
        </div>
      </div>
    </div>
  );
};

export default BeautifulLoadingScreen;
