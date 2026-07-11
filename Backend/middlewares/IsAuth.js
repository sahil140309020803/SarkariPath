import jwt from "jsonwebtoken";
import fs from "fs";
import path from "path";

export const isAuth = async (req, res, next) => {
    const logPath = "d:/Projects/SarkariPath/Backend/debug.log";
    const log = (msg) => {
        try {
            fs.appendFileSync(logPath, `[${new Date().toISOString()}] [isAuth] ${msg}\n`);
        } catch (e) {
            console.error(e);
        }
    };

    const { token } = req.cookies;
    log(`Cookies: ${JSON.stringify(req.cookies)}`);
    log(`Token present: ${!!token}`);

    if (!token) {
        log("No token in cookies. Denied.");
        return res.json({ message: "You are not authenticated, Login Again" });
    }
    try {
        const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
        req.body = req.body || {};      // My Biggest Error that I have not recognized!!
        req.body.userEmail = decodedToken.email;
        req.body.role = decodedToken.role;
        log(`Token verified for email: ${decodedToken.email}, role: ${decodedToken.role}`);
        next();
    } catch (err) {
        log(`Verification failed: ${err.message}`);
        res.json({ success: false, message: "User is not logged in", err: err.message });
    }
}