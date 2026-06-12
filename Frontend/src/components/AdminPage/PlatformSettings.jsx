import React from 'react';
import { HardHat } from 'lucide-react';

const PlatformSettings = () => {
    return (
        <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 text-center fade-in">
            <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 p-10 rounded-2xl shadow-sm dark:shadow-none max-w-lg w-full transition-colors">
                <div className="w-20 h-20 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-full flex items-center justify-center mx-auto mb-6">
                    <HardHat size={40} />
                </div>
                <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-3">Work in Progress</h2>
                <p className="text-gray-500 dark:text-slate-400">
                    The Settings module is currently under construction. We are working hard to bring you powerful new features. Please check back later!
                </p>
            </div>
        </div>
    );
};

export default PlatformSettings;
