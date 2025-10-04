import { Router, Request, Response } from "express";
import User, { IUser } from "../../data/models/User";
import jwt from "jsonwebtoken";

const router = Router();

// Middleware to authenticate JWT
const authenticate = async (req: Request, res: Response, next: Function) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ error: "Unauthorized" });

  try {
    const payload: any = jwt.verify(token, process.env.JWT_SECRET || "secret");
    (req as any).userId = payload.id;
    next();
  } catch (err) {
    res.status(401).json({ error: "Invalid token" });
  }
};

// View Profile
router.get("/view", authenticate, async (req: Request, res: Response) => {
  try {
    const user = await User.findById((req as any).userId).select("-password -__v");
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json(user);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Update Profile
router.put("/update", authenticate, async (req: Request, res: Response) => {
  try {
    const { name, faculty, contact } = req.body;
    const user = await User.findByIdAndUpdate(
      (req as any).userId,
      { name, faculty, contact },
      { new: true, runValidators: true }
    ).select("-password -__v");
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json(user);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

export default router;
