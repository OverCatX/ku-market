import { Request, Response } from "express";
import Cart from "../../data/models/Cart";
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
    photo?: string[];
    owner?: {
      _id: mongoose.Types.ObjectId;
      name: string;
    };
  };
  quantity: number;
  addedAt: Date;
}

interface FormattedCartItem {
  id: string;
  title: string;
  price: number;
  image: string;
  quantity: number;
  sellerId: string;
  sellerName: string;
}

export default class CartController {
  // GET /api/cart
  getCart = async (req: Request, res: Response): Promise<Response> => {
    try {
      const userId = (req as AuthenticatedRequest).userId;

      const cart = await Cart.findOne({ userId: new mongoose.Types.ObjectId(userId) })
        .populate({
          path: "items.itemId",
          populate: { path: "owner", select: "name" }
        });

      if (!cart) {
        return res.json({ success: true, items: [], totalItems: 0, totalPrice: 0 });
      }

      const populatedItems = cart.items as unknown as PopulatedCartItem[];
      const items: FormattedCartItem[] = populatedItems.map((item) => ({
        id: item.itemId._id.toString(),
        title: item.itemId.title,
        price: item.itemId.price,
        image: item.itemId.photo?.[0] || "",
        quantity: item.quantity,
        sellerId: item.itemId.owner?._id?.toString() || "",
        sellerName: item.itemId.owner?.name || "Unknown",
      }));

      return res.json({
        success: true,
        items,
        totalItems: items.reduce((sum, item) => sum + item.quantity, 0),
        totalPrice: items.reduce((sum, item) => sum + item.price * item.quantity, 0),
      });
    } catch (error) {
      console.error("Cart error:", error);
      return res.status(500).json({ success: false, error: "Server error" });
    }
  };

  // POST /api/cart/add
  addToCart = async (req: Request, res: Response): Promise<Response> => {
    try {
      const userId = (req as AuthenticatedRequest).userId;
      const { itemId } = req.body;

      const item = await Item.findById(itemId);
      if (!item) {
        return res.status(404).json({ success: false, error: "Item not found" });
      }

      let cart = await Cart.findOne({ userId: new mongoose.Types.ObjectId(userId) });

      if (!cart) {
        cart = await Cart.create({
          userId: new mongoose.Types.ObjectId(userId),
          items: [{ itemId: new mongoose.Types.ObjectId(itemId), quantity: 1, addedAt: new Date() }],
        });
      } else {
        const existingIndex = cart.items.findIndex(i => i.itemId.toString() === itemId);
        if (existingIndex > -1) {
          cart.items[existingIndex].quantity += 1;
        } else {
          cart.items.push({ itemId: new mongoose.Types.ObjectId(itemId), quantity: 1, addedAt: new Date() });
        }
        await cart.save();
      }

      return res.json({ success: true, message: "Added to cart" });
    } catch (error) {
      console.error("Add cart error:", error);
      return res.status(500).json({ success: false, error: "Server error" });
    }
  };

  // PUT /api/cart/update
  updateQuantity = async (req: Request, res: Response): Promise<Response> => {
    try {
      const userId = (req as AuthenticatedRequest).userId;
      const { itemId, quantity } = req.body;

      const cart = await Cart.findOne({ userId: new mongoose.Types.ObjectId(userId) });
      if (!cart) {
        return res.status(404).json({ success: false, error: "Cart not found" });
      }

      if (quantity === 0) {
        cart.items = cart.items.filter(i => i.itemId.toString() !== itemId);
      } else {
        const index = cart.items.findIndex(i => i.itemId.toString() === itemId);
        if (index > -1) {
          cart.items[index].quantity = quantity;
        }
      }

      await cart.save();
      return res.json({ success: true, message: "Updated" });
    } catch (error) {
      console.error("Update cart error:", error);
      return res.status(500).json({ success: false, error: "Server error" });
    }
  };

  // DELETE /api/cart/remove/:itemId
  removeFromCart = async (req: Request, res: Response): Promise<Response> => {
    try {
      const userId = (req as AuthenticatedRequest).userId;
      const { itemId } = req.params;

      const cart = await Cart.findOne({ userId: new mongoose.Types.ObjectId(userId) });
      if (!cart) {
        return res.status(404).json({ success: false, error: "Cart not found" });
      }

      cart.items = cart.items.filter(i => i.itemId.toString() !== itemId);
      await cart.save();

      return res.json({ success: true, message: "Removed" });
    } catch (error) {
      console.error("Remove cart error:", error);
      return res.status(500).json({ success: false, error: "Server error" });
    }
  };

  // DELETE /api/cart/clear
  clearCart = async (req: Request, res: Response): Promise<Response> => {
    try {
      const userId = (req as AuthenticatedRequest).userId;

      await Cart.findOneAndUpdate(
        { userId: new mongoose.Types.ObjectId(userId) },
        { items: [] },
        { upsert: true }
      );

      return res.json({ success: true, message: "Cleared" });
    } catch (error) {
      console.error("Clear cart error:", error);
      return res.status(500).json({ success: false, error: "Server error" });
    }
  };
}
