import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useTestWindow } from '../context/TestWindowContext';
import { useParams } from 'react-router-dom';
import { QuestionPalette } from '../components/Test Window/QuestionPallete';
import BeautifulLoadingScreen from '../components/BeautifulLoadingScreen';
import { XCircle } from 'lucide-react';


const TestWindow = () => {
    const {
        activeTest,
        questions,
        currentQuestionIndex,
        setCurrentQuestionIndex,
        userAnswers,
        handleSetAnswer,
        questionStatus,
        timeRemaining,
        formatTime,
        language,
        setLanguage,
        isTestLoading,
        testFetchError,
        fetchActiveTestDetails,
        setActiveTestID,
        isTestStarted,
        isTestEnded,
        handleSaveAndNext,
        handleMarkForReview,
        handleClearResponse,
        handleSubmitTest,
        activeQuestionDuration
    } = useTestWindow();

    const { testID } = useParams();


    // const sections = useMemo(() => {
    //     return activeTest.Structure.map(s => s.Subject);
    // }, [activeTest.Structure]);

    // const handleSectionChange = (subject) => {
    //     // Find the first question index belonging to the selected subject
    //     const firstQuestionIndex = questions.findIndex(q => q.Subject === subject);
    //     if (firstQuestionIndex !== -1) {
    //         setCurrentQuestionIndex(firstQuestionIndex);
    //     }
    // };


    const removeSlug = (text) => {
        return text.replaceAll('-', ' ');
    }

    // Get current question data based on selected language
    const currentQuestionData = questions[currentQuestionIndex];

    const questionContent = useMemo(() => {
        if (!currentQuestionData) return null;

        // setLanguage(currentQuestionData.en ? 'en' : currentQuestionData.hi ? 'hi' : 'en');
        const content = currentQuestionData[language];
        if (!content) return null;

        return {
            ...content,
            options: content.options.map((option) => ({
                ...option,
                value: option.text,
                text: option.text,
            })),
        };

    }, [currentQuestionData, language]);

    const handleLanguageChange = (lang) => {
        setLanguage(lang);
    };

    useEffect(() => {
        // Auto-switch language if current question doesn't have content in selected language
        if (currentQuestionData) {
            if (!currentQuestionData[language]) {
                const otherLanguage = language === 'en' ? 'hi' : 'en';
                setLanguage(otherLanguage);
            }
        }
    }, [currentQuestionData, language, setLanguage]);

    useEffect(() => {
        if (testID) {
            setActiveTestID(testID);
        }
        return () => {
            setActiveTestID('');
        };
    }, [testID, setActiveTestID]);


    const questionId = currentQuestionData ? currentQuestionData._id : null;
    const totalQuestions = questions.length;
    const currentAnswer = questionId ? userAnswers[questionId] : null;
    const currentQuestionNumber = currentQuestionIndex + 1;
    const isLastQuestion = currentQuestionIndex === questions.length - 1;
    const currentSubject = currentQuestionData?.Subject;


    if (isTestLoading) {
        return <BeautifulLoadingScreen message="Loading test details and questions..." />;
    }

    if (testFetchError) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 transition-colors">
                <div className="text-center p-8 bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-red-100 dark:border-rose-900/30 max-w-md my-6">
                    <XCircle className="w-12 h-12 text-red-500 dark:text-rose-500 mx-auto mb-4" />
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Error Loading Test Details</h3>
                    <p className="text-slate-650 dark:text-slate-400 mb-6 text-sm">{testFetchError}</p>
                    <button
                        onClick={fetchActiveTestDetails}
                        className="w-full bg-blue-600 dark:bg-indigo-650 text-white py-3 rounded-xl hover:bg-blue-700 dark:hover:bg-indigo-500 transition shadow-md font-bold cursor-pointer text-sm"
                    >
                        Retry Loading
                    </button>
                </div>
            </div>
        );
    }

    if (!isTestStarted) {
        return (
            <div className="flex items-center justify-center h-screen bg-gray-100 dark:bg-slate-950 transition-colors">
                <div className="text-2xl font-bold text-red-500 p-10 bg-white dark:bg-slate-900 rounded-xl shadow-2xl border border-transparent dark:border-slate-800">
                    Test not started. Please begin the test.
                </div>
            </div>
        );
    }

    if (isTestEnded) {
        return (
            <div className="flex items-center justify-center h-screen bg-green-50 dark:bg-slate-950 transition-colors">
                <div className="text-4xl font-extrabold text-green-700 dark:text-emerald-500 p-12 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-transparent dark:border-slate-800">
                    Test Submitted Successfully!
                </div>
            </div>
        );
    }

    return (
        <div className="flex h-screen overflow-hidden bg-gray-100 dark:bg-slate-950 transition-colors">

            {/* Question Panel */}
            <div className="flex-1 overflow-y-auto p-0 transition-all duration-300 custom-scrollbar">

                {/* Top Header Bar  */}
                <header className="flex flex-col sm:flex-row justify-between items-center bg-blue-800 dark:bg-indigo-950 text-white py-3 px-4 shadow-lg sticky top-0 z-30 transition-colors gap-3 sm:gap-0">
                    <div className="flex items-center justify-between sm:justify-start w-full sm:w-auto">
                        <div className="text-3xl sm:text-4xl text-white font-bold">Sarkari<span className="text-red-500">Path</span></div>
                        <span className="text-xs sm:text-md font-medium text-gray-300 dark:text-slate-400 ml-2 hidden md:inline truncate max-w-[200px] lg:max-w-[400px]">Mock Test: {removeSlug(activeTest.ExamId?.Name)} {activeTest.Title}</span>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto gap-4">
                        {/* Timer */}
                        <div className="bg-red-600 dark:bg-rose-600 text-gray-100 font-bold px-3 py-1 rounded-md shadow-lg text-sm sm:text-md">
                            <span className="mr-1">Time Left:</span>
                            <span className="text-md sm:text-lg tracking-wider">{formatTime(timeRemaining)}</span>
                        </div>
                        {/* Language Switcher */}
                        <div className="flex rounded-sm overflow-hidden border border-gray-500 dark:border-slate-700 shadow-sm shrink-0">
                            <button
                                onClick={() => handleLanguageChange('en')}
                                disabled={!currentQuestionData || !currentQuestionData.en}
                                className={`px-2 py-1.5 text-xs sm:text-sm font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${language === 'en' ? 'bg-blue-600 dark:bg-indigo-600 text-white' : 'bg-gray-700 dark:bg-slate-800 text-gray-300 dark:text-slate-400 hover:bg-gray-600 dark:hover:bg-slate-700'}`}
                            >
                                English
                            </button>
                            <button
                                onClick={() => handleLanguageChange('hi')}
                                disabled={!currentQuestionData || !currentQuestionData.hi}
                                className={`px-2 py-1 text-xs sm:text-sm font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${language === 'hi' ? 'bg-blue-600 dark:bg-indigo-600 text-white' : 'bg-gray-700 dark:bg-slate-800 text-gray-300 dark:text-slate-400 hover:bg-gray-600 dark:hover:bg-slate-700'}`}
                            >
                                हिन्दी
                            </button>
                        </div>
                    </div>
                </header>



                {/* Section Navigation Bar */}
                {/* <div className="flex flex-wrap bg-gray-700 p-0 shadow-md sticky top-[52px] z-20">
                    {sections.map((subject) => (
                        <button
                            key={subject}
                            // Clicking this button navigates to the first question of the section
                            onClick={() => handleSectionChange(subject)}
                            className={`
                        px-4 py-2 text-sm font-bold transition-colors
                        ${currentSubject === subject
                                    ? 'bg-blue-600 text-white shadow-inner shadow-blue-900 border-t-2 border-blue-200'
                                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                                }
                    `}
                        >
                            SECTION: {subject}
                        </button>
                    ))}
                
                    <div className="ml-4 px-4 py-2 text-sm font-bold text-gray-300 flex items-center">
                        Question No. {currentQuestionNumber}
                    </div>
                </div> 
                */}




                {/* Question Body */}
                <div className="p-2 sm:p-6">
                    {questionContent ? (
                        <div className="bg-white dark:bg-slate-900 p-4 sm:p-6 rounded-xl shadow-xl border border-gray-205 dark:border-slate-800/80 transition-colors">

                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 pb-4 border-b border-gray-200 dark:border-slate-800 gap-3">
                                <div className="text-xl sm:text-[22px] font-semibold text-gray-800 dark:text-slate-100">
                                    Question <span className="text-blue-700 dark:text-indigo-400">{currentQuestionNumber}</span>
                                </div>
                                <div className="flex flex-wrap items-center gap-3 sm:gap-4">
                                    <div className="text-xs sm:text-sm font-semibold text-blue-700 dark:text-indigo-400 bg-blue-50 dark:bg-indigo-900/30 px-3 py-1 rounded-md border border-blue-200 dark:border-indigo-800/50">
                                        Time Spent: {formatTime(activeQuestionDuration)}
                                    </div>
                                    <div className="text-sm sm:text-md font-semibold text-red-600 dark:text-rose-400">
                                        <span className='text-green-800 dark:text-emerald-400'>Marks: +1</span> | Negative: {activeTest.NegativeMarks > 0 ? '-' : ''}{activeTest.NegativeMarks !== undefined ? activeTest.NegativeMarks : 'N/A'}
                                    </div>
                                </div>
                            </div>

                            <p className="text-[14px] sm:text-[17px] font-semibold mb-4 sm:mb-6 text-gray-900 dark:text-white leading-snug p-3 sm:p-4 bg-gray-100 dark:bg-slate-800 shadow-md rounded-md border border-gray-200 dark:border-slate-700 transition-colors">{questionContent.Question}</p>

                            <div className="space-y-3">
                                {questionContent.options.map((option, index) => {
                                    const isSelected = currentAnswer === option.text;
                                    const optionLabel = String.fromCharCode(65 + index);
                                    return (
                                        <div
                                            key={option._id}
                                            className={`
                                                p-3 sm:p-4 border rounded-lg cursor-pointer transition-all duration-150 flex items-start space-x-3 shadow-sm
                                                ${isSelected ? 'bg-blue-50 dark:bg-indigo-900/40 border-blue-600 dark:border-indigo-500 ring-1 ring-blue-300 dark:ring-indigo-800' : 'hover:bg-gray-100 dark:hover:bg-slate-800 border-gray-300 dark:border-slate-700'}
                                            `}
                                            onClick={() => handleSetAnswer(option.text)}
                                        >
                                            <input
                                                type="radio"
                                                name={`question-${questionId}`}
                                                value={option.text}
                                                checked={isSelected}
                                                onChange={() => handleSetAnswer(option.text)}
                                                className="mt-1 h-5 w-5 text-blue-600 dark:text-indigo-500 border-gray-300 dark:border-slate-600 focus:ring-blue-500 dark:focus:ring-indigo-600"
                                            />
                                            <div className="text-base sm:text-lg text-gray-800 dark:text-slate-200">
                                                <span className="mr-2 font-bold text-blue-700 dark:text-indigo-400">{optionLabel}.</span>
                                                <span>{option.text}</span>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            {/* Action Buttons  */}
                            <div className="mt-6 sm:mt-10 flex flex-col md:flex-row gap-3 md:gap-4 border-t-2 border-gray-300 dark:border-slate-800 pt-4 sm:pt-6 justify-between items-stretch md:items-center">

                                {/* Top/Desktop Prev & Next Buttons on Mobile */}
                                <div className="flex justify-between items-center gap-3 sm:gap-4 w-full md:w-auto">
                                    {/* Previous Button */}
                                    <button
                                        onClick={() => setCurrentQuestionIndex(prev => Math.max(0, prev - 1))}
                                        disabled={currentQuestionIndex === 0}
                                        className="flex-1 md:flex-initial px-4 py-2.5 bg-gray-200 dark:bg-slate-800 text-gray-900 dark:text-slate-100 font-bold rounded-lg shadow-md disabled:opacity-50 hover:bg-gray-300 dark:hover:bg-slate-700 transition md:w-[190px] text-xs sm:text-sm cursor-pointer"
                                    >
                                        &larr; Prev
                                    </button>
                                    
                                    {/* Next Button (Mobile only) */}
                                    <button
                                        onClick={() => setCurrentQuestionIndex(prev => Math.min(questions.length - 1, prev + 1))}
                                        disabled={currentQuestionIndex === questions.length - 1}
                                        className="flex-1 md:hidden px-4 py-2.5 bg-gray-200 dark:bg-slate-800 text-gray-900 dark:text-slate-100 font-bold rounded-lg shadow-md disabled:opacity-50 hover:bg-gray-300 dark:hover:bg-slate-700 transition text-xs sm:text-sm cursor-pointer"
                                    >
                                        Next &rarr;
                                    </button>
                                </div>

                                {/* Center Buttons */}
                                <div className="flex flex-row md:flex-row gap-2 md:gap-3 justify-between md:justify-center items-center w-full md:w-auto">
                                    <button
                                        onClick={handleMarkForReview}
                                        className="flex-1 md:flex-initial px-2 py-2.5 md:px-4 md:py-3 bg-purple-700 hover:bg-purple-800 text-white font-bold rounded-lg shadow-md transition text-xs md:text-sm text-center cursor-pointer"
                                    >
                                        <span className="md:hidden">Mark</span>
                                        <span className="hidden md:inline">Mark for Review</span>
                                    </button>
                                    <button
                                        onClick={handleClearResponse}
                                        className="flex-1 md:flex-initial px-2 py-2.5 md:px-4 md:py-3 bg-gray-200 dark:bg-slate-800 text-gray-800 dark:text-slate-100 font-bold rounded-lg shadow-md hover:bg-gray-300 dark:hover:bg-slate-700 transition text-xs md:text-sm text-center cursor-pointer"
                                    >
                                        <span className="md:hidden">Clear</span>
                                        <span className="hidden md:inline">Clear Response</span>
                                    </button>
                                    <button
                                        onClick={isLastQuestion ? handleSubmitTest : handleSaveAndNext}
                                        className={`flex-[1.5] md:flex-initial px-2 py-2.5 md:px-4 md:py-3 text-white font-bold rounded-lg shadow-md transition text-xs md:text-sm text-center cursor-pointer ${isLastQuestion ? 'bg-green-600 dark:bg-emerald-600 hover:bg-green-700 dark:hover:bg-emerald-700' : 'bg-blue-600 dark:bg-indigo-600 hover:bg-blue-800 dark:hover:bg-indigo-700'}`}
                                    >
                                        {isLastQuestion ? 'Submit' : 'Save & Next'}
                                    </button>
                                </div>

                                {/* Desktop Next Button */}
                                <div className="hidden md:block w-[190px] text-right">
                                    <button
                                        onClick={() => setCurrentQuestionIndex(prev => Math.min(questions.length - 1, prev + 1))}
                                        disabled={currentQuestionIndex === questions.length - 1}
                                        className="px-6 py-3 bg-gray-200 dark:bg-slate-800 text-gray-900 dark:text-slate-100 font-semibold rounded-lg shadow-lg disabled:opacity-50 hover:bg-gray-300 dark:hover:bg-slate-700 transition w-full"
                                    >
                                        Next Question &rarr;
                                    </button>
                                </div>
                            </div>

                        </div>
                    ) : (
                        <div className="mt-6 text-2xl text-center text-gray-600 p-10 bg-white rounded-xl shadow-lg">Question content not found.</div>
                    )}
                </div>
            </div>

            {/* Question Palette Panel */}
            <QuestionPalette
                questions={questions}
                questionStatus={questionStatus}
                currentQuestionIndex={currentQuestionIndex}
                setCurrentQuestionIndex={setCurrentQuestionIndex}
                activeTest={activeTest}
                handleSubmitTest={handleSubmitTest}
            />

        </div>
    );
};

export default TestWindow;