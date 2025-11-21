import { Request } from "express";
import ActivityLog, { ActivityType, UserRole } from "../data/models/ActivityLog";
import User from "../data/models/User";
import { AuthenticatedRequest } from "../application/middlewares/authentication";

interface LogActivityParams {
  req: Request;
  activityType: ActivityType;
  entityType: "order" | "payment" | "review" | "item" | "shop" | "user" | "verification" | "system";
  entityId?: string;
  description: string;
  metadata?: Record<string, unknown>;
}

/**
 * Log user activity asynchronously to prevent blocking requests
 * This function runs in the background and doesn't wait for completion
 */
export async function logActivity({
  req,
  activityType,
  entityType,
  entityId,
  description,
  metadata = {},
}: LogActivityParams): Promise<void> {
  try {
    const authReq = req as AuthenticatedRequest;
    const userId = authReq.user?.id;

    if (!userId) {
      // Don't log if user is not authenticated
      return;
    }

    // Get user info (with caching in production, this could be optimized)
    const user = await User.findById(userId).select("name kuEmail role").lean();
    if (!user) {
      return;
    }

    // Determine user role
    let userRole: UserRole = "buyer";
    if (user.role === "admin") {
      userRole = "admin";
    } else if (user.role === "seller") {
      userRole = "seller";
    }

    // Get IP address and user agent
    const ipAddress =
      (req.headers["x-forwarded-for"] as string)?.split(",")[0] ||
      req.socket.remoteAddress ||
      req.ip ||
      "unknown";
    const userAgent = req.headers["user-agent"] || "unknown";

    // Create log entry (fire and forget - don't await)
    ActivityLog.create({
      userId,
      userRole,
      userName: user.name || "Unknown",
      userEmail: user.kuEmail || "unknown@ku.th",
      activityType,
      entityType,
      entityId: entityId ? entityId : undefined,
      description,
      metadata: {
        ...metadata,
        ipAddress,
        userAgent,
      },
      ipAddress,
      userAgent,
    }).catch((error) => {
      // Silently fail - logging should never break the main flow
      console.error("Failed to log activity:", error);
    });
  } catch (error) {
    // Silently fail - logging should never break the main flow
    console.error("Error in logActivity:", error);
  }
}

/**
 * Helper function to get IP address from request
 */
export function getClientIp(req: Request): string {
  return (
    (req.headers["x-forwarded-for"] as string)?.split(",")[0] ||
    req.socket.remoteAddress ||
    req.ip ||
    "unknown"
  );
}

