import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';

// --- Imports from the parent 'components' folder ---
import Sidebar from '../components/AdminPage/Sidebar';
import Header from '../components/AdminPage/Header';

// --- UPDATED: Imports from the new 'AdminPage' subfolder ---
import Dashboard from '../components/AdminPage/Dashboard';
import TestGenerator from '../components/AdminPage/TestGenerator';
import UserManagement from '../components/AdminPage/UserManagement';
import PlatformSettings from '../components/AdminPage/PlatformSettings';
import ExamManagement from '../components/AdminPage/ExamManagement';

export default function AdminPage() {
    const [activePage, setActivePage] = useState('dashboard');
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
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

    const renderPage = () => {
        switch (activePage) {
            case 'dashboard': return <Dashboard />;
            case 'exam-management': return <ExamManagement />;
            case 'manage-mock-tests': return <TestGenerator />;
            case 'user-management': return <UserManagement />;
            case 'settings': return <PlatformSettings />;
            default: return <Dashboard />;
        }
    };

    return (
        <div className="flex h-screen bg-slate-50 dark:bg-slate-900 transition-colors">
            <Sidebar activePage={activePage} setActivePage={setActivePage} isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
            <main className="flex-1 p-8 overflow-y-auto">
                <Header />
                {renderPage()}
            </main>
        </div>
    );
}