import { Router} from "express";
import AuthController from "../controllers/auth.controller";
import {userSignup, userLogin, forgotPassword, verifyOtp, resetPassword} from "../middlewares/validators/auth.validation";
import passport from "passport";

const router = Router();
const authController = new AuthController();

// Signup
router.post("/signup", userSignup, authController.userSignup)

// Login
router.post("/login", userLogin, authController.userLogin)

// Forgot password - sends OTP (no authentication required)
router.post("/forgot-password", forgotPassword, authController.forgotPassword)

// Verify OTP (no authentication required)
router.post("/verify-otp", verifyOtp, authController.verifyOtp)

// Reset password
router.post("/reset-password", resetPassword, authController.resetPassword)

//Google auth
router.get("/google", passport.authenticate("google", { scope: ["profile", "email"] }));

router.get("/google/callback", passport.authenticate("google", { failureRedirect: "/login", session: false }),authController.googleOAuth);
export default router;
