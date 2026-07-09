import { useContext, useState } from "react";
import InputField from "./InputField";
import { toast } from "react-toastify";
import axios from "axios";
// import { AppContent } from "../../context/AppContext";
import { AiOutlineLoading3Quarters } from "react-icons/ai";
import { useNavigate } from 'react-router-dom';
import { useAuth } from "../../context/AuthContext";
import { GoogleLogin } from '@react-oauth/google';
import { useTheme } from "../../context/ThemeContext";

const SignUp = ({ isLoaded }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false);
  // const {backend_url, isLoggedIn, setIsLoggedIn} = useContext(AppContent)


  const { isLoggedIn, setIsLoggedIn, backend_url } = useAuth();
  const { theme } = useTheme();
  const navigate = useNavigate();
  

  const delay = ms => new Promise(resolve => setTimeout(resolve, ms));
  const getDelay = (base) => isLoaded ? `${base}ms` : '0ms';

  const handleGoogleSuccess = async (idToken) => {
    setIsLoading(true);
    try {
      axios.defaults.withCredentials = true;
      const { data } = await axios.post(`${backend_url}/api/auth/user/google-login`, { idToken });
      if (data.success) {
        setIsLoggedIn(true);
        toast.success(data.message || "Google Login successful!", {
          autoClose: 2500
        });
        navigate('/');
      } else {
        toast.error(data.message || "Google authentication failed");
      }
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    axios.defaults.withCredentials = true;
    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    setIsLoading(true);
    try {
      await delay(1500);
      const { data } = await axios.post(`${backend_url}/api/auth/user/register`, { name, email, password });
      if (data.success) {
        setIsLoggedIn(true);
        toast.success(data.message, {
          autoClose: 2500
        });
        navigate('/');
      } else {
        toast.error(data.message);
      }

    } catch (err) {
      toast.error(err.message);
    }
    setIsLoading(false);
  }


  return (
    <form onSubmit={handleSubmit} className="flex flex-col w-full h-full justify-start items-center text-center">
      <div
        className={`w-full mb-6 transition-all duration-500 ease-out ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
        style={{ transitionDelay: getDelay(100) }}
      >
        <div className="font-bold text-2xl sm:text-3xl text-gray-800 dark:text-white mb-1.5 transition-colors">Get Started</div>
        <p className="text-sm text-gray-500 dark:text-slate-400 transition-colors">Create an account to continue</p>
      </div>
      <div className={`w-full transition-all duration-500 ease-out ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`} style={{ transitionDelay: getDelay(200) }}>
        <InputField id="name" label="Full Name" type="text" value={name} onChange={(e) => setName(e.target.value)} />
      </div>
      <div className={`w-full transition-all duration-500 ease-out ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`} style={{ transitionDelay: getDelay(300) }}>
        <InputField id="email-up" label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
      </div>
      <div className={`w-full transition-all duration-500 ease-out ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`} style={{ transitionDelay: getDelay(400) }}>
        <InputField id="password-up" label="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
      </div>
      <div className={`w-full transition-all duration-500 ease-out ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`} style={{ transitionDelay: getDelay(400) }}>
        <InputField id="confirm-password-up" label="Confirm Password" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
      </div>
      <div className={`w-full mt-auto transition-all duration-500 ease-out ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`} style={{ transitionDelay: getDelay(500) }}>
        <button
          type="submit"
          className="cursor-pointer w-full rounded-lg border-none bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-500 dark:to-cyan-600 text-white text-sm font-bold py-3.5 uppercase tracking-wider shadow-sm hover:shadow-[0_4px_15px_rgba(99,102,241,0.35)] dark:hover:shadow-[0_4px_15px_rgba(6,182,212,0.4)] transition-all duration-300 ease-out hover:-translate-y-0.5 flex justify-center items-center gap-5"
          disabled={isLoading}
        >
          Sign Up
          {isLoading && <AiOutlineLoading3Quarters className="animate-spin" />}
        </button>

        <div className="flex items-center my-4">
          <div className="flex-1 border-t border-gray-300 dark:border-slate-700"></div>
          <span className="px-3 text-xs text-gray-500 dark:text-slate-400 font-semibold uppercase tracking-wider">or</span>
          <div className="flex-1 border-t border-gray-300 dark:border-slate-700"></div>
        </div>
        
        <div className="relative w-full max-w-[350px] mx-auto h-[44px] rounded-lg overflow-hidden transition-all duration-300 hover:scale-[1.01] shadow-sm hover:shadow">
          {/* Custom Styled Google button UI */}
          <button
            type="button"
            className="absolute inset-0 w-full h-full flex items-center justify-center gap-3 px-4 py-2 rounded-lg border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-gray-50 dark:hover:bg-slate-700/80 text-gray-700 dark:text-slate-200 font-semibold text-sm transition-all duration-300 cursor-pointer"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            Continue with Google
          </button>

          {/* Invisible Official Google Login Trigger Overlay */}
          <div className="absolute inset-0 opacity-0 cursor-pointer [&>div]:w-full [&>div>iframe]:w-full [&>div>iframe]:cursor-pointer z-10">
            <GoogleLogin
              onSuccess={credentialResponse => {
                handleGoogleSuccess(credentialResponse.credential);
              }}
              onError={() => {
                toast.error("Google authentication failed");
              }}
              theme="outline"
              shape="rectangular"
              size="large"
              width="350"
            />
          </div>
        </div>
      </div>
    </form>
  );
};

export default SignUp;