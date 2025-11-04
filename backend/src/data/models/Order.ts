import mongoose, { Document, Schema, Types } from "mongoose";

export interface IOrderItem {
  itemId: Types.ObjectId;
  title: string;
  price: number;
  quantity: number;
  image?: string;
}

export interface IShippingAddress {
  address: string;
  city: string;
  postalCode: string;
}

export interface IOrder extends Document {
  buyer: Types.ObjectId;
  seller: Types.ObjectId;
  items: IOrderItem[];
  totalPrice: number;
  status: "pending_seller_confirmation" | "confirmed" | "rejected" | "completed" | "cancelled";
  deliveryMethod: "pickup" | "delivery";
  shippingAddress?: IShippingAddress;
  paymentMethod: "cash" | "transfer";
  buyerContact: {
    fullName: string;
    phone: string;
  };
  confirmedAt?: Date;
  rejectedAt?: Date;
  rejectionReason?: string;
  completedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const OrderItemSchema = new Schema<IOrderItem>(
  {
    itemId: {
      type: Schema.Types.ObjectId,
      ref: "Item",
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
    },
    image: {
      type: String,
    },
  },
  { _id: false }
);

const ShippingAddressSchema = new Schema<IShippingAddress>(
  {
    address: { type: String, required: true },
    city: { type: String, required: true },
    postalCode: { type: String, required: true },
  },
  { _id: false }
);

const OrderSchema = new Schema<IOrder>(
  {
    buyer: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    seller: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    items: {
      type: [OrderItemSchema],
      required: true,
      validate: {
        validator: (items: IOrderItem[]) => items.length > 0,
        message: "Order must have at least one item",
      },
    },
    totalPrice: {
      type: Number,
      required: true,
      min: 0,
    },
    status: {
      type: String,
      enum: ["pending_seller_confirmation", "confirmed", "rejected", "completed", "cancelled"],
      default: "pending_seller_confirmation",
      index: true,
    },
    deliveryMethod: {
      type: String,
      enum: ["pickup", "delivery"],
      required: true,
    },
    shippingAddress: {
      type: ShippingAddressSchema,
    },
    paymentMethod: {
      type: String,
      enum: ["cash", "transfer"],
      required: true,
    },
    buyerContact: {
      fullName: { type: String, required: true },
      phone: { type: String, required: true },
    },
    confirmedAt: {
      type: Date,
    },
    rejectedAt: {
      type: Date,
    },
    rejectionReason: {
      type: String,
    },
    completedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for better query performance
OrderSchema.index({ buyer: 1, createdAt: -1 });
OrderSchema.index({ seller: 1, status: 1, createdAt: -1 });
OrderSchema.index({ status: 1, createdAt: -1 });

export default mongoose.model<IOrder>("Order", OrderSchema);

