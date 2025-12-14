import userModel from "../models/userModel.js";

const fetchAllUsers = async (req, res) => {
    try {
        const users = await userModel.find({}, '-password'); // Exclude passwords
        res.status(200).json({ success: true, users });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export default fetchAllUsers;
