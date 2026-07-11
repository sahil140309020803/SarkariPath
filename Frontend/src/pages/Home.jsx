import React, { useEffect } from 'react';
import Navbar from '../components/Navbar';
import Header from '../components/Header';
import { ArrowDownCircle, XCircle } from "lucide-react";
import ExamCat from '../components/ExamCat';
import { useLocation, useNavigate } from 'react-router-dom';
import { useExam } from '../context/ExamContext';
import BeautifulLoadingScreen from '../components/BeautifulLoadingScreen';

const Home = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { isCategoriesLoading, categoriesFetchError, getExamCategories } = useExam();

  useEffect(() => {
    if (location.hash) {
      const element = document.querySelector(location.hash);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
  }, [location]);

  if (isCategoriesLoading) {
    return <BeautifulLoadingScreen message="Loading SarkariPath home page..." />;
  }

  if (categoriesFetchError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 transition-colors">
        <div className="text-center p-8 bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-red-100 dark:border-rose-900/30 max-w-md my-6">
          <XCircle className="w-12 h-12 text-red-500 dark:text-rose-500 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Error Loading Categories</h3>
          <p className="text-slate-650 dark:text-slate-400 mb-6 text-sm">{categoriesFetchError}</p>
          <button
            onClick={getExamCategories}
            className="w-full bg-blue-600 dark:bg-indigo-650 text-white py-3 rounded-xl hover:bg-blue-700 dark:hover:bg-indigo-500 transition shadow-md font-bold cursor-pointer text-sm"
          >
            Retry Loading
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className='w-full min-h-screen flex flex-col bg-slate-50 dark:bg-slate-900 transition-colors duration-300'>
      <Navbar />
      <Header />

      {/* Scroll Indicator */}
      <div
        onClick={() => navigate('/#exam-categories')}
        className='flex flex-col justify-center items-center gap-2 -mt-6 group cursor-pointer dark:bg-transparent bg-blue-50 z-10'
      >
        <div className="">
          <ArrowDownCircle className='w-8 h-8 text-slate-400 dark:text-slate-400 group-hover:text-indigo-500 dark:group-hover:text-indigo-400 animate-bounce' strokeWidth={1.5} />
        </div>
        <span className="text-xs text-slate-500 font-medium tracking-wide uppercase opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          Scroll to explore
        </span>
      </div>

      {/* Dynamic Wave Divider */}
      <div className="w-full relative h-[60px] md:h-[100px] overflow-hidden -mt-[40px] md:-mt-[70px] ">
        <svg viewBox="0 0 1440 320" className="absolute bottom-0 w-full" preserveAspectRatio="none" style={{ height: '100%', width: '100%' }}>
          <path className="fill-blue-50 dark:fill-[#020617] transition-colors duration-300" d="M0,256L48,229.3C96,203,192,149,288,138.7C384,128,480,160,576,170.7C672,181,768,171,864,154.7C960,139,1056,117,1152,122.7C1248,128,1344,160,1392,176L1440,192L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
        </svg>
      </div>

      {/* Content Section */}
      <div id='exam-categories' className="bg-slate-100 dark:bg-[#020617] pt-16 pb-24 px-4 sm:px-8 w-full flex justify-center transition-colors duration-300">
        <div className="max-w-7xl w-full">
          <ExamCat />
        </div>
      </div>
    </div>
  )
}

export default Home;