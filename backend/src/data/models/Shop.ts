import mongoose, { Document, Schema } from "mongoose";

export interface IShop extends Document{
    owner: mongoose.Types.ObjectId;
    shopName: string;
    shopType: string;
    productCategory: string[];
    shopdescription: string;
    shopPhoto: string;
    shopStatus?: "pending" | "approved" | "rejected";
    shopRequestDate?: Date;
    shopApprovalDate?: Date;
    shopRejectionReason?: string;
    senderAddress?: {
        address: string;
        city: string;
        postalCode: string;
    };
    createdAt: Date;
    updatedAt: Date;
}

const shopSchema: Schema<IShop> = new Schema({
    owner: { type: Schema.Types.ObjectId, ref: "User", required: true },
    shopName: { type: String, required: true },
    shopType: { type: String, required: true },
    productCategory: { type: [String], required: true },
    shopdescription: { type: String, required: true },
    shopPhoto: { type: String, required: true },
    shopStatus: { type: String, enum: ["pending", "approved", "rejected"], default: "pending" },
    shopRequestDate: { type: Date, default: Date.now },
    shopApprovalDate: { type: Date },
    shopRejectionReason: { type: String },
    senderAddress: {
        address: { type: String, default: "" },
        city: { type: String, default: "" },
        postalCode: { type: String, default: "" },
    },
}, { timestamps: true });

export default mongoose.model<IShop>("Shop", shopSchema);