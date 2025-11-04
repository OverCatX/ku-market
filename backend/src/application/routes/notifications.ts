import express from "express";
import NotificationController from "../controllers/notification.controller";
import { authenticate } from "../middlewares/authentication";

const router = express.Router();
const notificationController = new NotificationController();

// Get all notifications for the authenticated user
router.get("/", authenticate, notificationController.getNotifications);

// Mark a specific notification as read
router.patch("/:id/read", authenticate, notificationController.markAsRead);

// Mark all notifications as read
router.patch("/read-all", authenticate, notificationController.markAllAsRead);

// Delete a specific notification
router.delete("/:id", authenticate, notificationController.deleteNotification);

// Clear all notifications
router.delete("/clear-all", authenticate, notificationController.clearAll);

export default router;

