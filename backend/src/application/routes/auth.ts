import { Router, Request, Response, NextFunction } from "express";
import AuthController from "../controllers/auth.controller";
import {userSignup, userLogin, forgotPassword, verifyOtp, resetPassword} from "../middlewares/validators/auth.validation";
import { authenticate } from "../middlewares/authentication";
import passport from "passport";
import dotenv from "dotenv";

dotenv.config();

const router = Router();
const authController = new AuthController();

// Signup
router.post("/signup", userSignup, authController.userSignup)

// Login
router.post("/login", userLogin, authController.userLogin)

// Logout (requires authentication)
router.post("/logout", authenticate, authController.userLogout)

// Forgot password - sends OTP (no authentication required)
router.post("/forgot-password", forgotPassword, authController.forgotPassword)

// Verify OTP (no authentication required)
router.post("/verify-otp", verifyOtp, authController.verifyOtp)

// Reset password
router.post("/reset-password", resetPassword, authController.resetPassword)

//Google auth
router.get("/google", passport.authenticate("google", { scope: ["profile", "email"] }));

router.get("/google/callback", 
  (req: Request, res: Response, next: NextFunction) => {
    passport.authenticate("google", { 
      session: false 
    }, (err: Error | null, user: Express.User | false, info?: { message?: string }) => {
      // Handle authentication errors
      if (err) {
        const errorMessage = err.message || "Google login failed";
        const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";
        return res.redirect(`${frontendUrl}/auth/google/callback?error=${encodeURIComponent(errorMessage)}`);
      }
      
      if (!user) {
        const errorMessage = info?.message || "Google login failed";
        const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";
        return res.redirect(`${frontendUrl}/auth/google/callback?error=${encodeURIComponent(errorMessage)}`);
      }
      
      // Authentication successful, attach user to request and continue
      (req as { user?: Express.User }).user = user;
      next();
    })(req, res, next);
  },
  authController.googleOAuth
);

export default router;
