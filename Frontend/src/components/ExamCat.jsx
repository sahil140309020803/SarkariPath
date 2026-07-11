import React from 'react';
import ExamCard from './ExamCard';
import { useExam } from '../context/ExamContext';
import { Compass } from 'lucide-react';

const ExamCat = () => {
  const { examCatList } = useExam();
  console.log(examCatList)

  return (
    <div className='w-full flex justify-center py-8'>
      <div className='max-w-7xl w-full px-4 sm:px-6 lg:px-8 space-y-12'>
        {/* Exam Categories Heading */}
        <div className='flex flex-col gap-4 justify-center items-center text-center'>
          <div className='inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 dark:bg-slate-800 border border-blue-200 dark:border-slate-700 text-blue-700 dark:text-cyan-400 font-semibold text-sm transition-colors'>
            <Compass size={16} className="text-blue-600 dark:text-cyan-400" /> Discover Your Path
          </div>
          <h2 className='font-extrabold text-2xl sm:text-4xl md:text-5xl text-slate-800 dark:text-white tracking-tight transition-colors'>
            Popular Exam Categories
          </h2>
          <p className='text-slate-500 dark:text-slate-400 text-base sm:text-lg md:text-xl max-w-2xl font-medium transition-colors'>
            Choose from our most popular government exam categories and start your journey towards success today.
          </p>
        </div>

        {/* Exam Categories Grid */}
        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8'>
          {examCatList && examCatList.map((category) => (
            <ExamCard key={category._id} title={category.Name} content={category.Description} examList={category.Exams} />
          ))}
        </div>
      </div>
    </div>
  )
}

export default ExamCat;