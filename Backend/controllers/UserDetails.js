import userModel from "../models/userModel.js";
import adminModel from "../models/adminModel.js";

const userDetails = async(req, res) => {
    const {userEmail, role} = req.body;
    try {
        if(role === 'user') {
            const user = await userModel.findOne({email:userEmail});
            if(user) {
                res.status(200).json({success: true, message: "User details fetched successfully", details: {name: user.name, email: user.email, role: 'user'}});
            } else {
                res.status(404).json({success: false, message: "User not found"});
            }
        } else if(role === 'admin') {
            const admin = await adminModel.findOne({email:userEmail});
            if(admin) {
                res.status(200).json({success: true, message: "Admin details fetched successfully", details: {name: admin.name, email: admin.email, role: 'admin'}});
            } else {
                res.status(404).json({success: false, message: "Admin not found"});
            }
        }
    } catch(err) {
        res.status(500).json({success: false, message: err.message});
    }
};

export default userDetails;