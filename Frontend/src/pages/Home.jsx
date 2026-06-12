import React, { useEffect } from 'react';
import Navbar from '../components/Navbar';
import Header from '../components/Header';
import { ArrowDownCircle } from "lucide-react";
import ExamCat from '../components/ExamCat';
import { useLocation, useNavigate } from 'react-router-dom';

const Home = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  useEffect(() => {
    if(location.hash) {
      const element = document.querySelector(location.hash);
      if(element) {
        element.scrollIntoView({behavior: 'smooth'});
      }
    }
  }, [location]);

  return (
    <div className='w-full min-h-screen flex flex-col bg-slate-50 dark:bg-slate-900 transition-colors duration-300'>
        <Navbar />
        <Header />
        
        {/* Scroll Indicator */}
        <div 
            onClick={() => navigate('/#exam-categories')} 
            className='flex flex-col justify-center items-center gap-2 -mt-6 z-20 group cursor-pointer'
        >
            <div className="bg-white dark:bg-slate-800 p-2 rounded-full border border-slate-200 dark:border-slate-700 hover:border-indigo-500 shadow-xl transition-all duration-300">
                <ArrowDownCircle className='w-8 h-8 text-slate-400 dark:text-slate-400 group-hover:text-indigo-500 dark:group-hover:text-indigo-400 animate-bounce' strokeWidth={1.5}/>
            </div>
            <span className="text-xs text-slate-500 font-medium tracking-wide uppercase opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                Scroll to explore
            </span>
        </div>

        {/* Dynamic Wave Divider */}
        <div className="w-full relative h-[60px] md:h-[100px] overflow-hidden -mt-[40px] md:-mt-[70px]">
            <svg viewBox="0 0 1440 320" className="absolute bottom-0 w-full" preserveAspectRatio="none" style={{ height: '100%', width: '100%' }}>
                <path className="fill-slate-100 dark:fill-[#020617] transition-colors duration-300" d="M0,256L48,229.3C96,203,192,149,288,138.7C384,128,480,160,576,170.7C672,181,768,171,864,154.7C960,139,1056,117,1152,122.7C1248,128,1344,160,1392,176L1440,192L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
            </svg>
        </div>

        {/* Content Section */}
        <div id='exam-categories' className="bg-slate-100 dark:bg-[#020617] pt-16 pb-24 px-4 sm:px-8 w-full flex justify-center transition-colors duration-300">
            <div className="max-w-7xl w-full">
               <ExamCat/>
            </div>
        </div>
    </div>
  )
}

export default Home;