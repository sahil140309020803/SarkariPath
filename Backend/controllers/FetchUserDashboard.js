import mongoose from 'mongoose';
import userModel from '../models/userModel.js';
import userStatisticsModel from '../models/userStatisticsModel.js';
import { TestSubmissionModel, examModel, MockTestModel, QuizModel } from '../models/ExamModel.js';

export const getUserDashboardData = async (req, res) => {
    const { userEmail } = req.body;

    try {
        let user;
        if (mongoose.Types.ObjectId.isValid(userEmail)) {
            user = await userModel.findById(userEmail).select('name email');
        }
        if (!user) {
            user = await userModel.findOne({ email: userEmail }).select('name email');
        }
        if (!user) {
            user = await userModel.findOne({ email: { $regex: userEmail, $options: 'i' } }).select('name email');
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

        // Fetch recent 10 test submissions
        const possibleUserIds = [
            user._id.toString(),
            user.email
        ];
        const recentSubmissions = await TestSubmissionModel.find({
            userId: { $in: possibleUserIds }
        })
            .sort({ createdAt: -1 })
            .limit(10)
            .lean();

        const testIds = recentSubmissions.map(sub => sub.testId).filter(Boolean);
        const [mockTestsFound, quizzesFound] = await Promise.all([
            MockTestModel.find({ _id: { $in: testIds } }).select('Title').lean(),
            QuizModel.find({ _id: { $in: testIds } }).select('Title').lean()
        ]);

        const titleMap = {};
        mockTestsFound.forEach(t => titleMap[t._id.toString()] = t.Title);
        quizzesFound.forEach(t => titleMap[t._id.toString()] = t.Title);

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
            const testTitle = titleMap[test.testId?.toString()] || 'Mock Test';
            return {
                id: test._id,
                title: `${examName} - ${testTitle}`,
                score: `${test.totalScore}/${test.maxPossibleScore} Marks`,
                time: test.createdAt,
                percentage: ((test.totalScore / test.maxPossibleScore) * 100).toFixed(2),
                status: 'Completed'
            };
        });

        const syllabusProgressList = [];
        if (stats.syllabusProgress && stats.syllabusProgress.length > 0) {
            const examIds = stats.syllabusProgress.map(p => p.examId);
            const examsData = await examModel.find({ _id: { $in: examIds } }).select('Name Topics').lean();
            const examMap = new Map(examsData.map(e => [e._id.toString(), e]));

            for (const entry of stats.syllabusProgress) {
                const examDoc = examMap.get(entry.examId.toString());
                if (!examDoc) continue;

                // Count total topics in the exam
                let totalTopics = 0;
                if (examDoc.Topics && typeof examDoc.Topics === 'object') {
                    for (const topicsList of Object.values(examDoc.Topics)) {
                        if (Array.isArray(topicsList)) {
                            totalTopics += topicsList.length;
                        }
                    }
                }

                // Count completed topics in stats.syllabusProgress entry
                let completedTopics = 0;
                if (entry.progress && Array.isArray(entry.progress)) {
                    for (const subjectProgress of entry.progress) {
                        if (subjectProgress.completedTopics && Array.isArray(subjectProgress.completedTopics)) {
                            completedTopics += subjectProgress.completedTopics.length;
                        }
                    }
                }

                // Calculate percentage
                const percentage = totalTopics > 0 ? Math.round((completedTopics / totalTopics) * 100) : 0;

                syllabusProgressList.push({
                    examId: entry.examId,
                    examName: entry.examName,
                    percentage: Math.min(100, percentage)
                });
            }
        }

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
            recentActivity,
            syllabusProgress: syllabusProgressList
        });

    } catch (error) {
        console.error("❌ API Error:", error);
        res.status(500).json({ message: "Server Error", error: error.message });
    }
};