import mongoose, { Document, Schema } from "mongoose";

export type ActivityType =
  | "payment_submitted"
  | "payment_confirmed"
  | "payment_qr_generated"
  | "order_created"
  | "order_confirmed"
  | "order_rejected"
  | "order_completed"
  | "order_cancelled"
  | "buyer_received"
  | "seller_delivered"
  | "review_created"
  | "review_deleted"
  | "item_created"
  | "item_updated"
  | "item_deleted"
  | "shop_created"
  | "shop_updated"
  | "shop_deleted"
  | "shop_cancelled"
  | "verification_submitted"
  | "verification_approved"
  | "verification_rejected"
  | "user_login"
  | "user_logout"
  | "profile_updated"
  | "report_submitted"
  | "report_item_submitted"
  | "admin_verification_approved"
  | "admin_verification_rejected"
  | "admin_shop_approved"
  | "admin_shop_rejected"
  | "admin_item_approved"
  | "admin_item_rejected"
  | "admin_item_updated"
  | "admin_item_deleted"
  | "admin_review_deleted"
  | "admin_user_deleted"
  | "admin_user_promoted"
  | "admin_user_demoted"
  | "admin_order_marked_paid"
  | "admin_order_marked_completed"
  | "admin_order_cancelled"
  | "admin_meetup_preset_created"
  | "admin_meetup_preset_updated"
  | "admin_meetup_preset_deleted";

export type UserRole = "buyer" | "seller" | "admin";

export interface IActivityLog extends Document {
  userId: mongoose.Types.ObjectId;
  userRole: UserRole;
  userName: string;
  userEmail: string;
  activityType: ActivityType;
  entityType: "order" | "payment" | "review" | "item" | "shop" | "user" | "verification" | "system";
  entityId?: mongoose.Types.ObjectId;
  description: string;
  metadata?: {
    orderId?: string;
    orderTotal?: number;
    paymentMethod?: string;
    paymentStatus?: string;
    itemId?: string;
    itemTitle?: string;
    reviewId?: string;
    shopId?: string;
    shopName?: string;
    ipAddress?: string;
    userAgent?: string;
    [key: string]: unknown;
  };
  ipAddress?: string;
  userAgent?: string;
  createdAt: Date;
}

const ActivityLogSchema = new Schema<IActivityLog>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    userRole: {
      type: String,
      enum: ["buyer", "seller", "admin"],
      required: true,
      index: true,
    },
    userName: {
      type: String,
      required: true,
    },
    userEmail: {
      type: String,
      required: true,
      index: true,
    },
    activityType: {
      type: String,
      enum: [
        "payment_submitted",
        "payment_confirmed",
        "payment_qr_generated",
        "order_created",
        "order_confirmed",
        "order_rejected",
        "order_completed",
        "order_cancelled",
        "buyer_received",
        "seller_delivered",
        "review_created",
        "review_deleted",
        "item_created",
        "item_updated",
        "item_deleted",
        "shop_created",
        "shop_updated",
        "shop_deleted",
        "shop_cancelled",
        "verification_submitted",
        "verification_approved",
        "verification_rejected",
        "user_login",
        "user_logout",
        "profile_updated",
        "report_submitted",
        "report_item_submitted",
        "admin_verification_approved",
        "admin_verification_rejected",
        "admin_shop_approved",
        "admin_shop_rejected",
        "admin_item_approved",
        "admin_item_rejected",
        "admin_item_updated",
        "admin_item_deleted",
        "admin_review_deleted",
        "admin_user_deleted",
        "admin_user_promoted",
        "admin_user_demoted",
        "admin_order_marked_paid",
        "admin_order_marked_completed",
        "admin_order_cancelled",
        "admin_meetup_preset_created",
        "admin_meetup_preset_updated",
        "admin_meetup_preset_deleted",
      ],
      required: true,
      index: true,
    },
    entityType: {
      type: String,
      enum: ["order", "payment", "review", "item", "shop", "user", "verification", "system"],
      required: true,
      index: true,
    },
    entityId: {
      type: Schema.Types.ObjectId,
      index: true,
    },
    description: {
      type: String,
      required: true,
    },
    metadata: {
      type: Schema.Types.Mixed,
      default: {},
    },
    ipAddress: {
      type: String,
    },
    userAgent: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

// Compound indexes for common queries
ActivityLogSchema.index({ userId: 1, createdAt: -1 });
ActivityLogSchema.index({ activityType: 1, createdAt: -1 });
ActivityLogSchema.index({ entityType: 1, entityId: 1, createdAt: -1 });
ActivityLogSchema.index({ userRole: 1, createdAt: -1 });
ActivityLogSchema.index({ createdAt: -1 }); // For admin queries

// TTL index to auto-delete logs older than 1 year (optional, can be adjusted)
// ActivityLogSchema.index({ createdAt: 1 }, { expireAfterSeconds: 31536000 });

export default mongoose.model<IActivityLog>("ActivityLog", ActivityLogSchema);

