import React, { useContext } from 'react'
import FeatureCard from './FeatureCard';
import { useNavigate } from 'react-router-dom';
// import { AppContent } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';

const Header = () => {
    const navigate = useNavigate();
    // const { userDetails, setUserDetails, isLoggedIn } = useContext(AppContent);

    const { isLoggedIn, userDetails, setUserDetails } = useAuth();

    const name = userDetails ? userDetails.name : '';
  return (
    <div className='flex justify-center items-center h-[85dvh]'>
        <div className='flex justify-center items-center w-[80vw] gap-5'>
            {/* Header Content */}
            <div className='flex flex-col justify-center items-center gap-4'>
                {isLoggedIn && <div className='text-3xl font-bold text-center mr-20'>
                    👋 Hey, {name}
                </div>}
                <div className='text-5xl font-extrabold'>
                    <div className='text-black'>Your Gateway to</div>
                    <div className='text-blue-600 decoration-3 decoration-blue-500 underline underline-offset-8'>Government Exams</div>
                </div>
                <div className='text-gray-600 text-center'>Master government exam preparation with AI-powered mock tests, subject-wise practice, and topic-focused learning designed for your success.</div>
                <div className='cursor-pointer p-[6px] pr-5 pl-5 rounded-xl bg-linear-to-r from-cyan-500 to-blue-500 text-gray-100 hover:-translate-y-0.5 transition-all duration-400 hover:shadow-xl font-semibold animate-pulse shadow'>
                    🤖 AI-Powered Questions
                </div>
                <div className='flex gap-3 m-4'>
                    <button onClick={() => navigate('/signup')} className='bg-linear-to-t from-sky-500 to-indigo-500 p-3 pr-5 pl-5 font-semibold rounded-xl cursor-pointer text-white hover:-translate-y-0.5 transition-all duration-400 hover:shadow-xl'>Get Started</button>
                    <button className='p-3 pr-5 pl-5 font-semibold border-2 rounded-xl border-gray-400 cursor-pointer hover:border-blue-600 hover:text-blue-600 hover:-translate-y-0.5 transition-all duration-400 ease-in-out'>Explore Features</button>
                </div>
            </div>
            {/* Features Component */}
            <div className='flex justify-center items-center flex-wrap gap-7'>
                <FeatureCard icon="📝"  title="Full Mock Tests" content="Experience the real exam with our full-length mock tests."/>
                <FeatureCard icon="📚" title="Subject Practice" content="Master any subject with our AI-Powered tests for targeted practice."/>
                <FeatureCard icon="🎯" title="Topic-wise Learning" content="Instantly create a custom test on any small topic now."/>
            </div>
        </div>
    </div>
  )
}

export default Header;