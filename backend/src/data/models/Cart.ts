import mongoose, { Document, Schema, Types } from "mongoose";

export interface ICartItem {
  itemId: Types.ObjectId;
  quantity: number;
  addedAt: Date;
}

export interface ICart extends Document {
  userId: Types.ObjectId;
  items: ICartItem[];
  createdAt: Date;
  updatedAt: Date;
}

const CartItemSchema = new Schema<ICartItem>(
  {
    itemId: {
      type: Schema.Types.ObjectId,
      ref: "Item",
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
      default: 1,
    },
    addedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false }
);

const CartSchema = new Schema<ICart>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    items: {
      type: [CartItemSchema],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

// Index for faster queries
CartSchema.index({ "items.itemId": 1 });

// TTL index - auto delete cart after 90 days of inactivity
CartSchema.index({ updatedAt: 1 }, { expireAfterSeconds: 7776000 });

export default mongoose.model<ICart>("Cart", CartSchema);
