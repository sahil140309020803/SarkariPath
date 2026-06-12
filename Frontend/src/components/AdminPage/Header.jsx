import React, { useState, useEffect, useRef } from 'react';
import { Bell, CheckCircle, FileText, ExternalLink } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import ThemeToggle from '../ThemeToggle';
import axios from 'axios';

const Header = () => {
    const [notificationsOpen, setNotificationsOpen] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const notificationRef = useRef(null);
    const { userDetails, backend_url } = useAuth();

    const fetchNotifications = async () => {
        if (!backend_url) return;
        axios.defaults.withCredentials = true;
        try {
            const { data } = await axios.get(`${backend_url}/api/admin/test-generations/fetch`);
            if (data.success && data.generations) {
                const drafts = data.generations.filter(g => g.Status === 'Draft');
                setNotifications(drafts);
            }
        } catch (error) {
            console.error('Failed to fetch notifications');
        }
    };

    useEffect(() => {
        fetchNotifications();
        const interval = setInterval(fetchNotifications, 60000);
        return () => clearInterval(interval);
    }, [backend_url]);

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
        <header className="flex items-center justify-between mb-8 transition-colors">
            <div>
                <h2 className="text-2xl font-bold text-gray-800 dark:text-white transition-colors">👋 Hey, {userDetails?.name} (Admin)</h2>
                <p className="text-gray-500 dark:text-slate-400 transition-colors">Here's your mission control for the SarkariPath platform.</p>
            </div>
            <div className="flex items-center gap-4">
                <a href="/" target="_blank" rel="noreferrer" className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg text-sm font-semibold text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors shadow-sm">
                    <ExternalLink size={16} />
                    Go to Website
                </a>
                <ThemeToggle />
                <div className="relative" ref={notificationRef}>
                    <button onClick={() => setNotificationsOpen(!notificationsOpen)} className="text-gray-500 hover:text-gray-800 dark:text-slate-400 dark:hover:text-white relative transition-colors">
                        <Bell size={24} className='translate-y-1' />
                        {notifications.length > 0 && (
                            <span className="absolute -top-0.5 -right-0.5 flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                            </span>
                        )}
                    </button>
                    {notificationsOpen && (
                        <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-slate-900 rounded-xl shadow-lg border border-gray-200 dark:border-slate-800 z-50 transition-colors">
                            <div className="p-4 border-b dark:border-slate-800"><h3 className="font-semibold text-gray-800 dark:text-white">Notifications</h3></div>
                            <div className="divide-y max-h-80 overflow-y-auto dark:divide-slate-800 custom-scrollbar">
                                {notifications.length > 0 ? (
                                    notifications.map((notif, index) => (
                                        <div key={index} className="p-4 flex items-start gap-3 hover:bg-gray-50 dark:hover:bg-slate-800/50 transition-colors">
                                            <div className="bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400 p-2 rounded-full transition-colors"><FileText size={20} /></div>
                                            <div>
                                                <p className="text-sm text-gray-700 dark:text-slate-300 transition-colors">AI Test <span className="font-semibold text-gray-900 dark:text-white">"{notif.Title}"</span> is waiting for your review.</p>
                                                <p className="text-xs text-gray-400 dark:text-slate-500 mt-1 transition-colors">{new Date(notif.createdAt).toLocaleString()}</p>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="p-4 text-center text-sm text-gray-500 dark:text-slate-400">No new notifications</div>
                                )}
                            </div>
                            <div className="p-2 bg-gray-50 dark:bg-slate-800 text-center transition-colors"><a href="#" className="text-sm font-medium text-indigo-600 dark:text-cyan-400 hover:underline">View all notifications</a></div>
                        </div>
                    )}
                </div>
                <div className="w-10 h-10 bg-indigo-600 text-white flex items-center justify-center rounded-full font-bold text-lg">A</div>
            </div>
        </header>
    );
};

export default Header;