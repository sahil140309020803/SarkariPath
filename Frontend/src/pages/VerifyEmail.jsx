import React, { useState, useEffect, useRef } from 'react';
import LOGO from '../assets/LOGO.png';
import { useNavigate, useLocation } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import axios from 'axios';
import { toast } from 'react-toastify';
import { AiOutlineLoading3Quarters } from 'react-icons/ai';

const VerifyEmail = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isLoggedIn, setIsLoggedIn, backend_url } = useUser();

  const [email, setEmail] = useState('');
  const [otpValues, setOtpValues] = useState(['', '', '', '', '', '']);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [timer, setTimer] = useState(30);
  const [isLoaded, setIsLoaded] = useState(false);

  const otpRefs = useRef([]);

  useEffect(() => {
    if (isLoggedIn) {
      navigate('/');
    }
  }, [isLoggedIn, navigate]);

  useEffect(() => {
    // Implement SEO Page Title
    document.title = "Verify Email - SarkariPath";

    const emailState = location.state?.email || new URLSearchParams(location.search).get('email');
    if (!emailState) {
      toast.error("No email provided for verification. Please register or login.");
      navigate('/login');
      return;
    }
    setEmail(emailState);

    const loadTimer = setTimeout(() => {
      setIsLoaded(true);
    }, 100);
    return () => clearTimeout(loadTimer);
  }, [location, navigate]);

  // Countdown timer for Resend OTP
  useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [timer]);

  // OTP inputs change handler
  const handleOtpChange = (index, value) => {
    // Only accept numeric digits
    if (value !== '' && !/^\d+$/.test(value)) return;

    const newOtp = [...otpValues];
    newOtp[index] = value;
    setOtpValues(newOtp);

    // Auto-focus next field
    if (value && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }
  };

  // OTP inputs KeyDown handler (Backspace support)
  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace') {
      if (!otpValues[index] && index > 0) {
        const newOtp = [...otpValues];
        newOtp[index - 1] = '';
        setOtpValues(newOtp);
        otpRefs.current[index - 1]?.focus();
      } else {
        const newOtp = [...otpValues];
        newOtp[index] = '';
        setOtpValues(newOtp);
      }
    }
  };

  // Paste handler
  const handlePaste = (e) => {
    e.preventDefault();
    const pasteData = e.clipboardData.getData('text').trim();
    if (/^\d{6}$/.test(pasteData)) {
      const digits = pasteData.split('');
      setOtpValues(digits);
      otpRefs.current[5]?.focus();
    } else {
      toast.error("Please paste a valid 6-digit numeric OTP.");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const otpString = otpValues.join('');
    if (otpString.length !== 6) {
      toast.error("Please enter a valid 6-digit OTP.");
      return;
    }

    setIsVerifying(true);
    try {
      axios.defaults.withCredentials = true;
      const { data } = await axios.post(`${backend_url}/api/auth/user/verify-otp`, { email, otp: otpString });
      if (data.success) {
        toast.success(data.message || "Email verified successfully!");
        setIsLoggedIn(true);
        // Redirect to dashboard
        navigate(`/`);
      } else {
        toast.error(data.message || "Invalid OTP");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || err.message);
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResend = async () => {
    if (timer > 0) return;

    setIsResending(true);
    try {
      axios.defaults.withCredentials = true;
      const { data } = await axios.post(`${backend_url}/api/auth/user/resend-otp`, { email });
      if (data.success) {
        toast.success(data.message || "OTP resent successfully!");
        setOtpValues(['', '', '', '', '', '']);
        setTimer(30);
        otpRefs.current[0]?.focus();
      } else {
        toast.error(data.message || "Failed to resend OTP");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || err.message);
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="flex justify-center items-center h-[100dvh] w-[100dvw] p-2 bg-slate-50 dark:bg-slate-950 transition-colors">
      <div className={`w-full max-w-xl bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-800 shadow-2xl relative p-8 transition-all duration-700 ease-out flex flex-col gap-6 ${isLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}>

        {/* Header/Logo */}
        <div className="flex flex-col items-center justify-center">
          <div>
            <img src={LOGO} alt="logo" className='w-16 h-16' />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Verify Email</h2>
          <p className="text-sm text-gray-500 dark:text-slate-400 mt-2 text-center">
            We have sent a verification code to <span className="font-semibold text-slate-750 dark:text-slate-200">{email}</span>
          </p>
        </div>

        {/* OTP Input Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-center text-gray-600 dark:text-slate-300">
              Enter 6-digit OTP
            </label>
            <div className="flex justify-center gap-3 my-4">
              {otpValues.map((val, idx) => (
                <input
                  key={idx}
                  ref={(el) => (otpRefs.current[idx] = el)}
                  type="text"
                  maxLength={1}
                  value={val}
                  onChange={(e) => handleOtpChange(idx, e.target.value)}
                  onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                  onPaste={idx === 0 ? handlePaste : undefined}
                  className="w-12 h-12 text-center text-xl font-bold bg-gray-100 dark:bg-slate-800 border border-gray-300 dark:border-slate-700 rounded-lg outline-none text-gray-800 dark:text-white focus:border-indigo-500 dark:focus:border-cyan-400 focus:ring-2 focus:ring-indigo-200 dark:focus:ring-cyan-900/50 transition-all duration-300"
                />
              ))}
            </div>
          </div>

          <button
            type="submit"
            id="verify-otp-btn"
            className="w-full rounded-lg border-none bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-500 dark:to-cyan-600 text-white text-sm font-bold py-3.5 uppercase tracking-wider shadow-sm hover:shadow-[0_4px_15px_rgba(99,102,241,0.35)] dark:hover:shadow-[0_4px_15px_rgba(6,182,212,0.4)] transition-all duration-300 ease-out hover:-translate-y-0.5 cursor-pointer flex justify-center items-center gap-2"
            disabled={isVerifying}
          >
            Verify OTP
            {isVerifying && <AiOutlineLoading3Quarters className="animate-spin" />}
          </button>
        </form>

        {/* Resend and Timer Info */}
        <div className="flex justify-between items-center text-sm font-semibold mt-2">
          <span className="text-gray-500 dark:text-slate-400">
            {timer > 0 ? `Resend OTP in ${timer}s` : "Ready to resend"}
          </span>
          <button
            type="button"
            id="resend-otp-btn"
            onClick={handleResend}
            disabled={timer > 0 || isResending}
            className={`transition-colors cursor-pointer ${timer > 0 || isResending
              ? "text-gray-400 dark:text-slate-650 cursor-not-allowed"
              : "text-indigo-650 hover:text-indigo-750 dark:text-cyan-400 dark:hover:text-cyan-300"
              }`}
          >
            {isResending ? (
              <span className="flex items-center gap-1">
                Resending... <AiOutlineLoading3Quarters className="animate-spin text-xs" />
              </span>
            ) : (
              "Resend OTP"
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default VerifyEmail;
