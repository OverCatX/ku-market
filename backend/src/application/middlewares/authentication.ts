import { Router, Request, Response } from "express";
import jwt from "jsonwebtoken";

export const authenticate = async (req: Request, res: Response, next: Function) => {
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