import React from 'react'
import { useContext } from 'react';
import { AppContent } from '../../context/AppContext';
import { RxCross2 } from "react-icons/rx";

const Difficulty = () => {
    const { showDifficulty, setShowDifficulty, difficulty, setDifficulty, showTestGenerate, setShowTestGenerate } = useContext(AppContent);

    const handleTest = (diff) => {
      setDifficulty(diff);
      setShowTestGenerate(prev => !prev);
      setShowDifficulty(prev => !prev);
    }
    const handleCancel = () => {
      setDifficulty(null);
      setShowDifficulty(prev => !prev);

    }

  return (
    <div>
        {/* Wrapper */}
        <div onClick={() => handleCancel()} className='fixed top-0 left-0 right-0 bottom-0 z-2 bg-black opacity-50'></div>
        <div className='fixed top-[50%] left-[50%] -translate-x-[50%] -translate-y-[50%] z-3 flex flex-col bg-white w-[25rem] rounded-xl'>
            <div className='flex justify-between items-center p-4 border-b border-gray-400'>
              <div className='text-lg font-medium '>Select Difficulty</div>
              <RxCross2 className='hover:text-black text-gray-500 cursor-pointer text-xl' onClick={() => handleCancel()}/>
            </div>
            <div className='flex flex-col gap-4 p-6'>
              <div className='text-center text-gray-800'>Choose the challenge level for your AI-generated mock test.</div>
              <div onClick={() => handleTest('Easy')} className='border rounded-[8px] text-center p-3 font-bold text-[17px] bg-green-50 text-green-700 border-green-400 cursor-pointer hover:bg-green-100 hover:outline transition-all duration-300 ease-in-out hover:-translate-y-0.5 hover:shadow-xl'>Easy</div>
              <div onClick={() => handleTest('Medium')} className='border rounded-[8px] text-center p-3 font-bold text-[17px] bg-yellow-50 text-yellow-700 border-yellow-400 cursor-pointer hover:bg-yellow-100 hover:outline transition-all duration-300 ease-in-out hover:-translate-y-0.5 hover:shadow-xl'>Medium</div>
              <div onClick={() => handleTest('Hard')} className='border rounded-[8px] text-center p-3 font-bold text-[17px] bg-red-50 text-red-700 border-red-400 cursor-pointer hover:bg-red-100 hover:outline transition-all duration-300 ease-in-out hover:-translate-y-0.5 hover:shadow-xl'>Hard</div>
            </div>
        </div>
    </div>
  )
}

export default Difficulty;