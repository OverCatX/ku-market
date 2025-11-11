import { Response } from "express";
import Item from "../../data/models/Item";
import Shop from "../../data/models/Shop";
import Order from "../../data/models/Order";
import User from "../../data/models/User";
import mongoose from "mongoose";
import { AuthenticatedRequest } from "../middlewares/authentication";
import { createNotification } from "../../lib/notifications";

export default class SellerController {
  /**
   * Get seller dashboard statistics
   */
  getStats = async (req: AuthenticatedRequest, res: Response): Promise<Response> => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      // Get shop
      const shop = await Shop.findOne({ owner: userId, shopStatus: "approved" });
      if (!shop) {
        return res.status(404).json({ error: "No approved shop found" });
      }

      // Get item count
      const totalItems = await Item.countDocuments({ owner: userId });

      // Get order statistics
      const totalOrders = await Order.countDocuments({ seller: userId });
      const pendingOrders = await Order.countDocuments({
        seller: userId,
        status: "pending_seller_confirmation",
      });

      // Calculate total revenue (sum of completed orders)
      const completedOrders = await Order.find({
        seller: userId,
        status: "completed",
      });
      const totalRevenue = completedOrders.reduce((sum, order) => sum + order.totalPrice, 0);

      const stats = {
        totalOrders,
        pendingOrders,
        totalItems,
        totalRevenue,
      };

