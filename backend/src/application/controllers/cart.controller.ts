import { Request, Response } from "express";
import Cart, { ICartItem } from "../../data/models/Cart";
import Item from "../../data/models/Item";
import mongoose from "mongoose";

interface AuthenticatedRequest extends Request {
  userId: string;
}

interface PopulatedCartItem {
  itemId: {
    _id: mongoose.Types.ObjectId;
    title: string;
    price: number;
    photo: string[];
    status: "available" | "reserved" | "sold";
    owner: {
      _id: mongoose.Types.ObjectId;
      name: string;
    };
  };
  quantity: number;
  addedAt: Date;
}

export default class CartController {
  // Get cart with populated item details
  getCart = async (req: Request, res: Response) => {
    try {
      const userId = (req as AuthenticatedRequest).userId;

      let cart = await Cart.findOne({ userId: new mongoose.Types.ObjectId(userId) })
        .populate({
          path: "items.itemId",
          select: "title price photo status owner",
          populate: {
            path: "owner",
            select: "name"
          }
        });

      if (!cart) {
        // Create empty cart if doesn't exist
        cart = new Cart({
          userId: new mongoose.Types.ObjectId(userId),
          items: []
        });
        await cart.save();
      }

      // Filter out items that no longer exist or are sold
      const populatedItems = cart.items as unknown as PopulatedCartItem[];
      const validItems = populatedItems.filter((item) => {
        return item.itemId && item.itemId.status === "available";
      });

      // Update cart if items were filtered out
      if (validItems.length !== cart.items.length) {
        cart.items = validItems as unknown as ICartItem[];
        await cart.save();
      }

      // Format response with minimal payload
      const formattedItems = validItems.map((item) => ({
        id: item.itemId._id.toString(),
        title: item.itemId.title,
        price: item.itemId.price,
        image: item.itemId.photo?.[0] || "",
        quantity: item.quantity,
        sellerId: item.itemId.owner._id.toString(),
        sellerName: item.itemId.owner.name,
        addedAt: item.addedAt
      }));

      return res.status(200).json({
        success: true,
        items: formattedItems,
        totalItems: validItems.reduce((sum, item) => sum + item.quantity, 0),
        totalPrice: validItems.reduce((sum, item) => 
          sum + (item.itemId.price * item.quantity), 0
        )
      });

    } catch (err: unknown) {
      console.error("Get cart error:", err);
      const message = err instanceof Error ? err.message : "Server error";
      return res.status(500).json({ error: message });
    }
  };

  // Add item to cart or update quantity
  addToCart = async (req: Request, res: Response) => {
    try {
      const userId = (req as AuthenticatedRequest).userId;
      const { itemId, quantity = 1 } = req.body;

      // Validate item exists and is available
      const item = await Item.findById(itemId);
      if (!item) {
        return res.status(404).json({ error: "Item not found" });
      }

      if (item.status !== "available") {
        return res.status(400).json({ error: "Item is not available for purchase" });
      }

      // Don't allow buying own items (check if owner exists first)
      if (item.owner && item.owner.toString() === userId) {
        return res.status(400).json({ error: "You cannot add your own items to cart" });
      }

      let cart = await Cart.findOne({ userId: new mongoose.Types.ObjectId(userId) });

      if (!cart) {
        // Create new cart
        cart = new Cart({
          userId: new mongoose.Types.ObjectId(userId),
          items: [{
            itemId: new mongoose.Types.ObjectId(itemId),
            quantity,
            addedAt: new Date()
          }]
        });
      } else {
        // Check if item already in cart
        const existingItemIndex = cart.items.findIndex(
          (item) => item.itemId.toString() === itemId
        );

        if (existingItemIndex > -1) {
          // Update quantity
          cart.items[existingItemIndex].quantity += quantity;
        } else {
          // Add new item
          const newItem: ICartItem = {
            itemId: new mongoose.Types.ObjectId(itemId),
            quantity,
            addedAt: new Date()
          };
          cart.items.push(newItem);
        }
      }

      await cart.save();

      return res.status(200).json({
        success: true,
        message: "Item added to cart successfully"
      });

    } catch (err: unknown) {
      console.error("Add to cart error:", err);
      const message = err instanceof Error ? err.message : "Server error";
      return res.status(500).json({ error: message });
    }
  };

