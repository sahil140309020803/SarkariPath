import { useContext, useState } from "react";
import RoleButton from "./RoleButton";
import InputField from "./InputField";
import axios from "axios";
import { toast } from "react-toastify";
import { AppContent } from "../../context/AppContext";
import { AiOutlineLoading3Quarters } from "react-icons/ai";
import { useNavigate } from 'react-router-dom'

const SignIn = ({ isLoaded }) => {
  const [role, setRole] = useState('user');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [adminID, setAdminID] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { backend_url, isLoggedIn, setIsLoggedIn } = useContext(AppContent);

  const navigate = useNavigate();
  const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

  const handleUserClick = () => setRole('user');
  const handleAdminClick = () => {
    setRole('admin');
  }
  const handleSubmit = async (e) => {
    e.preventDefault();
    axios.defaults.withCredentials = true;
    setIsLoading(true);
    try {
      await delay(1500);
      if (role === 'user') {
        const { data } = await axios.post(`${backend_url}/api/auth/user/login`, { email, password });
        if (data.success) {
          setIsLoggedIn(true);
          toast.success(data.message, {
            autoClose: 2500
          });
          navigate('/');
        } else {
          toast.error(data.message);
        }
      } else if (role === 'admin') {
        console.log(adminId, password)
        const { data } = await axios.post(`${backend_url}/api/auth/admin/login`, { adminID, password });
        if (data.success) {
          setIsLoggedIn(true);
          toast.success(data.message, {
            autoClose: 2500
          });
          navigate('/');
        } else {
          toast.error(data.message);
        }
      }

    } catch (err) {
      toast.error(err.message);
    }
    setIsLoading(false);
  }

  const getDelay = (base) => isLoaded ? `${base}ms` : '0ms';

  return (
    <form onSubmit={handleSubmit} className="flex flex-col w-full h-full justify-start items-center text-center">
      <div
        className={`w-full mb-6 transition-all duration-500 ease-out ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
        style={{ transitionDelay: getDelay(100) }}
      >
        <div className="font-bold text-3xl text-gray-800 mb-1.5">
          {role === 'user' ? 'Welcome Back!' : 'Admin Access'}
        </div>
        <p className="text-sm text-gray-500">
          {role === 'user' ? 'Please enter your details to login.' : 'Please enter your admin credentials.'}
        </p>
      </div>

      <div
        className={`flex gap-4 w-full mb-6 transition-all duration-500 ease-out ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
        style={{ transitionDelay: getDelay(200) }}
      >
        <RoleButton label="User" isActive={role === 'user'} onClick={handleUserClick} />
        <RoleButton label="Admin" isActive={role === 'admin'} onClick={handleAdminClick} />
      </div>

      <div className={`w-full transition-all duration-500 ease-out ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`} style={{ transitionDelay: getDelay(300) }}>
        {role === 'user' ? (
          <InputField id="email" label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
        ) : (
          <InputField id="adminId" label="Admin ID" type="email" value={adminID} onChange={(e) => setAdminID(e.target.value)} />
        )}
      </div>
      <div className={`w-full transition-all duration-500 ease-out ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`} style={{ transitionDelay: getDelay(400) }}>
        <InputField id="password" label="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
      </div>

      {/* <div className={`w-full self-end transition-all duration-500 ease-out ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`} style={{ transitionDelay: getDelay(500) }}>
        {role === 'user' && (
          <a href="#" className="text-sm text-gray-600 my-4 hover:text-indigo-600 transition-colors block">
            Forgot Your Password?
          </a>
        )}
      </div> */}

      <div className={`w-full mt-auto transition-all duration-500 ease-out ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`} style={{ transitionDelay: getDelay(600) }}>
        <button
          type="submit"
          className={`w-full rounded-lg border-none bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-sm font-bold py-3.5 uppercase tracking-wider shadow-lg shadow-indigo-200 hover:-translate-y-0.5 hover:shadow-xl transition-all duration-300 cursor-pointer flex justify-center items-center gap-5`}
          disabled={isLoading}
        >
          {role === 'user' ? 'Login' : 'Admin Login'}
          {isLoading && <AiOutlineLoading3Quarters className="animate-spin" />}
        </button>
      </div>
    </form>
  );
};
export default SignIn;