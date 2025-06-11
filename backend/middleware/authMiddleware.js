import jwt from "jsonwebtoken";
import User from "../models/userModel.js";

export const verifyAdmin = (req, res, next) => {
    const token = req.cookies.admin_token;
    if (!token) {
        return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (err) {
        return res.status(401).json({ success: false, message: "Invalid or expired token" });
    }
};

export const verifyUser = async (req, res, next) => {
    try {
        const token = req.cookies.user_token;
        if (!token) {
            return res.status(401).json({ success: false, message: "Unauthorized: No token provided" });
        }
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id);
        if (!user) {
            return res.status(401).json({ success: false, message: "Unauthorized: User not found" });
        }
        req.user = user;
        next();
    } catch (error) {
        console.error('Auth middleware error:', error);
        return res.status(401).json({ success: false, message: 'Invalid or expired token' });
    }
}