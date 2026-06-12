import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [isLoading, setIsLoading] = useState(true); // Start true for initial auth check
    const [userDetails, setUserDetails] = useState(null);
    const backend_url = import.meta.env.VITE_BACKEND_URL;

    const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

    const getUserDetails = async () => {
        axios.defaults.withCredentials = true;
        setIsLoading(true);
        try {
            const { data } = await axios.get(`${backend_url}/api/user-details`);
            if (data.success) {
                setUserDetails({...data.details, role: data.role});
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
            const {data} = await axios.get(`${backend_url}/api/is-auth`);
            if (data.success) {
                setIsLoggedIn(true);
                getUserDetails();
            }
        } catch (err) {
            console.log(err.message);
        }
        if(!userDetails)
            await delay(1100);
        setIsLoading(false);
    }
    useEffect(()=> {
        isAuth();
    }, [isLoggedIn, setIsLoggedIn]);

    const logout = async () => {
        setIsLoading(true);
        try {
            const role = userDetails?.role || 'user';
            const endpoint = role === 'admin' ? `${backend_url}/api/auth/admin/logout` : `${backend_url}/api/auth/user/logout`;
            const { data } = await axios.post(endpoint, {}, { withCredentials: true });
            
            if (data.success) {
                setIsLoggedIn(false);
                setUserDetails(null);
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
        logout
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

// Custom hook for easy consumption
export const useAuth = () => useContext(AuthContext);