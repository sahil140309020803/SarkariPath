import React, { useContext } from 'react'
import ExamCard from './ExamCard';
// import { AppContent } from '../context/AppContext';
import ExamsList from './ExamsList';
import { useExam } from '../context/ExamContext';

const ExamCat = () => {
  const { examCatList } = useExam();
console.log(examCatList);
  return (
    <div className='w-[85vw] h-[94vh] flex flex-col items-center gap-12 pt-[1rem]'>
        {/* Exam Categories Heading */}
        <div className='flex flex-col gap-2 justify-center items-center'>
          <div className='font-bold text-3xl text-center'>
            Popular Exam Categories
          </div>
          <div className='text-gray-500 text-[18px] text-center'>
            Choose from our most popular government exam categories and start your preparation journey
          </div>
        </div>
        {/* Exam Categories */}
        <div className='flex justify-center items-center flex-wrap gap-10'>
          {examCatList && examCatList.map((category) => (
            <ExamCard key={category._id} icon={category.icon} title={category.Name} content={category.Description} examList={category.Exams}/>
          ))}
        </div>
        
    </div>
  )
}

export default ExamCat;