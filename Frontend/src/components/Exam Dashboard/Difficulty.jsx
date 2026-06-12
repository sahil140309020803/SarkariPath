import React from 'react'
import { useContext } from 'react';
// import { AppContent } from '../../context/AppContext';
import { RxCross2 } from "react-icons/rx";
import { useExam } from '../../context/ExamContext';

const Difficulty = () => {
    // const { showDifficulty, setShowDifficulty, difficulty, setDifficulty, showTestGenerate, setShowTestGenerate } = useContext(AppContent);

    const { showDifficulty, setShowDifficulty, difficulty, setDifficulty, showTestGenerate, setShowTestGenerate } = useExam();

    const handleTest = (diff) => {
      setDifficulty(diff);
      setShowTestGenerate(prev => !prev);
      setShowDifficulty(prev => !prev);
    }
    const handleCancel = () => {
      setDifficulty(null);
      setShowDifficulty(prev => !prev);

    }

  return (
    <div className='fixed inset-0 z-[100] flex items-center justify-center p-4'>
        {/* Backdrop Wrapper */}
        <div onClick={() => handleCancel()} className='absolute inset-0 bg-slate-900/40 dark:bg-black/60 backdrop-blur-sm transition-opacity'></div>
        
        {/* Modal Content */}
        <div className='relative z-[110] flex flex-col bg-white dark:bg-slate-900 w-full max-w-md rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden'>
            <div className='flex justify-between items-center p-5 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50'>
              <div className='text-lg font-bold text-slate-800 dark:text-white'>Select Difficulty</div>
              <button className='p-2 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors' onClick={() => handleCancel()}>
                <RxCross2 className='size-5'/>
              </button>
            </div>
            
            <div className='flex flex-col gap-4 p-6'>
              <div className='text-center text-sm font-medium text-slate-600 dark:text-slate-400 mb-2'>Choose the challenge level for your AI-generated mock test.</div>
              
              <div onClick={() => handleTest('Easy')} className='border border-emerald-200 dark:border-emerald-500/30 rounded-xl text-center p-4 font-bold text-[17px] bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 cursor-pointer hover:bg-emerald-100 dark:hover:bg-emerald-500/20 hover:border-emerald-300 dark:hover:border-emerald-500/50 transition-all duration-300 ease-in-out hover:-translate-y-0.5 shadow-sm'>Easy</div>
              
              <div onClick={() => handleTest('Medium')} className='border border-amber-200 dark:border-amber-500/30 rounded-xl text-center p-4 font-bold text-[17px] bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 cursor-pointer hover:bg-amber-100 dark:hover:bg-amber-500/20 hover:border-amber-300 dark:hover:border-amber-500/50 transition-all duration-300 ease-in-out hover:-translate-y-0.5 shadow-sm'>Medium</div>
              
              <div onClick={() => handleTest('Hard')} className='border border-rose-200 dark:border-rose-500/30 rounded-xl text-center p-4 font-bold text-[17px] bg-rose-50 dark:bg-rose-500/10 text-rose-700 dark:text-rose-400 cursor-pointer hover:bg-rose-100 dark:hover:bg-rose-500/20 hover:border-rose-300 dark:hover:border-rose-500/50 transition-all duration-300 ease-in-out hover:-translate-y-0.5 shadow-sm'>Hard</div>
            </div>
        </div>
    </div>
  )
}

export default Difficulty;