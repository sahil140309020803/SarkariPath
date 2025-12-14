import React from 'react'
import Difficulty from './Difficulty'
import { useContext } from 'react'
// import { AppContent } from '../../context/AppContext'
import { useExam } from '../../context/ExamContext'

const Section1 = () => {
  // const { showDifficulty, setShowDifficulty, difficulty, setDifficulty, setShowTestGenerate, showTestGenerate, isExamDataFetched } = useContext(AppContent);

  const {
    isExamDataFetched,
    showDifficulty, setShowDifficulty,
    difficulty, setDifficulty,
    showTestGenerate, setShowTestGenerate,
    activeExamPage
} = useExam();

  const handleClick = () => {
    setDifficulty(null);
    setShowDifficulty(prev => !prev);
  }
  const removeSlug = (text) => {
    return text.replaceAll('-', ' ');
  }
  // console.log(isExamDataFetched);

  const mockTests = isExamDataFetched?.MockTests;
  console.log(mockTests);
  return (
    <div className={`w-full h-full flex justify-center items-start`}>

      <div className='w-full h-full flex flex-col justify-start items-start p-5 gap-4'>
        <div className='font-semibold text-2xl text-gray-700'>Available Mock Tests</div>
        <div className='h-full w-full mt-2 mb-2 bg-white rounded-xl p-5 shadow-2xl overflow-y-scroll flex flex-col gap-4'>
          {!isExamDataFetched && <div>Loading mock tests...</div>}
          {isExamDataFetched && mockTests.length === 0 && <div>No mock tests available for {removeSlug(activeExamPage)}.</div>}
          {isExamDataFetched && mockTests.map((test, index) => (
            <div key={index} className='border-b pb-4'>
              <div className='flex justify-between items-center'>
                <div className='text-lg font-semibold'>{test.Title}</div>
                <div onClick={handleClick} className='bg-blue-500 text-white px-4 py-2 rounded-lg cursor-pointer hover:bg-blue-700 transition-colors duration-100'>Start Test</div>
              </div>
              <div className='text-gray-600 mt-2'>Questions: {test.Questions.length} | Duration: {test.DurationinMinutes} minutes</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default Section1;