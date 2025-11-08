import { Request, Response } from "express";
import ChatThread from "../../data/models/ChatThread";
import ChatMessage from "../../data/models/ChatMessage";
import User from "../../data/models/User";
import Item from "../../data/models/Item";
import mongoose from "mongoose";

interface AuthenticatedRequest extends Request {
  userId: string;
}

// Types for populated documents
interface PopulatedUser {
  _id: mongoose.Types.ObjectId;
  name: string;
  kuEmail: string;
}

interface PopulatedItem {
  _id: mongoose.Types.ObjectId;
  title: string;
  photo: string[];
}

interface ThreadQuery {
  buyer: string;
  seller: string;
  item?: string;
}

export default class ChatController {
  // Get all threads for the authenticated user
  getThreads = async (req: Request, res: Response) => {
    try {
      const userId = (req as AuthenticatedRequest).userId;

      const threads = await ChatThread.find({
        $or: [{ buyer: userId }, { seller: userId }],
      })
        .populate("buyer", "name kuEmail")
        .populate("seller", "name kuEmail")
        .populate("item", "title photo")
        .sort({ lastMessageAt: -1, updatedAt: -1 });

      const formattedThreads = threads.map((thread) => {
        const populatedBuyer = thread.buyer as unknown as PopulatedUser;
        const populatedSeller = thread.seller as unknown as PopulatedUser;
        const isBuyer = populatedBuyer._id.toString() === userId;
        const otherUser = isBuyer ? populatedSeller : populatedBuyer;
        const populatedItem = (thread.item as unknown as PopulatedItem) || null;

        return {
          id: (thread._id as mongoose.Types.ObjectId).toString(),
          title: thread.title,
          sellerName: populatedSeller.name,
          buyerName: populatedBuyer.name,
          otherUserName: otherUser.name,
          lastMessage: thread.lastMessage,
          lastMessageAt: thread.lastMessageAt,
          unread: isBuyer ? thread.buyerUnreadCount : thread.sellerUnreadCount,
          item: populatedItem
            ? {
                id: populatedItem._id.toString(),
                title: populatedItem.title,
                photo: populatedItem.photo?.[0] || null,
              }
            : null,
        };
      });

      res.json(formattedThreads);
    } catch (error) {
      console.error("Error fetching threads:", error);
      res.status(500).json({ error: "Failed to fetch threads" });
    }
  };

  // Get or create a thread
  getOrCreateThread = async (req: Request, res: Response) => {
    try {
      const userId = (req as AuthenticatedRequest).userId;
      const { sellerId, itemId } = req.body;

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

      // Check if item exists (if provided)
      let item = null;
      if (itemId) {
        item = await Item.findById(itemId);
        if (!item) {
          return res.status(404).json({ error: "Item not found" });
        }
        // Verify item belongs to seller
        if (item.owner.toString() !== sellerId) {
          return res.status(403).json({ error: "Item does not belong to this seller" });
        }
      }

      // Try to find existing thread
      const query: ThreadQuery = {
        buyer: userId,
        seller: sellerId,
      };
      if (itemId) {
        query.item = itemId;
      }

      let thread = await ChatThread.findOne(query)
        .populate("buyer", "name kuEmail")
        .populate("seller", "name kuEmail")
        .populate("item", "title photo");

      // Create thread if it doesn't exist
      if (!thread) {
        const title = item ? item.title : `Chat with ${seller.name}`;
        thread = new ChatThread({
          buyer: userId,
          seller: sellerId,
          item: itemId || undefined,
          title,
        });
        await thread.save();
        await thread.populate("buyer", "name kuEmail");
        await thread.populate("seller", "name kuEmail");
        if (itemId) {
          await thread.populate("item", "title photo");
        }
      }

      const populatedBuyer = thread.buyer as unknown as PopulatedUser;
      const populatedSeller = thread.seller as unknown as PopulatedUser;
      const populatedItem = (thread.item as unknown as PopulatedItem) || null;
      const formattedThread = {
        id: (thread._id as mongoose.Types.ObjectId).toString(),
        title: thread.title,
        sellerName: populatedSeller.name,
        buyerName: populatedBuyer.name,
        item: populatedItem
          ? {
              id: populatedItem._id.toString(),
              title: populatedItem.title,
              photo: populatedItem.photo?.[0] || null,
            }
          : null,
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
      const userId = (req as AuthenticatedRequest).userId;
      const { threadId } = req.params;

      // Verify user is part of this thread
      const thread = await ChatThread.findOne({
        _id: threadId,
        $or: [{ buyer: userId }, { seller: userId }],
      })
        .populate("item", "title")
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

      const populatedSeller = thread.seller as unknown as PopulatedUser;
      const populatedItem = (thread.item as unknown as PopulatedItem) || null;
      res.json({
        messages: formattedMessages,
        title: thread.title,
        seller_name: populatedSeller.name,
        item: populatedItem ? { title: populatedItem.title } : null,
      });
    } catch (error) {
      console.error("Error fetching messages:", error);
      res.status(500).json({ error: "Failed to fetch messages" });
    }
  };

  // Mark thread as read
  markThreadRead = async (req: Request, res: Response) => {
    try {
      const userId = (req as AuthenticatedRequest).userId;
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

