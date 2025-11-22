import { Request, Response } from "express";
import ChatThread from "../../data/models/ChatThread";
import ChatMessage from "../../data/models/ChatMessage";
import User from "../../data/models/User";
import mongoose from "mongoose";
import { AuthenticatedRequest } from "../middlewares/authentication";

// Types for populated documents
interface PopulatedUser {
  _id: mongoose.Types.ObjectId;
  name: string;
  kuEmail: string;
}

export default class ChatController {
  // Get all threads for the authenticated user
  getThreads = async (req: Request, res: Response) => {
    try {
      const userId = (req as AuthenticatedRequest).userId || (req as AuthenticatedRequest).user?.id;

      const rawThreads = await ChatThread.find({
        $or: [{ buyer: userId }, { seller: userId }],
      })
        .populate("buyer", "name kuEmail")
        .populate("seller", "name kuEmail")
        .sort({ lastMessageAt: -1, updatedAt: -1 });

      interface ThreadWithActivity {
        thread: typeof rawThreads[number];
        lastActivity: Date;
      }

      const dedupedThreads = new Map<string, ThreadWithActivity>();

      rawThreads.forEach((thread) => {
        const populatedBuyer = thread.buyer as unknown as PopulatedUser;
        const populatedSeller = thread.seller as unknown as PopulatedUser;
        const buyerId = populatedBuyer._id.toString();
        const sellerId = populatedSeller._id.toString();
        const key = `${buyerId}::${sellerId}`;
        const activity =
          thread.lastMessageAt ||
          thread.updatedAt ||
          thread.createdAt ||
          new Date(0);

        const existing = dedupedThreads.get(key);

        if (!existing || activity > existing.lastActivity) {
          dedupedThreads.set(key, {
            thread,
            lastActivity: activity,
          });
        }
      });

      const formattedThreads = Array.from(dedupedThreads.values()).map(
        ({ thread }) => {
          const populatedBuyer = thread.buyer as unknown as PopulatedUser;
          const populatedSeller = thread.seller as unknown as PopulatedUser;
          const buyerId = populatedBuyer._id.toString();
          const isBuyer = buyerId === userId;
          const partner = isBuyer ? populatedSeller : populatedBuyer;
          const partnerId = partner._id.toString();

          const computedTitle =
            thread.title && thread.title.trim().length > 0
              ? thread.title
              : `Chat with ${partner.name}`;

          return {
            id: (thread._id as mongoose.Types.ObjectId).toString(),
            title: computedTitle,
            partnerId,
            partnerName: partner.name,
            lastMessage: thread.lastMessage,
            lastMessageAt: thread.lastMessageAt,
            unread: isBuyer
              ? thread.buyerUnreadCount
              : thread.sellerUnreadCount,
            viewerRole: isBuyer ? "buyer" : "seller",
          };
        }
      );

      res.json(formattedThreads);
    } catch (error) {
      console.error("Error fetching threads:", error);
      res.status(500).json({ error: "Failed to fetch threads" });
    }
  };

  // Get or create a thread
  getOrCreateThread = async (req: Request, res: Response) => {
    try {
      const userId = (req as AuthenticatedRequest).userId || (req as AuthenticatedRequest).user?.id;
      const { sellerId } = req.body;

      if (!sellerId) {
        return res.status(400).json({ error: "sellerId is required" });
      }

      if (userId === sellerId) {
        return res.status(400).json({ error: "Cannot create thread with yourself" });
      }

      // Check if seller exists
      const seller = await User.findById(sellerId);
      if (!seller) {
        return res.status(404).json({ error: "Seller not found" });
      }

      let thread = await ChatThread.findOne({
        buyer: userId,
        seller: sellerId,
      })
        .sort({ lastMessageAt: -1, updatedAt: -1 })
        .populate("buyer", "name kuEmail")
        .populate("seller", "name kuEmail");

      // Create thread if it doesn't exist
      if (!thread) {
        const title = `Chat with ${seller.name}`;
        thread = new ChatThread({
          buyer: userId,
          seller: sellerId,
          title,
        });
        await thread.save();
        await thread.populate("buyer", "name kuEmail");
        await thread.populate("seller", "name kuEmail");
      } else {
        const desiredTitle = `Chat with ${seller.name}`;
        if (!thread.title || thread.title !== desiredTitle) {
          thread.title = desiredTitle;
          await thread.save();
        }
      }

      const populatedBuyer = thread.buyer as unknown as PopulatedUser;
      const populatedSeller = thread.seller as unknown as PopulatedUser;
      const formattedThread = {
        id: (thread._id as mongoose.Types.ObjectId).toString(),
        title: thread.title,
        partnerId:
          populatedBuyer._id.toString() === userId
            ? populatedSeller._id.toString()
            : populatedBuyer._id.toString(),
        partnerName:
          populatedBuyer._id.toString() === userId
            ? populatedSeller.name
            : populatedBuyer.name,
      };

      res.json(formattedThread);
    } catch (error) {
      console.error("Error getting/creating thread:", error);
      res.status(500).json({ error: "Failed to get or create thread" });
    }
  };

  // Get messages for a thread
  getMessages = async (req: Request, res: Response) => {
    try {
      const userId = (req as AuthenticatedRequest).userId || (req as AuthenticatedRequest).user?.id;
      const { threadId } = req.params;

      // Verify user is part of this thread
      const thread = await ChatThread.findOne({
        _id: threadId,
        $or: [{ buyer: userId }, { seller: userId }],
      })
        .populate("seller", "name");

      if (!thread) {
        return res.status(404).json({ error: "Thread not found or access denied" });
      }

      // Get messages
      const messages = await ChatMessage.find({ thread: threadId })
        .populate("sender", "name kuEmail")
        .sort({ createdAt: 1 });

      const formattedMessages = messages.map((msg) => {
        const populatedSender = msg.sender as unknown as PopulatedUser;
        const isMe = populatedSender._id.toString() === userId;
        return {
          id: (msg._id as mongoose.Types.ObjectId).toString(),
          text: msg.text,
          sender_is_me: isMe,
          created_at_hhmm: new Date(msg.createdAt).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
          createdAt: msg.createdAt,
        };
      });

      const populatedBuyer = thread.buyer as unknown as PopulatedUser;
      const populatedSeller = thread.seller as unknown as PopulatedUser;
      const isBuyer = populatedBuyer._id.toString() === userId;
      const partner = isBuyer ? populatedSeller : populatedBuyer;

      res.json({
        messages: formattedMessages,
        title:
          thread.title && thread.title.trim().length > 0
            ? thread.title
            : `Chat with ${partner.name}`,
        partner_name: partner.name,
        partner_id: partner._id,
        viewer_role: isBuyer ? "buyer" : "seller",
      });
    } catch (error) {
      console.error("Error fetching messages:", error);
      res.status(500).json({ error: "Failed to fetch messages" });
    }
  };

  // Mark thread as read
  markThreadRead = async (req: Request, res: Response) => {
    try {
      const userId = (req as AuthenticatedRequest).userId || (req as AuthenticatedRequest).user?.id;
      const { threadId } = req.params;

      const thread = await ChatThread.findOne({
        _id: threadId,
        $or: [{ buyer: userId }, { seller: userId }],
      });

      if (!thread) {
        return res.status(404).json({ error: "Thread not found or access denied" });
      }

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

      res.json({ success: true });
    } catch (error) {
      console.error("Error marking thread as read:", error);
      res.status(500).json({ error: "Failed to mark thread as read" });
    }
  };
}

