import { Request, Response } from "express";
import User from "../../data/models/User";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { sendPasswordResetOtp } from "../../lib/email";
import { logActivity } from "../../lib/activityLogger";
import { AuthenticatedRequest } from "../middlewares/authentication";
import { logger } from "../../lib/logger";

interface GoogleProfile {
    kuEmail?: string;
    email?: string;
    [key: string]: unknown;
}

export default class AuthController {
    userSignup = async(req: Request, res: Response) =>{
        const {name, kuEmail, password, confirm_password, faculty, contact} = req.body;

        try {
            const userEmailexist = await User.findOne({kuEmail});

            if (userEmailexist){
                return res.status(400).json({ message: "Email is already registered"})
            }

            const userContactExist = await User.findOne({contact})

            if (userContactExist){
                return res.status(400).json({message : "Phone number is already existed"})
            }

            if (password !== confirm_password){
                return res.status(400).json({message : "Password and Confirm password do not match"})
            }

            const user = new User({name, kuEmail, password, faculty, contact});
            await user.save();

            return res.status(201).json({message: "User created successfully"})
            
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : "Bad request";
            return res.status(400).json({ error: message })
        }
    }

    userLogin = async(req: Request, res: Response ,) => {
        const {kuEmail, password} = req.body;

        try {
            const user = await User.findOne({kuEmail});

            if (!user){
                return res.status(404).json({ error : "Email is not found"})
            }

            const isMatch = await user.comparePassword(password);
            if (!isMatch){
                return res.status(400).json({ error : "Invalid credentials"})
            }

            // Include important user data in JWT payload
            const tokenPayload = {
                id: user._id,
                email: user.kuEmail,
                role: user.role,
                isVerified: user.isVerified || false
            };
            
            const token = jwt.sign(tokenPayload, process.env.JWT_SECRET || "secret", {expiresIn: "1h"});
            
            const userData = {
                id: user._id,
                name: user.name,
                email: user.kuEmail,
                faculty: user.faculty,
                contact: user.contact,
                role: user.role,
                isVerified: user.isVerified || false
            };

            // Log user login (with role-specific description)
            const roleDescription = user.role === "admin" 
                ? "Admin logged in via email/password"
                : user.role === "seller"
                ? "Seller logged in via email/password"
                : "User logged in via email/password";
            
            await logActivity({
                req,
                activityType: "user_login",
                entityType: "user",
                entityId: String(user._id),
                description: roleDescription,
                metadata: {
                    loginMethod: "email_password",
                    userEmail: user.kuEmail,
                    userRole: user.role,
                },
            });
            
            return res.json({
                token,
                user: userData
            })
            
        } catch (err : unknown) {
            const message = err instanceof Error ? err.message : "Bad request";
            return res.status(400).json({ error: message });
        }
    }

