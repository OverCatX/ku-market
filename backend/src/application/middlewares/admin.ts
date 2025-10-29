import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import User from "../../data/models/User";

interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
  };
}

export const adminMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      res.status(401).json({ error: "No token provided" });
      return;
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || "secret") as { id: string };
    const user = await User.findById(decoded.id);

    if (!user) {
      res.status(401).json({ error: "User not found" });
      return;
    }

    if (user.role !== "admin") {
      res.status(403).json({ error: "Access denied. Admin only." });
      return;
    }

    (req as AuthenticatedRequest).user = { id: decoded.id };
    next();
  } catch {
    res.status(401).json({ error: "Invalid token" });
  }
};

