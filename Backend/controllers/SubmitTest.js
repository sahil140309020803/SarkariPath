import { MockTestModel, QuizModel, QuestionModel, TestSubmissionModel } from "../models/ExamModel.js";
import userModel from "../models/userModel.js";
import userStatisticsModel from "../models/userStatisticsModel.js";

const REATTEMPT_EXPIRY_MS = 1 * 24 * 60 * 60 * 1000; // 1 day — applied to ALL reattempts (quiz or mock)

export const submitTest = async (req, res) => {
    console.log("Payload received:", JSON.stringify(req.body, null, 2));

    try {
        const { userEmail, testId, userResponses, timeTaken } = req.body;

        if (!userEmail) throw new Error("userEmail is missing from frontend payload.");
        if (!testId) throw new Error("testId is missing from frontend payload.");
        if (!userResponses || !Array.isArray(userResponses)) throw new Error("userResponses is missing or not an array.");

        let isMock = true;
        let mockTest = await MockTestModel.findById(testId);
        if (!mockTest) {
            mockTest = await QuizModel.findById(testId);
            isMock = false;
        }
        if (!mockTest) throw new Error(`Test with ID ${testId} not found in DB.`);

        const user = await userModel.findOne({ email: userEmail });
        if (!user) console.warn(`Warning: User with email ${userEmail} not found in User DB. Proceeding as 'Unknown User'.`);
        // const userName = user ? user.name : "Unknown User";

        const questionIds = mockTest.Questions || [];
        if (questionIds.length === 0) console.warn("Warning: This test has no questions linked in the DB.");

        const questions = await QuestionModel.find({
            _id: { $in: questionIds }
        });
        console.log(`Fetched ${questions.length} questions from DB.`);

        // CALCULATION LOGIC
        let totalScore = 0;
        let correctCount = 0;
        let incorrectCount = 0;
        let skippedCount = 0;
        const processedResponses = [];
        const subjectMap = {};

        const questionMap = new Map(questions.map(q => [q._id.toString(), q]));

        for (const response of userResponses) {
            try {
                if (!response.questionId) continue;

                const questionDb = questionMap.get(response.questionId);
                if (!questionDb) {
                    console.warn(`Question ID ${response.questionId} in user response not found in Question DB.`);
                    continue;
                }

                const questionData = (questionDb.en && questionDb.en.options && questionDb.en.options.length > 0)
                    ? questionDb.en
                    : questionDb.hi;

                if (!questionData || !questionData.options) {
                    console.warn(`Skipping QID ${response.questionId}: Malformed data (missing options).`);
                    continue;
                }

                const subject = questionDb.Subject;

                if (!subjectMap[subject]) {
                    subjectMap[subject] = {
                        subject, score: 0, totalQuestions: 0,
                        correct: 0, incorrect: 0, skipped: 0, timeSpent: 0, accuracy: 0
                    };
                }

                subjectMap[subject].totalQuestions++;
                subjectMap[subject].timeSpent += (response.timeSpent || 0);

                let status = 'skipped';
                const correctOptionIndex = questionData.options.findIndex(opt => opt.isCorrect === true);
                const marksPerQuestion = mockTest.MarksPerQuestion !== undefined ? mockTest.MarksPerQuestion : 1;
                const negMarks = mockTest.NegativeMarks || 0;

                if (response.selectedOptionIndex !== null && response.selectedOptionIndex !== undefined) {
                    if (response.selectedOptionIndex === correctOptionIndex) {
                        status = 'correct';
                        correctCount++;
                        totalScore += marksPerQuestion;
                        subjectMap[subject].correct++;
                        subjectMap[subject].score += marksPerQuestion;
                    } else {
                        status = 'incorrect';
                        incorrectCount++;
                        totalScore -= Math.abs(negMarks);
                        subjectMap[subject].incorrect++;
                        subjectMap[subject].score -= Math.abs(negMarks);
                    }
                } else {
                    skippedCount++;
                    subjectMap[subject].skipped++;
                }

                processedResponses.push({
                    questionId: response.questionId,
                    subject: subject,
                    selectedOptionIndex: response.selectedOptionIndex,
                    correctOptionIndex: correctOptionIndex,
                    status: status,
                    timeSpent: response.timeSpent || 0
                });
            } catch (innerErr) {
                console.error(`Error processing QID ${response.questionId}:`, innerErr.message);
            }
        }

        const sectionAnalysis = Object.values(subjectMap).map(sub => ({
            subject: sub.subject,
            score: parseFloat(sub.score.toFixed(3)),
            totalQuestions: sub.totalQuestions,
            correct: sub.correct,
            incorrect: sub.incorrect,
            skipped: sub.skipped,
            timeSpent: sub.timeSpent,
            accuracy: parseFloat(((sub.correct / sub.totalQuestions) * 100).toFixed(2))
        }));

        const finalScore = Math.max(0, totalScore);
        const maxScore = questions.length * (mockTest.MarksPerQuestion !== undefined ? mockTest.MarksPerQuestion : 1);
        const accuracy = correctCount + incorrectCount > 0
            ? parseFloat(((correctCount / (correctCount + incorrectCount)) * 100).toFixed(2))
            : 0;
        const currentAverageScore = maxScore > 0
            ? parseFloat(((finalScore / maxScore) * 100).toFixed(2))
            : 0;

        console.log("Calculations finished. Saving submission...");

        // Check for previous attempts to determine expiry and leaderboard eligibility
        const previousAttemptsCount = await TestSubmissionModel.countDocuments({
            userId: userEmail,
            testId: testId
        });

        let submissionExpireAt = null;
        const testType = isMock ? 'mock_test' : 'quiz';

        if (previousAttemptsCount > 0) {
            // Any reattempt (quiz or mock test) → expires in 1 day
            submissionExpireAt = new Date(Date.now() + REATTEMPT_EXPIRY_MS);
        } else if (testType === 'quiz') {
            // Quiz first attempt → inherit the quiz's 7-day expiry
            submissionExpireAt = mockTest.expireAt;
        }
        // Mock test first attempt → null (never expires)

        const newSubmission = new TestSubmissionModel({
            userId: userEmail,
            testId: testId,
            examId: mockTest.ExamId,
            responses: processedResponses,
            sectionAnalysis: sectionAnalysis,
            totalScore: finalScore,
            maxPossibleScore: maxScore,
            correctCount,
            incorrectCount,
            skippedCount,
            accuracy,
            timeTaken: timeTaken || 0,
            isQualified: ((finalScore / maxScore) * 100) >= 80,    // Example qualification criteria
            expireAt: submissionExpireAt
        });

        await newSubmission.save();
        console.log("Submission saved successfully:", newSubmission._id);

        // ─── Leaderboard Update (mock_test only, first attempt only) ───
        if (testType === 'mock_test' && previousAttemptsCount === 0) {
            const userName = user ? user.name : 'Aspirant';
            await MockTestModel.findByIdAndUpdate(testId, {
                $push: {
                    leaderboard: {
                        userId: userEmail,
                        name: userName,
                        score: finalScore,
                        percentage: currentAverageScore,
                        timeTaken: timeTaken || 0,
                        submittedAt: newSubmission.createdAt
                    }
                }
            });
        }

        // Updating user statistics (UserStatistics collection)
        try {
            if (user) {
                let stats = await userStatisticsModel.findOne({ userId: user._id });
                if (!stats) {
                    stats = new userStatisticsModel({
                        userId: user._id,
                        testsAttempted: 0,
                        averageScore: 0,
                        currentStreak: 0,
                        longestStreak: 0,
                        dailyStatistics: [],
                        syllabusProgress: []
                    });
                }

                // Increment tests attempted
                stats.testsAttempted += 1;

                // Update rolling average score using the formula:
                // stats.averageScore = ((oldAverage * oldTests) + currentAverageScore) / (oldTests + 1)
                const oldTestsCount = stats.testsAttempted - 1;
                const oldAverage = stats.averageScore || 0;
                stats.averageScore = ((oldAverage * oldTestsCount) + currentAverageScore) / stats.testsAttempted;

                // Total study time conversion
                const minutes = Math.ceil((timeTaken || 0) / 60);

                // Date string helpers (local timezone)
                const getLocalDateString = (date) => {
                    const year = date.getFullYear();
                    const month = String(date.getMonth() + 1).padStart(2, '0');
                    const day = String(date.getDate()).padStart(2, '0');
                    return `${year}-${month}-${day}`;
                };

                const todayStr = getLocalDateString(new Date());
                const yesterdayStr = getLocalDateString(new Date(Date.now() - 24 * 60 * 60 * 1000));

                let todayEntry = stats.dailyStatistics.find(h => h.date === todayStr);
                const isFirstStudyOfToday = !todayEntry;
                if (todayEntry) {
                    todayEntry.studyMinutes += minutes;
                    todayEntry.testsAttempted += 1;
                } else {
                    stats.dailyStatistics.push({
                        date: todayStr,
                        testsAttempted: 1,
                        studyMinutes: minutes
                    });
                }

                // Streak calculation logic
                stats.dailyStatistics.sort((a, b) => a.date.localeCompare(b.date));
                const historyBeforeToday = stats.dailyStatistics.filter(h => h.date !== todayStr);
                const lastStudyEntry = historyBeforeToday.length > 0 ? historyBeforeToday[historyBeforeToday.length - 1] : null;

                if (!lastStudyEntry) {
                    stats.currentStreak = 1;
                } else if (lastStudyEntry.date === yesterdayStr) {
                    if (isFirstStudyOfToday) {
                        stats.currentStreak += 1;
                    }
                } else {
                    if (isFirstStudyOfToday) {
                        stats.currentStreak = 1;
                    }
                }

                // Longest Streak calculation
                stats.longestStreak = Math.max(stats.longestStreak || 0, stats.currentStreak || 0);

                await stats.save();
                console.log("UserStatistics updated successfully for user:", user._id);
            }
        } catch (err) {
            console.error("Failed to update UserStatistics:", err.message);
        }

        res.status(200).json({ success: true, result: newSubmission });

    } catch (error) {
        console.error("CRITICAL ERROR IN SUBMIT TEST:", error);
        res.status(400).json({
            success: false,
            error: error.message,
            stack: error.stack
        });
    }
};