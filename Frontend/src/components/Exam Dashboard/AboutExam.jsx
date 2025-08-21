import React from 'react'
import { useContext } from 'react';
import { AppContent } from '../../context/AppContext';

const AboutExam = () => {
    const { isExamDataFetched, setIsExamDataFetched } = useContext(AppContent);
    const about = isExamDataFetched?.About;
  return (
    <div className='w-full h-[40rem] p-5 overflow-y-scroll' dangerouslySetInnerHTML={{ __html: about }}>
    </div>
  )
}

export default AboutExam;