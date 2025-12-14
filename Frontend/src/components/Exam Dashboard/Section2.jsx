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
      <div className='w-full h-full flex flex-col justify-start items-start p-5 gap-4'>
        <div className='font-semibold text-2xl text-gray-700'>Practice By Subject</div>
        <div className='h-full w-full mt-2 mb-2 bg-white rounded-xl p-5 shadow-2xl overflow-y-scroll'>
          {!isExamDataFetched && <SubjectLoader />}
          {isExamDataFetched && <SubjectList />}
        </div>
      </div>
    </div>
  )
}

export default Section2;