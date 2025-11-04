import { Response } from "express";
import Order from "../../data/models/Order";
import Cart from "../../data/models/Cart";
import mongoose from "mongoose";
import { AuthenticatedRequest } from "../middlewares/authentication";

interface PopulatedItem {
  _id: mongoose.Types.ObjectId;
  title: string;
  price: number;
  photo?: string[];
  owner: {
    _id: mongoose.Types.ObjectId;
    name?: string;
  };
  approvalStatus?: string;
  status?: string;
}

interface PopulatedSeller {
  _id: mongoose.Types.ObjectId;
  name?: string;
}

interface PopulatedBuyer {
  _id: mongoose.Types.ObjectId;
  name?: string;
  kuEmail?: string;
}

interface OrderItem {
  itemId: mongoose.Types.ObjectId;
  title: string;
  price: number;
  quantity: number;
  image?: string;
}

interface OrderFilter {
  buyer?: mongoose.Types.ObjectId;
  seller?: mongoose.Types.ObjectId;
  status?: string;
}

export default class OrderController {
  /**
   * POST /api/orders/checkout - Create order from cart
   */
  checkout = async (req: AuthenticatedRequest, res: Response): Promise<Response> => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ success: false, error: "Unauthorized" });
      }

      const { deliveryMethod, paymentMethod, shippingAddress, buyerContact } = req.body;

      // Validate required fields
      if (!deliveryMethod || !paymentMethod || !buyerContact) {
        return res.status(400).json({
          success: false,
          error: "Missing required fields: deliveryMethod, paymentMethod, buyerContact",
        });
      }

      if (deliveryMethod === "delivery" && !shippingAddress) {
        return res.status(400).json({
          success: false,
          error: "Shipping address is required for delivery",
        });
      }

      // Get cart
      const cart = await Cart.findOne({ userId: new mongoose.Types.ObjectId(userId) })
        .populate({
          path: "items.itemId",
          populate: { path: "owner", select: "name" },
        });

      if (!cart || cart.items.length === 0) {
        return res.status(400).json({
          success: false,
          error: "Cart is empty",
        });
      }

      // Group items by seller
      const itemsBySeller = new Map<string, OrderItem[]>();
      
      for (const cartItem of cart.items) {
        const item = cartItem.itemId as unknown as PopulatedItem;
        if (!item || !item.owner) {
          return res.status(400).json({
            success: false,
            error: "Some items are invalid or no longer available",
          });
        }

        // Check if item is approved
        if (item.approvalStatus !== "approved") {
          return res.status(400).json({
            success: false,
            error: `Item "${item.title}" is not approved yet`,
          });
        }

        // Check if item is available
        if (item.status !== "available") {
          return res.status(400).json({
            success: false,
            error: `Item "${item.title}" is no longer available`,
          });
        }

        const sellerId = item.owner._id.toString();
        if (!itemsBySeller.has(sellerId)) {
          itemsBySeller.set(sellerId, []);
        }

        itemsBySeller.get(sellerId)!.push({
          itemId: item._id,
          title: item.title,
          price: item.price,
          quantity: cartItem.quantity,
          image: item.photo?.[0],
        });
      }

      // Create orders for each seller
      const orders = [];
      for (const [sellerId, items] of itemsBySeller.entries()) {
        const totalPrice = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

        const orderData = {
          buyer: new mongoose.Types.ObjectId(userId),
          seller: new mongoose.Types.ObjectId(sellerId),
          items,
          totalPrice,
          status: "pending_seller_confirmation" as const,
          deliveryMethod,
          paymentMethod,
          shippingAddress: deliveryMethod === "delivery" ? shippingAddress : undefined,
          buyerContact,
        };

        const order = await Order.create(orderData);
        orders.push(order);
      }

      // Clear cart after successful order creation
      await Cart.findOneAndUpdate(
        { userId: new mongoose.Types.ObjectId(userId) },
        { items: [] }
      );

      return res.status(201).json({
        success: true,
        message: "Order created successfully",
        orders: orders.map((order) => ({
          id: order._id,
          seller: order.seller,
          items: order.items,
          totalPrice: order.totalPrice,
          status: order.status,
        })),
      });
    } catch (error) {
      console.error("Checkout error:", error);
      return res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : "Server error",
      });
    }
  };

  /**
   * GET /api/orders - Get buyer's orders
   */
  getBuyerOrders = async (req: AuthenticatedRequest, res: Response): Promise<Response> => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ success: false, error: "Unauthorized" });
      }

      const { status } = req.query;
      const filter: OrderFilter = { buyer: new mongoose.Types.ObjectId(userId) };

      if (status && typeof status === "string" && ["pending_seller_confirmation", "confirmed", "rejected", "completed", "cancelled"].includes(status)) {
        filter.status = status;
      }

      const orders = await Order.find(filter)
        .populate("seller", "name")
        .sort({ createdAt: -1 });

      return res.json({
        success: true,
        orders: orders.map((order) => ({
          id: order._id,
          seller: {
            id: (order.seller as unknown as PopulatedSeller)._id,
            name: (order.seller as unknown as PopulatedSeller).name,
          },
          items: order.items,
          totalPrice: order.totalPrice,
          status: order.status,
          deliveryMethod: order.deliveryMethod,
          shippingAddress: order.shippingAddress,
          paymentMethod: order.paymentMethod,
          buyerContact: order.buyerContact,
          confirmedAt: order.confirmedAt,
          rejectedAt: order.rejectedAt,
          rejectionReason: order.rejectionReason,
          completedAt: order.completedAt,
          createdAt: order.createdAt,
          updatedAt: order.updatedAt,
        })),
      });
    } catch (error) {
      console.error("Get buyer orders error:", error);
      return res.status(500).json({
        success: false,
        error: "Server error",
      });
    }
  };

  /**
   * GET /api/orders/:id - Get order details
   */
  getOrderDetails = async (req: AuthenticatedRequest, res: Response): Promise<Response> => {
    try {
      const userId = req.user?.id;
      const { id } = req.params;

      if (!userId) {
        return res.status(401).json({ success: false, error: "Unauthorized" });
      }

      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ success: false, error: "Invalid order ID" });
      }

      const order = await Order.findById(id)
        .populate("buyer", "name kuEmail")
        .populate("seller", "name");

      if (!order) {
        return res.status(404).json({ success: false, error: "Order not found" });
      }

      // Check if user is buyer or seller
      const buyerId = order.buyer.toString();
      const sellerId = order.seller.toString();

      if (userId !== buyerId && userId !== sellerId) {
        return res.status(403).json({ success: false, error: "Access denied" });
      }

      return res.json({
        success: true,
        order: {
          id: order._id,
          buyer: {
            id: (order.buyer as unknown as PopulatedBuyer)._id,
            name: (order.buyer as unknown as PopulatedBuyer).name,
            email: (order.buyer as unknown as PopulatedBuyer).kuEmail,
          },
          seller: {
            id: (order.seller as unknown as PopulatedSeller)._id,
            name: (order.seller as unknown as PopulatedSeller).name,
          },
          items: order.items,
          totalPrice: order.totalPrice,
          status: order.status,
          deliveryMethod: order.deliveryMethod,
          shippingAddress: order.shippingAddress,
          paymentMethod: order.paymentMethod,
          buyerContact: order.buyerContact,
          confirmedAt: order.confirmedAt,
          rejectedAt: order.rejectedAt,
          rejectionReason: order.rejectionReason,
          completedAt: order.completedAt,
          createdAt: order.createdAt,
          updatedAt: order.updatedAt,
        },
      });
    } catch (error) {
      console.error("Get order details error:", error);
      return res.status(500).json({
        success: false,
        error: "Server error",
      });
    }
  };
}

