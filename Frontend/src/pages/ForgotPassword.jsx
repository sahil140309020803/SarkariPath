import React, { useState, useEffect, useRef } from 'react';
import LOGO from '../assets/LOGO.png';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { AiOutlineLoading3Quarters } from 'react-icons/ai';
import { useUser } from '../context/UserContext';
import InputField from '../components/Auth Page/InputField';

const ForgotPassword = () => {
  const navigate = useNavigate();
  const { isLoggedIn, backend_url } = useUser();

  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [otpValues, setOtpValues] = useState(['', '', '', '', '', '']);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  useEffect(() => {
    if (isLoggedIn) {
      navigate('/');
    }
  }, [isLoggedIn, navigate]);

  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [timer, setTimer] = useState(30);
  const [isLoaded, setIsLoaded] = useState(false);

  const otpRefs = useRef([]);

  // Password validation state
  const [passwordsMatch, setPasswordsMatch] = useState(true);
  const [passwordLengthValid, setPasswordLengthValid] = useState(true);

  useEffect(() => {
    document.title = "Forgot Password - SarkariPath";
    const loadTimer = setTimeout(() => {
      setIsLoaded(true);
    }, 100);
    return () => clearTimeout(loadTimer);
  }, []);

  // Timer countdown for Resend OTP
  useEffect(() => {
    let interval = null;
    if (step === 2 && timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [step, timer]);

  // Real-time password validation
  useEffect(() => {
    if (password || confirmPassword) {
      setPasswordLengthValid(password.length >= 6);
      setPasswordsMatch(password === confirmPassword);
    } else {
      setPasswordLengthValid(true);
      setPasswordsMatch(true);
    }
  }, [password, confirmPassword]);

  // Step 1: Send OTP handler
  const handleSendOtp = async (e) => {
    e.preventDefault();
    if (!email) {
      toast.error("Please enter your email address.");
      return;
    }

    setIsLoading(true);
    try {
      axios.defaults.withCredentials = true;
      const { data } = await axios.post(`${backend_url}/api/auth/user/forgot-password`, { email });
      if (data.success) {
        toast.success(data.message || "OTP sent successfully!");
        setTimer(30);
        setStep(2);
      } else {
        toast.error(data.message || "Something went wrong.");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Step 2: OTP inputs change handler
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

  // Step 2: OTP inputs KeyDown handler (Backspace support)
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

  // Step 2: Paste handler
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

  // Step 2: Verify OTP handler
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    const otpString = otpValues.join('');
    if (otpString.length !== 6) {
      toast.error("Please enter a 6-digit OTP.");
      return;
    }

    setIsLoading(true);
    try {
      axios.defaults.withCredentials = true;
      const { data } = await axios.post(`${backend_url}/api/auth/user/verify-forgot-password-otp`, {
        email,
        otp: otpString
      });
      if (data.success) {
        toast.success(data.message || "OTP verified successfully!");
        setStep(3);
      } else {
        toast.error(data.message || "Invalid OTP.");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Step 2: Resend OTP handler
  const handleResendOtp = async () => {
    if (timer > 0 || isResending) return;

    setIsResending(true);
    try {
      axios.defaults.withCredentials = true;
      const { data } = await axios.post(`${backend_url}/api/auth/user/forgot-password`, { email });
      if (data.success) {
        toast.success("OTP has been resent successfully!");
        setOtpValues(['', '', '', '', '', '']);
        setTimer(30);
        otpRefs.current[0]?.focus();
      } else {
        toast.error(data.message || "Failed to resend OTP.");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || err.message);
    } finally {
      setIsResending(false);
    }
  };

  // Step 3: Reset Password handler
  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (password.length < 6) {
      toast.error("Password must be at least 6 characters.");
      return;
    }
    if (password !== confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }

    setIsLoading(true);
    try {
      const otpString = otpValues.join('');
      axios.defaults.withCredentials = true;
      const { data } = await axios.post(`${backend_url}/api/auth/user/reset-password`, {
        email,
        otp: otpString,
        password
      });

      if (data.success) {
        toast.success(data.message || "Password updated successfully!");
        navigate('/login');
      } else {
        toast.error(data.message || "Password reset failed.");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center h-[100dvh] w-[100dvw] p-2 bg-slate-50 dark:bg-slate-950 transition-colors">
      <div className={`w-full max-w-xl bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-800 shadow-2xl relative p-8 transition-all duration-700 ease-out flex flex-col gap-6 ${isLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}>

        {/* Logo and Header */}
        <div className="flex flex-col items-center justify-center">
          <div className="w-18 h-18 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg shadow-indigo-200 dark:shadow-none mb-4">
            <img src={LOGO} alt="logo" className='w-16 h-16 text-white' />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
            {step === 1 && "Forgot Password"}
            {step === 2 && "Verify OTP"}
            {step === 3 && "Reset Password"}
          </h2>
          <p className="text-sm text-gray-500 dark:text-slate-400 mt-2 text-center">
            {step === 1 && "Enter your email address to receive a secure 6-digit verification code."}
            {step === 2 && (
              <>
                We have sent a 6-digit OTP to <span className="font-semibold text-gray-700 dark:text-slate-200">{email}</span>
              </>
            )}
            {step === 3 && "Please enter a strong new password below."}
          </p>
        </div>

        {/* STEP 1: ENTER EMAIL */}
        {step === 1 && (
          <form onSubmit={handleSendOtp} className="flex flex-col gap-4">
            <InputField
              id="email"
              label="Email Address"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <button
              type="submit"
              className="w-full rounded-lg border-none bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-500 dark:to-cyan-600 text-white text-sm font-bold py-3.5 uppercase tracking-wider shadow-sm hover:shadow-[0_4px_15px_rgba(99,102,241,0.35)] dark:hover:shadow-[0_4px_15px_rgba(6,182,212,0.4)] transition-all duration-300 ease-out hover:-translate-y-0.5 cursor-pointer flex justify-center items-center gap-2"
              disabled={isLoading}
            >
              Send OTP
              {isLoading && <AiOutlineLoading3Quarters className="animate-spin" />}
            </button>
            <button
              type="button"
              onClick={() => navigate('/login')}
              className="text-xs font-semibold text-center text-gray-500 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-cyan-400 transition-colors mt-2"
            >
              Back to Login
            </button>
          </form>
        )}

        {/* STEP 2: VERIFY OTP */}
        {step === 2 && (
          <form onSubmit={handleVerifyOtp} className="flex flex-col gap-6">
            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-center text-gray-600 dark:text-slate-300">
                Enter 6-digit OTP
              </label>
              
              {/* Separate OTP Square inputs */}
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
              className="w-full rounded-lg border-none bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-500 dark:to-cyan-600 text-white text-sm font-bold py-3.5 uppercase tracking-wider shadow-sm hover:shadow-[0_4px_15px_rgba(99,102,241,0.35)] dark:hover:shadow-[0_4px_15px_rgba(6,182,212,0.4)] transition-all duration-300 ease-out hover:-translate-y-0.5 cursor-pointer flex justify-center items-center gap-2"
              disabled={isLoading}
            >
              Verify OTP
              {isLoading && <AiOutlineLoading3Quarters className="animate-spin" />}
            </button>

            {/* Resend OTP countdown section */}
            <div className="flex justify-between items-center text-sm font-semibold mt-2">
              <span className="text-gray-500 dark:text-slate-400">
                {timer > 0 ? `Resend OTP in ${timer}s` : "Ready to resend"}
              </span>
              <button
                type="button"
                onClick={handleResendOtp}
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
            
            <button
              type="button"
              onClick={() => setStep(1)}
              className="text-xs font-semibold text-center text-gray-500 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-cyan-400 transition-colors"
            >
              Back to Enter Email
            </button>
          </form>
        )}

        {/* STEP 3: RESET PASSWORD */}
        {step === 3 && (
          <form onSubmit={handleResetPassword} className="flex flex-col gap-4">
            <InputField
              id="password"
              label="New Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <InputField
              id="confirmPassword"
              label="Confirm Password"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />

            {/* Real-time validation indicators */}
            <div className="flex flex-col gap-1.5 mt-2 px-1 text-xs text-left">
              <div className="flex items-center gap-2">
                <span className={`w-2.5 h-2.5 rounded-full transition-colors ${passwordLengthValid ? 'bg-green-500' : 'bg-red-500'}`} />
                <span className={passwordLengthValid ? 'text-green-600 dark:text-green-400' : 'text-red-500'}>
                  Password must be at least 6 characters
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className={`w-2.5 h-2.5 rounded-full transition-colors ${passwordsMatch ? 'bg-green-500' : 'bg-red-500'}`} />
                <span className={passwordsMatch ? 'text-green-600 dark:text-green-400' : 'text-red-500'}>
                  Confirm Password must match
                </span>
              </div>
            </div>

            <button
              type="submit"
              className="w-full mt-4 rounded-lg border-none bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-500 dark:to-cyan-600 text-white text-sm font-bold py-3.5 uppercase tracking-wider shadow-sm hover:shadow-[0_4px_15px_rgba(99,102,241,0.35)] dark:hover:shadow-[0_4px_15px_rgba(6,182,212,0.4)] transition-all duration-300 ease-out hover:-translate-y-0.5 cursor-pointer flex justify-center items-center gap-2"
              disabled={isLoading || !passwordLengthValid || !passwordsMatch}
            >
              Update Password
              {isLoading && <AiOutlineLoading3Quarters className="animate-spin" />}
            </button>
          </form>
        )}

      </div>
    </div>
  );
};

export default ForgotPassword;
