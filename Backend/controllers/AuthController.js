import jwt from "jsonwebtoken";
import bcrypt from 'bcryptjs';
import axios from 'axios';
import userModel from "../models/userModel.js";
import adminModel from "../models/adminModel.js";
import { OAuth2Client } from 'google-auth-library';
import otpModel from "../models/otpModel.js";
import { sendOtpEmail, sendForgotPasswordOtpEmail } from "../utils/emailService.js";

const generateOtp = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const setAuthCookie = (res, req, token) => {
    const isProd = process.env.NODE_ENV === "production" || (req && req.headers['x-forwarded-proto'] === 'https');
    res.cookie('token', token, {
        httpOnly: true,
        secure: isProd,
        sameSite: isProd ? "none" : "lax",
        maxAge: 1 * 24 * 60 * 60 * 1000, // 1 day
    });
};

const adminLogin = async (req, res) => {
    const { adminID, password } = req.body;
    if (!adminID || !password) {
        return res.json({ success: false, message: "All Fields are required" });
    }
    try {
        const admin = await adminModel.findOne({ email: adminID });
        if (!admin) {
            return res.json({ success: false, message: "Admin not found" });
        }
        const isMatch = await bcrypt.compare(password, admin.password);
        if (!isMatch) {
            return res.json({ success: false, message: "Invalid Password" });
        }

        const token = jwt.sign({ email: adminID, role: 'admin' }, process.env.JWT_SECRET, { expiresIn: '1d' });
        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
            maxAge: 1 * 24 * 60 * 60 * 1000,
        });

        return res.json({ success: true, message: "Admin login successfully", token: token, role: 'admin' });

    } catch (err) {
        return res.json({ success: false, message: err.message });
    }
};

const register = async (req, res) => {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
        return res.json({ success: false, message: "All Fields are required" });
    }

    try {
        const existingUser = await userModel.findOne({ email });
        if (existingUser) {
            return res.json({ success: false, message: "User already exists" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const user = new userModel({ name, email, password: hashedPassword, emailVerified: false });

        // Generate unique username
        const baseUsername = email.split('@')[0].toLowerCase().replace(/[^a-z0-9]/g, '');
        const suffix = user._id.toString().slice(-6);
        let username = `${baseUsername}_${suffix}`;

        let isUnique = false;
        let suffixLength = 6;
        while (!isUnique) {
            const duplicate = await userModel.findOne({ username });
            if (!duplicate) {
                isUnique = true;
            } else {
                if (suffixLength === 6) {
                    suffixLength = 8;
                    const longSuffix = user._id.toString().slice(-8);
                    username = `${baseUsername}_${longSuffix}`;
                } else {
                    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
                    username = `${baseUsername}_${randomSuffix}`;
                }
            }
        }
        user.username = username;
        await user.save();

        // Delete previous OTP if any
        await otpModel.deleteOne({ email });

        // Generate 6-digit OTP
        const otp = generateOtp();

        // Store OTP
        const otpRecord = new otpModel({ email, otp });
        await otpRecord.save();

        // Send OTP using Nodemailer
        await sendOtpEmail(email, otp);

        return res.json({
            success: true,
            unverified: true,
            message: "OTP sent to your email. Please verify."
        });
    } catch (err) {
        return res.json({ success: false, message: err.message });
    }
}

const userLogin = async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.json({ success: false, message: "All Fields are required" });
    }

    try {
        // 1. Search Admin collection first
        const admin = await adminModel.findOne({ email });
        if (admin) {
            const isMatch = await bcrypt.compare(password, admin.password);
            if (!isMatch) {
                return res.json({ success: false, message: "Invalid Password" });
            }

            const token = jwt.sign({ email: email, role: 'admin' }, process.env.JWT_SECRET, { expiresIn: '1d' });
            setAuthCookie(res, req, token);

            return res.json({ success: true, message: "Admin login successfully", token: token, role: 'admin' });
        }

        // 2. Search User collection
        const user = await userModel.findOne({ email });
        if (!user) {
            return res.json({ success: false, message: "User not found" });
        }

        if (user.provider === 'google' || user.googleId) {
            return res.json({
                success: false,
                message: "This account is linked with Google. Please use Continue with Google to sign in."
            });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.json({ success: false, message: "Invalid Password" });
        }

        if (!user.emailVerified) {
            // Delete previous OTP if any
            await otpModel.deleteOne({ email });

            // Generate 6-digit OTP
            const otp = generateOtp();

            // Store OTP
            const otpRecord = new otpModel({ email, otp });
            await otpRecord.save();

            // Send OTP using Nodemailer
            await sendOtpEmail(email, otp);

            return res.json({ success: false, unverified: true, email: email, message: "Email is not verified. A new OTP has been sent." });
        }

        const token = jwt.sign({ email: email, role: 'user' }, process.env.JWT_SECRET, { expiresIn: '1d' });
        setAuthCookie(res, req, token);

        return res.json({ success: true, message: "User login successfully", token: token, role: 'user' });

    } catch (err) {
        return res.json({ success: false, message: err.message });
    }
}

