import { Request, Response } from "express";
import Order from "../../data/models/Order";
import Cart from "../../data/models/Cart";
import mongoose from "mongoose";
import { AuthenticatedRequest } from "../middlewares/authentication";
import { createNotification } from "../../lib/notifications";
import { logActivity } from "../../lib/activityLogger";

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
  contact?: string;
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
  checkout = async (req: Request, res: Response): Promise<Response> => {
    try {
      const userId = (req as AuthenticatedRequest).user?.id;
      if (!userId) {
        return res.status(401).json({ success: false, error: "Unauthorized" });
      }

      const {
        deliveryMethod,
        paymentMethod,
        shippingAddress,
        buyerContact,
        pickupDetails,
      } = req.body;

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

      if (deliveryMethod === "pickup") {
        if (
          !pickupDetails ||
          typeof pickupDetails.locationName !== "string" ||
          pickupDetails.locationName.trim().length === 0
        ) {
          return res.status(400).json({
            success: false,
            error: "Pickup location is required for self pick-up orders",
          });
        }
      }

      // Get cart
      const cart = await Cart.findOne({ userId: new mongoose.Types.ObjectId(userId) })
        .populate({
          path: "items.itemId",
          populate: { path: "owner", select: "_id name" },
        });

      if (!cart || cart.items.length === 0) {
        return res.status(400).json({
          success: false,
          error: "Cart is empty",
        });
      }

      // Prevent purchasing own items
      for (const cartItem of cart.items) {
        const item = cartItem.itemId as unknown as PopulatedItem;
        if (item?.owner?._id?.toString() === String(userId)) {
          return res.status(400).json({
            success: false,
            error: "You cannot purchase your own item",
          });
        }
      }

      // Group items by seller
      const itemsBySeller = new Map<string, OrderItem[]>();
      const invalidItemIds: string[] = [];
      const invalidReasons: string[] = [];
      
      for (const cartItem of cart.items) {
        const item = cartItem.itemId as unknown as PopulatedItem | undefined;
        if (!item || !item.owner) {
          invalidItemIds.push((cartItem.itemId as unknown as { _id?: mongoose.Types.ObjectId })?._id?.toString() || "");
          invalidReasons.push("invalid");
          continue;
        }

        // Check if item is approved
        if (item.approvalStatus !== "approved") {
          invalidItemIds.push(item._id.toString());
          invalidReasons.push(`not approved: ${item.title}`);
          continue;
        }

        // Check if item is available
        if (item.status !== "available") {
          invalidItemIds.push(item._id.toString());
          invalidReasons.push(`not available: ${item.title}`);
          continue;
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

      // If there are invalid items, remove them from cart to avoid repeated errors
      if (invalidItemIds.length > 0) {
        cart.items = cart.items.filter(
          (ci) => {
            const id = (ci.itemId as unknown as { _id?: mongoose.Types.ObjectId })?._id?.toString();
            return id ? !invalidItemIds.includes(id) : false;
          }
        );
        await cart.save();
      }

      // If after filtering, there are no valid items left, block checkout
      if (itemsBySeller.size === 0) {
        return res.status(400).json({
          success: false,
          error: "Some items are invalid or no longer available. We have updated your cart.",
          removed: invalidReasons,
        });
      }

      // Create orders for each seller
      const orders = [];
      for (const [sellerId, items] of itemsBySeller.entries()) {
        const totalPrice = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

        let normalizedPickupDetails:
          | {
              locationName: string;
              address?: string;
              note?: string;
              coordinates?: { lat: number; lng: number };
              preferredTime?: Date;
            }
          | undefined;

        if (deliveryMethod === "pickup" && pickupDetails) {
          const locationName = String(pickupDetails.locationName || "").trim();
          const locationAddress =
            typeof pickupDetails.address === "string"
              ? pickupDetails.address.trim()
              : undefined;
          const note =
            typeof pickupDetails.note === "string"
              ? pickupDetails.note.trim()
              : undefined;
          if (!locationName) {
            return res.status(400).json({
              success: false,
              error: "Pickup location name is required",
            });
          }

          let coordinates:
            | {
                lat: number;
                lng: number;
              }
            | undefined;

          if (pickupDetails.coordinates) {
            const lat = Number(pickupDetails.coordinates.lat);
            const lng = Number(pickupDetails.coordinates.lng);

            if (Number.isNaN(lat) || Number.isNaN(lng)) {
              return res.status(400).json({
                success: false,
                error: "Pickup coordinates must be valid numbers",
              });
            }

            coordinates = { lat, lng };
          }

          let preferredTime: Date | undefined;
          if (pickupDetails.preferredTime) {
            const time = new Date(pickupDetails.preferredTime);
            if (isNaN(time.getTime())) {
              return res.status(400).json({
                success: false,
                error: "Preferred time must be a valid date",
              });
            }
            preferredTime = time;
          }

          normalizedPickupDetails = {
            locationName,
            address: locationAddress || undefined,
            note: note || undefined,
            coordinates,
            preferredTime,
          };
        }

        const orderData = {
          buyer: new mongoose.Types.ObjectId(userId),
          seller: new mongoose.Types.ObjectId(sellerId),
          items,
          totalPrice,
          status: "pending_seller_confirmation" as const,
          deliveryMethod,
          paymentMethod,
          paymentStatus:
            paymentMethod === "transfer" || paymentMethod === "promptpay"
              ? "pending"
              : "not_required",
          shippingAddress: deliveryMethod === "delivery" ? shippingAddress : undefined,
          pickupDetails: deliveryMethod === "pickup" ? normalizedPickupDetails : undefined,
          buyerContact,
        };

        const order = await Order.create(orderData);
        orders.push(order);

        // Log order creation
        await logActivity({
          req,
          activityType: "order_created",
          entityType: "order",
          entityId: String(order._id),
          description: `Buyer created order ${order._id} with ${items.length} item(s), total ${totalPrice} THB`,
          metadata: {
            orderId: String(order._id),
            orderTotal: totalPrice,
            paymentMethod: paymentMethod,
            deliveryMethod: deliveryMethod,
            itemCount: items.length,
          },
        });

        // Notify seller about new order
        await createNotification(
          sellerId,
          "order",
          "New Order Received",
          `You have a new order for ${items.length} item(s). Total: ${totalPrice} THB`,
          `/seller/orders/${order._id}`
        );
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
          paymentStatus: order.paymentStatus,
          pickupDetails: order.pickupDetails,
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
  getBuyerOrders = async (req: Request, res: Response): Promise<Response> => {
    try {
      const userId = (req as AuthenticatedRequest).user?.id;
      if (!userId) {
        return res.status(401).json({ success: false, error: "Unauthorized" });
      }

      const { status, page, limit } = req.query as {
        status?: string;
        page?: string;
        limit?: string;
      };
      const filter: OrderFilter = { buyer: new mongoose.Types.ObjectId(userId) };

      if (status && typeof status === "string" && ["pending_seller_confirmation", "confirmed", "rejected", "completed", "cancelled"].includes(status)) {
        filter.status = status;
      }

      // Pagination
      const pageNum = parseInt(page || "1", 10);
      const limitNum = Math.min(parseInt(limit || "10", 10), 50); // Max 50 per page
      const skip = (pageNum - 1) * limitNum;

      // Get total count, status counts, and paginated orders in parallel
      const [total, orders, statusCounts] = await Promise.all([
        Order.countDocuments(filter),
        Order.find(filter)
          .populate("seller", "name contact")
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limitNum)
          .lean(),
        // Get status counts for all buyer orders (not filtered by status)
        Promise.all([
          Order.countDocuments({ buyer: new mongoose.Types.ObjectId(userId), status: "pending_seller_confirmation" }),
          Order.countDocuments({ buyer: new mongoose.Types.ObjectId(userId), status: "confirmed" }),
          Order.countDocuments({ buyer: new mongoose.Types.ObjectId(userId), status: "completed" }),
          Order.countDocuments({ buyer: new mongoose.Types.ObjectId(userId), status: "rejected" }),
          Order.countDocuments({ buyer: new mongoose.Types.ObjectId(userId), status: "cancelled" }),
        ]).then(([pending, confirmed, completed, rejected, cancelled]) => ({
          pending_seller_confirmation: pending,
          confirmed,
          completed,
          rejected,
          cancelled,
        })),
      ]);

      return res.json({
        success: true,
        orders: orders.map((order) => ({
          id: order._id,
          seller: {
            id: (order.seller as unknown as PopulatedSeller)._id,
            name: (order.seller as unknown as PopulatedSeller).name,
            contact: (order.seller as unknown as PopulatedSeller).contact,
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
        })),
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          totalPages: Math.ceil(total / limitNum),
        },
        statusCounts,
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
  getOrderDetails = async (req: Request, res: Response): Promise<Response> => {
    try {
      const userId = (req as AuthenticatedRequest).user?.id;
      const { id } = req.params;

      if (!userId) {
        return res.status(401).json({ success: false, error: "Unauthorized" });
      }

      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ success: false, error: "Invalid order ID" });
      }

      const order = await Order.findById(id)
        .populate("buyer", "name kuEmail")
        .populate("seller", "name contact");

      if (!order) {
        return res.status(404).json({ success: false, error: "Order not found" });
      }

      // Check if user is buyer or seller
      const buyerId = (
        order.buyer as unknown as PopulatedBuyer
      )._id.toString();
      const sellerId = (
        order.seller as unknown as PopulatedSeller
      )._id.toString();

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
            contact: (order.seller as unknown as PopulatedSeller).contact,
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
          paymentSubmittedAt: order.paymentSubmittedAt,
          buyerReceived: order.buyerReceived,
          buyerReceivedAt: order.buyerReceivedAt,
          sellerDelivered: order.sellerDelivered,
          sellerDeliveredAt: order.sellerDeliveredAt,
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

  /**
   * POST /api/orders/:id/payment - Buyer submits payment notification
   */
  submitPaymentNotification = async (req: Request, res: Response): Promise<Response> => {
    try {
      const userId = (req as AuthenticatedRequest).user?.id;
      const { id } = req.params;

      if (!userId) {
        return res.status(401).json({ success: false, error: "Unauthorized" });
      }

      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ success: false, error: "Invalid order ID" });
      }

      const order = await Order.findById(id);

      if (!order) {
        return res.status(404).json({ success: false, error: "Order not found" });
      }

      if (order.buyer.toString() !== userId) {
        return res.status(403).json({ success: false, error: "Access denied" });
      }

      if (order.paymentMethod !== "transfer" && order.paymentMethod !== "promptpay") {
        return res.status(400).json({ success: false, error: "Payment confirmation not required for this order" });
      }

      if (order.status !== "confirmed") {
        return res.status(400).json({
          success: false,
          error: `Cannot submit payment for order in status: ${order.status}`,
        });
      }

      if (order.paymentStatus === "payment_submitted" || order.paymentStatus === "paid") {
        return res.status(400).json({
          success: false,
          error: "Payment has already been submitted for this order",
        });
      }

      order.paymentStatus = "payment_submitted";
      order.paymentSubmittedAt = new Date();
      await order.save();

      // Log payment submission (CRITICAL for payment tracking - especially QR code payments)
      const paymentMethodLabel = order.paymentMethod === "promptpay" ? "PromptPay QR" : order.paymentMethod === "transfer" ? "Bank Transfer" : "Cash";
      await logActivity({
        req,
        activityType: "payment_submitted",
        entityType: "payment",
        entityId: String(order._id),
        description: `Buyer submitted payment notification for order ${order._id} via ${paymentMethodLabel} - Amount: ${order.totalPrice} THB`,
        metadata: {
          orderId: String(order._id),
          orderTotal: order.totalPrice,
          paymentMethod: order.paymentMethod,
          paymentStatus: order.paymentStatus,
          isQRPayment: order.paymentMethod === "promptpay",
          paymentSubmittedAt: new Date().toISOString(),
        },
      });

      await createNotification(
        order.seller,
        "order",
        "Buyer submitted payment",
        "The buyer has submitted payment for an order. Please verify and update the status.",
        `/seller/orders/${order._id}`
      );

      return res.json({
        success: true,
        message: "Payment submitted notification sent to the seller",
        order: {
          id: order._id,
          paymentStatus: order.paymentStatus,
          paymentSubmittedAt: order.paymentSubmittedAt,
        },
      });
    } catch (error) {
      console.error("Submit payment notification error:", error);
      return res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : "Server error",
      });
    }
  };

  /**
   * POST /api/orders/:id/buyer-received - Buyer confirms they received the product
   */
  buyerReceived = async (req: Request, res: Response): Promise<Response> => {
    try {
      const userId = (req as AuthenticatedRequest).user?.id;
      const { id } = req.params;

      if (!userId) {
        return res.status(401).json({ success: false, error: "Unauthorized" });
      }

      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ success: false, error: "Invalid order ID" });
      }

      const order = await Order.findById(id);

      if (!order) {
        return res.status(404).json({ success: false, error: "Order not found" });
      }

      if (order.buyer.toString() !== userId) {
        return res.status(403).json({ success: false, error: "Access denied" });
      }

      if (order.status !== "confirmed") {
        return res.status(400).json({
          success: false,
          error: `Cannot mark as received. Order status must be confirmed. Current status: ${order.status}`,
        });
      }

      if (order.deliveryMethod !== "pickup") {
        return res.status(400).json({
          success: false,
          error: "This feature is only available for pickup orders",
        });
      }

      if (order.buyerReceived) {
        return res.status(400).json({
          success: false,
          error: "You have already confirmed receiving this order",
        });
      }

      order.buyerReceived = true;
      order.buyerReceivedAt = new Date();

      // Log buyer received (at pickup point)
      const pickupLocation = order.pickupDetails?.locationName || order.pickupDetails?.address || "Pickup point";
      await logActivity({
        req,
        activityType: "buyer_received",
        entityType: "order",
        entityId: String(order._id),
        description: `Buyer confirmed receiving order ${order._id} at pickup point: ${pickupLocation}`,
        metadata: {
          orderId: String(order._id),
          orderTotal: order.totalPrice,
          deliveryMethod: order.deliveryMethod,
          pickupLocation: pickupLocation,
          receivedAtPickupPoint: true,
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
        success: true,
        message: "Order marked as received",
        order: {
          id: order._id,
          buyerReceived: order.buyerReceived,
          buyerReceivedAt: order.buyerReceivedAt,
          status: order.status,
          completedAt: order.completedAt,
        },
      });
    } catch (error) {
      console.error("Buyer received error:", error);
      return res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : "Server error",
      });
    }
  };

}

