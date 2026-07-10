import mongoose from 'mongoose';
import userModel from '../models/userModel.js';
import userStatisticsModel from '../models/userStatisticsModel.js';
import { TestSubmissionModel, examModel } from '../models/ExamModel.js';

export const getUserDashboardData = async (req, res) => {
    const { userId } = req.params;

    try {
        let user;
        if (mongoose.Types.ObjectId.isValid(userId)) {
            user = await userModel.findById(userId).select('name email');
        }
        if (!user) {
            user = await userModel.findOne({ email: userId }).select('name email');
        }
        if (!user) {
            user = await userModel.findOne({ email: { $regex: userId, $options: 'i' } }).select('name email');
        }

        if (!user) {
            console.log("❌ User not found in DB");
            return res.status(404).json({ message: "User not found" });
        }

        console.log(`✅ Found User: ${user.name} (ID: ${user._id})`);

        // Get or instantiate UserStatistics
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
            await stats.save();
        }

        // Fetch recent 5 test submissions
        const possibleUserIds = [
            user._id.toString(),
            user.email
        ];
        const recentSubmissions = await TestSubmissionModel.find({ 
            userId: { $in: possibleUserIds } 
        })
        .populate('testId', 'Title')
        .sort({ createdAt: -1 })
        .limit(5)
        .lean();

        // Get unique exams mapped to names for recent activity title formatting
        const uniqueExamIds = [...new Set(
            recentSubmissions
                .map(sub => sub.examId)
                .filter(id => id && mongoose.Types.ObjectId.isValid(id))
        )];

        const exams = await examModel.find({ _id: { $in: uniqueExamIds } }).select('Name');
        const examMap = {};
        exams.forEach(exam => {
            examMap[exam._id.toString()] = exam.Name;
        });

        const recentActivity = recentSubmissions.map(test => {
            const examName = examMap[test.examId?.toString()] || "Custom Test";
            return {
                title: `${examName} - ${test.testId?.Title || 'Mock Test'}`, 
                qs: `${test.correctCount}/${test.maxPossibleScore} Marks`,
                time: test.createdAt,
                score: `${Math.round(test.accuracy)}%`,
                status: 'Completed'
            };
        });

        return res.status(200).json({
            success: true,
            user: {
                name: user.name,
                handle: user.email.split('@')[0],
                email: user.email
            },
            testsAttempted: stats.testsAttempted,
            averageScore: Math.round(stats.averageScore * 10) / 10,
            currentStreak: stats.currentStreak,
            longestStreak: stats.longestStreak,
            dailyStatistics: stats.dailyStatistics,
            recentActivity
        });

    } catch (error) {
        console.error("❌ API Error:", error);
        res.status(500).json({ message: "Server Error", error: error.message });
    }
};