import { MockTestModel, TestSubmissionModel } from "../models/ExamModel.js";

export const getTestAnalysis = async (req, res) => {
    try {
        const { submissionId } = req.params;

        const submission = await TestSubmissionModel.findById(submissionId).lean();

        if (!submission) {
            return res.status(404).json({ success: false, message: "Submission not found" });
        }

        const test = await MockTestModel.findById(submission.testId)
            .populate('Questions')
            .populate('ExamId')
            .lean();

        if (!test) {
            return res.status(404).json({ success: false, message: "Test details not found" });
        }

        const totalParticipants = await TestSubmissionModel.countDocuments({ 
            testId: submission.testId 
        });

        const betterScorers = await TestSubmissionModel.countDocuments({ 
            testId: submission.testId, 
            totalScore: { $gt: submission.totalScore }
        });

        const rank = betterScorers + 1;
        const percentile = totalParticipants > 1 
            ? ((totalParticipants - rank) / totalParticipants) * 100 
            : 100;

        submission.globalRank = rank;
        submission.totalParticipants = totalParticipants;
        submission.percentile = parseFloat(percentile.toFixed(2));
        
        submission.attempts = await TestSubmissionModel.countDocuments({ 
            userId: submission.userId, 
            testId: submission.testId 
        });
        submission.attemptedAt = submission.createdAt.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });

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