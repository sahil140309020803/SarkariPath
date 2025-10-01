import React, { useContext, useEffect, useRef } from 'react'
import Navbar from '../components/Navbar'
import Header from '../components/Header'
import { IoArrowDownCircleOutline } from "react-icons/io5";
import ExamCat from '../components/ExamCat';
import { useLocation, useNavigate } from 'react-router-dom';

const Home = () => {
  const location = useLocation();

  const navigate = useNavigate();
  
  useEffect(() => {
    if(location.hash) {
      const element = document.querySelector(location.hash);
      if(element)
        element.scrollIntoView({behavior: 'smooth'});
    }
  }, [location])
  


  return (
    <div className='w-full h-full flex flex-col items-center'>
        <Navbar />
        <Header />
        <div onClick={() => navigate('/#exam-categories')} className='flex flex-col justify-center items-center gap-1 animate-bounce text-gray-400 cursor-pointer'>
          <div>Exam Categories</div>
          <IoArrowDownCircleOutline className='size-8'/>
        </div>
        <div id='exam-categories'>
          <ExamCat/>
        </div>
        
    </div>
  )
}

export default Home;