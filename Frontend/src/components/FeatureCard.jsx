import React from 'react';

const FeatureCard = ({ icon, title, content, delay = "0" }) => {
    return (
        <div 
            className="group relative overflow-hidden rounded-2xl bg-white dark:bg-slate-800/50 backdrop-blur-sm hover:bg-slate-50 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 p-6 flex flex-col items-start gap-4 transition-all duration-300 transform hover:-translate-y-2 cursor-pointer shadow-lg min-h-[14rem]"
            style={{ animationDelay: `${delay}ms` }}
        >
            <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 group-hover:scale-110 group-hover:bg-slate-200 dark:group-hover:bg-slate-700 transition-all duration-300 shadow-inner">
                {icon}
            </div>
            <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-2 group-hover:text-black dark:group-hover:text-white">{title}</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed group-hover:text-slate-700 dark:group-hover:text-slate-300">
                    {content}
                </p>
            </div>
            
            {/* Decorative element */}
            <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-black/5 dark:from-white/5 to-transparent rounded-bl-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
        </div>
    );
};

export default FeatureCard;