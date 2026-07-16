import React, { useState, useEffect, useContext } from 'react';
import LOGO from '../assets/LOGO.png';
import SignIn from '../components/Auth Page/SignIn';
import SignUp from '../components/Auth Page/SignUp';
// import { AppContent } from '../context/AppContext';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';


const Authentication = ({ initialIsLogin }) => {
  const [isLogin, setIsLogin] = useState(initialIsLogin);
  const [isLoaded, setIsLoaded] = useState(false);
  // const {isLoggedIn, setIsLoggedIn} = useContext(AppContent);
  const { isLoggedIn } = useUser();


  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoaded(true);
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (isLoggedIn) {
      navigate('/');
    }
  }, [isLoggedIn]);

  return (
    <div className="flex justify-center items-center h-[100dvh] w-[100dvw] p-2 ">
      <div className={`w-full max-w-xl max-h-[96dvh] bg-white dark:bg-slate-900 rounded-2xl border max-[23rem]:overflow-y-auto overflow-hidden overflow-x-hidden custom-scrollbar border-gray-200 dark:border-slate-800 shadow-2xl shadow-gray-300 dark:shadow-none relative p-8 transition-all duration-700 ease-out flex flex-col gap-3 ${isLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}>

        <div className={`flex gap-1 flex-col items-center justify-center transition-all duration-500 ease-out ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'}`}>
          <img src={LOGO} alt="logo" className='w-16 h-16' />
          <div className="font-bold text-2xl tracking-tight text-slate-800 dark:text-white flex items-center transition-colors">
            Sarkari<span className="text-blue-600 dark:text-cyan-400">Path</span>
          </div>
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

        <div className={`relative transition-all duration-500 ease-in-out ${isLogin ? 'h-[400px]' : 'h-[560px]'}`}>
          <div className={`absolute top-0 left-0 w-full h-full transition-all duration-500 ease-in-out ${isLogin ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-full'}`}>
            <SignIn isLoaded={isLogin && isLoaded} />
          </div>
          <div className={`absolute top-0 left-0 w-full h-full transition-all duration-500 ease-in-out ${!isLogin ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-full'}`}>
            <SignUp isLoaded={!isLogin && isLoaded} />
          </div>
        </div>
        {/* <div
          className={`transition-all duration-500 ease-in-out ${isLogin ? "min-h-[400px]" : "min-h-[560px]"
            }`}
        >
          {isLogin ? (
            <SignIn isLoaded={isLoaded} />
          ) : (
            <SignUp isLoaded={isLoaded} />
          )}
        </div> */}
      </div>
    </div>
  );
}

export default Authentication;