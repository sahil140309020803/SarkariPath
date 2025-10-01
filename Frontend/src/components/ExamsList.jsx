import React, { useContext, useEffect } from 'react'
// import { AppContent } from '../context/AppContext';
import SpecficExam from './SpecficExam';
import { useExam } from '../context/ExamContext';

const ExamsList = ({ examList, title }) => {
  // const { activeList , setActiveList } = useContext(AppContent)

  const {
    activeList, setActiveList,
} = useExam();

  useEffect(() => {
    document.body.style.overflowY = "hidden";
  
    return () => {
      document.body.style.overflowY = "scroll";
    }
  }, [])
  

  return (
    <div>
      {/* Wrapper Container */}
      <div onClick={() => setActiveList(null)} className='fixed top-0 left-0 right-0 bottom-0 backdrop-blur-sm cursor-pointer z-5'></div>
      {/* Actual PopUp */}
      <div className='fixed top-[50%] left-[50%] -translate-x-[50%] -translate-y-[50%] p-10 z-6 bg-white shadow rounded-2xl flex flex-col justify-center gap-5'>
        <div className='flex flex-col justify-center items-center gap-1'>
          <div className='font-bold text-2xl'>Select Your Dream Exam</div>
          <div className='text-gray-600 animate-pulse'>
            Choose the path that leads to your success
          </div>
          <hr className="border w-[100%]"/>
        </div>
        
        <ul className='relative flex flex-col gap-6 max-h-[60vh] overflow-y-auto pt-2'>
          {examList.map(exam => (
            <li key={exam}>
              <SpecficExam exam = {exam} title={title}/>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

export default ExamsList;