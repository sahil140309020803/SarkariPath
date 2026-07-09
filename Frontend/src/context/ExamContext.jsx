import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

export const ExamContext = createContext();


export const ExamProvider = ({ children }) => {
    const backend_url = import.meta.env.VITE_BACKEND_URL;
    const [activeList, setActiveList] = useState(null);
    const [activeExamTitle, setActiveExamTitle] = useState(null);
    const [isExamDataFetched, setIsExamDataFetched] = useState(null);
    const [isExamLoading, setIsExamLoading] = useState(false);
    const [examFetchError, setExamFetchError] = useState(null);
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
    const [isCategoriesLoading, setIsCategoriesLoading] = useState(false);
    const [categoriesFetchError, setCategoriesFetchError] = useState(null);
    const [isCatUpdated, setIsCatUpdated] = useState(false);

    const fetchExamData = async () => {
        if (!activeExamPage) return;
        setIsExamLoading(true);
        setExamFetchError(null);
        axios.defaults.withCredentials = true;
        try {
            const { data } = await axios.get(`${backend_url}/api/exam-details/${activeExamPage}`);
            console.log(data);
            if (data.success) {
                setIsExamDataFetched({ 
                    ExamId: data.ExamId, 
                    ExamName: data.ExamName,
                    Subjects: data.Subjects, 
                    Topics: data.Topics,
                    MockTests: data.MockTests, 
                    testHistory: data.testHistory,
                    syllabusProgress: data.syllabusProgress 
                });
            } else {
                setIsExamDataFetched(null);
                setExamFetchError(data.message || "Failed to fetch exam details.");
            }
        } catch (err) {
            console.error('Failed to fetch exam data:', err);
            setIsExamDataFetched(null);
            setExamFetchError("Network error. Please check your internet connection.");
        } finally {
            setIsExamLoading(false);
        }
    };

    const getExamCategories = async () => {
        setIsCategoriesLoading(true);
        setCategoriesFetchError(null);
        axios.defaults.withCredentials = true;
        try {
            const { data } = await axios.get(`${backend_url}/api/exam-category/get-categories`);
            if (data.success && data.categories.length > 0) {
                setExamCatList(data.categories);
            } else {
                setCategoriesFetchError(data.message || "Failed to fetch exam categories.");
            }
        } catch (err) {
            console.error('Failed to fetch exam categories:', err);
            setCategoriesFetchError("Network error. Failed to load exam categories.");
        } finally {
            setIsCategoriesLoading(false);
        }
    };

    useEffect(() => {
        getExamCategories();
    }, [isCatUpdated]);

    useEffect(() => {
        setIsExamDataFetched(null);
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
        isCatUpdated, setIsCatUpdated,
        isExamLoading,
        examFetchError, setExamFetchError,
        isCategoriesLoading,
        categoriesFetchError,
        getExamCategories
    };

    return (
        <ExamContext.Provider value={value}>
            {children}
        </ExamContext.Provider>
    );
};

// Custom hook
export const useExam = () => useContext(ExamContext);