import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { AuthenticatedRequest } from "./authentication";

/**
 * Optional authentication middleware
 * Doesn't fail if token is missing, but sets user if token is valid
 */
export const optionalAuthenticate = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const token = req.headers.authorization?.split(" ")[1];
  
  if (!token) {
    // No token, continue without user
    return next();
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET || "secret") as { id: string };
    (req as AuthenticatedRequest).user = { id: payload.id };
  } catch {
    // Invalid token, continue without user
  }
  
  next();
};

