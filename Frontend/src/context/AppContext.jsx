import React, { createContext, useRef, useState } from 'react'


export const AppContent = createContext();

const AppContextProvider = (props) => {
    const [isLightMode, setIsLightMode] = useState(true);
    const scrollToExams = useRef(null); 
    const [activeList, setActiveList] = useState(null);
    const [activeExamTitle, setActiveExamTitle] = useState(null);

    const value = {
        isLightMode, setIsLightMode,
        scrollToExams,
        activeList, setActiveList,
        activeExamTitle, setActiveExamTitle
    };

    return (
        <AppContent.Provider value={value}>
            {props.children}
        </AppContent.Provider>
    )
}

export default AppContextProvider;