import { useState } from "react";
import { FaUser, FaUserShield, FaEye, FaEyeSlash  } from "react-icons/fa";
import { MdEmail } from "react-icons/md";
import { FaLock } from "react-icons/fa6";

const InputField = ({ id, label, type = 'text', value, onChange, delay }) => {
  const [isFocused, setIsFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false)
  const isFilled = value !== '';

  return (
    <div
      className="relative w-full my-3 transition-all duration-500 ease-out"
      style={{ transitionDelay: delay }}
    >
      <div className='flex'>
        {type === 'email' && <MdEmail className=' w-13 h-[3.35rem] rounded-l-lg text-blue-800 border-gray-300 bg-gray-100 border py-3.5 border-r-gray-100 p-3' />}
        {type === 'password' && <FaLock className=' w-13 h-[3.35rem] rounded-l-lg text-blue-800 border-gray-300 bg-gray-100 border py-3.5 border-r-gray-100 p-3.5' />}
        {label === 'Full Name' && <FaUser className=' w-13 h-[3.35rem] rounded-l-lg text-blue-800 border-gray-300 bg-gray-100 border py-3.5 border-r-gray-100' />}
        <input
          type={(type === 'password' && showPassword) ? 'text' : type}
          id={id}
          value={value}
          onChange={onChange}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          className={`w-full px-4 py-3.5 bg-gray-100 border border-gray-300 rounded-lg outline-none text-gray-800 transition-all duration-300  border-l-0 rounded-l-none ${type === 'password' ? 'border-r-0 rounded-r-none' : ''}`}
          placeholder=" "
          required
        />
        {type === 'password' && !showPassword && <FaEye onClick={() => setShowPassword(prev => !prev)} className='cursor-pointer w-13 h-[3.35rem] rounded-r-lg text-blue-800 border-gray-300 bg-gray-100 border py-3.5 border-l-gray-100 p-3' />}
        {type === 'password' && showPassword && <FaEyeSlash onClick={() => setShowPassword(prev => !prev)} className='cursor-pointer w-13 h-[3.35rem] rounded-r-lg text-blue-800 border-gray-300 bg-gray-100 border py-3.5 border-l-gray-100 p-3' />}
      </div>
      <label
        htmlFor={id}
        className={`absolute left-16 px-1 transition-all duration-300 pointer-events-none text-gray-500 bg-transparent
                    ${isFocused || isFilled
            ? 'text-xs -top-2.5 bg-white text-indigo-600'
            : 'text-base top-3.5'
          } peer-focus:text-xs peer-focus:-top-2.5 peer-focus:bg-gray-100 peer-focus:text-indigo-600`}
      >
        {label}
      </label>
    </div>
  );
};

export default InputField;