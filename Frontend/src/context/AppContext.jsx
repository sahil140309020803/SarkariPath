import React, { createContext, useRef, useState } from 'react'


export const AppContent = createContext();

const AppContextProvider = (props) => {
    const [isLightMode, setIsLightMode] = useState(true);
    const scrollToExams = useRef(null);



    const value = {
        isLightMode, setIsLightMode,
        scrollToExams
    };

    return (
        <AppContent.Provider value={value}>
            {props.children}
        </AppContent.Provider>
    )
}

export default AppContextProvider;