import jwt from "jsonwebtoken";
import bcrypt from 'bcryptjs';
import userModel from "../models/userModel.js";
import adminModel from "../models/adminModel.js";

const adminLogin = async(req, res) => {
    const { adminID, password } = req.body;
    if(!adminID || !password) {
        return res.json({success: false, message: "All Fields are required"});
    }
    try {
        const admin = await adminModel.findOne({email: adminID});
        if(!admin) {
            return res.json({success: false, message: "Admin not found"});
        }
        const isMatch = await bcrypt.compare(password, admin.password);
        if(!isMatch) {
            return res.json({success: false, message: "Invalid Password"});
        }

        const token = jwt.sign({email: adminID, role: 'admin'}, process.env.JWT_SECRET, {expiresIn: '1d'});
        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: process.env.NODE_ENV === "production" ? "none": "strict",
            maxAge: 1 * 24 * 60 * 60 * 1000,
        });

        return res.json({success:true, message: "Admin login successfully", token: token, role: 'admin'});

    } catch(err) {
        return res.json({success: false, message: err.message});
    }
};

const register = async (req, res) => {
    const {name, email, password} = req.body;
    if(!name || !email || !password) {
        return res.json({success: false, message: "All Fields are required"});
    }

    try {
        const existingUser = await userModel.findOne({email});
        if(existingUser) {
            return res.json({success: false, message: "User already exists"});
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await new userModel({name, email, password:hashedPassword});
        await user.save();

        const token = jwt.sign({email: email, role: 'user'}, process.env.JWT_SECRET, {expiresIn: '1d'});
        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: process.env.NODE_ENV === "production" ? "none": "strict",
            maxAge: 1 * 24 * 60 * 60 * 1000, // milliseconds i.e 1 day
        })

        return res.json({success: true, message: "User created successfully", token: token, role: 'user'});
    } catch(err) {
        return res.json({success: false, message: err.message});
    }
}

const userLogin = async (req, res) => {
    const {email, password} = req.body;
    if(!email || !password) {
        return res.json({success: false, message: "All Fields are required"});
    }

    try {
        const user = await userModel.findOne({email});
        if(!user) {
            return res.json({success: false, message: "User not found"});
        }
        const isMatch = await bcrypt.compare(password, user.password);
        if(!isMatch) {
            return res.json({success: false, message: "Invalid Password"});
        }

        const token = jwt.sign({email: email, role: 'user'}, process.env.JWT_SECRET, {expiresIn: '1d'});
        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: process.env.NODE_ENV === "production" ? "none": "strict",
            maxAge: 1 * 24 * 60 * 60 * 1000,
        });

        return res.json({success:true, message: "User login successfully", token: token, role: 'user'});

    } catch(err) {
        return res.json({success: false, message: err.message});
    }
}

const logout = async (req, res) => {
    try {
        res.clearCookie('token', {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: process.env.NODE_ENV === "production" ? "none": "strict",
        })

        return res.json({success: true, message: "Logged Out Successfully"});
    } catch(err) {
        return res.json({success: false, message: err.message});
    }
}

const isAuthenticated = async(req, res) => {
    try {
        return res.json({success:true, message: "User is Logged In", email: req.body.userEmail, role: req.body.role});
    } catch(err) {
        return res.json({success: false, message: err.message});
    }
}

export {
    adminLogin,
    register,
    userLogin,
    logout,
    isAuthenticated
};
