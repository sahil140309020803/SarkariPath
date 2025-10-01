import React from 'react'
import { useContext } from 'react';
// import { AppContent } from '../../context/AppContext';
import { useExam } from '../../context/ExamContext';

const AboutExam = () => {
    const { isExamDataFetched, setIsExamDataFetched } = useExam();
    const about = isExamDataFetched?.About;
  return (
    <div className='w-full h-[40rem] p-5 overflow-y-scroll' dangerouslySetInnerHTML={{ __html: about }}>
    </div>
  )
}

export default AboutExam;