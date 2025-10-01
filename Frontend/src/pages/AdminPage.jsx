import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// --- Imports from the parent 'components' folder ---
import Sidebar from '../components/AdminPage/Sidebar';
import Header from '../components/AdminPage/Header';

// --- UPDATED: Imports from the new 'AdminPage' subfolder ---
import Dashboard from '../components/AdminPage/Dashboard';
import ManageCategories from '../components/AdminPage/ManageCategories';
import ManageExams from '../components/AdminPage/ManageExams';
import TestGenerator from '../components/AdminPage/TestGenerator';
import UserManagement from '../components/AdminPage/UserManagement';
import Analytics from '../components/AdminPage/Analytics';

export default function AdminPage() {
    const [activePage, setActivePage] = useState('dashboard');
    const { userDetails } = useAuth();
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
            case 'manage-categories': return <ManageCategories />;
            case 'manage-exams': return <ManageExams />;
            case 'manage-mock-tests': return <TestGenerator />;
            case 'user-management': return <UserManagement />;
            case 'analytics': return <Analytics />;
            default: return <Dashboard />;
        }
    };

    return (
        <div className="flex h-screen bg-radial-[at_50%_75%] from-sky-50 via-blue-50 to-90%">
            <Sidebar activePage={activePage} setActivePage={setActivePage} />
            <main className="flex-1 p-8 overflow-y-auto">
                <Header />
                {renderPage()}
            </main>
        </div>
    );
}