      return res.json(stats);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to get stats";
      return res.status(500).json({ error: message });
    }
  };

  /**
   * Get seller's orders
   */
  getOrders = async (req: AuthenticatedRequest, res: Response): Promise<Response> => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      // Get shop
      const shop = await Shop.findOne({ owner: userId, shopStatus: "approved" });
      if (!shop) {
        return res.status(404).json({ error: "No approved shop found" });
      }

      // Get query parameters
      const { status } = req.query;
      interface OrderFilter {
        seller: mongoose.Types.ObjectId;
        status?: string;
      }
      const filter: OrderFilter = { seller: new mongoose.Types.ObjectId(userId) };

      if (status && typeof status === "string" && ["pending_seller_confirmation", "confirmed", "rejected", "completed", "cancelled"].includes(status)) {
        filter.status = status;
      }

      // Get orders
      const orders = await Order.find(filter)
        .populate("buyer", "name kuEmail")
        .sort({ createdAt: -1 });

      interface PopulatedBuyer {
        _id: mongoose.Types.ObjectId;
        name?: string;
        kuEmail?: string;
      }
      
      return res.json({
        orders: orders.map((order) => {
          const buyer = order.buyer as unknown as PopulatedBuyer;
          return {
            id: order._id,
            buyer: {
              id: buyer._id,
              name: buyer.name,
              email: buyer.kuEmail,
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
          };
        }),
      });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to get orders";
      return res.status(500).json({ error: message });
    }
  };

  /**
   * Get a single order detail for the seller
   */
  getOrderDetail = async (req: AuthenticatedRequest, res: Response): Promise<Response> => {
    try {
      const userId = req.user?.id;
      const { orderId } = req.params;

      if (!userId) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      const shop = await Shop.findOne({ owner: userId, shopStatus: "approved" });
      if (!shop) {
        return res.status(404).json({ error: "No approved shop found" });
      }

      if (!mongoose.Types.ObjectId.isValid(orderId)) {
        return res.status(400).json({ error: "Invalid order ID" });
      }

      const order = await Order.findById(orderId)
        .populate("buyer", "name kuEmail contact")
        .populate("seller", "name kuEmail contact");

      if (!order) {
        return res.status(404).json({ error: "Order not found" });
      }

      const sellerId = order.seller instanceof mongoose.Types.ObjectId
        ? order.seller.toString()
        : ((order.seller as unknown as { _id: mongoose.Types.ObjectId })._id.toString());

      if (sellerId !== userId) {
        return res.status(403).json({ error: "Access denied. This order does not belong to you." });
      }

      const sellerUser = await User.findById(userId).select("name kuEmail contact").lean();

      const buyer = order.buyer as unknown as {
        _id: mongoose.Types.ObjectId;
        name?: string;
        kuEmail?: string;
        contact?: string;
      };

      return res.json({
        order: {
          id: order._id,
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
        buyer: {
          id: buyer?._id,
          name: buyer?.name,
          email: buyer?.kuEmail,
          phone: order.buyerContact.phone,
        },
        seller: {
          id: sellerId,
          name: sellerUser?.name,
          email: sellerUser?.kuEmail,
          phone: sellerUser?.contact,
          shopName: shop.shopName,
          shopType: shop.shopType,
        },
      });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to get order detail";
      return res.status(500).json({ error: message });
    }
  };

  /**
   * Confirm an order
   */
  confirmOrder = async (req: AuthenticatedRequest, res: Response): Promise<Response> => {
    try {
      const userId = req.user?.id;
      const { orderId } = req.params;

      if (!userId) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      // Get shop
      const shop = await Shop.findOne({ owner: userId, shopStatus: "approved" });
      if (!shop) {
        return res.status(404).json({ error: "No approved shop found" });
      }

      if (!mongoose.Types.ObjectId.isValid(orderId)) {
        return res.status(400).json({ error: "Invalid order ID" });
      }

      // Find order and populate buyer
      const order = await Order.findById(orderId).populate("buyer", "name");
      if (!order) {
        return res.status(404).json({ error: "Order not found" });
      }

      // Check if order belongs to this seller
      if (order.seller.toString() !== userId) {
        return res.status(403).json({ error: "Access denied. This order does not belong to you." });
      }

      // Check if order can be confirmed
      if (order.status !== "pending_seller_confirmation") {
        return res.status(400).json({
          error: `Cannot confirm order. Current status: ${order.status}`,
        });
      }

      // Update order status
      order.status = "confirmed";
      order.confirmedAt = new Date();
      await order.save();

      // Update item statuses to reserved
      for (const orderItem of order.items) {
        await Item.findByIdAndUpdate(orderItem.itemId, {
          status: "reserved",
        });
      }

      // Notify buyer that order is confirmed
      await createNotification(
        order.buyer,
        "order",
        "Order Confirmed",
        `Your order has been confirmed by the seller!`,
        `/order/${order._id}`
      );

      return res.json({
        message: "Order confirmed successfully",
        order: {
          id: order._id,
          status: order.status,
          confirmedAt: order.confirmedAt,
        },
      });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to confirm order";
      return res.status(500).json({ error: message });
    }
  };

  /**
   * Reject an order
   */
  rejectOrder = async (req: AuthenticatedRequest, res: Response): Promise<Response> => {
    try {
      const userId = req.user?.id;
      const { orderId } = req.params;

      if (!userId) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      // Get shop
      const shop = await Shop.findOne({ owner: userId, shopStatus: "approved" });
      if (!shop) {
        return res.status(404).json({ error: "No approved shop found" });
      }

      if (!mongoose.Types.ObjectId.isValid(orderId)) {
        return res.status(400).json({ error: "Invalid order ID" });
      }

      const { reason } = req.body;

      // Find order and populate buyer
      const order = await Order.findById(orderId).populate("buyer", "name");
      if (!order) {
        return res.status(404).json({ error: "Order not found" });
      }

      // Check if order belongs to this seller
      if (order.seller.toString() !== userId) {
        return res.status(403).json({ error: "Access denied. This order does not belong to you." });
      }

      // Check if order can be rejected
      if (order.status !== "pending_seller_confirmation") {
        return res.status(400).json({
          error: `Cannot reject order. Current status: ${order.status}`,
        });
      }

      // Update order status
      order.status = "rejected";
      order.rejectedAt = new Date();
      if (reason) {
        order.rejectionReason = reason;
      }
      await order.save();

      // Notify buyer that order is rejected
      await createNotification(
        order.buyer,
        "order",
        "Order Rejected",
        reason 
          ? `Your order has been rejected. Reason: ${reason}`
          : "Your order has been rejected by the seller.",
        `/order/${order._id}`
      );

      return res.json({
        message: "Order rejected successfully",
        order: {
          id: order._id,
          status: order.status,
          rejectedAt: order.rejectedAt,
          rejectionReason: order.rejectionReason,
        },
      });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to reject order";
      return res.status(500).json({ error: message });
    }
  };

  /**
   * Get seller's items
   */
  getItems = async (req: AuthenticatedRequest, res: Response): Promise<Response> => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      // Get shop
      const shop = await Shop.findOne({ owner: userId, shopStatus: "approved" });
      if (!shop) {
        return res.status(404).json({ error: "No approved shop found" });
      }

      // Get items with approval status
      const items = await Item.find({ owner: userId })
        .sort({ createAt: -1 })
        .select("-__v");

      return res.json({
        items: items.map((item) => ({
          id: item._id,
          title: item.title,
          description: item.description,
          category: item.category,
          price: item.price,
          status: item.status,
          approvalStatus: item.approvalStatus,
          rejectionReason: item.rejectionReason,
          photo: item.photo,
          createdAt: (item as unknown as { createdAt?: Date }).createdAt || item.createAt || new Date(),
          updatedAt: (item as unknown as { updatedAt?: Date }).updatedAt || item.updateAt || new Date(),
        })),
      });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to get items";
      return res.status(500).json({ error: message });
    }
  };
}

