import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import dotenv from "dotenv";
import User, { IUser } from "../data/models/User";
import { Document } from "mongoose";

dotenv.config();

if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
    passport.use(new GoogleStrategy(
        {
        clientID: process.env.GOOGLE_CLIENT_ID as string,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
        callbackURL: process.env.GOOGLE_REDIRECT_URI as string,
        },
        async (accessToken, refreshToken, profile, done) => {
            try {
                let user = await User.findOne({ kuEmail: profile.emails?.[0].value });

                if (!user) {
                    user = new User({
                        name: profile.displayName,
                        kuEmail: profile.emails?.[0].value,
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

    passport.serializeUser((user: IUser & Document, done) => {
    done(null, user);
    });

    passport.deserializeUser((user: IUser & Document, done) => {
    done(null, user);
    });
}

export default passport;

