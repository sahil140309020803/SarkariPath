import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

export const ExamContext = createContext();

export const ExamProvider = ({ children }) => {
    const backend_url = import.meta.env.VITE_BACKEND_URL;
    const [activeList, setActiveList] = useState(null);
    const [activeExamTitle, setActiveExamTitle] = useState(null);
    const [isExamDataFetched, setIsExamDataFetched] = useState(null);
    const [activeExamPage, setActiveExamPage] = useState(null);
    const [showDifficulty, setShowDifficulty] = useState(false);
    const [activeSubject, setActiveSubject] = useState(null);
    const [topicList, setTopicList] = useState(null);
    const [activeTopic, setActiveTopic] = useState(null);
    const [difficulty, setDifficulty] = useState(null);
    const [showCustomTopic, setShowCustomTopic] = useState(false);
    const [showTestGenerate, setShowTestGenerate] = useState(false);
    const [AItopicSummarizer, setAItopicSummarizer] = useState(false);

    const [examCatList, setExamCatList] = useState([]);
    const [isCatUpdated, setIsCatUpdated] = useState(false);

    const fetchExamData = async () => {
        if (!activeExamPage) return;
        axios.defaults.withCredentials = true;
        try {
            const { data } = await axios.get(`${backend_url}/api/exam-details/${activeExamPage}`);
            if (data.success) {
                setIsExamDataFetched({ Subjects: data.Subjects, About: data.About, QuesnTimer: data.QuesnTimer });
            }
        } catch (err) {
            console.error('Failed to fetch exam data:', err);
        }
    };

    const getExamCategories = async () => {

        axios.defaults.withCredentials = true;
        try {
            const { data } = await axios.get(`${backend_url}/api/exam-category/get-categories`);
            if (data.success) {
                setExamCatList(data.categories);
                console.log(data.categories);
            }
        } catch (err) {
            console.error('Failed to fetch exam categories:', err);
        }
    };

    useEffect(() => {
        getExamCategories();
},[isCatUpdated]);

    useEffect(() => {
        fetchExamData();
    }, [activeExamPage]);


    const value = {
        activeList, setActiveList,
        activeExamTitle, setActiveExamTitle,
        isExamDataFetched, setIsExamDataFetched,
        activeExamPage, setActiveExamPage,
        showDifficulty, setShowDifficulty,
        activeSubject, setActiveSubject,
        topicList, setTopicList,
        activeTopic, setActiveTopic,
        difficulty, setDifficulty,
        showCustomTopic, setShowCustomTopic,
        showTestGenerate, setShowTestGenerate,
        AItopicSummarizer, setAItopicSummarizer,
        examCatList, setExamCatList,
        backend_url,
        isCatUpdated, setIsCatUpdated
    };

    return (
        <ExamContext.Provider value={value}>
            {children}
        </ExamContext.Provider>
    );
};

// Custom hook for easy consumption
export const useExam = () => useContext(ExamContext);