import React, { createContext, useRef, useState } from 'react'


export const AppContent = createContext();

const AppContextProvider = (props) => {
    const [isLightMode, setIsLightMode] = useState(true);
    const scrollToExams = useRef(null); 
    const backend_url = import.meta.env.VITE_BACKEND_URL;
    const [activeList, setActiveList] = useState(null);
    const [activeExamTitle, setActiveExamTitle] = useState(null);
    const [AItopicSummarizer, setAItopicSummarizer] = useState(false);
    const [isExamDataFetched, setIsExamDataFetched] = useState(null);

    const value = {
        isLightMode, setIsLightMode,
        scrollToExams,
        activeList, setActiveList,
        activeExamTitle, setActiveExamTitle,
        AItopicSummarizer, setAItopicSummarizer,
        backend_url,
        isExamDataFetched, setIsExamDataFetched
    };

    return (
        <AppContent.Provider value={value}>
            {props.children}
        </AppContent.Provider>
    )
}

export default AppContextProvider;