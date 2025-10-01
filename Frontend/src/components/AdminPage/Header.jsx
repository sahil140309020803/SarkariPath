import React, { useState, useEffect, useRef } from 'react';
import { Bell, CheckCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const Header = () => {
    const [notificationsOpen, setNotificationsOpen] = useState(false);
    const notificationRef = useRef(null);
    const { userDetails } = useAuth();

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (notificationRef.current && !notificationRef.current.contains(event.target)) {
                setNotificationsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [notificationRef]);

    return (
        <header className="flex items-center justify-between mb-8">
            <div>
                <h2 className="text-2xl font-bold text-gray-800">👋 Hey, {userDetails?.name} (Admin)</h2>
                <p className="text-gray-500">Here's your mission control for the SarkariPath platform.</p>
            </div>
            <div className="flex items-center gap-4">
                <div className="relative" ref={notificationRef}>
                    <button onClick={() => setNotificationsOpen(!notificationsOpen)} className="text-gray-500 hover:text-gray-800 relative">
                        <Bell size={24} className='translate-y-1' />
                        <span className="absolute -top-0.5 -right-0.5 flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                        </span>
                    </button>
                    {notificationsOpen && (
                        <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-lg border border-gray-200 z-50">
                            <div className="p-4 border-b"><h3 className="font-semibold text-gray-800">Notifications</h3></div>
                            <div className="divide-y max-h-80 overflow-y-auto">
                                <div className="p-4 flex items-start gap-3 hover:bg-gray-50">
                                    <div className="bg-green-100 text-green-600 p-2 rounded-full"><CheckCircle size={20} /></div>
                                    <div>
                                        <p className="text-sm text-gray-700">New test <span className="font-semibold">"SSC CGL Mock #5"</span> has been published.</p>
                                        <p className="text-xs text-gray-400 mt-1">15 minutes ago</p>
                                    </div>
                                </div>
                            </div>
                            <div className="p-2 bg-gray-50 text-center"><a href="#" className="text-sm font-medium text-indigo-600 hover:underline">View all notifications</a></div>
                        </div>
                    )}
                </div>
                <div className="w-10 h-10 bg-indigo-600 text-white flex items-center justify-center rounded-full font-bold text-lg">A</div>
            </div>
        </header>
    );
};

export default Header;