import mongoose, { Document, Schema } from "mongoose";

export interface ICategory extends Document {
  name: string;
  slug: string;
  description?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const categorySchema: Schema<ICategory> = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      unique: true,
      maxlength: 50,
      index: true,
    },
    slug: {
      type: String,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    description: {
      type: String,
      maxlength: 500,
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  { timestamps: true }
);

// Generate slug from name before saving
categorySchema.pre("save", function (next) {
  // Always generate slug if it's missing or name has changed
  if (!this.slug || this.isModified("name")) {
    if (this.name) {
      this.slug = this.name
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");
      
      // Ensure slug is not empty
      if (!this.slug) {
        this.slug = `category-${Date.now()}`;
      }
    }
  }
  next();
});

categorySchema.index({ name: "text", description: "text" });

export default mongoose.model<ICategory>("Category", categorySchema);

