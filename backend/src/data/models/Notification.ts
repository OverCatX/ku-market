import mongoose, { Document, Schema } from "mongoose";

export interface INotification extends Document {
  userId: mongoose.Types.ObjectId;
  type: "order" | "message" | "item" | "system";
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  link?: string;
}

const notificationSchema: Schema<INotification> = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: ["order", "message", "item", "system"],
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },
    message: {
      type: String,
      required: true,
      trim: true,
      maxlength: 1000,
    },
    timestamp: {
      type: Date,
      default: Date.now,
      index: true,
    },
    read: {
      type: Boolean,
      default: false,
      index: true,
    },
    link: {
      type: String,
      trim: true,
    },
  },
  { timestamps: true }
);

// Compound index for efficient queries
notificationSchema.index({ userId: 1, read: 1, timestamp: -1 });

export default mongoose.model<INotification>("Notification", notificationSchema);

