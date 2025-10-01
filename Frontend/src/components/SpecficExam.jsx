import React from 'react'
import { useContext } from 'react';
import { FaArrowRightLong } from "react-icons/fa6";
import { useNavigate } from 'react-router-dom';
// import { AppContent } from '../context/AppContext';
import { useExam } from '../context/ExamContext';

const SpecficExam = ({ exam, title }) => {
  const navigate = useNavigate();
  // const { isExamDataFetched, setIsExamDataFetched } = useContext(AppContent);
  const { setIsExamDataFetched } = useExam();
  const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

  const createSlug = (text) => {
    return text.replaceAll(' ', '-');
  }
  const handleNav = async () => {
    setIsExamDataFetched(null);
    await delay(500);
    navigate(`/${createSlug(title)}/${createSlug(exam)}`)
  }

  return (
    <div onClick={() => handleNav()} className='relative w-[100%] p-3 rounded-xl cursor-pointer bg-radial-[at_50%_75%] from-sky-50 via-blue-100 to-cyan-50 to-90% hover:outline-1 hover:-translate-y-1 transition-all duration-500 shadow hover:shadow-lg hover:outline-blue-500 hover:from-sky-200 hover:via-blue-200 hover:to-indigo-100 group flex justify-between items-center'>
      <div className='group-hover:-translate-y-0.5 transition-all duration-500 font-medium'>{exam}</div>
      <FaArrowRightLong className='text-gray-700 mr-1 animate-pulse group-hover:rotate-360 transition-all duration-800' />
    </div>
  )
}

export default SpecficExam;