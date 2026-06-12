import React, { useState, useMemo } from 'react';

const statusClasses = {
    answered: 'bg-green-600 text-white shadow-md', // Answered (Green)
    marked_for_review: 'bg-purple-600 text-white shadow-md', // Marked (Purple)
    answered_and_marked: 'bg-purple-600 text-white shadow-md', // Ans & Marked (Pink)
    not_answered: 'bg-red-600 dark:bg-rose-600 text-white shadow-md', // Not Answered (Red)
    not_visited: 'bg-gray-200 dark:bg-slate-800 text-gray-700 dark:text-slate-300 hover:bg-gray-200 shadow-md', // Not Visited (Gray/White)
};

const LegendItem = ({ color, text }) => (
    <div className="flex items-center space-x-2">
        <span className={`size-5 rounded-sm ${color}`}></span>
        <span className="text-gray-600 dark:text-slate-400 text-xs font-semibold uppercase tracking-tight">{text}</span>
    </div>
);

export const QuestionPalette = ({ questions, questionStatus, currentQuestionIndex, setCurrentQuestionIndex, activeTest, handleSubmitTest}) => {
    const [isPaletteOpen, setIsPaletteOpen] = useState(true);

    // Group questions by Subject for display headers in the palette
    const structuredQuestions = useMemo(() => {
        if (!activeTest || !activeTest.Structure || !questions.length) return {};

        const groups = {};
        let questionIndex = 0;

        activeTest.Structure.forEach(section => {
            const subject = section.Subject;
            if (!groups[subject]) {
                groups[subject] = [];
            }

            const numQs = section.QuestionCount;

            for (let i = 0; i < numQs && questionIndex < questions.length; i++) {
                groups[subject].push({
                    qId: questions[questionIndex]._id,
                    index: questionIndex,
                    number: questionIndex + 1,
                });
                questionIndex++;
            }
        });
        return groups;
    }, [activeTest, questions]);

    // Determine the current subject for the main palette header
    const currentSubject = questions[currentQuestionIndex]?.Subject;

    // Calculate question counts for display
    const totalAnswered = questions.filter(q => questionStatus[q._id] === 'answered' || questionStatus[q._id] === 'answered_and_marked').length;
    const totalMarked = questions.filter(q => questionStatus[q._id] === 'marked_for_review' || questionStatus[q._id] === 'answered_and_marked').length;
    const totalNotAnswered = questions.filter(q => questionStatus[q._id] === 'not_answered').length;
    const totalNotVisited = questions.filter(q => questionStatus[q._id] === 'not_visited').length;

    return (
        <>
            {/* Toggle Button for mobile/tablet (Hidden on desktop) */}
            <button
                onClick={() => setIsPaletteOpen(!isPaletteOpen)}
                className={`fixed top-4 right-4 z-50 p-3 rounded-full shadow-xl transition-colors md:hidden ${isPaletteOpen ? 'bg-red-600 text-white' : 'bg-blue-600 text-white'}`}
                title={isPaletteOpen ? "Hide Palette" : "Show Palette"}
            >
                {isPaletteOpen ? (
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                ) : (
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2004/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7"></path></svg>
                )}
            </button>

            {/* Palette Content */}
            <div
                className={`
          fixed inset-y-0 right-0 z-40 w-full max-w-sm bg-white dark:bg-slate-900 p-4 border-l border-gray-200 dark:border-slate-800 shadow-2xl transition-all duration-300 ease-in-out
          ${isPaletteOpen ? 'translate-x-0' : 'translate-x-full'} md:relative md:translate-x-0 md:w-100 md:shadow-lg
        `}
            >

                {/* Top Status and Submit Area */}
                <div className="pt-4">
                    <div className="grid grid-cols-2 gap-x-2 gap-y-3 text-sm font-medium mb-10">
                        <LegendItem color="bg-green-600 dark:bg-emerald-600" text={`Answered (${totalAnswered})`} />
                        <LegendItem color="bg-red-600 dark:bg-rose-600" text={`Not Answered (${totalNotAnswered})`} />
                        <LegendItem color="bg-purple-600 dark:bg-indigo-600" text={`Marked (${totalMarked})`} />
                        <LegendItem color="bg-gray-200 dark:bg-slate-800 border border-gray-400 dark:border-slate-700" text={`Not Visited (${totalNotVisited})`} />
                    </div>
                </div>

                {/* Question Grid - Segmented by Subject */}
                <div className="space-y-4 max-h-[72vh] overflow-y-auto pr-2 mt-4 mb-5">
                    {Object.entries(structuredQuestions).map(([subject, qList]) => (
                        <div key={subject} className="mb-4">
                            {/* Subject Header above the question batch */}
                            <h4 className="text-[11px] font-extrabold text-gray-500 dark:text-slate-500 mb-2 border-b border-gray-200 dark:border-slate-800 pb-1 uppercase tracking-wider">SECTION: {subject}</h4>

                            <div className="grid grid-cols-5 gap-2.5 p-2 bg-slate-50 dark:bg-slate-800/30 rounded-xl">
                                {qList.map((q) => {
                                    const status = questionStatus[q.qId] || 'not_visited';
                                    const isCurrent = q.index === currentQuestionIndex;

                                    return (
                                        <div
                                            key={q.qId}
                                            className={`
                                        flex items-center justify-center h-9 w-full text-sm font-bold rounded-lg cursor-pointer transition-all duration-150 
                                        ${statusClasses[status]} 
                                        ${isCurrent ? 'ring-2 ring-yellow-500 scale-105 border' : ''}
                                    `}
                                            onClick={() => setCurrentQuestionIndex(q.index)}
                                            title={status.replace(/_/g, ' ')}
                                        >
                                            {q.number}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Submit Button */}
                <button
                    onClick={handleSubmitTest}
                    className="w-full px-3 py-2.5 bg-red-600 text-white font-bold text-lg rounded-lg shadow-2xl hover:bg-red-700 transition"
                >
                    Submit Test
                </button>

            </div>
        </>
    );
};