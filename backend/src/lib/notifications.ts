import Notification from "../data/models/Notification";
import mongoose from "mongoose";

/**
 * Helper function to create notifications
 */
export async function createNotification(
  userId: string | mongoose.Types.ObjectId,
  type: "order" | "message" | "item" | "system",
  title: string,
  message: string,
  link?: string
): Promise<void> {
  try {
    const notification = new Notification({
      userId: typeof userId === "string" ? new mongoose.Types.ObjectId(userId) : userId,
      type,
      title,
      message,
      link,
      read: false,
      timestamp: new Date(),
    });

    await notification.save();
  } catch (err) {
    console.error("Failed to create notification:", err);
    // Don't throw - notifications are non-critical
  }
}

