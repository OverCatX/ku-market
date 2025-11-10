import mongoose, { Document, Schema } from "mongoose";

export type ReportType = "general" | "item";
export type ReportStatus = "pending" | "in_review" | "resolved" | "dismissed";

export interface IReport extends Document {
  user: mongoose.Types.ObjectId;
  type: ReportType;
  category?: string;
  item?: mongoose.Types.ObjectId | null;
  itemTitle?: string;
  reason?: string;
  details: string;
  contact?: string;
  attachments: string[];
  status: ReportStatus;
  adminNotes?: string;
  reviewedBy?: mongoose.Types.ObjectId | null;
  reviewedAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

const reportSchema = new Schema<IReport>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: ["general", "item"],
      required: true,
      index: true,
    },
    category: {
      type: String,
      trim: true,
    },
    item: {
      type: Schema.Types.ObjectId,
      ref: "Item",
      default: null,
      index: true,
    },
    itemTitle: {
      type: String,
      trim: true,
    },
    reason: {
      type: String,
      trim: true,
    },
    details: {
      type: String,
      required: true,
      trim: true,
    },
    contact: {
      type: String,
      trim: true,
    },
    attachments: {
      type: [String],
      default: [],
    },
    status: {
      type: String,
      enum: ["pending", "in_review", "resolved", "dismissed"],
      default: "pending",
      index: true,
    },
    adminNotes: {
      type: String,
      trim: true,
    },
    reviewedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    reviewedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

export default mongoose.model<IReport>("Report", reportSchema);
