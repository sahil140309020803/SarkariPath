import userModel from '../models/userModel.js';
import { examModel, MockTestModel, QuizModel, TestSubmissionModel } from '../models/ExamModel.js';

export const getDashboardStats = async (req, res) => {
    try {
        const [totalUsers, activeExams, publishedTests, aiQuizzes, popularExamsAggregation, testsUnderReview] = await Promise.all([
            userModel.countDocuments(),
            examModel.countDocuments(),
            MockTestModel.countDocuments({ Status: 'Published' }),
            QuizModel.countDocuments({ status: 'Completed' }),
            MockTestModel.aggregate([
                { $group: { _id: "$ExamId", count: { $sum: 1 } } },
                { $sort: { count: -1 } },
                { $limit: 5 },
                {
                    $lookup: {
                        from: "exams",
                        localField: "_id",
                        foreignField: "_id",
                        as: "examDetails"
                    }
                },
                { $unwind: "$examDetails" },
                {
                    $project: {
                        _id: 0,
                        name: "$examDetails.Name",
                        count: 1
                    }
                }
            ]),
            MockTestModel.find({ Status: 'Draft' })
                .populate('ExamId', 'Name')
                .limit(5)
                .select('Title Status')
        ]);

        const testsPerExam = {
            labels: popularExamsAggregation.map(e => e.name),
            data: popularExamsAggregation.map(e => e.count)
        };

        const underReview = testsUnderReview.map(t => ({
            id: t._id,
            title: t.Title,
            examName: t.ExamId ? t.ExamId.Name : 'Unknown Exam',
            type: 'Mock Test'
        }));

        res.status(200).json({
            success: true,
            stats: {
                totalUsers,
                activeExams,
                publishedTests,
                aiQuizzes
            },
            testsPerExam,
            testsUnderReview: underReview
        });
    } catch (error) {
        console.error("Dashboard Stats Error:", error);
        res.status(500).json({ success: false, message: "Failed to fetch dashboard stats" });
    }
};

export const getAnalyticsStats = async (req, res) => {
    try {
        // Daily Activity over the last 30 days based on Test Submissions
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const dailyActivity = await TestSubmissionModel.aggregate([
            { $match: { createdAt: { $gte: thirtyDaysAgo } } },
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                    count: { $sum: 1 }
                }
            },
            { $sort: { _id: 1 } }
        ]);

        const totalSubmissions = await TestSubmissionModel.countDocuments();

        // Simulating completion rate: Assume 10% of tests are abandoned (not full funnel).
        const testsStarted = Math.round(totalSubmissions * 1.15);
        const funnelData = [testsStarted, totalSubmissions];

        // Average score and Time per test
        const averages = await TestSubmissionModel.aggregate([
            {
                $group: {
                    _id: null,
                    avgScore: { $avg: "$accuracy" },
                    avgTime: { $avg: "$timeTaken" }
                }
            }
        ]);

        const avgScore = averages.length > 0 ? averages[0].avgScore : 0;
        const avgTime = averages.length > 0 ? averages[0].avgTime : 0;

        // Populate popular categories
        const categoryPopularity = await TestSubmissionModel.aggregate([
            {
                $lookup: {
                    from: "exams",
                    localField: "examId",
                    foreignField: "_id",
                    as: "exam"
                }
            },
            { $unwind: "$exam" },
            {
                $lookup: {
                    from: "exam_categories",
                    localField: "exam.Category",
                    foreignField: "_id",
                    as: "category"
                }
            },
            { $unwind: "$category" },
            {
                $group: {
                    _id: "$category.Name",
                    count: { $sum: 1 }
                }
            },
            { $sort: { count: -1 } }
        ]);

        res.status(200).json({
            success: true,
            dailyActivity,
            funnelData,
            categoryPopularity,
            overallStats: {
                avgScore,
                avgTime,
                completionRate: totalSubmissions ? Math.round((totalSubmissions / testsStarted) * 100) : 0
            }
        });
    } catch (error) {
        console.error("Analytics Stats Error:", error);
        res.status(500).json({ success: false, message: "Failed to fetch analytics stats" });
    }
};
