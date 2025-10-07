import express, { Application } from "express";
import cors from "cors";
import bodyParser from "body-parser";
import authRoutes from "./application/routes/auth";
import profileRoutes from "./application/routes/profile";
import itemRoutes from "./application/routes/items";

const app: Application = express();
app.use(cors());
app.use(bodyParser.json());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/items", itemRoutes)

export default app;