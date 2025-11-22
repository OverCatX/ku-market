import { Request, Response } from "express";
import Notification from "../../data/models/Notification";
import mongoose from "mongoose";
import { AuthenticatedRequest } from "../middlewares/authentication";

export default class NotificationController {
  // POST /api/notifications - Create a notification (for testing)
  createNotification = async (req: Request, res: Response): Promise<Response> => {
    try {
      const userId = (req as AuthenticatedRequest).user?.id;
      if (!userId) {
        return res.status(401).json({
          success: false,
          error: "User not authenticated",
        });
      }
      const { type, title, message, link } = req.body;

      if (!type || !title || !message) {
        return res.status(400).json({
          success: false,
          error: "Type, title, and message are required",
        });
      }

      if (!["order", "message", "item", "system"].includes(type)) {
        return res.status(400).json({
          success: false,
          error: "Invalid notification type",
        });
      }

      const notification = new Notification({
        userId: new mongoose.Types.ObjectId(userId),
        type,
        title,
        message,
        link,
        read: false,
        timestamp: new Date(),
      });

      await notification.save();

      return res.status(201).json({
        success: true,
        message: "Notification created",
        notification: {
          id: notification._id?.toString() || "",
          type: notification.type,
          title: notification.title,
          message: notification.message,
          timestamp: notification.timestamp,
          read: notification.read,
          link: notification.link || undefined,
        },
      });
    } catch (err: unknown) {
      console.error("Create notification error:", err);
      const message = err instanceof Error ? err.message : "Server error";
      return res.status(500).json({
        success: false,
        error: message,
      });
    }
  };

  // GET /api/notifications
  getNotifications = async (req: Request, res: Response): Promise<Response> => {
    try {
      const userId = (req as AuthenticatedRequest).user?.id;
      if (!userId) {
        return res.status(401).json({
          success: false,
          error: "User not authenticated",
        });
      }

      // Pagination parameters
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const skip = (page - 1) * limit;

      // Get total count for pagination
      const totalCount = await Notification.countDocuments({
        userId: new mongoose.Types.ObjectId(userId),
      });

      const unreadCount = await Notification.countDocuments({
        userId: new mongoose.Types.ObjectId(userId),
        read: false,
      });

      // Get paginated notifications
      const notifications = await Notification.find({
        userId: new mongoose.Types.ObjectId(userId),
      })
        .sort({ timestamp: -1 }) // Most recent first
        .skip(skip)
        .limit(limit)
        .lean();

      // Format for frontend (convert _id to id, timestamp to Date)
      const formattedNotifications = notifications.map((notif) => ({
        id: notif._id.toString(),
        type: notif.type,
        title: notif.title,
        message: notif.message,
        timestamp: notif.timestamp,
        read: notif.read,
        link: notif.link || undefined,
      }));

      const totalPages = Math.ceil(totalCount / limit);
      const hasMore = page < totalPages;

      return res.status(200).json({
        success: true,
        notifications: formattedNotifications,
        unreadCount,
        pagination: {
          page,
          limit,
          totalCount,
          totalPages,
          hasMore,
        },
      });
    } catch (err: unknown) {
      console.error("Get notifications error:", err);
      const message = err instanceof Error ? err.message : "Server error";
      return res.status(500).json({
        success: false,
        error: message,
      });
    }
  };

  // PATCH /api/notifications/:id/read
  markAsRead = async (req: Request, res: Response): Promise<Response> => {
    try {
      const userId = (req as AuthenticatedRequest).user?.id;
      if (!userId) {
        return res.status(401).json({
          success: false,
          error: "User not authenticated",
        });
      }
      const { id } = req.params;

      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({
          success: false,
          error: "Invalid notification ID",
        });
      }

      const notification = await Notification.findOneAndUpdate(
        {
          _id: new mongoose.Types.ObjectId(id),
          userId: new mongoose.Types.ObjectId(userId),
        },
        { read: true },
        { new: true }
      );

      if (!notification) {
        return res.status(404).json({
          success: false,
          error: "Notification not found",
        });
      }

      return res.status(200).json({
        success: true,
        message: "Notification marked as read",
      });
    } catch (err: unknown) {
      console.error("Mark notification as read error:", err);
      const message = err instanceof Error ? err.message : "Server error";
      return res.status(500).json({
        success: false,
        error: message,
      });
    }
  };

  // PATCH /api/notifications/read-all
  markAllAsRead = async (req: Request, res: Response): Promise<Response> => {
    try {
      const userId = (req as AuthenticatedRequest).user?.id;
      if (!userId) {
        return res.status(401).json({
          success: false,
          error: "User not authenticated",
        });
      }

      const result = await Notification.updateMany(
        {
          userId: new mongoose.Types.ObjectId(userId),
          read: false,
        },
        { read: true }
      );

      return res.status(200).json({
        success: true,
        message: "All notifications marked as read",
        updatedCount: result.modifiedCount,
      });
    } catch (err: unknown) {
      console.error("Mark all notifications as read error:", err);
      const message = err instanceof Error ? err.message : "Server error";
      return res.status(500).json({
        success: false,
        error: message,
      });
    }
  };

  // DELETE /api/notifications/:id
  deleteNotification = async (req: Request, res: Response): Promise<Response> => {
    try {
      const userId = (req as AuthenticatedRequest).user?.id;
      if (!userId) {
        return res.status(401).json({
          success: false,
          error: "User not authenticated",
        });
      }
      const { id } = req.params;

      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({
          success: false,
          error: "Invalid notification ID",
        });
      }

      const notification = await Notification.findOneAndDelete({
        _id: new mongoose.Types.ObjectId(id),
        userId: new mongoose.Types.ObjectId(userId),
      });

      if (!notification) {
        return res.status(404).json({
          success: false,
          error: "Notification not found",
        });
      }

      return res.status(200).json({
        success: true,
        message: "Notification deleted",
      });
    } catch (err: unknown) {
      console.error("Delete notification error:", err);
      const message = err instanceof Error ? err.message : "Server error";
      return res.status(500).json({
        success: false,
        error: message,
      });
    }
  };

  // DELETE /api/notifications/clear-all
  clearAll = async (req: Request, res: Response): Promise<Response> => {
    try {
      const userId = (req as AuthenticatedRequest).user?.id;
      if (!userId) {
        return res.status(401).json({
          success: false,
          error: "User not authenticated",
        });
      }

      const result = await Notification.deleteMany({
        userId: new mongoose.Types.ObjectId(userId),
      });

      return res.status(200).json({
        success: true,
        message: "All notifications cleared",
        deletedCount: result.deletedCount,
      });
    } catch (err: unknown) {
      console.error("Clear all notifications error:", err);
      const message = err instanceof Error ? err.message : "Server error";
      return res.status(500).json({
        success: false,
        error: message,
      });
    }
  };
}

