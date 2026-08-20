import express from "express";
import { 
    forgotPassword, login, 
    logOut,
    resendVerificationCode,
    resetPassword, 
    signup, 
    verifyEmail } from "../controllers/auth.controller.js";
import rateLimit from "../middleware/rateLimit.js";

const router = express.Router();

// Rate limit auth endpoints: max 10 requests per minute
const authRateLimit = rateLimit(10, 60 * 1000);

router.post("/signup", authRateLimit, signup);
router.post("/login", authRateLimit, login);
router.post("/logout", logOut);

router.post("/verify-email", authRateLimit, verifyEmail);
router.post("/resend-verification-code", authRateLimit, resendVerificationCode);
router.post("/forgot-password", authRateLimit, forgotPassword);
router.post("/reset-password/:token", authRateLimit, resetPassword);


export default router;