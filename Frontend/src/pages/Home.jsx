import React, { useContext, useRef } from 'react'
import Navbar from '../components/Navbar'
import Header from '../components/Header'
import { IoArrowDownCircleOutline } from "react-icons/io5";
import ExamCat from '../components/ExamCat';
import { AppContent } from '../context/AppContext';

const Home = () => {
  const { scrollToExams } = useContext(AppContent);

  const handleScroll = () => {
    scrollToExams.current.scrollIntoView({ behavior: 'smooth' });
  }


  return (
    <div className='w-full h-full flex flex-col items-center'>
        <Navbar />
        <Header />
        <div onClick={() =>handleScroll()} className='flex flex-col justify-center items-center gap-1 animate-bounce text-gray-400 cursor-pointer'>
          <div>Exam Categories</div>
          <IoArrowDownCircleOutline className='size-8'/>
        </div>
        <div ref={scrollToExams}>
          <ExamCat/>
        </div>
    </div>
  )
}

export default Home;