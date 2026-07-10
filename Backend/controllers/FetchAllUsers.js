import userModel from "../models/userModel.js";
import userStatisticsModel from "../models/userStatisticsModel.js";

const fetchAllUsers = async (req, res) => {
    try {
        const users = await userModel.find({}, '-password').lean(); // Exclude passwords
        const userIds = users.map(u => u._id);

        const allStats = await userStatisticsModel.find({ userId: { $in: userIds } }).lean();
        const statsMap = {};
        allStats.forEach(s => {
            statsMap[s.userId.toString()] = s.testsAttempted;
        });

        const usersWithCounts = users.map(user => ({
            ...user,
            testsAttempted: statsMap[user._id.toString()] || 0,
            id: user._id
        }));
        res.status(200).json({ success: true, users: usersWithCounts });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export default fetchAllUsers;
