import React, { useContext } from 'react'
import ExamCard from './ExamCard';
import { AppContent } from '../context/AppContext';
import ExamsList from './ExamsList';

const ExamCat = () => {

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
          <ExamCard icon="📝"  title="HSSC" content="Haryana Staff Selection Commission exams including CET Group C and D." examList={["HSSC CET Group C", "HSSC CET Group D", "HSSC Gram Sachiv", "Haryana Police Constable", "Haryana Sub-Inspector", "Haryana Patwari"]}/>
          <ExamCard icon="🗒️" title="SSC" content="Staff Selection Commission exams including CGL, CHSL, MTS" examList={["SSC CGL", "SSC MTS", "SSC CHSL", "SSC GD Constable", "SSC Junior Engineer"]}/>
          <ExamCard icon="🏦" title="Banking" content="IBPS, SBI, RBI and other banking examination preparation" examList={["IBPS PO", "IBPS Clerk", "SBI PO", "SBI Clerk"]}/>
          <ExamCard icon="👮" title="Delhi Police" content="Delhi Police related exams like DP Constable, Head Constable and SI etc." examList={["Delhi Police Constable", "Delhi Police MTS", "Delhi Police SI", "Delhi Police Head Constable"]}/>
          <ExamCard icon="🚂" title="Railways" content="Railway Recruitment Board exams like RRB NTPC, Group D etc." examList={["RRB NTPC", "RRB JE", "RRB Group D"]}/>
        </div>
        
    </div>
  )
}

export default ExamCat;