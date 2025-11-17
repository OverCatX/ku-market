import mongoose, { Document, Schema } from "mongoose";

export interface IMeetupPreset extends Document {
  label: string;
  locationName: string;
  address?: string;
  lat: number;
  lng: number;
  isActive: boolean;
  order: number; // For sorting
  createdAt: Date;
  updatedAt: Date;
}

const MeetupPresetSchema = new Schema<IMeetupPreset>(
  {
    label: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    locationName: {
      type: String,
      required: true,
      trim: true,
      maxlength: 150,
    },
    address: {
      type: String,
      trim: true,
      maxlength: 400,
    },
    lat: {
      type: Number,
      required: true,
      min: -90,
      max: 90,
    },
    lng: {
      type: Number,
      required: true,
      min: -180,
      max: 180,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    order: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Index for active presets ordered by order field
MeetupPresetSchema.index({ isActive: 1, order: 1 });

export default mongoose.model<IMeetupPreset>("MeetupPreset", MeetupPresetSchema);

