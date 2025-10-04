import { Router, Request, Response, NextFunction } from "express";
import User from "../models/User";
import jwt from "jsonwebtoken";

const router = Router();

// ---------------- Helper Types ----------------
interface JwtPayload {
  id: string;
}

interface AuthenticatedRequest extends Request {
  userId?: string;
}

// Middleware to authenticate JWT
const authenticate = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) {
    res.status(401).json({ success: false, error: "Unauthorized" });
    return;
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET || "secret") as JwtPayload;
    req.userId = payload.id;
    next();
  } catch (err: unknown) {
    res.status(401).json({ success: false, errorr: err,error_msg: "Invalid token" });
  }
};

// View Profile
router.get("/view", authenticate, async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ success: false, error: "Unauthorized" });
    }

    const user = await User.findById(req.userId).select("-password -__v");
    if (!user) {
      return res.status(404).json({ success: false, error: "User not found" });
    }

    res.status(200).json({ success: true, user });
  } catch (err: unknown) {
    console.error("View profile error:", err);
    res.status(500).json({ success: false, error: err instanceof Error ? err.message : "Server error" });
  }
});

// Update Profile
interface UpdateProfileBody {
  name?: string;
  faculty?: string;
  contact?: string;
}

router.put("/update", authenticate, async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ success: false, error: "Unauthorized" });
    }

    const { name, faculty, contact } = req.body as UpdateProfileBody;

    const updatedUser = await User.findByIdAndUpdate(
      req.userId,
      { name, faculty, contact },
      { new: true, runValidators: true }
    ).select("-password -__v");

    if (!updatedUser) {
      return res.status(404).json({ success: false, error: "User not found" });
    }

    res.status(200).json({ success: true, user: updatedUser });
  } catch (err: unknown) {
    console.error("Update profile error:", err);
    res.status(500).json({ success: false, error: err instanceof Error ? err.message : "Server error" });
  }
});

export default router;