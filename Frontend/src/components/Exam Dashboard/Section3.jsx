import React, { useContext } from 'react'
import AboutLoader from './AboutLoader';
// import { AppContent } from '../../context/AppContext';
import AboutExam from './AboutExam';
import { useExam } from '../../context/ExamContext';

const Section3 = () => {
  // const { isExamDataFetched, setIsExamDataFetched } = useContext(AppContent);

  const {
    isExamDataFetched, setIsExamDataFetched
} = useExam();

  return (
    <div className={`w-full h-full flex items-start justify-start`}>
      <div className='w-full h-full p-5'>
        <div className='h-full w-full mt-2 mb-2 bg-white rounded-xl p-5 shadow-2xl'>
          {!isExamDataFetched && <AboutLoader />}
          {isExamDataFetched && <AboutExam />}
        </div>
      </div>
    </div>
  )
}

export default Section3;