import axios from 'axios';

import { useContext, createContext, useState, useEffect } from 'react';



export const TestWindowContext = createContext();


export const TestWindowProvider = ({ children }) => {

    const backend_url = import.meta.env.VITE_BACKEND_URL;

    // Test Data State (Fetched from API)
    const [activeTest, setActiveTest] = useState(null);
    const [activeTestID, setActiveTestID] = useState('');
    const [questions, setQuestions] = useState([]);
    const [duration, setDuration] = useState(0); // Duration in minutes
    const [markingScheme, setMarkingScheme] = useState({ correct: 0, incorrect: 0 });

    // Core Test Management State
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [timeRemaining, setTimeRemaining] = useState(0); // Time in seconds
    const [userAnswers, setUserAnswers] = useState({}); // { 'qId': 'selectedOption', ...}
    const [questionStatus, setQuestionStatus] = useState({}); // { 'qId': 'answered' | 'marked_for_review' | 'not_visited', ...}

    // Test Status State
    const [score, setScore] = useState(0); // Current calculated score
    const [isTestLoading, setIsLoading] = useState(true); // Replaces isTestStarted initially for loading popup
    const [isTestStarted, setIsTestStarted] = useState(false);
    const [isTestEnded, setIsTestEnded] = useState(false);

    // --- Data Fetching and Initialization ---

    useEffect(() => {

        // Simulating the loading popup delay before fetching
        const loadTimer = setTimeout(() => setIsLoading(false), 3000);
        if (activeTestID) {
            fetchActiveTestDetails();
        }
        return () => clearTimeout(loadTimer);

    }, [activeTestID]);

    const fetchActiveTestDetails = async () => {
        axios.defaults.withCredentials = true;

        try {
            const { data } = await axios.get(`${backend_url}/api/test-window/active-test/${activeTestID}`);
            if (data.success && data.Test) {
                const test = data.Test;
                const totalSeconds = test.DurationinMinutes * 60;
                setActiveTest(test);
                setQuestions(test.Questions || []);
                setDuration(test.DurationinMinutes);
                setMarkingScheme({ correct: 1, incorrect: test.NegativeMarks });
                setTimeRemaining(totalSeconds);

                // Initialize user answers and question status based on fetched questions
                const initialAnswers = test.Questions.reduce((acc, q) => ({ ...acc, [q._id]: null }), {});
                const initialStatus = test.Questions.reduce((acc, q) => ({ ...acc, [q._id]: 'not_visited' }), {});
                setUserAnswers(initialAnswers);
                setQuestionStatus(initialStatus);

                // Set isTestStarted to true once data is ready and loaded
                setIsTestStarted(true);

            } else {
                console.error('Test data not found or success is false.');
            }

        } catch (err) {
            console.error('Failed to fetch active test details:', err);
        } finally {
            setIsLoading(false);
        }

    }

    // --- Timer Logic ---
    useEffect(() => {

        if (!isTestStarted || isTestEnded || timeRemaining <= 0) return;
        const timerId = setInterval(() => {
            setTimeRemaining(prevTime => {
                if (prevTime <= 1) {
                    setIsTestEnded(true);
                    // auto submission logic here
                    clearInterval(timerId);
                    return 0;
                }
                return prevTime - 1;
            });
        }, 1000);

        return () => clearInterval(timerId);
    }, [isTestStarted, isTestEnded]);


    const formatTime = (totalSeconds) => {
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = totalSeconds % 60;
        return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    };


    // --- Action Handlers ---
    const currentQuestion = questions[currentQuestionIndex];
    const questionId = currentQuestion ? currentQuestion._id : null;

    const handleSetAnswer = (answer) => {
        if (isTestEnded || !questionId) return;
        setUserAnswers(prev => ({ ...prev, [questionId]: answer }));

        // Update status to 'answered' if not marked for review
        setQuestionStatus(prev => {
            const currentStatus = prev[questionId];
            if (currentStatus !== 'marked_for_review' && currentStatus !== 'answered_and_marked') {
                return { ...prev, [questionId]: 'answered' };
            }
            return prev;
        });
    };

    const handleSaveAndNext = () => {
        if (isTestEnded || !questionId) return;
        const isAnswered = !!userAnswers[questionId];

        setQuestionStatus(prev => ({
            ...prev,
            [questionId]: isAnswered ? 'answered' : 'not_answered'
        }));
        if (currentQuestionIndex < questions.length - 1) {
            setCurrentQuestionIndex(prev => prev + 1);
        } else {
            // End of test sequence
        }

    };

    const handleMarkForReview = () => {
        if (isTestEnded || !questionId) return;
        const isAnswered = !!userAnswers[questionId];
        setQuestionStatus(prev => ({
            ...prev,
            [questionId]: isAnswered ? 'answered_and_marked' : 'marked_for_review'
        }));

        if (currentQuestionIndex < questions.length - 1) {
            setCurrentQuestionIndex(prev => prev + 1);
        }
    };

    const handleClearResponse = () => {
        if (isTestEnded || !questionId) return;
        setUserAnswers(prev => ({ ...prev, [questionId]: null }));

        setQuestionStatus(prev => ({
            ...prev,
            [questionId]: 'not_answered'
        }));
    };

    const handleSubmitTest = async () => {
        // Confirmation modal logic should wrap this
        if (window.confirm("Are you sure you want to end and submit the test?")) {

            // Submit answers and calculate final score here
            let totalScore = 0;
            questions.forEach(q => {
                const userAnswer = userAnswers[q._id];
                const correctAnswer = q.en ? q.en.answer : q.hi ? q.hi.answer : null;
                // console.log('Question ID:', q._id, 'User Answer:', userAnswer, 'Correct Answer:', correctAnswer);
                // console.log(markingScheme);
                if (userAnswer) {
                    if (userAnswer === correctAnswer) {
                        // console.log('Correct answer for question ID:', q._id);
                        totalScore += markingScheme.correct;
                    } else {
                        totalScore += markingScheme.incorrect; // negative marking
                    }
                }
            });

            // auto submission logic
            console.log('Final Score:', totalScore);
            setIsTestEnded(true);
            // try {
            //     axios.defaults.withCredentials = true;
            //     const { data } = await axios.post(`${backend_url}/api/test-window/submit-test/${activeTestID}`, {
            //         answers: userAnswers,
            //         score: totalScore,
            //     });
            //     if (data.success) {
            //         console.log('Test submitted successfully.');

            //         setIsTestEnded(true);
            //     } else {
            //         console.error('Failed to submit test.');
            //     }
            // } catch (err) {
            //     console.error('Failed to submit test:', err);
            // }
        }

    };



    const [language, setLanguage] = useState('en');

    const value = {
        activeTest, setActiveTest,
        questions, setQuestions,
        duration, setDuration,
        markingScheme, setMarkingScheme,
        isTestStarted, setIsTestStarted,
        isTestEnded, setIsTestEnded,
        activeTestID, setActiveTestID,

        // New Test Window Logic
        currentQuestionIndex, setCurrentQuestionIndex,
        userAnswers, handleSetAnswer,
        questionStatus,
        timeRemaining, formatTime,
        language, setLanguage,
        isTestLoading, setIsLoading,
        handleSaveAndNext, handleMarkForReview,
        handleClearResponse, handleSubmitTest,
    };

    return (
        <TestWindowContext.Provider value={value}>
            {children}
        </TestWindowContext.Provider>
    );
}

export const useTestWindow = () => {
    return useContext(TestWindowContext);
};

