import mongoose, { Document, Schema } from "mongoose";

export interface IHelpfulVote extends Document {
  review: mongoose.Types.ObjectId;
  user: mongoose.Types.ObjectId;
  createdAt: Date;
}

const helpfulVoteSchema: Schema<IHelpfulVote> = new Schema(
  {
    review: {
      type: Schema.Types.ObjectId,
      ref: "Review",
      required: true,
      index: true,
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
  },
  { timestamps: true }
);

// Prevent duplicate votes from same user on same review
helpfulVoteSchema.index({ review: 1, user: 1 }, { unique: true });

export default mongoose.model<IHelpfulVote>("HelpfulVote", helpfulVoteSchema);

