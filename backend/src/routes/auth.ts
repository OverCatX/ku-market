import { Router, Request, Response } from "express";
import User from "../models/User";
import jwt from "jsonwebtoken";

const router = Router();

// Helper function to get error message safely
const getErrorMessage = (err: unknown): string => {
  if (err instanceof Error) return err.message;
  return String(err);
};

// Signup
router.post("/signup", async (req: Request, res: Response) => {
  try {
    const { name, kuEmail, password } = req.body;
    const user = new User({ name, kuEmail, password });
    await user.save();
    res.status(201).json({ message: "User created successfully" });
  } catch (err: unknown) {
    res.status(400).json({ error: getErrorMessage(err) });
  }
});

// Login
router.post("/login", async (req: Request, res: Response) => {
  try {
    const { kuEmail, password } = req.body;
    const user = await User.findOne({ kuEmail });
    if (!user) return res.status(404).json({ error: "User not found" });

    const isMatch = await user.comparePassword(password);
    if (!isMatch) return res.status(400).json({ error: "Invalid credentials" });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET || "secret", { expiresIn: "1h" });
    res.json({ token });
  } catch (err: unknown) {
    res.status(500).json({ error: getErrorMessage(err) });
  }
});

export default router;