import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import BeautifulLoadingScreen from '../components/BeautifulLoadingScreen';

// --- Imports from the parent 'components' folder ---
import Sidebar from '../components/AdminPage/Sidebar';
import Header from '../components/AdminPage/Header';

// --- UPDATED: Imports from the new 'AdminPage' subfolder ---
import Dashboard from '../components/AdminPage/Dashboard';
import TestGenerator from '../components/AdminPage/TestGenerator';
import PlatformSettings from '../components/AdminPage/PlatformSettings';
import ExamManagement from '../components/AdminPage/ExamManagement';
import CurrentAffairsDashboard from '../components/AdminPage/CurrentAffairsDashboard';
import Analytics from '../components/AdminPage/Analytics';

export default function AdminPage() {
    const [activePage, setActivePage] = useState('dashboard');
    const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth >= 1024);
    const { userDetails } = useUser();
    const navigate = useNavigate();

    useEffect(() => {
        const checkUserRole = async () => {
            if (userDetails && userDetails.role !== 'admin') {
                navigate('/');
            }
        };
        checkUserRole();
    }, [userDetails, navigate]);

    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth < 1024) {
                setIsSidebarOpen(false);
            } else {
                setIsSidebarOpen(true);
            }
        };
        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    if (!userDetails || userDetails.role !== 'admin') {
        return <BeautifulLoadingScreen message="Verifying admin credentials..." />;
    }

    const renderPage = () => {
        switch (activePage) {
            case 'dashboard': return <Dashboard />;
            case 'exam-management': return <ExamManagement />;
            case 'manage-mock-tests': return <TestGenerator />;
            case 'current-affairs': return <CurrentAffairsDashboard />;
            case 'analytics': return <Analytics />;
            case 'settings': return <PlatformSettings />;
            default: return <Dashboard />;
        }
    };

    return (
        <div className="flex h-screen bg-slate-50 dark:bg-slate-900 transition-colors relative overflow-hidden">
            {/* Mobile/Tablet Backdrop Overlay */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 lg:hidden"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}
            <Sidebar activePage={activePage} setActivePage={setActivePage} isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
            <main className="flex-1 p-4 md:p-6.4 overflow-y-auto">
                <Header toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
                {renderPage()}
            </main>
        </div>
    );
}