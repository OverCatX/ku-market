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
import sellerRoutes from "./application/routes/seller";
import orderRoutes from "./application/routes/order";
import healthRoutes from "./application/routes/health";

const app: Application = express();
app.use(cors());
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
app.use("/api/seller", sellerRoutes);

export default app;