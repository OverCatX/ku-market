import { Request, Response } from "express";
import Notification from "../../data/models/Notification";
import mongoose from "mongoose";

interface AuthenticatedRequest extends Request {
  userId: string;
}

export default class NotificationController {
  // GET /api/notifications
  getNotifications = async (req: Request, res: Response): Promise<Response> => {
    try {
      const userId = (req as AuthenticatedRequest).userId;

      const notifications = await Notification.find({
        userId: new mongoose.Types.ObjectId(userId),
      })
        .sort({ timestamp: -1 }) // Most recent first
        .lean();

      const unreadCount = await Notification.countDocuments({
        userId: new mongoose.Types.ObjectId(userId),
        read: false,
      });

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

      return res.status(200).json({
        success: true,
        notifications: formattedNotifications,
        unreadCount,
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
      const userId = (req as AuthenticatedRequest).userId;
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
      const userId = (req as AuthenticatedRequest).userId;

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
      const userId = (req as AuthenticatedRequest).userId;
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
      const userId = (req as AuthenticatedRequest).userId;

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

