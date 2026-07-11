import React from 'react';
import ExamsList from './ExamsList';
import { useExam } from '../context/ExamContext';

const ExamCard = ({ title, content, examList }) => {
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
        className='cursor-pointer flex flex-col justify-between items-start p-6 sm:p-7 min-h-[220px] bg-white dark:bg-slate-900 rounded-2xl shadow-sm hover:shadow-md border border-slate-200/85 dark:border-slate-800/80 hover:border-blue-200 dark:hover:border-slate-700/80 hover:-translate-y-1.5 transition-all duration-300 relative overflow-hidden group'
      >
        {/* Top Accent Gradient Border */}
        <div className="absolute top-0 left-0 w-full h-[3.5px] bg-gradient-to-r from-blue-500 to-indigo-600 dark:from-cyan-400 dark:to-indigo-500 opacity-80 group-hover:opacity-100 transition-opacity"></div>

        <div className="space-y-4 w-full text-left">
          <div className="flex justify-between items-center w-full">
            <span className="text-[10px] uppercase font-extrabold tracking-wider text-blue-600 dark:text-cyan-400 bg-blue-50/70 dark:bg-cyan-950/30 px-3 py-1 rounded-full border border-blue-100/50 dark:border-cyan-900/30 select-none">
              Category
            </span>
            <span className="text-xs font-bold text-slate-600 dark:text-slate-400 bg-slate-100/80 dark:bg-slate-800/60 px-3 py-1 rounded-full border border-slate-200/40 dark:border-slate-700/40 select-none">
              {examList ? examList.length : 0} {examList?.length === 1 ? 'Exam' : 'Exams'}
            </span>
          </div>

          <h3 className='font-bold text-lg sm:text-xl text-slate-800 dark:text-white tracking-tight leading-snug group-hover:text-blue-600 dark:group-hover:text-cyan-400 transition-colors'>
            {title}
          </h3>

          <p className='text-xs sm:text-sm font-medium text-slate-600 dark:text-slate-400 leading-relaxed line-clamp-3'>
            {content}
          </p>
        </div>

        <div className='mt-6 flex items-center gap-1.5 text-xs font-bold text-blue-600 dark:text-cyan-400 group-hover:text-blue-700 dark:group-hover:text-cyan-300 transition-colors'>
          <span>Explore Category</span>
          <span className="text-sm font-semibold transform group-hover:translate-x-1 transition-transform duration-205">&rarr;</span>
        </div>
      </div>

      {activeList === examList && <ExamsList examList={activeList} title={title} />}
    </>
  )
}

export default ExamCard;