import mongoose, { Document, Schema } from "mongoose";

export interface IReview extends Document {
  item: mongoose.Types.ObjectId;
  user: mongoose.Types.ObjectId;
  rating: number; // 1-5
  title?: string;
  comment: string;
  images?: string[]; // Array of image URLs
  helpful: number;
  verified: boolean; // verified purchase
  createAt: Date;
  updateAt: Date;
}

const reviewSchema: Schema<IReview> = new Schema(
  {
    item: {
      type: Schema.Types.ObjectId,
      ref: "Item",
      required: true,
      index: true,
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
      index: true,
    },
    title: {
      type: String,
      trim: true,
      maxlength: 200,
    },
    comment: {
      type: String,
      required: true,
      trim: true,
      maxlength: 2000,
    },
    images: {
      type: [String],
      default: [],
      validate: {
        validator: (v: string[]) => v.length <= 5,
        message: "Maximum 5 images allowed",
      },
    },
    helpful: {
      type: Number,
      default: 0,
      min: 0,
    },
    verified: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

// Prevent duplicate reviews from same user on same item
reviewSchema.index({ item: 1, user: 1 }, { unique: true });

export default mongoose.model<IReview>("Review", reviewSchema);

