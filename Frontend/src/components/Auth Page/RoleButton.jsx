import { FaUser, FaUserShield, FaEye, FaEyeSlash  } from "react-icons/fa";

const RoleButton = ({ label, isActive, onClick }) => (
  <div
    onClick={onClick}
    className={`flex-1 bg-white border-2 rounded-xl p-5 cursor-pointer transition-all duration-300 ${isActive ? 'border-indigo-500 shadow-xl' : 'border-gray-100'
      }`}
  >
    <div
      className={`w-12 h-12 rounded-full mx-auto mb-2 flex items-center justify-center text-2xl transition-all duration-300 ${isActive ? 'bg-indigo-500 text-white' : 'bg-gray-100 text-gray-500'
        }`}
    >
      {label === 'User' && <FaUser />}
      {label === 'Admin' && <FaUserShield />}
    </div>
    <span
      className={`font-semibold transition-colors duration-300 ${isActive ? 'text-indigo-500' : 'text-gray-700'
        }`}
    >
      {label}
    </span>
  </div>
);

export default RoleButton;