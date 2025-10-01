import React from 'react';
import { LayoutDashboard, Folder, FileText, Settings2, Users, BarChart3, LogOut } from 'lucide-react';
import { FiAlignJustify } from "react-icons/fi";

const Sidebar = ({ activePage, setActivePage }) => {
    const navItems = [
        { id: 'dashboard', icon: <LayoutDashboard size={20} />, label: 'Dashboard' },
        { id: 'manage-categories', icon: <Folder size={20} />, label: 'Manage Categories' },
        { id: 'manage-exams', icon: <FileText size={20} />, label: 'Manage Exams' },
        { id: 'manage-mock-tests', icon: <Settings2 size={20} />, label: 'Test Generator' },
        { id: 'user-management', icon: <Users size={20} />, label: 'Users' },
        { id: 'analytics', icon: <BarChart3 size={20} />, label: 'Analytics' },
    ];

    const handleKeyDown = (e, pageId) => {
        if (e.key === 'Enter' || e.key === ' ') {
            setActivePage(pageId);
        }
    };

    return (
        <aside className="w-68 flex-shrink-0 bg-white border-r border-gray-200 flex flex-col">
            <div className="h-20 flex items-center px-6 border-b border-gray-200">
                <div className="flex items-center gap-6">
                    <div className='flex items-center gap-2'>
                        <div className="bg-indigo-600 text-white font-bold text-lg w-9 h-9 flex items-center justify-center rounded-lg">SP</div>
                        <div className="text-2xl font-bold text-gray-800">SarkariPath</div>
                    </div>
                    <FiAlignJustify size={24} className="text-gray-600" />
                </div>
            </div>
            <nav className="flex-1 px-4 py-4 space-y-2">
                {navItems.map(item => (
                    <div
                        key={item.id}
                        role="button"
                        tabIndex="0"
                        onClick={() => setActivePage(item.id)}
                        onKeyDown={(e) => handleKeyDown(e, item.id)}
                        className={`nav-link flex items-center px-4 py-2.5 text-gray-600 rounded-lg transition-colors duration-200 cursor-pointer ${activePage === item.id ? ' text-white bg-blue-500' : 'hover:bg-gray-100'}`}
                    >
                        {item.icon}
                        <span className="ml-3">{item.label}</span>
                    </div>
                ))}
            </nav>
            <div className="p-4 border-t border-gray-200">
                <div role="button" tabIndex="0" className="nav-link flex items-center px-4 py-2.5 text-gray-600 rounded-lg hover:bg-gray-100 cursor-pointer">
                    <LogOut size={20} className="mr-3" /> Logout
                </div>
            </div>
        </aside>
    );
};

export default Sidebar;