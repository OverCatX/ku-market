import mongoose, { Document, Schema } from "mongoose";

export interface ICartItem {
  itemId: mongoose.Types.ObjectId;
  quantity: number;
  addedAt: Date;
}

export interface ICart extends Document {
  userId: mongoose.Types.ObjectId;
  items: ICartItem[];
  updatedAt: Date;
}

const cartItemSchema = new Schema<ICartItem>(
  {
    itemId: { 
      type: Schema.Types.ObjectId, 
      ref: "Item", 
      required: true,
      index: true
    },
    quantity: { 
      type: Number, 
      required: true, 
      min: 1,
      default: 1
    },
    addedAt: { 
      type: Date, 
      default: Date.now 
    }
  },
  { _id: false }
);

const cartSchema = new Schema<ICart>(
  {
    userId: { 
      type: Schema.Types.ObjectId, 
      ref: "User", 
      required: true, 
      unique: true,
      index: true
    },
    items: [cartItemSchema]
  },
  { 
    timestamps: true 
  }
);

// Index for efficient queries
cartSchema.index({ userId: 1, "items.itemId": 1 });

// TTL index to auto-delete carts inactive for 90 days (optional optimization)
cartSchema.index({ updatedAt: 1 }, { expireAfterSeconds: 7776000 });

export default mongoose.model<ICart>("Cart", cartSchema);

