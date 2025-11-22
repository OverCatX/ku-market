import express, { Application, Request, Response, NextFunction } from "express";
import cors from "cors";
import bodyParser from "body-parser";
import session from "express-session";
import cookieParser from "cookie-parser";
import passport from "./lib/passport";
import { logger } from "./lib/logger";
import authRoutes from "./application/routes/auth";
import profileRoutes from "./application/routes/profile";
import itemRoutes from "./application/routes/items";
import verificationRoutes from "./application/routes/verification";
import shopRoutes from "./application/routes/shop";
import cartRoutes from "./application/routes/cart";
import adminRoutes from "./application/routes/admin";
import chatRoutes from "./application/routes/chat";
import notificationRoutes from "./application/routes/notifications";
import sellerRoutes from "./application/routes/seller";
import orderRoutes from "./application/routes/order";
import categoryRoutes from "./application/routes/category";
import reviewRoutes from "./application/routes/review";
import reportRoutes from "./application/routes/report";
import healthRoutes from "./application/routes/health";
import checkoutRoutes from "./application/routes/checkout";
import meetupPresetRoutes from "./application/routes/meetup-preset";

const app: Application = express();

const allowedOrigins = (process.env.CORS_ORIGIN || "http://localhost:3000")
  .split(",")
  .map((origin) => origin.trim())
  .filter((origin) => origin.length > 0);

logger.log(`CORS allowed origins: ${allowedOrigins.join(", ")}`);

const corsOptions = {
  origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) {
      return callback(null, true);
    }
    
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      logger.warn(`CORS blocked origin: ${origin}`);
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
};

app.use(cors(corsOptions));
app.use(cookieParser());
app.use(bodyParser.json({ limit: "10mb" }));
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

if (process.env.SESSION_SECRET) {
  app.use(session({
    secret: process.env.SESSION_SECRET as string,
    resave: false,
    saveUninitialized: false
  }));
  
  app.use(passport.initialize());
  app.use(passport.session());
}

app.use("/api/health", healthRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/items", itemRoutes);
app.use("/api/verification", verificationRoutes);
app.use("/api/shop", shopRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/chats", chatRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/seller", sellerRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/checkout", checkoutRoutes);
app.use("/api/meetup-presets", meetupPresetRoutes);

// Error handling middleware (must be last)
// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  logger.error("Error:", err);
  
  // Don't leak error details in production
  const message = process.env.NODE_ENV === "production" 
    ? "Internal server error" 
    : err.message;
  
  res.status(500).json({
    success: false,
    message,
    ...(process.env.NODE_ENV !== "production" && { stack: err.stack }),
  });
});

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

export default app;