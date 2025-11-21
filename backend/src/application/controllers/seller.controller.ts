import { Request, Response } from "express";
import Item from "../../data/models/Item";
import Shop from "../../data/models/Shop";
import Order from "../../data/models/Order";
import User from "../../data/models/User";
import mongoose from "mongoose";
import { AuthenticatedRequest } from "../middlewares/authentication";
import { createNotification } from "../../lib/notifications";
import { logActivity } from "../../lib/activityLogger";

export default class SellerController {
  /**
   * Get seller dashboard statistics
   */
  getStats = async (req: Request, res: Response): Promise<Response> => {
    try {
      const userId = (req as AuthenticatedRequest).user?.id;
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
  getOrders = async (req: Request, res: Response): Promise<Response> => {
    try {
      const userId = (req as AuthenticatedRequest).user?.id;
      if (!userId) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      // Get shop
      const shop = await Shop.findOne({ owner: userId, shopStatus: "approved" });
      if (!shop) {
        return res.status(404).json({ error: "No approved shop found" });
      }

      // Get query parameters
      const { status, page, limit } = req.query as {
        status?: string;
        page?: string;
        limit?: string;
      };
      interface OrderFilter {
        seller: mongoose.Types.ObjectId;
        status?: string;
      }
      const filter: OrderFilter = { seller: new mongoose.Types.ObjectId(userId) };

      if (status && typeof status === "string" && ["pending_seller_confirmation", "confirmed", "rejected", "completed", "cancelled"].includes(status)) {
        filter.status = status;
      }

      // Pagination
      const pageNum = parseInt(page || "1", 10);
      const limitNum = Math.min(parseInt(limit || "10", 10), 50); // Max 50 per page
      const skip = (pageNum - 1) * limitNum;

      // Get total count and paginated orders in parallel
      const [total, orders] = await Promise.all([
        Order.countDocuments(filter),
        Order.find(filter)
          .populate("buyer", "name kuEmail")
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limitNum)
          .lean(),
      ]);

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
            pickupDetails: order.pickupDetails,
            paymentMethod: order.paymentMethod,
            paymentStatus: order.paymentStatus,
            buyerContact: order.buyerContact,
            confirmedAt: order.confirmedAt,
            rejectedAt: order.rejectedAt,
            rejectionReason: order.rejectionReason,
            completedAt: order.completedAt,
            buyerReceived: order.buyerReceived,
            buyerReceivedAt: order.buyerReceivedAt,
            sellerDelivered: order.sellerDelivered,
            sellerDeliveredAt: order.sellerDeliveredAt,
            createdAt: order.createdAt,
            updatedAt: order.updatedAt,
          };
        }),
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          totalPages: Math.ceil(total / limitNum),
        },
      });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to get orders";
      return res.status(500).json({ error: message });
    }
  };

  /**
   * Get a single order detail for the seller
   */
  getOrderDetail = async (req: Request, res: Response): Promise<Response> => {
    try {
      const userId = (req as AuthenticatedRequest).user?.id;
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
          pickupDetails: order.pickupDetails,
          paymentMethod: order.paymentMethod,
          paymentStatus: order.paymentStatus,
          buyerContact: order.buyerContact,
          confirmedAt: order.confirmedAt,
          rejectedAt: order.rejectedAt,
          rejectionReason: order.rejectionReason,
          completedAt: order.completedAt,
          buyerReceived: order.buyerReceived,
          buyerReceivedAt: order.buyerReceivedAt,
          sellerDelivered: order.sellerDelivered,
          sellerDeliveredAt: order.sellerDeliveredAt,
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
  confirmOrder = async (req: Request, res: Response): Promise<Response> => {
    try {
      const userId = (req as AuthenticatedRequest).user?.id;
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
      if (order.paymentMethod === "transfer" || order.paymentMethod === "promptpay") {
        order.paymentStatus = "awaiting_payment";
      } else {
        order.paymentStatus = "not_required";
      }
      await order.save();

      // Log order confirmation
      const { logActivity } = await import("../../lib/activityLogger");
      await logActivity({
        req,
        activityType: "order_confirmed",
        entityType: "order",
        entityId: String(order._id),
        description: `Seller confirmed order ${order._id} - Payment method: ${order.paymentMethod === "promptpay" ? "PromptPay QR" : order.paymentMethod === "transfer" ? "Bank Transfer" : "Cash"}`,
        metadata: {
          orderId: String(order._id),
          orderTotal: order.totalPrice,
          paymentMethod: order.paymentMethod,
          paymentStatus: order.paymentStatus,
          requiresPayment: order.paymentMethod === "promptpay" || order.paymentMethod === "transfer",
        },
      });

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
  rejectOrder = async (req: Request, res: Response): Promise<Response> => {
    try {
      const userId = (req as AuthenticatedRequest).user?.id;
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

      // Log order rejection
      const { logActivity: logRejection } = await import("../../lib/activityLogger");
      await logRejection({
        req,
        activityType: "order_rejected",
        entityType: "order",
        entityId: String(order._id),
        description: `Seller rejected order ${order._id}${reason ? `: ${reason}` : ""}`,
        metadata: {
          orderId: String(order._id),
          orderTotal: order.totalPrice,
          rejectionReason: reason || "No reason provided",
        },
      });

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
  getItems = async (req: Request, res: Response): Promise<Response> => {
    try {
      const userId = (req as AuthenticatedRequest).user?.id;
      if (!userId) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      // Get shop
      const shop = await Shop.findOne({ owner: userId, shopStatus: "approved" });
      if (!shop) {
        return res.status(404).json({ error: "No approved shop found" });
      }

      const { page, limit } = req.query as {
        page?: string;
        limit?: string;
      };

      // Pagination
      const pageNum = parseInt(page || "1", 10);
      const limitNum = Math.min(parseInt(limit || "12", 10), 50); // Max 50 per page
      const skip = (pageNum - 1) * limitNum;

      // Get total count and paginated items in parallel
      const [total, items] = await Promise.all([
        Item.countDocuments({ owner: userId }),
        Item.find({ owner: userId })
          .sort({ createAt: -1 })
          .select("-__v")
          .skip(skip)
          .limit(limitNum)
          .lean(),
      ]);

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
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          totalPages: Math.ceil(total / limitNum),
        },
      });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to get items";
      return res.status(500).json({ error: message });
    }
  };

  /**
   * Update item availability status
   */
  updateItemStatus = async (req: Request, res: Response): Promise<Response> => {
    try {
      const userId = (req as AuthenticatedRequest).user?.id;
      const { itemId } = req.params;
      const { status } = req.body as { status?: string };

      if (!userId) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      if (!itemId || !mongoose.Types.ObjectId.isValid(itemId)) {
        return res.status(400).json({ error: "Invalid item ID" });
      }

      const allowedStatuses = ["available", "reserved", "sold"] as const;
      if (!status || !allowedStatuses.includes(status as typeof allowedStatuses[number])) {
        return res.status(400).json({ error: "Invalid status value" });
      }

      const shop = await Shop.findOne({ owner: userId, shopStatus: "approved" });
      if (!shop) {
        return res.status(404).json({ error: "No approved shop found" });
      }

      const item = await Item.findOne({ _id: itemId, owner: userId });
      if (!item) {
        return res.status(404).json({ error: "Item not found" });
      }

      const previousStatus = item.status;
      item.status = status as typeof allowedStatuses[number];
      await item.save();

      // Log seller action
      await logActivity({
        req,
        activityType: "item_updated",
        entityType: "item",
        entityId: itemId,
        description: `Seller updated item status: "${item.title}" from ${previousStatus} to ${item.status}`,
        metadata: {
          itemId: itemId,
          itemTitle: item.title,
          previousStatus: previousStatus,
          newStatus: item.status,
        },
      });

      return res.json({
        message: "Item status updated successfully",
        item: {
          id: item._id,
          status: item.status,
          updatedAt:
            (item as unknown as { updatedAt?: Date }).updatedAt ||
            item.updateAt ||
            new Date(),
        },
      });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to update item status";
      return res.status(500).json({ error: message });
    }
  };

  /**
   * POST /api/seller/orders/:orderId/delivered - Seller confirms they delivered the product
   */
  markDelivered = async (req: Request, res: Response): Promise<Response> => {
    try {
      const userId = (req as AuthenticatedRequest).user?.id;
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

      const order = await Order.findById(orderId);

      if (!order) {
        return res.status(404).json({ error: "Order not found" });
      }

      if (order.seller.toString() !== userId) {
        return res.status(403).json({ error: "Access denied. This order does not belong to you." });
      }

      if (order.status !== "confirmed") {
        return res.status(400).json({
          error: `Cannot mark as delivered. Order status must be confirmed. Current status: ${order.status}`,
        });
      }

      if (order.deliveryMethod !== "pickup") {
        return res.status(400).json({
          error: "This feature is only available for pickup orders",
        });
      }

      if (order.sellerDelivered) {
        return res.status(400).json({
          error: "You have already confirmed delivering this order",
        });
      }

      // Check payment status for PromptPay/Transfer orders
      // Seller must wait for buyer to complete payment before marking as delivered
      if (order.paymentMethod === "promptpay" || order.paymentMethod === "transfer") {
        if (!order.paymentStatus || 
            (order.paymentStatus !== "paid" && order.paymentStatus !== "payment_submitted")) {
          return res.status(400).json({
            error: "Cannot mark as delivered. Buyer has not completed payment yet. Please wait for payment confirmation.",
          });
        }
      }

      order.sellerDelivered = true;
      order.sellerDeliveredAt = new Date();

      // Log seller delivered
      const { logActivity } = await import("../../lib/activityLogger");
      await logActivity({
        req,
        activityType: "seller_delivered",
        entityType: "order",
        entityId: String(order._id),
        description: `Seller confirmed delivering order ${order._id}`,
        metadata: {
          orderId: String(order._id),
          orderTotal: order.totalPrice,
        },
      });

      // If both buyer and seller confirmed, complete the order
      if (order.buyerReceived && order.sellerDelivered) {
        order.status = "completed";
        order.completedAt = new Date();

        // Log order completion
        await logActivity({
          req,
          activityType: "order_completed",
          entityType: "order",
          entityId: String(order._id),
          description: `Order ${order._id} completed`,
          metadata: {
            orderId: String(order._id),
            orderTotal: order.totalPrice,
          },
        });

        // Notify both parties
        await createNotification(
          order.buyer,
          "order",
          "Order Completed",
          "Your order has been completed!",
          `/order/${order._id}`
        );
        await createNotification(
          order.seller,
          "order",
          "Order Completed",
          "The order has been completed!",
          `/seller/orders/${order._id}`
        );
      }

      await order.save();

      return res.json({
        message: "Order marked as delivered",
        order: {
          id: order._id,
          sellerDelivered: order.sellerDelivered,
          sellerDeliveredAt: order.sellerDeliveredAt,
          status: order.status,
          completedAt: order.completedAt,
        },
      });
    } catch (error) {
      console.error("Seller delivered error:", error);
      const message = error instanceof Error ? error.message : "Server error";
      return res.status(500).json({ error: message });
    }
  };
}