  // Update item quantity
  updateQuantity = async (req: Request, res: Response) => {
    try {
      const userId = (req as AuthenticatedRequest).userId;
      const { itemId, quantity } = req.body;

      if (quantity < 0) {
        return res.status(400).json({ error: "Quantity must be non-negative" });
      }

      const cart = await Cart.findOne({ userId: new mongoose.Types.ObjectId(userId) });

      if (!cart) {
        return res.status(404).json({ error: "Cart not found" });
      }

      if (quantity === 0) {
        // Remove item from cart
        cart.items = cart.items.filter(
          (item) => item.itemId.toString() !== itemId
        );
      } else {
        // Update quantity
        const itemIndex = cart.items.findIndex(
          (item) => item.itemId.toString() === itemId
        );

        if (itemIndex === -1) {
          return res.status(404).json({ error: "Item not found in cart" });
        }

        cart.items[itemIndex].quantity = quantity;
      }

      await cart.save();

      return res.status(200).json({
        success: true,
        message: "Cart updated successfully"
      });

    } catch (err: unknown) {
      console.error("Update quantity error:", err);
      const message = err instanceof Error ? err.message : "Server error";
      return res.status(500).json({ error: message });
    }
  };

  // Remove item from cart
  removeFromCart = async (req: Request, res: Response) => {
    try {
      const userId = (req as AuthenticatedRequest).userId;
      const { itemId } = req.params;

      const cart = await Cart.findOne({ userId: new mongoose.Types.ObjectId(userId) });

      if (!cart) {
        return res.status(404).json({ error: "Cart not found" });
      }

      cart.items = cart.items.filter(
        (item) => item.itemId.toString() !== itemId
      );

      await cart.save();

      return res.status(200).json({
        success: true,
        message: "Item removed from cart"
      });

    } catch (err: unknown) {
      console.error("Remove from cart error:", err);
      const message = err instanceof Error ? err.message : "Server error";
      return res.status(500).json({ error: message });
    }
  };

  // Clear entire cart
  clearCart = async (req: Request, res: Response) => {
    try {
      const userId = (req as AuthenticatedRequest).userId;

      await Cart.findOneAndUpdate(
        { userId: new mongoose.Types.ObjectId(userId) },
        { items: [] },
        { upsert: true }
      );

      return res.status(200).json({
        success: true,
        message: "Cart cleared successfully"
      });

    } catch (err: unknown) {
      console.error("Clear cart error:", err);
      const message = err instanceof Error ? err.message : "Server error";
      return res.status(500).json({ error: message });
    }
  };

  // Sync cart from client (merge local storage with backend)
  syncCart = async (req: Request, res: Response) => {
    try {
      const userId = (req as AuthenticatedRequest).userId;
      const { items } = req.body; // Array of { itemId, quantity }

      if (!Array.isArray(items)) {
        return res.status(400).json({ error: "Items must be an array" });
      }

      // Validate all items exist and are available
      const itemIds = items.map((item: { itemId: string; quantity: number }) => item.itemId);
      const validItems = await Item.find({
        _id: { $in: itemIds },
        status: "available",
        owner: { $ne: new mongoose.Types.ObjectId(userId) }
      }).select("_id");

      const validItemIds = new Set(
        validItems.map((item) => (item._id as mongoose.Types.ObjectId).toString())
      );

      // Filter to only valid items
      const validCartItems: ICartItem[] = items
        .filter((item: { itemId: string; quantity: number }) => validItemIds.has(item.itemId))
        .map((item: { itemId: string; quantity: number }) => ({
          itemId: new mongoose.Types.ObjectId(item.itemId),
          quantity: Math.max(1, item.quantity),
          addedAt: new Date()
        }));

      // Update or create cart
      await Cart.findOneAndUpdate(
        { userId: new mongoose.Types.ObjectId(userId) },
        { items: validCartItems },
        { upsert: true }
      );

      return res.status(200).json({
        success: true,
        message: "Cart synced successfully",
        syncedItems: validCartItems.length,
        removedItems: items.length - validCartItems.length
      });

    } catch (err: unknown) {
      console.error("Sync cart error:", err);
      const message = err instanceof Error ? err.message : "Server error";
      return res.status(500).json({ error: message });
    }
  };
}

