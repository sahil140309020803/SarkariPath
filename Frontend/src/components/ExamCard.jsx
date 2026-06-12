import React from 'react';
import ExamsList from './ExamsList';
import { useExam } from '../context/ExamContext';

const ExamCard = ({ icon, title, content, examList }) => {
  const {
    activeList, setActiveList,
    activeExamTitle, setActiveExamTitle,
  } = useExam();

  const handleClick = () => {
    setActiveList(examList);
    setActiveExamTitle(title);
  }

  return (
    <>
      <div 
        onClick={handleClick} 
        className='cursor-pointer flex flex-col justify-center items-center text-center p-8 gap-4 bg-white dark:bg-slate-800 rounded-3xl shadow-lg dark:shadow-none hover:shadow-2xl border border-slate-100 dark:border-slate-700 hover:border-blue-200 dark:hover:border-slate-500 group transform hover:-translate-y-2 transition-all duration-300 relative overflow-hidden'
      >
          {/* Decorative Background Blob */}
          <div className="absolute -top-10 -right-10 w-32 h-32 bg-blue-50 dark:bg-slate-700/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>

          <div className='text-4xl p-5 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-slate-700 dark:to-slate-600 text-indigo-600 dark:text-cyan-400 rounded-2xl flex justify-center items-center group-hover:bg-gradient-to-br group-hover:from-blue-600 group-hover:to-indigo-600 dark:group-hover:from-cyan-600 dark:group-hover:to-blue-600 group-hover:text-white dark:group-hover:text-white transition-all duration-500 group-hover:rotate-6 shadow-sm group-hover:shadow-indigo-500/30 z-10'>
            {icon}
          </div>
          
          <div className='font-bold text-xl text-slate-800 dark:text-white tracking-tight z-10 transition-colors'>
            {title}
          </div>
          
          <div className='text-sm font-medium text-slate-500 dark:text-slate-400 leading-relaxed z-10 transition-colors'>
            {content}
          </div>

          <div className='mt-2 flex items-center gap-1 text-sm font-bold text-blue-600 opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all duration-300 z-10'>
             View Exams <span className="text-lg">→</span>
          </div>
      </div>
      
      {activeList === examList && <ExamsList examList={activeList} title={title}/>}
    </>
  )
}

export default ExamCard;