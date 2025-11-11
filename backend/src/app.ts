import express, { Application } from "express";
import cors from "cors";
import bodyParser from "body-parser";
import authRoutes from "./application/routes/auth";
import profileRoutes from "./application/routes/profile";
import itemRoutes from "./application/routes/items";
import verificationRoutes from "./application/routes/verification";
import shopRoutes from "./application/routes/shop";
import cartRoutes from "./application/routes/cart";
import adminRoutes from "./application/routes/admin";
import notificationRoutes from "./application/routes/notifications";
import sellerRoutes from "./application/routes/seller";
import orderRoutes from "./application/routes/order";
import categoryRoutes from "./application/routes/category";
import reviewRoutes from "./application/routes/review";
import reportRoutes from "./application/routes/report";
import healthRoutes from "./application/routes/health";
import checkoutRoutes from "./application/routes/checkout";

const app: Application = express();

const allowedOrigins = (process.env.CORS_ORIGIN || "http://localhost:3000")
  .split(",")
  .map((origin) => origin.trim());

const corsOptions = {
  origin: allowedOrigins,
  credentials: true,
};

app.use(cors(corsOptions));
app.use(bodyParser.json());
app.use(express.json());

app.use("/api/health", healthRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/items", itemRoutes);
app.use("/api/verification", verificationRoutes);
app.use("/api/shop", shopRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/seller", sellerRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/checkout", checkoutRoutes);

export default app;