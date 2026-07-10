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
    <div onClick={() => handleNav()} className='relative w-[100%] p-3 rounded-xl cursor-pointer bg-slate-50 dark:bg-slate-800 hover:outline-1 hover:-translate-y-0.5 transition-colors duration-150 shadow dark:shadow-none hover:shadow-lg hover:outline-blue-500 dark:hover:outline-cyan-500 hover:bg-slate-100 dark:hover:bg-slate-700 group flex justify-between items-center border border-transparent dark:border-slate-700'>
      <div className='group-hover:-translate-y-0.5 transition-all duration-500 font-medium text-slate-800 dark:text-slate-100'>{exam}</div>
      <FaArrowRightLong className='text-slate-500 dark:text-cyan-400 mr-1 animate-pulse group-hover:rotate-360 transition-all duration-800' />
    </div>
  )
}

export default SpecficExam;