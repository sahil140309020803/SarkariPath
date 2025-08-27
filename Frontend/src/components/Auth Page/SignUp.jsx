import { useContext, useState } from "react";
import InputField from "./InputField";
import { toast } from "react-toastify";
import axios from "axios";
import { AppContent } from "../../context/AppContext";
import { AiOutlineLoading3Quarters } from "react-icons/ai";

const SignUp = ({ isLoaded }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false);
  const {backend_url, isLoggedIn, setIsLoggedIn} = useContext(AppContent)

  const delay = ms => new Promise(resolve => setTimeout(resolve, ms));
  const getDelay = (base) => isLoaded ? `${base}ms` : '0ms';

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
        <div className="font-bold text-3xl text-gray-800 mb-1.5">Get Started</div>
        <p className="text-sm text-gray-500">Create an account to continue</p>
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
          className="cursor-pointer w-full rounded-lg border-none bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-sm font-bold py-3.5 uppercase tracking-wider shadow-lg shadow-indigo-200 hover:-translate-y-0.5 hover:shadow-xl transition-all duration-300 flex justify-center items-center gap-5"
        >
          Sign Up
          {isLoading && <AiOutlineLoading3Quarters className="animate-spin" />}
        </button>
      </div>
    </form>
  );
};

export default SignUp;