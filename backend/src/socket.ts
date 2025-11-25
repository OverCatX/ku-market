import { Server as HttpServer } from "http";
import { Server as SocketServer, Socket } from "socket.io";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import ChatThread from "./data/models/ChatThread";
import ChatMessage from "./data/models/ChatMessage";
import { createNotification } from "./lib/notifications";

interface AuthenticatedSocket extends Socket {
  userId?: string;
}

// Types for populated documents
interface PopulatedUser {
  _id: mongoose.Types.ObjectId;
  name: string;
  kuEmail: string;
}

// Store active users: userId -> socketId
const activeUsers = new Map<string, string>();

// JWT authentication middleware for Socket.io
const authenticateSocket = (socket: AuthenticatedSocket, next: (err?: Error) => void) => {
  try {
    const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.split(" ")[1];
    
    if (!token) {
      return next(new Error("Authentication error: No token provided"));
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || "secret") as { id: string };
    socket.userId = decoded.id;
    next();
  } catch {
    next(new Error("Authentication error: Invalid token"));
  }
};

// Initialize Socket.io server
export const initializeSocket = (httpServer: HttpServer) => {
  const io = new SocketServer(httpServer, {
    cors: {
      origin: process.env.FRONTEND_URL || "http://localhost:3000",
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

  // Authentication middleware
  io.use(authenticateSocket);

  io.on("connection", (socket: AuthenticatedSocket) => {
    const userId = socket.userId;
    
    if (!userId) {
      socket.disconnect();
      return;
    }

    // User connected (logged via morgan in production)
    
    // Store user's socket ID
    activeUsers.set(userId, socket.id);
    
    // Join user's personal room for direct notifications
    socket.join(`user:${userId}`);

    // Join all threads this user is part of
    ChatThread.find({
      $or: [{ buyer: userId }, { seller: userId }],
    })
      .then((threads) => {
        threads.forEach((thread) => {
          socket.join(`thread:${(thread._id as mongoose.Types.ObjectId).toString()}`);
        });
      })
      .catch((err) => {
        console.error("Error joining user threads:", err);
      });

    // Handle sending a new message
    socket.on("send_message", async (data: { threadId: string; text: string }) => {
      try {
        const { threadId, text } = data;

        if (!text || text.trim().length === 0) {
          socket.emit("error", { message: "Message text is required" });
          return;
        }

        if (text.length > 2000) {
          socket.emit("error", { message: "Message is too long (max 2000 characters)" });
          return;
        }

        // Verify user is part of this thread
        const thread = await ChatThread.findOne({
          _id: threadId,
          $or: [{ buyer: userId }, { seller: userId }],
        });

        if (!thread) {
          socket.emit("error", { message: "Thread not found or access denied" });
          return;
        }

        // Create message
        const message = new ChatMessage({
          thread: threadId,
          sender: userId,
          text: text.trim(),
        });

        await message.save();

        // Populate sender info
        await message.populate("sender", "name kuEmail");

        // Update thread's last message and unread counts
        const isBuyer = thread.buyer.toString() === userId;
        thread.lastMessage = text.trim();
        thread.lastMessageAt = new Date();
        
        if (isBuyer) {
          thread.sellerUnreadCount += 1;
        } else {
          thread.buyerUnreadCount += 1;
        }

        await thread.save();

        // Create notification for the recipient (if they're not the sender)
        const recipientId = isBuyer ? thread.seller.toString() : thread.buyer.toString();
        
        // Get sender name for notification
        const populatedSender = message.sender as unknown as PopulatedUser;
        const senderName = populatedSender.name || "Someone";
        
        // Truncate message text for notification (max 100 chars)
        const notificationText = text.trim().length > 100 
          ? text.trim().substring(0, 100) + "..." 
          : text.trim();
        
        // Create notification for recipient (fire-and-forget, don't block)
        createNotification(
          recipientId,
          "message",
          `New message from ${senderName}`,
          notificationText,
          `/chats?threadId=${threadId}`
        ).catch((err) => {
          console.error("Failed to create message notification:", err);
          // Non-critical, continue execution
        });

        // Prepare message response
        const messageData = {
          id: (message._id as mongoose.Types.ObjectId).toString(),
          threadId: threadId,
          text: message.text,
          sender: {
            id: populatedSender._id.toString(),
            name: populatedSender.name,
          },
          sender_is_me: userId === populatedSender._id.toString(),
          createdAt: message.createdAt,
          created_at_hhmm: new Date(message.createdAt).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
        };

        // Emit to all users in the thread room
        io.to(`thread:${threadId}`).emit("new_message", messageData);

        // Emit thread update to both users
        const threadUpdate = {
          id: (thread._id as mongoose.Types.ObjectId).toString(),
          title: thread.title,
          lastMessage: thread.lastMessage,
          lastMessageAt: thread.lastMessageAt,
          buyerUnreadCount: thread.buyerUnreadCount,
          sellerUnreadCount: thread.sellerUnreadCount,
        };

        io.to(`user:${thread.buyer.toString()}`).emit("thread_updated", threadUpdate);
        io.to(`user:${thread.seller.toString()}`).emit("thread_updated", threadUpdate);
      } catch (error) {
        console.error("Error sending message:", error);
        socket.emit("error", { message: "Failed to send message" });
      }
    });

    // Handle typing indicator
    socket.on("typing", async (data: { threadId: string }) => {
      try {
        const { threadId } = data;

        // Verify user is part of this thread
        const thread = await ChatThread.findOne({
          _id: threadId,
          $or: [{ buyer: userId }, { seller: userId }],
        });

        if (!thread) return;

        // Emit typing indicator to other users in the thread
        socket.to(`thread:${threadId}`).emit("user_typing", {
          threadId,
          userId,
        });
      } catch (error) {
        console.error("Error handling typing:", error);
      }
    });

    // Handle stop typing
    socket.on("stop_typing", async (data: { threadId: string }) => {
      try {
        const { threadId } = data;

        const thread = await ChatThread.findOne({
          _id: threadId,
          $or: [{ buyer: userId }, { seller: userId }],
        });

        if (!thread) return;

        socket.to(`thread:${threadId}`).emit("user_stopped_typing", {
          threadId,
          userId,
        });
      } catch (error) {
        console.error("Error handling stop typing:", error);
      }
    });

    // Handle mark messages as read
    socket.on("mark_read", async (data: { threadId: string }) => {
      try {
        const { threadId } = data;

        const thread = await ChatThread.findOne({
          _id: threadId,
          $or: [{ buyer: userId }, { seller: userId }],
        });

        if (!thread) return;

        // Update unread count
        const isBuyer = thread.buyer.toString() === userId;
        if (isBuyer) {
          thread.buyerUnreadCount = 0;
        } else {
          thread.sellerUnreadCount = 0;
        }
        await thread.save();

        // Mark messages as read
        await ChatMessage.updateMany(
          {
            thread: threadId,
            sender: { $ne: userId },
            readAt: null,
          },
          {
            readAt: new Date(),
          }
        );

        // Notify other user
        const otherUserId = isBuyer ? thread.seller.toString() : thread.buyer.toString();
        io.to(`user:${otherUserId}`).emit("thread_updated", {
          id: (thread._id as mongoose.Types.ObjectId).toString(),
          buyerUnreadCount: thread.buyerUnreadCount,
          sellerUnreadCount: thread.sellerUnreadCount,
        });
      } catch (error) {
        console.error("Error marking as read:", error);
      }
    });

    // Handle join thread (when user opens a chat)
    socket.on("join_thread", async (data: { threadId: string }) => {
      try {
        const { threadId } = data;

        const thread = await ChatThread.findOne({
          _id: threadId,
          $or: [{ buyer: userId }, { seller: userId }],
        });

        if (thread) {
          socket.join(`thread:${threadId}`);
          socket.emit("joined_thread", { threadId });
        }
      } catch (error) {
        console.error("Error joining thread:", error);
      }
    });

    // Handle disconnect
    socket.on("disconnect", () => {
      // User disconnected (logged via morgan in production)
      activeUsers.delete(userId);
    });
  });

  return io;
};