const verifyOtp = async (req, res) => {
    const { email, otp } = req.body;
    if (!email || !otp) {
        return res.json({ success: false, message: "Email and OTP are required" });
    }

    try {
        const otpRecord = await otpModel.findOne({ email });
        if (!otpRecord) {
            return res.json({ success: false, message: "OTP expired or invalid" });
        }

        if (otpRecord.otp !== otp) {
            return res.json({ success: false, message: "Invalid OTP" });
        }

        const user = await userModel.findOne({ email });
        if (!user) {
            return res.json({ success: false, message: "User not found" });
        }

        user.emailVerified = true;
        user.verifiedAt = new Date();
        await user.save();

        await otpModel.deleteOne({ email });

        const token = jwt.sign({ email: email, role: 'user' }, process.env.JWT_SECRET, { expiresIn: '1d' });
        setAuthCookie(res, req, token);

        return res.json({
            success: true,
            message: "Email verified successfully",
            token: token,
            role: 'user',
            userDetails: {
                name: user.name,
                email: user.email,
                role: 'user'
            }
        });
    } catch (err) {
        return res.json({ success: false, message: err.message });
    }
}

const resendOtp = async (req, res) => {
    const { email } = req.body;
    if (!email) {
        return res.json({ success: false, message: "Email is required" });
    }

    try {
        const user = await userModel.findOne({ email });
        if (!user) {
            return res.json({ success: false, message: "User not found" });
        }
        if (user.emailVerified) {
            return res.json({ success: false, message: "Email is already verified" });
        }

        await otpModel.deleteOne({ email });

        const otp = generateOtp();
        const otpRecord = new otpModel({ email, otp });
        await otpRecord.save();

        await sendOtpEmail(email, otp);

        return res.json({ success: true, message: "OTP resent successfully" });
    } catch (err) {
        return res.json({ success: false, message: err.message });
    }
}

const logout = async (req, res) => {
    try {
        res.clearCookie('token', {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
        })

        return res.json({ success: true, message: "Logged Out Successfully" });
    } catch (err) {
        return res.json({ success: false, message: err.message });
    }
}

const isAuthenticated = async (req, res) => {
    try {
        return res.json({ success: true, message: "User is Logged In", email: req.body.userEmail, role: req.body.role });
    } catch (err) {
        return res.json({ success: false, message: err.message });
    }
}

