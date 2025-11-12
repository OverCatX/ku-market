import express from "express";
import ChatController from "../controllers/chat.controller";
import { authenticate } from "../middlewares/authentication";

const router = express.Router();
const chatController = new ChatController();

// Get all threads for authenticated user
router.get("/threads", authenticate, chatController.getThreads);

// Get or create a thread
router.post("/threads", authenticate, chatController.getOrCreateThread);

// Get messages for a thread
router.get("/threads/:threadId/messages", authenticate, chatController.getMessages);

// Mark thread as read
router.post("/threads/:threadId/mark_read", authenticate, chatController.markThreadRead);

export default router;

