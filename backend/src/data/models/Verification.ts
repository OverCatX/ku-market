import mongoose, { Document, Schema } from "mongoose";

export interface IVerification extends Document{
    userId: mongoose.Types.ObjectId;
    documentType: "student_id" | "citizen_id";
    documentUrl: string;
    status: "pending" | "approved" | "rejected";
    createdAt: Date;
    reviewedAt?: Date;
    reviewedBy?: mongoose.Types.ObjectId;
    rejectionReason?: string;
}

const verificationSchema: Schema<IVerification> = new Schema({
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    documentType: { type: String, enum: ["student_id", "citizen_id"], required: true },
    documentUrl: { type: String, required: true },
    status: { type: String, enum: ["pending", "approved", "rejected"], default: "pending" },
    createdAt: { type: Date, default: Date.now },
    reviewedAt: { type: Date },
    reviewedBy: { type: Schema.Types.ObjectId, ref: "User" },
    rejectionReason: { type: String },
}, { timestamps: true });

export default mongoose.model<IVerification>("Verification", verificationSchema);
