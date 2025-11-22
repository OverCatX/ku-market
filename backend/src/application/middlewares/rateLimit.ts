import rateLimit, { ipKeyGenerator } from "express-rate-limit";
import { Request, Response } from "express";
import { AuthenticatedRequest } from "./authentication";

/**
 * Rate limiter for creating reviews
 * Limits: 5 reviews per hour per user
 */
export const createReviewLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5, // 5 reviews per hour
  message: {
    success: false,
    error: "Too many review submissions. Please try again later. You can submit up to 5 reviews per hour.",
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  // Use user ID as key if authenticated, otherwise use IP
  keyGenerator: (req: Request): string => {
    const authReq = req as AuthenticatedRequest;
    if (authReq.user?.id) {
      return `review:create:${authReq.user.id}`;
    }
    return ipKeyGenerator(req.ip || "unknown");
  },
  // Custom handler for rate limit exceeded
  handler: (req: Request, res: Response) => {
    res.status(429).json({
      success: false,
      error: "Too many review submissions. Please try again later. You can submit up to 5 reviews per hour.",
    });
  },
});

/**
 * Rate limiter for marking reviews as helpful
 * Limits: 20 helpful votes per hour per user
 */
export const helpfulVoteLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 20, // 20 helpful votes per hour
  message: {
    success: false,
    error: "Too many helpful votes. Please try again later. You can vote up to 20 times per hour.",
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req: Request): string => {
    const authReq = req as AuthenticatedRequest;
    if (authReq.user?.id) {
      return `review:helpful:${authReq.user.id}`;
    }
    return ipKeyGenerator(req.ip || "unknown");
  },
  handler: (req: Request, res: Response) => {
    res.status(429).json({
      success: false,
      error: "Too many helpful votes. Please try again later. You can vote up to 20 times per hour.",
    });
  },
});

/**
 * Rate limiter for deleting reviews
 * Limits: 10 deletions per hour per user
 */
export const deleteReviewLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // 10 deletions per hour
  message: {
    success: false,
    error: "Too many review deletions. Please try again later. You can delete up to 10 reviews per hour.",
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req: Request): string => {
    const authReq = req as AuthenticatedRequest;
    if (authReq.user?.id) {
      return `review:delete:${authReq.user.id}`;
    }
    return ipKeyGenerator(req.ip || "unknown");
  },
  handler: (req: Request, res: Response) => {
    res.status(429).json({
      success: false,
      error: "Too many review deletions. Please try again later. You can delete up to 10 reviews per hour.",
    });
  },
});

