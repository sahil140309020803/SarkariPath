import axios from 'axios';

import { useContext, createContext, useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';



export const TestWindowContext = createContext();


export const TestWindowProvider = ({ children }) => {

    const backend_url = import.meta.env.VITE_BACKEND_URL;

    const [activeTest, setActiveTest] = useState(null);
    const [activeTestID, setActiveTestID] = useState('');
    const [questions, setQuestions] = useState([]);
    const [duration, setDuration] = useState(0);
    const [markingScheme, setMarkingScheme] = useState({ correct: 0, incorrect: 0 });

    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [timeRemaining, setTimeRemaining] = useState(0);
    const [userAnswers, setUserAnswers] = useState({});
    const [questionStatus, setQuestionStatus] = useState({});

    const [score, setScore] = useState(0);
    const [isTestLoading, setIsLoading] = useState(true);
    const [isTestStarted, setIsTestStarted] = useState(false);
    const [isTestEnded, setIsTestEnded] = useState(false);

    const { userDetails } = useAuth();

    const navigate = useNavigate();

    // Timer per question functionality
    const questionTimesRef = useRef({});
    const [activeQuestionDuration, setActiveQuestionDuration] = useState(0);
    const activeDurationRef = useRef(0);


    useEffect(() => {

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

                const initialAnswers = test.Questions.reduce((acc, q) => ({ ...acc, [q._id]: null }), {});
                const initialStatus = test.Questions.reduce((acc, q) => ({ ...acc, [q._id]: 'not_visited' }), {});
                setUserAnswers(initialAnswers);
                setQuestionStatus(initialStatus);
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

    useEffect(() => {

        if (!isTestStarted || isTestEnded || timeRemaining <= 0) return;
        const timerId = setInterval(() => {
            setTimeRemaining(prevTime => {
                if (prevTime <= 1) {
                    setIsTestEnded(true);
                    clearInterval(timerId);
                    handleSubmitTest();
                    return 0;
                }
                return prevTime - 1;
            });
        }, 1000);

        return () => clearInterval(timerId);
    }, [isTestStarted, isTestEnded, timeRemaining]);


    const formatTime = (totalSeconds) => {
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = totalSeconds % 60;
        return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    };


    const currentQuestion = questions[currentQuestionIndex];
    const questionId = currentQuestion ? currentQuestion._id : null;


    useEffect(() => {
        if (!isTestStarted || isTestEnded || !questionId) return;

        const qId = questionId;
        const previouslySpent = questionTimesRef.current[qId] || 0;

        activeDurationRef.current = previouslySpent;
        setActiveQuestionDuration(previouslySpent);

        const interval = setInterval(() => {
            activeDurationRef.current += 1;
            setActiveQuestionDuration(activeDurationRef.current);
        }, 1000);

        return () => {
            clearInterval(interval);
            questionTimesRef.current[qId] = activeDurationRef.current;
        };
    }, [questionId, isTestStarted, isTestEnded]);


    const handleSetAnswer = (answer) => {
        if (isTestEnded || !questionId) return;
        setUserAnswers(prev => ({ ...prev, [questionId]: answer }));

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
            handleSubmitTest();
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
    if (window.confirm("Are you sure you want to end and submit the test?")) {
        try {
            if (!activeTestID) throw new Error("Test ID is missing");

            const totalSecondsAllocated = duration * 60;
            const timeTakenInSeconds = totalSecondsAllocated - timeRemaining;

            if (questionId) {
                questionTimesRef.current[questionId] = activeDurationRef.current;
            }

            const formattedResponses = questions.map(q => {
                const userSelectedValue = userAnswers[q._id];
                let finalIndex = null;

                if (userSelectedValue) {
                    const enOptions = q.en?.options || [];
                    let foundIndex = enOptions.findIndex(opt => opt.text === userSelectedValue);

                    if (foundIndex === -1) {
                        const hiOptions = q.hi?.options || [];
                        foundIndex = hiOptions.findIndex(opt => opt.text === userSelectedValue);
                    }
                    
                    if (foundIndex !== -1) {
                        finalIndex = foundIndex;
                    }
                }

                return {
                    questionId: q._id,
                    selectedOptionIndex: finalIndex,
                    timeSpent: questionTimesRef.current[q._id] || 0,
                };
            });

            const payload = {
                testId: activeTestID,
                timeTaken: timeTakenInSeconds,
                userResponses: formattedResponses
            };

            const { data } = await axios.post(`${backend_url}/api/submit-test`, payload);

            if (data.success) {
                setIsTestEnded(true);
                navigate(`/analysis/${data.result._id}`);
            } else {
                alert("Submission failed.");
            }

        } catch (error) {
            console.error("Submission Error:", error);
            alert("Error: " + (error.response?.data?.error || error.message));
        }
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

        currentQuestionIndex, setCurrentQuestionIndex,
        userAnswers, handleSetAnswer,
        questionStatus,
        timeRemaining, formatTime,
        language, setLanguage,
        isTestLoading, setIsLoading,
        handleSaveAndNext, handleMarkForReview,
        handleClearResponse, handleSubmitTest,
        activeQuestionDuration
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