const googleLogin = async (req, res) => {
    const { idToken, accessToken } = req.body;
    console.log(`[googleLogin] endpoint hit. idToken received: ${!!idToken}, accessToken received: ${!!accessToken}`);

    if (!idToken && !accessToken) {
        console.log("[googleLogin] Error: Both idToken and accessToken are missing in req.body");
        return res.json({ success: false, message: "Google authentication token (idToken or accessToken) is required" });
    }

    try {
        let googleId, email, name, picture, emailVerified;

        if (idToken) {
            console.log("[googleLogin] Verifying ID token...");
            const ticket = await client.verifyIdToken({
                idToken: idToken,
                audience: process.env.GOOGLE_CLIENT_ID,
            });
            const payload = ticket.getPayload();
            googleId = payload['sub'];
            email = payload['email'];
            name = payload['name'];
            picture = payload['picture'];
            emailVerified = payload['email_verified'];
        } else {
            console.log("[googleLogin] Fetching user info via Access Token...");
            const { data: profile } = await axios.get("https://www.googleapis.com/oauth2/v3/userinfo", {
                headers: { Authorization: `Bearer ${accessToken}` }
            });
            googleId = profile.sub;
            email = profile.email;
            name = profile.name;
            picture = profile.picture;
            emailVerified = profile.email_verified;
        }

        console.log(`[googleLogin] Resolved profile: sub=${googleId}, email=${email}, name=${name}, emailVerified=${emailVerified}`);

        if (!email) {
            console.log("[googleLogin] Error: Email is missing in profile payload");
            return res.json({ success: false, message: "Invalid profile payload: Email missing" });
        }

        // 1. Search Admin collection first
        const admin = await adminModel.findOne({ email });
        if (admin) {
            console.log(`[googleLogin] Admin found matching email: ${email}. ID=${admin._id}`);
            const token = jwt.sign({ email: admin.email, role: 'admin' }, process.env.JWT_SECRET, { expiresIn: '1d' });
            console.log(`[googleLogin] Generated Admin JWT token successfully.`);

            setAuthCookie(res, req, token);
            console.log("[googleLogin] Admin Cookie 'token' set successfully.");

            return res.json({
                success: true,
                message: "Admin Google login successful",
                token: token,
                role: 'admin'
            });
        }

        // 2. Search User collection
        let user = await userModel.findOne({ googleId });
        console.log(`[googleLogin] User lookup by googleId: ${user ? "Found: ID=" + user._id : "Not Found"}`);

        if (!user) {
            user = await userModel.findOne({ email });
            console.log(`[googleLogin] User lookup by email: ${user ? "Found: ID=" + user._id : "Not Found"}`);

            if (user) {
                console.log(`[googleLogin] Linking Google auth to existing account for email: ${email}`);
                user.googleId = googleId;
                user.provider = "google";
                if (!user.profilePicture) {
                    user.profilePicture = picture;
                }
                user.emailVerified = emailVerified;
                await user.save();
                console.log("[googleLogin] Linked user successfully saved.");
            } else {
                console.log(`[googleLogin] Creating new user account for name: ${name}, email: ${email}`);
                user = new userModel({
                    name,
                    email,
                    googleId,
                    provider: "google",
                    emailVerified,
                    profilePicture: picture
                });

                // Generate unique username
                const baseUsername = email.split('@')[0].toLowerCase().replace(/[^a-z0-9]/g, '');
                const suffix = user._id.toString().slice(-6);
                let username = `${baseUsername}_${suffix}`;

                let isUnique = false;
                let suffixLength = 6;
                while (!isUnique) {
                    const duplicate = await userModel.findOne({ username });
                    if (!duplicate) {
                        isUnique = true;
                    } else {
                        if (suffixLength === 6) {
                            suffixLength = 8;
                            const longSuffix = user._id.toString().slice(-8);
                            username = `${baseUsername}_${longSuffix}`;
                        } else {
                            const randomSuffix = Math.floor(1000 + Math.random() * 9000);
                            username = `${baseUsername}_${randomSuffix}`;
                        }
                    }
                }
                user.username = username;
                await user.save();
                console.log(`[googleLogin] New user successfully created: ID=${user._id}`);
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
                console.log(`[googleLogin] Updating profile information for user ID: ${user._id}`);
                await user.save();
                console.log("[googleLogin] User updates saved.");
            }
        }

        const token = jwt.sign({ email: user.email, role: 'user' }, process.env.JWT_SECRET, { expiresIn: '1d' });
        console.log(`[googleLogin] Generated JWT token successfully for email: ${user.email}`);

        setAuthCookie(res, req, token);
        console.log("[googleLogin] Cookie 'token' set successfully.");

        return res.json({
            success: true,
            message: "User Google login successful",
            token: token,
            role: 'user'
        });

    } catch (error) {
        console.error("[googleLogin] Google Auth Error:", error);
        return res.json({ success: false, message: "Google authentication failed: " + error.message });
    }
};

const forgotPassword = async (req, res) => {
    const { email } = req.body;
    if (!email) {
        return res.json({ success: false, message: "Email is required" });
    }

    try {
        const user = await userModel.findOne({ email });
        if (!user) {
            return res.json({ success: false, message: "No account found with this email address." });
        }

        if (user.provider === "google") {
            return res.json({
                success: false,
                message: "This account was created using Google Sign-In. Please use Continue with Google to access your account. Password reset is not available for Google accounts."
            });
        }

        // Generate 6-digit OTP
        const otp = generateOtp();

        // Delete previous OTP if any
        await otpModel.deleteOne({ email });

        // Store new OTP
        const otpRecord = new otpModel({ email, otp });
        await otpRecord.save();

        // Send OTP using Nodemailer
        await sendForgotPasswordOtpEmail(email, otp);

        return res.json({ success: true, message: "OTP sent to your email. Please verify." });
    } catch (err) {
        return res.json({ success: false, message: err.message });
    }
};

