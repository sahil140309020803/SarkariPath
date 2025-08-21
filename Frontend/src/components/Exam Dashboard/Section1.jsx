import React from 'react'
import Difficulty from './Difficulty'
import { useContext } from 'react'
import { AppContent } from '../../context/AppContext'

const Section1 = () => {
  const { showDifficulty, setShowDifficulty, difficulty, setDifficulty, setShowTestGenerate, showTestGenerate, isExamDataFetched } = useContext(AppContent);
  const questions = isExamDataFetched?.QuesnTimer[0];
  const time = isExamDataFetched?.QuesnTimer[1];
  const handleClick = () => {
    setDifficulty(null);
    setShowDifficulty(prev => !prev);
  }

  return (
    <div className={`w-full h-full flex justify-center items-start`}>
      {/* Full Mock Test Card */}
      <div  className='shadow-2xl flex justify-center items-center gap-4 p-10 w-[92%] rounded-xl bg-radial-[at_50%_75%] from-sky-600 via-blue-500 to-indigo-400 to-90%'>
        <div className='flex flex-col gap-5'>
          <div>
            <div className='font-bold text-white text-2xl'>Full Mock Test</div>
            <div className='text-gray-300 text-[17px]'>Generate a unique test tailored to the official syllabus. Prepare smarter, not just harder.
            </div>
            {isExamDataFetched && <div className='flex justify-start items-center gap-5 text-white mt-1'>
              <div>✅ {questions} Questions</div>
              <div>⌛ {time} Minutes</div>
            </div>}
          </div>
          <div onClick={() => handleClick()} className='bg-radial-[at_50%_75%] from-sky-600 via-blue-700 to-indigo-800 to-90% text-gray-100 font-semibold border p-2 pl-5 pr-5 w-fit rounded-full cursor-pointer text-lg hover:bg-radial-[at_50%_75%] hover:from-sky-800 hover:via-blue-800 hover:to-indigo-800 hover:to-90% transition-all duration-400'>Start New Test</div>
        </div>
        <div className='text-9xl cursor-pointer animate-heart-pulse'>🧠</div>
      </div>
    </div>
  )
}

export default Section1;