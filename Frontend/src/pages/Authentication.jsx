import React, { useState, useEffect, useContext } from 'react';
import LOGO from '../assets/LOGO.png';
import SignIn from '../components/Auth Page/SignIn';
import SignUp from '../components/Auth Page/SignUp';
// import { AppContent } from '../context/AppContext';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';


const Authentication = ({initialIsLogin}) => {
  const [isLogin, setIsLogin] = useState(initialIsLogin);
  const [isLoaded, setIsLoaded] = useState(false);
  // const {isLoggedIn, setIsLoggedIn} = useContext(AppContent);
  const { isLoggedIn } = useAuth();


  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoaded(true);
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if(isLoggedIn) {
      navigate('/');
    }
  }, [isLoggedIn]);

  return (
    <div className="flex justify-center items-center h-[100dvh] w-[100dvw] p-2 ">
      <div className={`w-full max-w-xl max-h-[96dvh] bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-800 shadow-2xl shadow-gray-300 dark:shadow-none relative overflow-hidden p-8 transition-all duration-700 ease-out flex flex-col gap-3 ${isLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}>

        <div className={`flex flex-col items-center justify-center transition-all duration-500 ease-out ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'}`}>
          <div className="w-18 h-18 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg shadow-indigo-200 mb-4">
            <img src={LOGO} alt="logo" className='w-16 h-16 text-white' />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white transition-colors">SarkariPath</h2>
        </div>

        <div className={`flex bg-gray-100 dark:bg-slate-800 gap-4 rounded-xl p-1 transition-all duration-500 ease-out ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'}`} style={{ transitionDelay: isLoaded ? '100ms' : '0ms' }}>
          <button
            onClick={() => setIsLogin(true)}
            className={`flex-1 p-2.5 text-center font-semibold rounded-lg transition-all duration-300 ${isLogin ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-cyan-400 shadow-md' : 'text-gray-500 dark:text-slate-400'} cursor-pointer`}
          >
            Login
          </button>
          <button
            onClick={() => setIsLogin(false)}
            className={`flex-1 p-2.5 text-center font-semibold rounded-lg transition-all duration-300 ${!isLogin ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-cyan-400 shadow-md' : 'text-gray-500 dark:text-slate-400'} cursor-pointer`}
          >
            Sign Up
          </button>
        </div>

        <div className="relative h-[480px]">
          <div className={`absolute top-0 left-0 w-full h-full transition-all duration-500 ease-in-out ${isLogin ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-full'}`}>
            <SignIn isLoaded={isLogin && isLoaded} />
          </div>
          <div className={`absolute top-0 left-0 w-full h-full transition-all duration-500 ease-in-out ${!isLogin ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-full'}`}>
            <SignUp isLoaded={!isLogin && isLoaded} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default Authentication;