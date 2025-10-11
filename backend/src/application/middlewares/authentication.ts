import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

interface JwtPayload { id: string }

export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ error: "Unauthorized" });
  
    try {
      const payload = jwt.verify(token, process.env.JWT_SECRET || "secret") as JwtPayload;
      (req as unknown as { userId: string }).userId = payload.id;
      next();
    } catch {
      res.status(401).json({ error: "Invalid token" });
    }
  };