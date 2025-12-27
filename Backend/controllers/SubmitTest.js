import { MockTestModel, QuestionModel, TestSubmissionModel } from "../models/ExamModel.js";
import userModel from "../models/userModel.js";


export const submitTest = async (req, res) => {
    console.log("Payload received:", JSON.stringify(req.body, null, 2));

    try {
        const { userEmail, testId, userResponses, timeTaken } = req.body;

        if (!userEmail) throw new Error("userEmail is missing from frontend payload.");
        if (!testId) throw new Error("testId is missing from frontend payload.");
        if (!userResponses || !Array.isArray(userResponses)) throw new Error("userResponses is missing or not an array.");

        const mockTest = await MockTestModel.findById(testId);
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
                const marksPerQuestion = 1;
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
                        totalScore += negMarks;             // Assume negMarks is negative or zero
                        subjectMap[subject].incorrect++;
                        subjectMap[subject].score += negMarks;  // Assume negMarks is negative or zero
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
        const maxScore = questions.length * 1;
        const accuracy = correctCount + incorrectCount > 0
            ? parseFloat(((correctCount / (correctCount + incorrectCount)) * 100).toFixed(2))
            : 0;

        console.log("Calculations finished. Saving submission...");

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
            isQualified: ((finalScore / maxScore) * 100) >= 80    // Example qualification criteria
        });

        await newSubmission.save();
        console.log("Submission saved successfully:", newSubmission._id);

        // Updating user's test history
        await userModel.findOneAndUpdate(
            { email: userEmail },
            {
                $push: {
                    testHistory: {
                        submissionId: newSubmission._id,
                        testId: testId,
                        examId: mockTest.ExamId,
                        status: 'Completed',
                        title: mockTest.Title,
                        score: finalScore,
                        maxPossibleScore: maxScore,
                        accuracy: accuracy,
                        attemptedAt: newSubmission.createdAt
                    }
                }
            }
        ).catch(err => console.error("Failed to update user stats:", err.message));

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