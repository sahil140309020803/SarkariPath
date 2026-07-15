import jwt from "jsonwebtoken";


export const isAuth = async (req, res, next) => {
    const { token } = req.cookies;
    console.log(`[isAuth] Token present: ${!!token}`);

    if (!token) {
        console.log("[isAuth] No token in cookies. Denied.");
        return res.json({ message: "You are not authenticated, Login Again" });
    }
    try {
        const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
        req.body = req.body || {};      // My Biggest Error that I have not recognized!!
        req.body.userEmail = decodedToken.email;
        req.body.role = decodedToken.role;
        console.log(`[isAuth] Token verified for email: ${decodedToken.email}, role: ${decodedToken.role}`);
        next();
    } catch (err) {
        console.log(`[isAuth] Verification failed: ${err.message}`);
        res.json({ success: false, message: "User is not logged in", err: err.message });
    }
}