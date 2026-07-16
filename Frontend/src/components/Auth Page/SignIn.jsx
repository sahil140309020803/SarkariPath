import { useContext, useState } from "react";
import InputField from "./InputField";
import axios from "axios";
import { toast } from "react-toastify";
// import { AppContent } from "../../context/AppContext";
import { AiOutlineLoading3Quarters } from "react-icons/ai";
import { useNavigate } from 'react-router-dom'
import { useUser } from "../../context/UserContext";
import { GoogleLogin } from '@react-oauth/google';
import { useTheme } from "../../context/ThemeContext";
import { trackEvent } from "../../utils/analytics";
import { identifyUser } from "../../utils/clarity";

const SignIn = ({ isLoaded }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  // const { backend_url, isLoggedIn, setIsLoggedIn } = useContext(AppContent);

  const { setIsLoggedIn, backend_url } = useUser();
  const { theme } = useTheme();
  const navigate = useNavigate();
  const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

  const handleGoogleSuccess = async (idToken) => {
    setIsLoading(true);
    try {
      axios.defaults.withCredentials = true;
      const { data } = await axios.post(`${backend_url}/api/auth/user/google-login`, { idToken });
      if (data.success) {
        trackEvent('login', { method: 'google' });
        identifyUser(data.user?.id || data.userId, data.user?.email, data.user?.name);
        setIsLoggedIn(true);
        toast.success(data.message || "Google Login successful!");
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
    setIsLoading(true);
    try {
      await delay(1500);
      const { data } = await axios.post(`${backend_url}/api/auth/user/login`, { email, password });
      if (data.success) {
        trackEvent('login', { method: 'email' });
        identifyUser(data.user?.id || data.userId, data.user?.email, data.user?.name);
        setIsLoggedIn(true);
        toast.success(data.message);
        navigate('/');
      } else if (data.unverified) {
        toast.info(data.message || "Please verify your email.");
        navigate('/verify-email', { state: { email } });
      } else {
        toast.error(data.message);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || err.message);
    }
    setIsLoading(false);
  }

  const getDelay = (base) => isLoaded ? `${base}ms` : '0ms';

  return (
    <form onSubmit={handleSubmit} className="flex flex-col w-full h-full justify-start items-center text-center">
      <div
        className={`w-full mb-4 transition-all duration-500 ease-out ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
        style={{ transitionDelay: getDelay(100) }}
      >
        <div className="font-bold text-2xl sm:text-3xl text-gray-800 dark:text-white mb-1.5 transition-colors">
          Welcome Back!
        </div>
        <p className="text-sm text-gray-500 dark:text-slate-400 transition-colors">
          Please enter your details to login.
        </p>
      </div>

      <div className={`w-full transition-all duration-500 ease-out ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`} style={{ transitionDelay: getDelay(200) }}>
        <InputField id="email" label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
      </div>
      <div className={`w-full transition-all duration-500 ease-out ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`} style={{ transitionDelay: getDelay(300) }}>
        <InputField id="password" label="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
      </div>

      <div className={`w-full text-right mb-4 transition-all duration-500 ease-out ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`} style={{ transitionDelay: getDelay(350) }}>
        <button
          type="button"
          onClick={() => navigate('/forgot-password')}
          className="text-xs sm:text-sm font-semibold text-indigo-600 hover:text-indigo-750 dark:text-cyan-400 dark:hover:text-cyan-300 transition-colors cursor-pointer"
        >
          Forgot Password?
        </button>
      </div>

      <div className={`w-full mt-auto transition-all duration-500 ease-out ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`} style={{ transitionDelay: getDelay(400) }}>
        <button
          type="submit"
          className={`w-full rounded-lg border-none bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-500 dark:to-cyan-600 text-white text-sm font-bold py-3.5 uppercase tracking-wider shadow-sm hover:shadow-[0_4px_15px_rgba(99,102,241,0.35)] dark:hover:shadow-[0_4px_15px_rgba(6,182,212,0.4)] transition-all duration-300 ease-out hover:-translate-y-0.5 cursor-pointer flex justify-center items-center gap-5`}
          disabled={isLoading}
        >
          Login
          {isLoading && <AiOutlineLoading3Quarters className="animate-spin" />}
        </button>

        <div className="flex items-center my-4">
          <div className="flex-1 border-t border-gray-300 dark:border-slate-700"></div>
          <span className="px-3 text-xs text-gray-500 dark:text-slate-400 font-semibold uppercase tracking-wider">or</span>
          <div className="flex-1 border-t border-gray-300 dark:border-slate-700"></div>
        </div>

         <div className="w-full max-w-[350px] mx-auto flex justify-center min-h-[44px]">
           <GoogleLogin
             onSuccess={credentialResponse => {
               handleGoogleSuccess(credentialResponse.credential);
             }}
             onError={() => {
               toast.error("Google authentication failed");
             }}
             theme={theme === 'dark' ? 'filled_black' : 'outline'}
             shape="rectangular"
             size="large"
             width="350"
           />
         </div>
      </div>
    </form>
  );
};

export default SignIn;