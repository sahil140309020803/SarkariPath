import mongoose from "mongoose";
import { MockTestModel, QuizModel, TestSubmissionModel } from "../models/ExamModel.js";
import userModel from "../models/userModel.js";
import { AI } from "../GenAI/ai.js";

export const getLeaderboard = async (req, res) => {
    try {
        const { testId } = req.params;
        const page = Math.max(1, parseInt(req.query.page) || 1);
        const limit = Math.max(1, parseInt(req.query.limit) || 10);
        const skip = (page - 1) * limit;

        if (!testId || !mongoose.Types.ObjectId.isValid(testId)) {
            return res.status(400).json({ success: false, message: "Invalid Test ID" });
        }

        let test = await MockTestModel.findById(testId).select('leaderboard type').lean();
        if (!test) {
            test = await QuizModel.findById(testId).select('expireAt').lean();
            if (test) {
                test.type = 'quiz';
                test.leaderboard = [];
            }
        }
        if (!test) return res.status(404).json({ success: false, message: "Test not found" });

        // Quiz tests never have a leaderboard
        if (test.type === 'quiz') {
            return res.status(200).json({ success: true, leaderboard: [], total: 0, page, totalPages: 0 });
        }

        // Sort embedded leaderboard by score desc, then timeTaken asc
        const sorted = [...(test.leaderboard || [])].sort((a, b) =>
            b.score !== a.score ? b.score - a.score : a.timeTaken - b.timeTaken
        );

        const total = sorted.length;
        const totalPages = Math.ceil(total / limit);
        const paginated = sorted.slice(skip, skip + limit);

        const leaderboard = paginated.map((entry, idx) => ({
            rank: skip + idx + 1,
            name: entry.name,
            score: entry.score,
            percentage: entry.percentage,
            time: entry.timeTaken
        }));

        res.status(200).json({ success: true, leaderboard, total, page, totalPages });
    } catch (error) {
        console.error("Leaderboard Error:", error);
        res.status(500).json({ success: false, message: "Error fetching leaderboard" });
    }
};

export const getTestAnalysis = async (req, res) => {
    try {
        const { submissionId } = req.params;

        const submission = await TestSubmissionModel.findById(submissionId).lean();

        if (!submission) {
            return res.status(404).json({ success: false, message: "Submission not found" });
        }

        let test = await MockTestModel.findById(submission.testId)
            .populate('Questions')
            .populate('ExamId')
            .lean();

        if (!test) {
            test = await QuizModel.findById(submission.testId)
                .populate('Questions')
                .populate('ExamId')
                .lean();
            if (test) {
                test.type = 'quiz';
                test.leaderboard = [];
            }
        }

        if (!test) {
            return res.status(404).json({ success: false, message: "Test details not found" });
        }

        // Rank & percentile — derived from the embedded leaderboard (mock_test only)
        const leaderboard = test.leaderboard || [];
        const sorted = [...leaderboard].sort((a, b) =>
            b.score !== a.score ? b.score - a.score : a.timeTaken - b.timeTaken
        );

        const totalParticipants = sorted.length;
        const rankIndex = sorted.findIndex(p => p.userId === submission.userId);
        const rank = rankIndex >= 0 ? rankIndex + 1 : 0;
        const percentile = totalParticipants > 0 && rank > 0
            ? parseFloat((((totalParticipants - rank + 1) / totalParticipants) * 100).toFixed(2))
            : 100;

        submission.globalRank = rank;
        submission.totalParticipants = totalParticipants;
        submission.percentile = percentile;

        submission.attempts = await TestSubmissionModel.countDocuments({
            userId: submission.userId,
            testId: submission.testId
        });
        submission.attemptedAt = submission.createdAt.toLocaleString('en-IN');

        res.status(200).json({
            success: true,
            test,
            submission
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Server Error" });
    }
};

export const getWeaknessAnalysis = async (req, res) => {
    try {
        const { userEmail, examId } = req.body;

        if (!userEmail || !examId) {
            return res.status(400).json({ success: false, message: "Missing email or examId" });
        }

        // Find all submissions of user for this specific exam
        const submissions = await TestSubmissionModel.find({ userId: userEmail, examId: examId })
            .select('sectionAnalysis')
            .lean();

        if (submissions.length === 0) {
            return res.json({ success: false, message: "No test history found for this exam." });
        }

        // Aggregate by subject
        const subjectStats = {};
        submissions.forEach(sub => {
            if (sub.sectionAnalysis && Array.isArray(sub.sectionAnalysis)) {
                sub.sectionAnalysis.forEach(sec => {
                    if (!subjectStats[sec.subject]) {
                        subjectStats[sec.subject] = { correct: 0, total: 0 };
                    }
                    subjectStats[sec.subject].correct += (sec.correct || 0);
                    subjectStats[sec.subject].total += (sec.totalQuestions || 0);
                });
            }
        });

        // Find subject with lowest accuracy
        let weakestSubject = null;
        let minAccuracy = Infinity;

        for (const [sub, stats] of Object.entries(subjectStats)) {
            if (stats.total > 0) {
                const acc = (stats.correct / stats.total) * 100;
                if (acc < minAccuracy) {
                    minAccuracy = acc;
                    weakestSubject = sub;
                }
            }
        }

        if (!weakestSubject) {
            return res.json({ success: false, message: "Could not determine weakness yet." });
        }

        res.status(200).json({
            success: true,
            weakestSubject,
            accuracy: parseFloat(minAccuracy.toFixed(2))
        });

    } catch (error) {
        console.error("Weakness Analysis Error:", error);
        res.status(500).json({ success: false, message: "Server Error during analysis" });
    }
};
export const generateAIInsights = async (req, res) => {
    try {
        const { submissionId } = req.body;
        if (!submissionId) return res.status(400).json({ success: false, message: "Submission ID is required" });

        const submission = await TestSubmissionModel.findById(submissionId).lean();
        if (!submission) return res.status(404).json({ success: false, message: "Submission not found" });

        let test = await MockTestModel.findById(submission.testId).lean();
        if (!test) {
            test = await QuizModel.findById(submission.testId).lean();
            if (test) {
                test.type = 'quiz';
            }
        }

        const dataForAI = {
            testTitle: test.Title,
            totalScore: submission.totalScore,
            maxScore: submission.maxPossibleScore,
            accuracy: submission.accuracy,
            timeTaken: `${Math.floor(submission.timeTaken / 60)}m ${submission.timeTaken % 60}s`,
            sections: submission.sectionAnalysis.map(s => ({
                subject: s.subject,
                correct: s.correct,
                incorrect: s.incorrect,
                accuracy: s.accuracy
            }))
        };

        const prompt = `You are an expert exam performance analyzer for SarkariPath, an AI-powered platform for competitive exam aspirants.
        Based on the following test performance data, provide a deep analysis.
        
        Data: ${JSON.stringify(dataForAI)}

        Return exactly 3 strengths and 3 specific areas to improve.
        Focus on subject-wise performance and time management.

        Return ONLY a raw JSON object with this structure (no markdown):
        {
          "strengths": ["string", "string", "string"],
          "weaknesses": ["string", "string", "string"]
        }`;

        const result = await AI.generateContent(prompt);
        const responseText = result.response.candidates[0].content.parts[0].text;

        const jsonMatch = responseText.match(/\{[\s\S]*\}/);
        if (!jsonMatch) throw new Error("AI failed to return valid JSON");

        const insights = JSON.parse(jsonMatch[0]);

        res.status(200).json({ success: true, insights });
    } catch (error) {
        console.error("AI Insights Error:", error);
        res.status(500).json({ success: false, message: "AI Analysis failed" });
    }
};
