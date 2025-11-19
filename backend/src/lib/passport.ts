import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import dotenv from "dotenv";
import User from "../data/models/User";

dotenv.config();

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
        } catch (err: any) { 
            if (err.name === "ValidationError") {
                const errors: Record<string, string> = {};
                for (const field in err.errors) {
                    errors[field] = err.errors[field].message;
                }
                return done({ validationErrors: errors });
            }
        done(err);
        }
    }
));

passport.serializeUser((user: any, done) => {
  done(null, user);
});

passport.deserializeUser((user: any, done) => {
  done(null, user);
});

export default passport;

