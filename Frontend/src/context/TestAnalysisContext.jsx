import axios from 'axios';
import { createContext, useContext, useState } from 'react';

export const TestAnalysisContext = createContext();

export const TestAnalysisProvider = ({ children }) => {
    const backend_url = import.meta.env.VITE_BACKEND_URL;
    const [analysisData, setAnalysisData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    const processTestResult = (test, submission) => {

        const rawSectionAnalysis = submission.sectionAnalysis || [];
        const marksPerQuestion = test.MarksPerQuestion !== undefined ? test.MarksPerQuestion : 1;

        const subjects = rawSectionAnalysis.map(sub => ({
            name: sub.subject,
            score: sub.score,
            total: sub.totalQuestions * marksPerQuestion,
            c: sub.correct,
            i: sub.incorrect,
            s: sub.skipped,
            accuracy: sub.accuracy,
            time: `${Math.floor(sub.timeSpent / 60)}m ${sub.timeSpent % 60}s`,
            // topperDiff: 'Equal', 
            // diffType: 'neutral'
        }));

        // if (subjects.length === 0) {
        //      subjects.push({ name: "General Analysis", score: submission.totalScore, total: test.Questions.length, c: submission.correctCount, i: submission.incorrectCount, s: submission.skippedCount, accuracy: submission.accuracy, time: "0m" });
        // }

        const responses = submission.responses || [];

        const processedQuestions = test.Questions.map((q, index) => {
            // Find user's response for this question ID
            const response = responses.find(r => r.questionId === q._id);

            const status = response ? response.status : 'skipped';
            const selectedOption = response ? response.selectedOptionIndex : null;

            const timeRaw = response ? response.timeSpent : 0;
            const timeSpent = `${Math.floor(timeRaw / 60)}m ${timeRaw % 60}s`;

            const qData = q.en || q.hi || { Question: "Question text unavailable", options: [] };
            const optionsArray = qData.options || [];

            return {
                id: index + 1,
                originalId: q._id,
                subject: q.Subject,
                difficulty: q.Difficulty,
                time: timeSpent,
                status: status,
                question: qData.Question,
                options: optionsArray.map(o => o.text),
                correctOption: optionsArray.findIndex(o => o.isCorrect),
                selectedOption: selectedOption,
                solution: qData.solution || "Solution not available."
            };
        });

        const strengths = subjects.filter(s => s.accuracy > 80).map(s => `Strong performance in ${s.name} (${s.accuracy}% accuracy).`);
        const weaknesses = subjects.filter(s => s.accuracy < 50).map(s => `Focus needed in ${s.name} (only ${s.accuracy}% accuracy).`);

        if (strengths.length === 0) strengths.push("Keep practicing to identify your strengths.");
        if (weaknesses.length === 0) weaknesses.push("Great consistency! Try to improve speed.");

        return {
            title: test.ExamId.Name + " - " + test.Title,
            level: test.Difficulty,
            testId: test._id, // Useful for 'Retake Test' button
            type: test.type || 'mock_test',

            attempts: submission.attempts || 1,
            attemptedAt: submission.attemptedAt || "",

            score: submission.totalScore,
            totalScore: submission.maxPossibleScore || (test.Questions.length * 1),
            accuracy: submission.accuracy.toFixed(2),
            rank: submission.globalRank || 0,
            totalAspirants: submission.totalParticipants || 0,
            percentile: submission.percentile || 0,
            isQualified: submission.isQualified,
            stats: {
                attempted: (submission.correctCount || 0) + (submission.incorrectCount || 0),
                totalQuestions: test.Questions.length,
                correct: submission.correctCount || 0,
                incorrect: submission.incorrectCount || 0,
                skipped: submission.skippedCount || 0,
                timeTaken: `${Math.floor((submission.timeTaken || 0) / 60)}m ${(submission.timeTaken || 0) % 60}s`,
                totalTime: `${test.DurationinMinutes}m`,
                avgTimePerQuestion: (submission.timeTaken || 0) / (test.Questions.length || 1)
            },
            aiInsights: {
                strengths,
                weaknesses
            },
            subjects,
            questions: processedQuestions
        };
    };

    const fetchAnalysisData = async (submissionId) => {
        setIsLoading(true);
        axios.defaults.withCredentials = true;
        try {
            const { data } = await axios.get(`${backend_url}/api/test-results/${submissionId}`);

            if (data.success) {
                const processed = processTestResult(data.test, data.submission);
                setAnalysisData(processed);
            } else {
                setError("Could not load results.");
            }
        } catch (err) {
            console.error("Error fetching analysis:", err);
            setError(err.response?.data?.message || "Failed to fetch analysis data.");
        } finally {
            setIsLoading(false);
        }
    };

    const value = {
        analysisData,
        isLoading,
        error,
        fetchAnalysisData
    };

    return (
        <TestAnalysisContext.Provider value={value}>
            {children}
        </TestAnalysisContext.Provider>
    );
};

export const useTestAnalysis = () => {
    return useContext(TestAnalysisContext);
};