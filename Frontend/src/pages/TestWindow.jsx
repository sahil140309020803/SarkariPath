import React, { useState, useMemo, useEffect } from 'react';
import { useTestWindow } from '../context/TestWindowContext';
import { useParams } from 'react-router-dom';
import { QuestionPalette } from '../components/Test Window/QuestionPallete';


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
        isTestStarted,
        isTestEnded,
        handleSaveAndNext,
        handleMarkForReview,
        handleClearResponse,
        handleSubmitTest,
    } = useTestWindow();


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


    const { exam_cat, exam_name, testID } = useParams();

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


    const questionId = currentQuestionData ? currentQuestionData._id : null;
    const totalQuestions = questions.length;
    const currentAnswer = questionId ? userAnswers[questionId] : null;
    const currentQuestionNumber = currentQuestionIndex + 1;
    const isLastQuestion = currentQuestionIndex === questions.length - 1;
    const currentSubject = currentQuestionData?.Subject;



    if (isTestLoading) {
        return (
            <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
                <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-700 mb-4"></div>
                <div className="text-xl font-semibold text-gray-700">Loading Test Data...</div>
            </div>
        );
    }

    if (!isTestStarted) {
        return (
            <div className="flex items-center justify-center h-screen bg-gray-100">
                <div className="text-2xl font-bold text-red-500 p-10 bg-white rounded-xl shadow-2xl">
                    Test not started. Please begin the test.
                </div>
            </div>
        );
    }

    if (isTestEnded) {
        return (
            <div className="flex items-center justify-center h-screen bg-green-50">
                <div className="text-4xl font-extrabold text-green-700 p-12 bg-white rounded-2xl shadow-2xl">
                    Test Submitted Successfully!
                </div>
            </div>
        );
    }

    return (
        <div className="flex h-screen overflow-hidden bg-gray-100">

            {/* Question Panel */}
            <div className="flex-1 overflow-y-auto p-0 transition-all duration-300">

                {/* Top Header Bar  */}
                <header className="flex justify-between items-center bg-blue-800 text-white py-3 px-4 shadow-lg sticky top-0 z-30">
                    <div className="flex items-center justify-center space-x-4">
                        <div className="text-4xl text-white font-bold">Sarkari<span className="text-red-500">Path</span></div>
                        <span className="text-md font-medium text-gray-300 ml-2 hidden sm:inline">Mock Test: {removeSlug(exam_name)} {activeTest.Title}</span>
                    </div>

                    <div className="flex items-center justify-center space-x-4">
                        {/* Timer */}
                        <div className="bg-red-600 text-gray-100 font-bold px-4 py-1 rounded-md shadow-lg text-md">
                            <span className="mr-1">Time Left:</span>
                            <span className="text-lg tracking-wider">{formatTime(timeRemaining)}</span>
                        </div>
                        {/* Language Switcher */}
                        <div className="flex rounded-sm overflow-hidden border border-gray-500 shadow-sm">
                            <button
                                onClick={() => handleLanguageChange('en')}
                                disabled={!currentQuestionData || !currentQuestionData.en}
                                className={`px-3 py-1.5 text-sm font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${language === 'en' ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}
                            >
                                English
                            </button>
                            <button
                                onClick={() => handleLanguageChange('hi')}
                                disabled={!currentQuestionData || !currentQuestionData.hi}
                                className={`px-3 py-1 text-sm font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${language === 'hi' ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}
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
                <div className="p-6">
                    {questionContent ? (
                        <div className="bg-white p-6 rounded-xl shadow-xl border border-gray-200">

                            <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-200">
                                <div className="text-[22px] font-semibold text-gray-800">
                                    Question <span className="text-blue-700">{currentQuestionNumber}</span>
                                </div>
                                <div className="text-md font-semibold text-red-600">
                                    <span className='text-green-800'>Marks: +1</span> | Negative: {activeTest.NegativeMarks > 0 ? '-' : ''}{activeTest.NegativeMarks !== undefined ? activeTest.NegativeMarks : 'N/A'}
                                </div>
                            </div>

                            <p className="text-[17px] font-semibold mb-8 text-gray-900 leading-snug p-4 bg-gray-100 shadow-md rounded-md border border-gray-200">{questionContent.Question}</p>

                            <div className="space-y-3">
                                {questionContent.options.map((option, index) => {
                                    const isSelected = currentAnswer === option.text;
                                    const optionLabel = String.fromCharCode(65 + index);
                                    return (
                                        <div
                                            key={option._id}
                                            className={`
                        p-4 border rounded-lg cursor-pointer transition-all duration-150 flex items-start space-x-3 shadow-sm
                        ${isSelected ? 'bg-blue-50 border-blue-600 ring-1 ring-blue-300' : 'hover:bg-gray-100 border-gray-300'}
                      `}
                                            onClick={() => handleSetAnswer(option.text)}
                                        >
                                            <input
                                                type="radio"
                                                name={`question-${questionId}`}
                                                value={option.text}
                                                checked={isSelected}
                                                onChange={() => handleSetAnswer(option.text)}
                                                className="mt-1 h-5 w-5 text-blue-600 border-gray-300 focus:ring-blue-500"
                                            />
                                            <div className="text-lg text-gray-800">
                                                <span className="mr-2 font-bold text-blue-700">{optionLabel}.</span>
                                                <span>{option.text}</span>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            {/* Action Buttons  */}
                            <div className="mt-10 flex flex-wrap gap-4 border-t-2 border-gray-300 pt-6 justify-between">

                                {/* Previous Button */}
                                <button
                                    onClick={() => setCurrentQuestionIndex(prev => Math.max(0, prev - 1))}
                                    disabled={currentQuestionIndex === 0}
                                    className="px-2 py-3 bg-gray-200 text-gray-900 font-semibold rounded-lg shadow-lg disabled:opacity-50 hover:bg-gray-300 transition w-[190px]"
                                >
                                    &larr; Previous Question
                                </button>

                                {/* Center Buttons */}
                                <div className="flex flex-wrap gap-4 justify-center items-center">
                                    <button
                                        onClick={handleMarkForReview}
                                        className="px-4 py-3 bg-purple-700 text-white font-semibold rounded-lg shadow-lg hover:bg-purple-800 transition"
                                    >
                                        Mark for Review & Next
                                    </button>
                                    <button
                                        onClick={handleClearResponse}
                                        className="px-4 py-3 bg-gray-200 text-gray-800 font-semibold rounded-lg shadow-lg hover:bg-gray-300 transition"
                                    >
                                        Clear Response
                                    </button>
                                    <button
                                        onClick={isLastQuestion ? handleSubmitTest : handleSaveAndNext}
                                        className={`px-4 py-3 text-white font-semibold rounded-lg shadow-lg transition ${isLastQuestion ? 'bg-green-600 hover:bg-green-700' : 'bg-blue-600 hover:bg-blue-800'}`}
                                    >
                                        {isLastQuestion ? 'Save & Submit' : 'Save & Next'}
                                    </button>
                                </div>

                                {/* Next Button */}
                                <div className="w-[190px] text-right">
                                    <button
                                        onClick={() => setCurrentQuestionIndex(prev => Math.min(questions.length - 1, prev + 1))}
                                        disabled={currentQuestionIndex === questions.length - 1}
                                        className="px-6 py-3 bg-gray-200 text-gray-900 font-semibold rounded-lg shadow-lg disabled:opacity-50 hover:bg-gray-300 transition"
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