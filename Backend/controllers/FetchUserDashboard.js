import mongoose from 'mongoose';
import userModel from '../models/userModel.js';
import { TestSubmissionModel, QuestionModel, examModel } from '../models/ExamModel.js';

export const getUserDashboardData = async (req, res) => {
    const { userId } = req.params;

    try {
        let user;
        if (mongoose.Types.ObjectId.isValid(userId)) {
            user = await userModel.findById(userId).select('-password');
        }
        if (!user) {
            user = await userModel.findOne({ email: userId }).select('-password');
        }
        if (!user) {
            user = await userModel.findOne({ email: { $regex: userId, $options: 'i' } }).select('-password');
        }

        if (!user) {
            console.log("❌ User not found in DB");
            return res.status(404).json({ message: "User not found" });
        }

        console.log(`✅ Found User: ${user.name} (ID: ${user._id})`);

        const possibleUserIds = [
            user._id,
            user._id.toString(),
            user.email
        ];

        const [totalQuestionsStats, submissionAnalytics] = await Promise.all([
            QuestionModel.aggregate([
                { $group: { _id: "$Difficulty", count: { $sum: 1 } } }
            ]),

            TestSubmissionModel.aggregate([
                { 
                    $match: { 
                        userId: { $in: possibleUserIds }
                    } 
                },
                {
                    $facet: {
                        "subjectStats": [
                            { $unwind: "$sectionAnalysis" },
                            { 
                                $group: {
                                    _id: "$sectionAnalysis.subject",
                                    avgAccuracy: { $avg: "$sectionAnalysis.accuracy" },
                                    totalAttempts: { $sum: 1 }
                                }
                            },
                            { $sort: { avgAccuracy: -1 } }
                        ],
                        "dailyActivity": [
                            { 
                                $group: {
                                    _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                                    count: { $sum: 1 }
                                }
                            },
                            { $sort: { _id: 1 } }
                        ],
                        "solvedStats": [
                            { $unwind: "$responses" },
                            { $match: { "responses.status": "correct" } },
                            { 
                                $group: { 
                                    _id: "$responses.questionId",
                                    difficulty: { $first: "unknown" }
                                } 
                            },
                            {
                                $lookup: {
                                    from: "questions",
                                    localField: "_id",
                                    foreignField: "_id",
                                    as: "qDetails"
                                }
                            },
                            { $unwind: "$qDetails" },
                            {
                                $group: {
                                    _id: "$qDetails.Difficulty",
                                    count: { $sum: 1 }
                                }
                            }
                        ],
                        "globalStats": [
                            {
                                $group: {
                                    _id: null,
                                    totalTests: { $sum: 1 },
                                    totalQuestionsSolved: { $sum: "$correctCount" },
                                    avgAccuracy: { $avg: "$accuracy" }
                                }
                            }
                        ]
                    }
                }
            ])
        ]);

        const analytics = submissionAnalytics[0];

        const totalMap = {};
        totalQuestionsStats.forEach(item => totalMap[item._id] = item.count);

        const solvedMap = {};
        if (analytics.solvedStats) {
            analytics.solvedStats.forEach(item => solvedMap[item._id] = item.count);
        }

        const solvedProgress = {
            totalSolved: (solvedMap['Easy']||0) + (solvedMap['Medium']||0) + (solvedMap['Hard']||0),
            totalQuestions: (totalMap['Easy']||0) + (totalMap['Medium']||0) + (totalMap['Hard']||0),
            details: {
                easy: { count: solvedMap['Easy'] || 0, total: totalMap['Easy'] || 0 },
                medium: { count: solvedMap['Medium'] || 0, total: totalMap['Medium'] || 0 },
                hard: { count: solvedMap['Hard'] || 0, total: totalMap['Hard'] || 0 },
            }
        };

        const subjectMastery = {
            subjects: (analytics.subjectStats || []).slice(0, 3).map(sub => ({
                subject: sub._id,
                accuracy: Math.round(sub.avgAccuracy)
            })),
            focusArea: (analytics.subjectStats && analytics.subjectStats.length > 0)
                ? analytics.subjectStats.sort((a,b) => a.avgAccuracy - b.avgAccuracy)[0]._id 
                : "None"
        };

        const heatmapData = (analytics.dailyActivity || []).map(day => ({
            date: day._id,
            count: day.count,
            intensity: day.count >= 4 ? 4 : day.count
        }));
        
        const totalSubmissions = heatmapData.reduce((sum, day) => sum + day.count, 0);

        const history = user.testHistory || [];
        
        const uniqueExamIds = [...new Set(
            history
                .map(h => h.examId)
                .filter(id => id && mongoose.Types.ObjectId.isValid(id))
        )];

        const exams = await examModel.find({ _id: { $in: uniqueExamIds } }).select('Name');
        
        const examMap = {};
        exams.forEach(exam => {
            examMap[exam._id.toString()] = exam.Name;
        });

        const recentActivity = history
            .sort((a, b) => new Date(b.attemptedAt) - new Date(a.attemptedAt))
            .slice(0, 5)
            .map(test => {
                const examName = examMap[test.examId?.toString()] || "Custom Test";
                return {
                    title: `${examName} - ${test.title}`, 
                    qs: `${test.score}/${test.maxPossibleScore} Marks`,
                    time: test.attemptedAt,
                    score: `${Math.round(test.accuracy)}%`,
                    status: test.status
                };
            });
        
        const globalParams = analytics.globalStats[0] || { totalTests: 0, totalQuestionsSolved: 0, avgAccuracy: 0 };

        // Current Streak calculation
        let currentStreak = 0;
        let maxStreak = 0;
        let lastDate = null;
        heatmapData.sort((a, b) => new Date(a.date) - new Date(b.date));
        heatmapData.forEach(day => {
            const dayDate = new Date(day.date);
            if (!lastDate) {
                lastDate = dayDate;
                currentStreak = 1;
            } else {
                const diffTime = dayDate - lastDate;
                const diffDays = diffTime / (1000 * 60 * 60 * 24);
                if (diffDays === 1) {
                    currentStreak++;
                } else if (diffDays > 1) {
                    currentStreak = 1;
                }
            }
            lastDate = dayDate;
            maxStreak = Math.max(maxStreak, currentStreak);
        });

        
        res.status(200).json({
            user: {
                name: user.name,
                handle: user.email.split('@')[0],
                rank: '-',
                rankTotal: '-'
            },
            communityStats: {
                tests: globalParams.totalTests,
                questions: globalParams.totalQuestionsSolved,
                avgScore: Math.round(globalParams.avgAccuracy * 10) / 10,
                badges: 6
            },
            solvedProgress,
            subjectMastery,
            currentStreak,
            heatmap: {
                data: heatmapData,
                totalSubmissions,
                activeDays: heatmapData.length,
                maxStreak: maxStreak
            },
            recentActivity
        });

    } catch (error) {
        console.error("❌ API Error:", error);
        res.status(500).json({ message: "Server Error", error: error.message });
    }
};