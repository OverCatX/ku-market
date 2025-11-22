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

export interface IPickupCoordinates {
  lat: number;
  lng: number;
}

export interface IPickupDetails {
  locationName: string;
  address?: string;
  note?: string;
  coordinates?: IPickupCoordinates;
  preferredTime?: Date;
}

export type PaymentStatus =
  | "pending"
  | "awaiting_payment"
  | "payment_submitted"
  | "paid"
  | "not_required";

export interface IOrder extends Document {
  buyer: Types.ObjectId;
  seller: Types.ObjectId;
  items: IOrderItem[];
  totalPrice: number;
  status: "pending_seller_confirmation" | "confirmed" | "rejected" | "completed" | "cancelled";
  deliveryMethod: "pickup" | "delivery";
  shippingAddress?: IShippingAddress;
  pickupDetails?: IPickupDetails;
  paymentMethod: "cash" | "transfer" | "promptpay";
  paymentStatus: PaymentStatus;
  buyerContact: {
    fullName: string;
    phone: string;
  };
  confirmedAt?: Date;
  rejectedAt?: Date;
  rejectionReason?: string;
  completedAt?: Date;
  paymentSubmittedAt?: Date;
  paymentIntentId?: string;
  buyerReceived?: boolean;
  buyerReceivedAt?: Date;
  sellerDelivered?: boolean;
  sellerDeliveredAt?: Date;
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

const PickupDetailsSchema = new Schema<IPickupDetails>(
  {
    locationName: { type: String, required: true, trim: true, maxlength: 150 },
    address: { type: String, trim: true, maxlength: 400 },
    note: { type: String, trim: true, maxlength: 400 },
    coordinates: {
      lat: { type: Number },
      lng: { type: Number },
    },
    preferredTime: { type: Date },
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
    pickupDetails: {
      type: PickupDetailsSchema,
    },
    shippingAddress: {
      type: ShippingAddressSchema,
    },
    paymentMethod: {
      type: String,
      enum: ["cash", "transfer", "promptpay"],
      required: true,
    },
    buyerContact: {
      fullName: { type: String, required: true },
      phone: { type: String, required: true },
    },
    paymentStatus: {
      type: String,
      enum: ["pending", "awaiting_payment", "payment_submitted", "paid", "not_required"],
      default: "pending",
      index: true,
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
    paymentSubmittedAt: {
      type: Date,
    },
    paymentIntentId: {
      type: String,
    },
    buyerReceived: {
      type: Boolean,
      default: false,
    },
    buyerReceivedAt: {
      type: Date,
    },
    sellerDelivered: {
      type: Boolean,
      default: false,
    },
    sellerDeliveredAt: {
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

