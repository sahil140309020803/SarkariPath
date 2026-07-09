import React, { useEffect } from 'react';
import SpecficExam from './SpecficExam';
import { useExam } from '../context/ExamContext';
import { X, Target } from 'lucide-react';

const ExamsList = ({ examList, title }) => {
  const { setActiveList } = useExam();

  useEffect(() => {
    document.body.style.overflowY = "hidden";
    return () => {
      document.body.style.overflowY = "scroll";
    }
  }, []);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
      {/* Backdrop */}
      <div 
        onClick={(e) => { e.stopPropagation(); setActiveList(null); }} 
        className='absolute inset-0 bg-slate-900/60 dark:bg-black/60 backdrop-blur-sm transition-opacity cursor-pointer'
      ></div>
      
      {/* Modal Content */}
      <div 
        className='relative bg-white dark:bg-slate-900 rounded-3xl shadow-2xl dark:shadow-[0_0_inset_white/10] w-full max-w-2xl max-h-[85vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200 border border-transparent dark:border-slate-800'
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className='flex flex-col items-center p-8 bg-gradient-to-b from-slate-50 to-white dark:from-slate-800 dark:to-slate-900 border-b border-slate-100 dark:border-slate-800 transition-colors'>
          <button 
             onClick={() => setActiveList(null)} 
             className="absolute top-4 right-4 p-2 text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"
          >
             <X size={24} />
          </button>
          
          <div className="p-3 bg-indigo-50 dark:bg-slate-800 text-indigo-600 dark:text-cyan-400 rounded-full mb-4 transition-colors">
             <Target size={28} />
          </div>
          <h2 className='font-extrabold text-2xl sm:text-3xl text-slate-800 dark:text-white text-center tracking-tight mb-2 transition-colors'>
            Select Your Exam
          </h2>
          <p className='text-slate-500 dark:text-slate-400 font-medium text-center max-w-sm transition-colors'>
            Choose the specific path that leads to your success in the <span className="font-bold text-indigo-600 dark:text-cyan-400">{title}</span> category.
          </p>
        </div>
        
        {/* List of Exams */}
        <div className='p-6 overflow-y-auto custom-scrollbar bg-slate-50 dark:bg-slate-900/50 transition-colors'>
          <ul className='grid gap-4'>
            {examList.map(exam => (
              <li key={exam._id} className="transform transition-transform hover:-translate-y-1">
                <SpecficExam exam={exam.Name} title={title}/>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}

export default ExamsList;