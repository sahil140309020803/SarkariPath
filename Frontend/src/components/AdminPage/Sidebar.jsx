import React from 'react';
import { LayoutDashboard, Folder, FileText, Settings2, Users, BarChart3, LogOut, BookOpen } from 'lucide-react';
import { FiAlignJustify } from "react-icons/fi";
import { useUser } from '../../context/UserContext';
import { useNavigate } from 'react-router-dom';
import LOGO from '../../assets/LOGO.png';

const Sidebar = ({ activePage, setActivePage, isOpen, setIsOpen }) => {
    const { logout } = useUser();
    const navigate = useNavigate();

    const handleLogout = async () => {
        const success = await logout();
        if (success) {
            navigate('/');
        }
    };
    const navItems = [
        { id: 'dashboard', icon: <LayoutDashboard size={20} />, label: 'Dashboard' },
        { id: 'exam-management', icon: <Folder size={20} />, label: 'Exam Management' },
        { id: 'manage-mock-tests', icon: <FileText size={20} />, label: 'AI Test Generator' },
        { id: 'current-affairs', icon: <BookOpen size={20} />, label: 'Current Affairs' },
        { id: 'analytics', icon: <BarChart3 size={20} />, label: 'Analytics' },
        { id: 'settings', icon: <Settings2 size={20} />, label: 'Settings' },
    ];

    const handleKeyDown = (e, pageId) => {
        if (e.key === 'Enter' || e.key === ' ') {
            setActivePage(pageId);
        }
    };

    return (
        <aside className={`fixed inset-y-0 left-0 lg:static z-50 flex flex-col flex-shrink-0 bg-white dark:bg-slate-900 border-r border-gray-200 dark:border-slate-800 transition-all duration-300 ${isOpen ? 'w-68 translate-x-0 shadow-2xl lg:shadow-none' : 'w-20 -translate-x-full lg:translate-x-0 lg:w-20'}`}>
            <div className="h-20 flex items-center justify-between px-6 border-b border-gray-200 dark:border-slate-800 transition-colors w-full overflow-hidden">
                <div className={`flex items-center gap-4 transition-all duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 hidden'}`}>
                    <div className='flex items-center gap-2'>
                        <img src={LOGO} alt="logo" className='w-9 h-9 text-white' />
                        <div className="font-bold text-2xl tracking-tight text-slate-800 dark:text-white flex items-center transition-colors">
                            Sarkari<span className="text-blue-600 dark:text-cyan-400">Path</span>
                        </div>
                    </div>
                </div>
                <button onClick={() => setIsOpen(!isOpen)} className={`text-gray-600 dark:text-gray-400 hover:text-indigo-600 transition-colors ${!isOpen ? 'mx-auto' : ''}`}>
                    <FiAlignJustify size={24} />
                </button>
            </div>
            <nav className="flex-1 px-4 py-4 space-y-2 overflow-hidden hover:overflow-y-auto custom-scrollbar">
                {navItems.map(item => (
                    <div
                        key={item.id}
                        role="button"
                        tabIndex="0"
                        onClick={() => setActivePage(item.id)}
                        onKeyDown={(e) => handleKeyDown(e, item.id)}
                        className={`nav-link flex items-center px-4 py-2.5 rounded-lg transition-colors duration-200 cursor-pointer ${activePage === item.id ? 'text-white bg-blue-500' : 'text-gray-600 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-800 dark:hover:text-slate-200'} ${!isOpen ? 'justify-center px-0' : ''}`}
                        title={!isOpen ? item.label : ''}
                    >
                        <div className={`${!isOpen ? 'mx-auto' : ''}`}>{item.icon}</div>
                        {isOpen && <span className="ml-3 whitespace-nowrap">{item.label}</span>}
                    </div>
                ))}
            </nav>
            <div className="p-4 border-t border-gray-200 dark:border-slate-800 transition-colors overflow-hidden">
                <div onClick={handleLogout} role="button" tabIndex="0" className={`nav-link flex items-center px-4 py-2.5 text-red-500 dark:text-red-400 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 cursor-pointer transition-colors ${!isOpen ? 'justify-center px-0' : ''}`} title={!isOpen ? 'Logout' : ''}>
                    <LogOut size={20} className={`${isOpen ? 'mr-3' : 'mx-auto'}`} />
                    {isOpen && <span className="whitespace-nowrap">Logout</span>}
                </div>
            </div>
        </aside>
    );
};

export default Sidebar;