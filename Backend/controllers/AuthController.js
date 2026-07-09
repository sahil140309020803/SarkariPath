import jwt from "jsonwebtoken";
import bcrypt from 'bcryptjs';
import userModel from "../models/userModel.js";
import adminModel from "../models/adminModel.js";
import { OAuth2Client } from 'google-auth-library';
import fs from 'fs';

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

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
        // 1. Search Admin collection first
        const admin = await adminModel.findOne({email});
        if (admin) {
            const isMatch = await bcrypt.compare(password, admin.password);
            if(!isMatch) {
                return res.json({success: false, message: "Invalid Password"});
            }

            const token = jwt.sign({email: email, role: 'admin'}, process.env.JWT_SECRET, {expiresIn: '1d'});
            res.cookie('token', token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                sameSite: process.env.NODE_ENV === "production" ? "none": "strict",
                maxAge: 1 * 24 * 60 * 60 * 1000,
            });

            return res.json({success:true, message: "Admin login successfully", token: token, role: 'admin'});
        }

        // 2. Search User collection
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

const googleLogin = async (req, res) => {
    const logPath = "d:/Projects/SarkariPath/Backend/debug.log";
    const log = (msg) => {
        try {
            fs.appendFileSync(logPath, `[${new Date().toISOString()}] [googleLogin] ${msg}\n`);
        } catch (e) {
            console.error(e);
        }
    };

    const { idToken } = req.body;
    log(`googleLogin endpoint hit. idToken received: ${!!idToken}`);

    if (!idToken) {
        log("Error: idToken is missing in req.body");
        return res.json({ success: false, message: "Google ID Token is required" });
    }

    try {
        log("Verifying ID token...");
        const ticket = await client.verifyIdToken({
            idToken: idToken,
            audience: process.env.GOOGLE_CLIENT_ID,
        });
        const payload = ticket.getPayload();
        
        const googleId = payload['sub'];
        const email = payload['email'];
        const name = payload['name'];
        const picture = payload['picture'];
        const emailVerified = payload['email_verified'];

        log(`Token payload: sub=${googleId}, email=${email}, name=${name}, emailVerified=${emailVerified}`);

        if (!email) {
            log("Error: Email is missing in token payload");
            return res.json({ success: false, message: "Invalid token payload: Email missing" });
        }

        // 1. Search Admin collection first
        const admin = await adminModel.findOne({ email });
        if (admin) {
            log(`Admin found matching email: ${email}. ID=${admin._id}`);
            const token = jwt.sign({ email: admin.email, role: 'admin' }, process.env.JWT_SECRET, { expiresIn: '1d' });
            log(`Generated Admin JWT token successfully. Signing email: ${admin.email}`);

            res.cookie('token', token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
                maxAge: 1 * 24 * 60 * 60 * 1000, // 1 day
            });
            log("Admin Cookie 'token' set successfully via res.cookie");

            return res.json({
                success: true,
                message: "Admin Google login successful",
                token: token,
                role: 'admin'
            });
        }

        // 2. Search User collection
        let user = await userModel.findOne({ googleId });
        log(`User lookup by googleId: ${user ? "Found: ID=" + user._id : "Not Found"}`);

        if (!user) {
            user = await userModel.findOne({ email });
            log(`User lookup by email: ${user ? "Found: ID=" + user._id : "Not Found"}`);

            if (user) {
                log(`Linking Google auth to existing account for email: ${email}`);
                user.googleId = googleId;
                user.provider = "google";
                if (!user.profilePicture) {
                    user.profilePicture = picture;
                }
                user.emailVerified = emailVerified;
                await user.save();
                log("Linked user successfully saved.");
            } else {
                log(`Creating new user account for name: ${name}, email: ${email}`);
                user = new userModel({
                    name,
                    email,
                    googleId,
                    provider: "google",
                    emailVerified,
                    profilePicture: picture
                });
                await user.save();
                log(`New user successfully created: ID=${user._id}`);
            }
        } else {
            let isModified = false;
            if (user.email !== email) {
                user.email = email;
                isModified = true;
            }
            if (!user.profilePicture && picture) {
                user.profilePicture = picture;
                isModified = true;
            }
            if (user.emailVerified !== emailVerified) {
                user.emailVerified = emailVerified;
                isModified = true;
            }
            if (isModified) {
                log(`Updating profile information for user ID: ${user._id}`);
                await user.save();
                log("User updates saved.");
            }
        }

        const token = jwt.sign({ email: user.email, role: 'user' }, process.env.JWT_SECRET, { expiresIn: '1d' });
        log(`Generated JWT token successfully. Signing email: ${user.email}`);

        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
            maxAge: 1 * 24 * 60 * 60 * 1000, // 1 day
        });
        log("Cookie 'token' set successfully via res.cookie");

        return res.json({
            success: true,
            message: "User Google login successful",
            token: token,
            role: 'user'
        });

    } catch (error) {
        log(`Google Auth Error: ${error.stack || error.message}`);
        console.error("Google Auth Error:", error);
        return res.json({ success: false, message: "Google authentication failed: " + error.message });
    }
};

export {
    adminLogin,
    register,
    userLogin,
    logout,
    isAuthenticated,
    googleLogin
};
