import React, { createContext, use, useRef, useState } from 'react'
import { useEffect } from 'react';
import axios from 'axios';


export const AppContent = createContext();

const AppContextProvider = (props) => {
    const [isLightMode, setIsLightMode] = useState(true);
    const scrollToExams = useRef(null); 
    const backend_url = import.meta.env.VITE_BACKEND_URL;
    const [activeList, setActiveList] = useState(null);
    const [activeExamTitle, setActiveExamTitle] = useState(null);
    const [AItopicSummarizer, setAItopicSummarizer] = useState(false);
    const [isExamDataFetched, setIsExamDataFetched] = useState(null);
    const [activeExamPage, setActiveExamPage] = useState(null);
    const [showDifficulty, setShowDifficulty] = useState(false);
    const [activeSubject, setActiveSubject] = useState(null);
    const [topicList, setTopicList] = useState(null);
    const [activeTopic, setActiveTopic] = useState(null);
    const [difficulty, setDifficulty] = useState(null);
    const [showCustomTopic, setShowCustomTopic] = useState(false);
    const [showTestGenerate, setShowTestGenerate] = useState(false);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [userDetails, setUserDetails] = useState(null);

    const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

    const fetchExamData = async (attempt) => {
        try {
            if(activeExamPage) {
                const { data } = await axios.get(`${backend_url}/api/${activeExamPage}`);
                if (data.success) {
                    setIsExamDataFetched({ Subjects: data.Subjects, About: data.About, QuesnTimer: data.QuesnTimer });
                }
            }
            
        } catch (err) {
            console.warn(`Attempt ${attempt} failed. Retrying...`);
            if (attempt < 3) {
                setTimeout(() => {
                    fetchExamData(attempt + 1);
                }, 2000); // Wait 2 seconds before retrying
            } else {
                console.error('Failed to fetch exam data after 3 attempts.');
            }
        }
    };

    const getUserDetails = async () => {
        axios.defaults.withCredentials = true;
        setIsLoading(true);
        try {
            const {data} = await axios.get(`${backend_url}/api/user-details`);
            if (data.success) {
                setUserDetails(data.details);
            }
        } catch (err) {
            console.log(err.message);
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
            await delay(1300);
        setIsLoading(false);
    }
    useEffect(()=> {
        isAuth();
    }, [isLoggedIn, setIsLoggedIn]);

    useEffect(() => {
        fetchExamData(1);
    }, [activeExamPage]);
    


    const value = {
        isLightMode, setIsLightMode,
        scrollToExams,
        activeList, setActiveList,
        activeExamTitle, setActiveExamTitle,
        AItopicSummarizer, setAItopicSummarizer,
        backend_url,
        isExamDataFetched, setIsExamDataFetched,
        activeExamPage, setActiveExamPage,
        showDifficulty, setShowDifficulty,
        activeSubject, setActiveSubject,
        topicList, setTopicList,
        activeTopic, setActiveTopic,
        difficulty, setDifficulty,
        showCustomTopic, setShowCustomTopic,
        showTestGenerate, setShowTestGenerate,
        isLoggedIn, setIsLoggedIn,
        isLoading, setIsLoading,
        userDetails, setUserDetails
    };

    

    return (
        <AppContent.Provider value={value}>
            {props.children}
        </AppContent.Provider>
    )
}

export default AppContextProvider;