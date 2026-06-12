import React, { useContext, useState } from 'react'
import SubjectLoader from './SubjectLoader';
// import { AppContent } from '../../context/AppContext';
import SubjectList from './SubjectList';
import { useExam } from '../../context/ExamContext';

const Section2 = () => {
  // const { isExamDataFetched, setIsExamDataFetched } = useContext(AppContent);

  const {
    isExamDataFetched
} = useExam();

  return (
    <div className={`w-full h-full flex items-start justify-start`}>
      <div className='w-full h-full flex flex-col justify-start items-start p-2 sm:p-5 gap-6'>
        <div className='flex flex-col gap-1'>
            <h2 className='font-bold text-2xl text-slate-800 dark:text-slate-100 transition-colors'>Practice By Subject</h2>
            <p className='text-slate-500 dark:text-slate-400 text-sm'>Select a subject module to take a highly focused mock test.</p>
        </div>
        <div className='w-full min-h-[400px] max-h-[800px] bg-white dark:bg-slate-800/60 backdrop-blur-sm rounded-2xl p-6 shadow-sm dark:shadow-none border border-slate-200 dark:border-slate-700 overflow-y-auto custom-scrollbar transition-colors'>
          {!isExamDataFetched && <SubjectLoader />}
          {isExamDataFetched && <SubjectList />}
        </div>
      </div>
    </div>
  )
}

export default Section2;