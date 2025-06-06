import express from 'express';
import rateLimit from "express-rate-limit";
import { adminLogin, adminLogout, getAdminData } from "../controllers/adminController.js";
import { verifyAdmin } from '../middleware/authMiddleware.js';

// Rate limiter: max 5 requests per minute per IP
const loginLimiter = rateLimit({
    windowMs: 1 * 60 * 1000,
    max: 50,
    message: "Too many login attempts. Please try again after 1 minute."
})

const adminRouter = express.Router();
adminRouter.post('/login', loginLimiter , adminLogin);
adminRouter.post('/logout', loginLimiter , adminLogout);
adminRouter.get('/deshboard', verifyAdmin , getAdminData);

export default adminRouter;