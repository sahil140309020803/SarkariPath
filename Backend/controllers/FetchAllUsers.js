import userModel from "../models/userModel.js";

const fetchAllUsers = async (req, res) => {
    try {
        const users = await userModel.find({}, '-password').lean(); // Exclude passwords
        const usersWithCounts = users.map(user => ({
            ...user,
            testsAttempted: user.testHistory ? user.testHistory.length : 0,
            id: user._id
        }));
        res.status(200).json({ success: true, users: usersWithCounts });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export default fetchAllUsers;
