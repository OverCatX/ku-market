import mongoose, { Document, Schema } from "mongoose";

export interface IChatThread extends Document {
  buyer: mongoose.Types.ObjectId;
  seller: mongoose.Types.ObjectId;
  item?: mongoose.Types.ObjectId;
  title: string;
  lastMessage?: string;
  lastMessageAt?: Date;
  buyerUnreadCount: number;
  sellerUnreadCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const chatThreadSchema: Schema<IChatThread> = new Schema(
  {
    buyer: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    seller: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    item: { type: Schema.Types.ObjectId, ref: "Item", index: true },
    title: { type: String, required: true },
    lastMessage: { type: String },
    lastMessageAt: { type: Date },
    buyerUnreadCount: { type: Number, default: 0 },
    sellerUnreadCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

// Compound index to ensure unique buyer-seller-item combination
chatThreadSchema.index({ buyer: 1, seller: 1, item: 1 }, { unique: true });

export default mongoose.model<IChatThread>("ChatThread", chatThreadSchema);