const verifyForgotPasswordOtp = async (req, res) => {
    const { email, otp } = req.body;
    if (!email || !otp) {
        return res.json({ success: false, message: "Email and OTP are required" });
    }

    try {
        const user = await userModel.findOne({ email });
        if (!user) {
            return res.json({ success: false, message: "No account found with this email address." });
        }

        if (user.provider === "google") {
            return res.json({ success: false, message: "Password reset is not available for Google accounts." });
        }

        const otpRecord = await otpModel.findOne({ email });
        if (!otpRecord) {
            return res.json({ success: false, message: "OTP has expired." });
        }

        if (otpRecord.otp !== otp) {
            return res.json({ success: false, message: "Invalid OTP." });
        }

        // Check expiration
        const expiryTime = 5 * 60 * 1000;
        const timeElapsed = Date.now() - new Date(otpRecord.createdAt).getTime();
        if (timeElapsed > expiryTime) {
            await otpModel.deleteOne({ email });
            return res.json({ success: false, message: "OTP has expired." });
        }

        return res.json({ success: true, message: "OTP verified. Please reset your password." });
    } catch (err) {
        return res.json({ success: false, message: err.message });
    }
};

const resetPassword = async (req, res) => {
    const { email, otp, password } = req.body;
    if (!email || !otp || !password) {
        return res.json({ success: false, message: "All fields are required" });
    }

    try {
        const user = await userModel.findOne({ email });
        if (!user) {
            return res.json({ success: false, message: "No account found with this email address." });
        }

        if (user.provider === "google") {
            return res.json({ success: false, message: "Password reset is not available for Google accounts." });
        }

        const otpRecord = await otpModel.findOne({ email });
        if (!otpRecord) {
            return res.json({ success: false, message: "OTP has expired." });
        }

        if (otpRecord.otp !== otp) {
            return res.json({ success: false, message: "Invalid OTP." });
        }

        // Check expiration
        const expiryTime = 5 * 60 * 1000;
        const timeElapsed = Date.now() - new Date(otpRecord.createdAt).getTime();
        if (timeElapsed > expiryTime) {
            await otpModel.deleteOne({ email });
            return res.json({ success: false, message: "OTP has expired." });
        }

        // Hash new password using bcrypt
        const hashedPassword = await bcrypt.hash(password, 10);

        // Update User password
        user.password = hashedPassword;
        await user.save();

        // Delete used OTP
        await otpModel.deleteOne({ email });

        return res.json({ success: true, message: "Password updated successfully." });
    } catch (err) {
        return res.json({ success: false, message: err.message });
    }
};

const updateProfile = async (req, res) => {
    const { userEmail, name, username } = req.body;

    if (!name || !username) {
        return res.json({ success: false, message: "Name and username are required." });
    }

    const cleanUsername = username.toLowerCase().trim().replace(/[^a-z0-9_]/g, '');
    if (cleanUsername !== username) {
        return res.json({ success: false, message: "Username can only contain letters, numbers, and underscores." });
    }

    try {
        const user = await userModel.findOne({ email: userEmail });
        if (!user) {
            return res.json({ success: false, message: "User not found." });
        }

        if (cleanUsername !== user.username) {
            const existingUsername = await userModel.findOne({ username: cleanUsername });
            if (existingUsername) {
                return res.json({ success: false, message: "Username already exists. Please choose a different one." });
            }
        }

        user.name = name;
        user.username = cleanUsername;
        await user.save();

        return res.json({
            success: true,
            message: "Profile updated successfully.",
            user: {
                name: user.name,
                username: user.username,
                email: user.email
            }
        });
    } catch (err) {
        return res.json({ success: false, message: err.message });
    }
};

export {
    adminLogin,
    register,
    userLogin,
    logout,
    isAuthenticated,
    googleLogin,
    verifyOtp,
    resendOtp,
    forgotPassword,
    verifyForgotPasswordOtp,
    resetPassword,
    updateProfile
};
