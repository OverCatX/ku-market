import express from "express";
import NotificationController from "../controllers/notification.controller";
import { authenticate } from "../middlewares/authentication";

const router = express.Router();
const notificationController = new NotificationController();

// Create a notification (for testing/development)
router.post("/", authenticate, notificationController.createNotification);

// Get all notifications for the authenticated user
router.get("/", authenticate, notificationController.getNotifications);

// Mark a specific notification as read
router.patch("/:id/read", authenticate, notificationController.markAsRead);

// Mark all notifications as read
router.patch("/read-all", authenticate, notificationController.markAllAsRead);

// Clear all notifications (must come before /:id route)
router.delete("/clear-all", authenticate, notificationController.clearAll);

// Delete a specific notification
router.delete("/:id", authenticate, notificationController.deleteNotification);

export default router;

