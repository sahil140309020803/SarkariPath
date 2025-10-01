import jwt from "jsonwebtoken";

export const isAuth = async (req, res, next) => {
    const {token} = req.cookies;
    if(!token) {
        return res.json({message: "You are not authenticated, Login Again"});
    } 
    try {
        const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
        req.body = req.body || {};      // My Biggest Error that I have not recognized!!
        req.body.userEmail = decodedToken.email;
        req.body.role = decodedToken.role;
        next();
    } catch(err) {
        res.json({ success: false, message: "User is not logged in", err: err.message });
    }
}