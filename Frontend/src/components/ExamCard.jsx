import React, { useContext, useState } from 'react'
import ExamsList from './ExamsList'
import { AppContent } from '../context/AppContext'

const ExamCard = ({ icon, title, content, examList }) => {
  const { activeList , setActiveList, activeExamTitle, setActiveExamTitle } = useContext(AppContent)

  const handleClick = () => {
    setActiveList(examList);
    setActiveExamTitle(title);
  }

  return (
    <>
      <div onClick={() => {handleClick()}} className='cursor-pointer flex flex-col justify-center items-center p-6 gap-3 bg-white rounded-xl shadow-xl w-[15rem] h-[17rem] group hover:outline-1 hover:outline-blue-600 hover:-translate-y-3 hover:shadow-2xl border-t border-t-blue-600 transition-all duration-700'>
          <div className='text-3xl p-4 bg-blue-100 rounded-full flex justify-center items-center group-hover:bg-blue-600 transition-all duration-500 group-hover:rotate-10'>
            {icon}
          </div>
          <div className='font-medium text-[18px]'>
            {title}
          </div>
          <div className='text-center text-gray-500 '>
            {content}
          </div>
      </div>
      {activeList && <ExamsList examList={activeList} title={activeExamTitle}/>}
    </>
  )
}

export default ExamCard;