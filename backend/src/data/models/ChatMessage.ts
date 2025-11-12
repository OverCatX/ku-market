import mongoose, { Document, Schema } from "mongoose";

export interface IChatMessage extends Document {
  thread: mongoose.Types.ObjectId;
  sender: mongoose.Types.ObjectId;
  text: string;
  readAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const chatMessageSchema: Schema<IChatMessage> = new Schema(
  {
    thread: { type: Schema.Types.ObjectId, ref: "ChatThread", required: true, index: true },
    sender: { type: Schema.Types.ObjectId, ref: "User", required: true },
    text: { type: String, required: true, maxlength: 2000 },
    readAt: { type: Date },
  },
  { timestamps: true }
);

// Index for efficient message retrieval by thread
chatMessageSchema.index({ thread: 1, createdAt: -1 });

export default mongoose.model<IChatMessage>("ChatMessage", chatMessageSchema);