    googleOAuth = async (req: Request, res: Response): Promise<Response | void> => {
        try {
            const profile = req.user as GoogleProfile;

            if (!profile || !profile.kuEmail) {
                const errorMessage = "No email found from Google account";
                // Check if request wants JSON
                if (req.headers.accept && req.headers.accept.includes("application/json")) {
                    return res.status(400).json({ error: errorMessage });
                }
                const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";
                return res.redirect(`${frontendUrl}/auth/google/callback?error=${encodeURIComponent(errorMessage)}`);
            }

            // Double check email domain (additional validation)
            if (!profile.kuEmail.endsWith("@ku.th")) {
                const errorMessage = "Email must be @ku.th domain. Please use your KU email address.";
                // Check if request wants JSON
                if (req.headers.accept && req.headers.accept.includes("application/json")) {
                    return res.status(400).json({ error: errorMessage });
                }
                const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";
                return res.redirect(`${frontendUrl}/auth/google/callback?error=${encodeURIComponent(errorMessage)}`);
            }

            // Create JWT token
            const tokenPayload = {
                id: profile._id,
                email: profile.kuEmail,
                role: profile.role,
                isVerified: profile.isVerified || false,
            };

            const token = jwt.sign(tokenPayload, process.env.JWT_SECRET || "secret", { expiresIn: "1h" });

            // Prepare user data for frontend
            const userData = {
                id: profile._id,
                name: profile.name,
                email: profile.kuEmail,
                faculty: profile.faculty,
                contact: profile.contact,
                role: profile.role,
                isVerified: profile.isVerified || false,
            };

            // Check if request wants JSON (from frontend callback page)
            if (req.headers.accept && req.headers.accept.includes("application/json")) {
                return res.status(200).json({
                    token,
                    user: userData,
                });
            }

            // Log Google OAuth login (with role-specific description)
            const roleDescription = profile.role === "admin"
                ? "Admin logged in via Google OAuth"
                : profile.role === "seller"
                ? "Seller logged in via Google OAuth"
                : "User logged in via Google OAuth";
            
            await logActivity({
                req,
                activityType: "user_login",
                entityType: "user",
                entityId: String(profile._id),
                description: roleDescription,
                metadata: {
                    loginMethod: "google_oauth",
                    userEmail: profile.kuEmail,
                    userRole: profile.role,
                },
            });

            // Store token and user data in httpOnly cookie temporarily
            // Frontend callback page will fetch from a special endpoint that reads the cookie
            // In production (cross-domain), use sameSite: "none" and secure: true
            const isProduction = process.env.NODE_ENV === "production";
            res.cookie("google_oauth_token", token, {
                httpOnly: true,
                secure: isProduction,
                sameSite: isProduction ? "none" : "lax",
                maxAge: 60000, // 1 minute
            });
            res.cookie("google_oauth_user", JSON.stringify(userData), {
                httpOnly: false, // Frontend needs to read this
                secure: isProduction,
                sameSite: isProduction ? "none" : "lax",
                maxAge: 60000, // 1 minute
            });

            // Redirect to frontend callback page
            const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";
            return res.redirect(`${frontendUrl}/auth/google/callback`);

        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : "Server error";
            // Check if request wants JSON
            if (req.headers.accept && req.headers.accept.includes("application/json")) {
                return res.status(500).json({ error: message });
            }
            const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";
            return res.redirect(`${frontendUrl}/auth/google/callback?error=${encodeURIComponent(message)}`);
        }
    }

    userLogout = async (req: Request, res: Response): Promise<Response> => {
        try {
            const userId = (req as AuthenticatedRequest).user?.id;
            
            if (!userId) {
                return res.status(401).json({ success: false, error: "Unauthorized" });
            }

            // Get user info for logging
            const user = await User.findById(userId).select("kuEmail name role").lean();
            
            if (user) {
                // Log user logout (with role-specific description)
                const roleDescription = user.role === "admin"
                    ? "Admin logged out"
                    : user.role === "seller"
                    ? "Seller logged out"
                    : "User logged out";
                
                await logActivity({
                    req,
                    activityType: "user_logout",
                    entityType: "user",
                    entityId: String(userId),
                    description: roleDescription,
                    metadata: {
                        userEmail: user.kuEmail,
                        userName: user.name,
                        userRole: user.role,
                    },
                });
            }

            return res.json({
                success: true,
                message: "Logged out successfully",
            });
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : "Server error";
            return res.status(500).json({ success: false, error: message });
        }
    };

    getGoogleOAuthData = async (req: Request, res: Response): Promise<Response> => {
        try {
            const cookies = (req as { cookies?: { google_oauth_token?: string; google_oauth_user?: string } }).cookies;
            const token = cookies?.google_oauth_token;
            const userDataStr = cookies?.google_oauth_user;

            if (!token || !userDataStr) {
                return res.status(404).json({ error: "OAuth data not found. Please try logging in again." });
            }

            const userData = JSON.parse(userDataStr);

            // Clear cookies after reading
            res.clearCookie("google_oauth_token");
            res.clearCookie("google_oauth_user");

            return res.status(200).json({
                token,
                user: userData,
            });
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : "Server error";
            return res.status(500).json({ error: message });
        }
    }

