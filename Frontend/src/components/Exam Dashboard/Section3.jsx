import React, { useContext } from 'react'
import AboutLoader from './AboutLoader';
import { AppContent } from '../../context/AppContext';

const Section3 = () => {
  const { isExamDataFetched, setIsExamDataFetched } = useContext(AppContent);
  return (
    <div className={`w-full h-full flex items-start justify-start`}>
      <div className='w-full h-full p-5'>
        <div className='h-full w-full mt-2 mb-2 bg-white rounded-xl p-5 shadow-2xl'>
          {!isExamDataFetched && <AboutLoader />}
        </div>
      </div>
    </div>
  )
}

export default Section3;