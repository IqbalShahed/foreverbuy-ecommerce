import express from "express";
import rateLimit from "express-rate-limit";
import { chatWithAI, getRecommendations, trackUserActivity } from "../controllers/aiController.js";
import { attachUserIfPresent, verifyUser } from "../middleware/authMiddleware.js";

const aiRouter = express.Router();

const aiRateLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 40,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        success: false,
        message: "Too many assistant requests. Please try again in a few minutes.",
    },
});

const recommendationRateLimiter = rateLimit({
    windowMs: 5 * 60 * 1000,
    max: 60,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        success: false,
        message: "Too many recommendation requests. Please try again shortly.",
    },
});

aiRouter.post("/chat", aiRateLimiter, attachUserIfPresent, chatWithAI);
aiRouter.get("/recommendations", recommendationRateLimiter, attachUserIfPresent, getRecommendations);
aiRouter.post("/activity", verifyUser, trackUserActivity);

export default aiRouter;