    forgotPassword = async (req: Request, res: Response): Promise<Response> => {
        const { email } = req.body;

        try {
            if (!email) {
                return res.status(400).json({ error: "Email is required" });
            }

            // Normalize email (trim and lowercase)
            const normalizedEmail = email.trim().toLowerCase();

            // Find user by email
            const user = await User.findOne({ kuEmail: normalizedEmail });

            // Check if user exists
            if (!user) {
                return res.status(404).json({ 
                    error: "No account found with this email address. Please check your email and try again." 
                });
            }

            // Generate 6-digit OTP
            const otp = Math.floor(100000 + Math.random() * 900000).toString();
            const otpExpiry = new Date();
            otpExpiry.setSeconds(otpExpiry.getSeconds() + 60); // OTP expires in 60 seconds

            // Save OTP to user
            user.resetPasswordOtp = otp;
            user.resetPasswordOtpExpires = otpExpiry;
            await user.save();

            // Send OTP email
            try {
                await sendPasswordResetOtp(user.kuEmail, otp, user.name);
            } catch (emailError) {
                const errorMessage = emailError instanceof Error ? emailError.message : String(emailError);
                logger.error("Error sending password reset OTP:", errorMessage);
                
                // Provide more specific error message to user
                let userFriendlyMessage = "Failed to send OTP email. Please try again later.";
                if (errorMessage.includes("not configured") || errorMessage.includes("RESEND_API_KEY")) {
                    userFriendlyMessage = "Email service is not configured. Please contact support.";
                } else if (errorMessage.includes("domain not verified") || errorMessage.includes("not verified")) {
                    userFriendlyMessage = "Email domain not verified. Please contact support.";
                } else if (errorMessage.includes("timeout")) {
                    userFriendlyMessage = "Email service is temporarily unavailable. Please try again in a moment.";
                }
                
                return res.status(500).json({ 
                    error: userFriendlyMessage 
                });
            }

            return res.status(200).json({
                success: true,
                message: "OTP has been sent to your email. Please check your inbox.",
            });
        } catch (err: unknown) {
            logger.error("Forgot password error:", err);
            const message = err instanceof Error ? err.message : "Server error";
            return res.status(500).json({ error: message });
        }
    }

    verifyOtp = async (req: Request, res: Response): Promise<Response> => {
        const { email, otp } = req.body;

        try {
            if (!email || !otp) {
                return res.status(400).json({ error: "Email and OTP are required" });
            }

            // Normalize email
            const normalizedEmail = email.trim().toLowerCase();

            // Find user by email
            const user = await User.findOne({ kuEmail: normalizedEmail });

            if (!user) {
                return res.status(404).json({ 
                    error: "No account found with this email address." 
                });
            }

            // Check if OTP matches and is not expired
            if (user.resetPasswordOtp !== otp) {
                return res.status(400).json({ error: "Invalid OTP. Please check and try again." });
            }

            if (!user.resetPasswordOtpExpires || user.resetPasswordOtpExpires < new Date()) {
                return res.status(400).json({ error: "OTP has expired. Please request a new OTP." });
            }

            // OTP is valid - generate a temporary token for password reset
            const resetToken = crypto.randomBytes(32).toString("hex");
            const resetTokenExpiry = new Date();
            resetTokenExpiry.setMinutes(resetTokenExpiry.getMinutes() + 10); // Token valid for 10 minutes

            // Save reset token and clear OTP
            user.resetPasswordToken = resetToken;
            user.resetPasswordExpires = resetTokenExpiry;
            user.resetPasswordOtp = undefined;
            user.resetPasswordOtpExpires = undefined;
            await user.save();

            return res.status(200).json({
                success: true,
                message: "OTP verified successfully",
                resetToken: resetToken, // Return token for frontend to use
            });
        } catch (err: unknown) {
            logger.error("Verify OTP error:", err);
            const message = err instanceof Error ? err.message : "Server error";
            return res.status(500).json({ error: message });
        }
    }

    resetPassword = async (req: Request, res: Response): Promise<Response> => {
        const { token, new_password } = req.body;

        try {
            if (!token || !new_password) {
                return res.status(400).json({ error: "Token and new password are required" });
            }

            if (new_password.length < 8) {
                return res.status(400).json({ error: "Password must be at least 8 characters long" });
            }

            // Find user by reset token and check if token is not expired
            const user = await User.findOne({
                resetPasswordToken: token,
                resetPasswordExpires: { $gt: new Date() }, // Token must not be expired
            });

            if (!user) {
                return res.status(400).json({ error: "Invalid or expired reset token" });
            }

            // Update password
            user.password = new_password;
            user.resetPasswordToken = undefined;
            user.resetPasswordExpires = undefined;
            await user.save();

            return res.status(200).json({
                success: true,
                message: "Password has been reset successfully",
            });
        } catch (err: unknown) {
            logger.error("Reset password error:", err);
            const message = err instanceof Error ? err.message : "Server error";
            return res.status(500).json({ error: message });
        }
    }
}