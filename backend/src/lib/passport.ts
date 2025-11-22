import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import dotenv from "dotenv";
import User from "../data/models/User";
import { logger } from "./logger";

dotenv.config();

if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
    const callbackURL = process.env.GOOGLE_REDIRECT_URI as string;
    logger.log("🔐 Google OAuth Configuration:");
    logger.log("   Callback URL:", callbackURL);
    logger.log("   ⚠️  Make sure this EXACT URL is in Google Cloud Console > Credentials > OAuth 2.0 Client ID > Authorized redirect URIs");
    logger.log("   ⚠️  Check for: trailing slash, port number, http vs https");
    
    passport.use(new GoogleStrategy(
        {
        clientID: process.env.GOOGLE_CLIENT_ID as string,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
        callbackURL: callbackURL,
        },
        async (accessToken, refreshToken, profile, done) => {
            try {
                const email = profile.emails?.[0].value;
                
                // Check if email exists
                if (!email) {
                    return done(new Error("No email found from Google account"));
                }

                // Check if email is @ku.th domain
                if (!email.endsWith("@ku.th")) {
                    return done(new Error("Email must be @ku.th domain. Please use your KU email address."));
                }

                let user = await User.findOne({ kuEmail: email });

                if (!user) {
                    user = new User({
                        name: profile.displayName,
                        kuEmail: email,
                        password: Math.random().toString(36).slice(-8),
                        role: "buyer",
                        faculty: "Unknown",
                        contact: "0000000000",
                    });
                    await user.save();
                }
                done(null, user);
            } catch (err: unknown) {
                if (err && typeof err === "object" && "name" in err && err.name === "ValidationError") {
                    const validationErr = err as { errors?: Record<string, { message: string }> };
                    if (validationErr.errors) {
                        const errors: Record<string, string> = {};
                        for (const field in validationErr.errors) {
                            errors[field] = validationErr.errors[field].message;
                        }
                        return done({ validationErrors: errors });
                    }
                }
            done(err);
            }
        }
    ));

    passport.serializeUser((user: unknown, done) => {
        done(null, user as false | Express.User | null | undefined);
    });

    passport.deserializeUser((user: unknown, done) => {
        done(null, user as false | Express.User | null | undefined);
    });
}

export default passport;

