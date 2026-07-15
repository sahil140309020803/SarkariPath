import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { trackEvent } from '../utils/analytics';
import { clearUser, trackEvent as clarityTrackEvent } from '../utils/clarity';

export const UserContext = createContext();

export const UserProvider = ({ children }) => {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [isLoading, setIsLoading] = useState(true); // Start true for initial auth check
    const [userDetails, setUserDetails] = useState(null);
    const [dashboardData, setDashboardData] = useState(null);
    const [dashboardLoading, setDashboardLoading] = useState(true);
    const [dashboardError, setDashboardError] = useState(null);
    const backend_url = import.meta.env.VITE_BACKEND_URL;

    const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

    const fetchUserDashboardData = async () => {
        setDashboardLoading(true);
        setDashboardError(null);

        try {
            const { data } = await axios.get(`${backend_url}/api/dashboard`, { withCredentials: true });
            if (data.success === false) {
                setDashboardError(data.message || "Failed to load dashboard statistics.");
            } else {
                setDashboardData(data);
            }
        } catch (error) {
            console.error("Failed to fetch dashboard data", error);
            setDashboardError("Network error. Failed to load dashboard statistics.");
        } finally {
            setDashboardLoading(false);
        }
    };

    const getUserDetails = async () => {
        axios.defaults.withCredentials = true;
        setIsLoading(true);
        try {
            const { data } = await axios.get(`${backend_url}/api/user-details`);
            if (data.success) {
                setUserDetails({ ...data.details, role: data.role });
                if (data.role === 'user') {
                    await fetchUserDashboardData();
                }
            }
        } catch (err) {
            console.error("Failed to get user details:", err.message);
        }
        setIsLoading(false);
    };

    const isAuth = async () => {
        axios.defaults.withCredentials = true;
        setIsLoading(true);
        try {
            const { data } = await axios.get(`${backend_url}/api/is-auth`);
            if (data.success) {
                setIsLoggedIn(true);
                await getUserDetails();
            }
        } catch (err) {
            console.log(err.message);
        }
        if (!userDetails)
            await delay(1100);
        setIsLoading(false);
    }

    useEffect(() => {
        isAuth();
    }, [isLoggedIn, setIsLoggedIn]);

    const logout = async () => {
        setIsLoading(true);
        try {
            const role = userDetails?.role || 'user';
            const endpoint = role === 'admin' ? `${backend_url}/api/auth/admin/logout` : `${backend_url}/api/auth/user/logout`;
            const { data } = await axios.post(endpoint, {}, { withCredentials: true });

            if (data.success) {
                trackEvent('logout');
                clarityTrackEvent('logout');
                clearUser();
                setIsLoggedIn(false);
                setUserDetails(null);
                setDashboardData(null); // Clear dashboard data on logout
                setIsLoading(false);
                return true;
            }
        } catch (err) {
            console.error("Logout failed:", err.message);
        }
        setIsLoading(false);
        return false;
    };

    const value = {
        isLoggedIn,
        setIsLoggedIn,
        isLoading,
        setIsLoading,
        userDetails,
        setUserDetails,
        backend_url,
        logout,
        dashboardData,
        setDashboardData,
        dashboardLoading,
        setDashboardLoading,
        dashboardError,
        setDashboardError,
        fetchUserDashboardData
    };

    return (
        <UserContext.Provider value={value}>
            {children}
        </UserContext.Provider>
    );
};

// Custom hook for easy consumption
export const useUser = () => useContext(UserContext);
