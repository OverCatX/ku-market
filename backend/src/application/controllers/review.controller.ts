import { Request, Response } from "express";
import mongoose from "mongoose";
import Review from "../../data/models/Review";
import Item from "../../data/models/Item";
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import User from "../../data/models/User";
import Order from "../../data/models/Order";
import HelpfulVote from "../../data/models/HelpfulVote";
import { AuthenticatedRequest } from "../middlewares/authentication";
import { createNotification } from "../../lib/notifications";

export default class ReviewController {
  // POST /api/reviews - Create a review
  createReview = async (req: Request, res: Response): Promise<Response> => {
    try {
      const userId = (req as AuthenticatedRequest).user?.id;
      if (!userId) {
        return res.status(401).json({ success: false, error: "Unauthorized" });
      }

      // Check if user is verified
      const user = await User.findById(userId);
      if (!user) {
        return res.status(401).json({ success: false, error: "User not found" });
      }

      if (!user.isVerified) {
        return res.status(403).json({
          success: false,
          error: "You must verify your identity before submitting a review. Please complete identity verification first.",
        });
      }

      const { itemId, rating, title, comment } = req.body;

      if (!itemId || !rating || !comment) {
        return res.status(400).json({
          success: false,
          error: "itemId, rating, and comment are required",
        });
      }

      if (!mongoose.Types.ObjectId.isValid(itemId)) {
        return res.status(400).json({ success: false, error: "Invalid item ID" });
      }

      if (rating < 1 || rating > 5) {
        return res.status(400).json({
          success: false,
          error: "Rating must be between 1 and 5",
        });
      }

      if (comment.trim().length < 10) {
        return res.status(400).json({
          success: false,
          error: "Comment must be at least 10 characters",
        });
      }

      const item = await Item.findById(itemId);
      if (!item) {
        return res.status(404).json({ success: false, error: "Item not found" });
      }

      // Check if user already reviewed this item
      const existingReview = await Review.findOne({
        item: itemId,
        user: userId,
      });

      if (existingReview) {
        return res.status(400).json({
          success: false,
          error: "You have already reviewed this item",
        });
      }

      // Check if user has purchased this item (verified purchase)
      const hasPurchased = await Order.exists({
        buyer: userId,
        items: {
          $elemMatch: { item: itemId },
        },
        status: { $in: ["confirmed", "completed"] },
      });

      const review = new Review({
        item: itemId,
        user: userId,
        rating,
        title: title?.trim() || undefined,
        comment: comment.trim(),
        verified: hasPurchased || false,
      });

      await review.save();

      // Populate user info for response
      await review.populate("user", "name kuEmail");

      // Notify item owner about new review
      await createNotification(
        item.owner,
        "item",
        "New Review",
        `Your item "${item.title}" received a new ${rating}-star review!`,
        `/marketplace/${itemId}`
      );

      interface PopulatedUser {
        _id: mongoose.Types.ObjectId;
        name?: string;
        kuEmail?: string;
      }

      const populatedUser = review.user as unknown as PopulatedUser;

      return res.status(201).json({
        success: true,
        review: {
          id: review._id,
          itemId: review.item,
          userId: review.user,
          userName: populatedUser.name || "Anonymous",
          userAvatar: undefined,
          rating: review.rating,
          title: review.title,
          comment: review.comment,
          helpful: review.helpful,
          verified: review.verified,
          createdAt: (review as unknown as { createdAt?: Date }).createdAt || review.createAt,
          updatedAt: (review as unknown as { updatedAt?: Date }).updatedAt || review.updateAt,
        },
      });
    } catch (error) {
      console.error("Create review error:", error);
      if ((error as { code?: number }).code === 11000) {
        return res.status(400).json({
          success: false,
          error: "You have already reviewed this item",
        });
      }
      return res.status(500).json({ success: false, error: "Server error" });
    }
  };

  // GET /api/reviews/item/:itemId - Get all reviews for an item
  getItemReviews = async (req: Request, res: Response): Promise<Response> => {
    try {
      const { itemId } = req.params;
      const userId = (req as AuthenticatedRequest).user?.id; // Optional - set by optionalAuthenticate middleware

      if (!mongoose.Types.ObjectId.isValid(itemId)) {
        return res.status(400).json({ success: false, error: "Invalid item ID" });
      }

      const reviews = await Review.find({ item: itemId })
        .populate("user", "name kuEmail")
        .sort({ createAt: -1 });

      // Get helpful votes for current user if authenticated
      let userVotes: mongoose.Types.ObjectId[] = [];
      if (userId) {
        const votes = await HelpfulVote.find({
          user: userId,
          review: { $in: reviews.map((r) => r._id) },
        });
        userVotes = votes.map((v) => v.review);
      }

      interface PopulatedUser {
        _id: mongoose.Types.ObjectId;
        name?: string;
        kuEmail?: string;
      }

      return res.json({
        success: true,
        reviews: reviews.map((review) => {
          const populatedUser = review.user as unknown as PopulatedUser;
          const reviewId = review._id as mongoose.Types.ObjectId;
          const hasVoted = userId ? userVotes.some((vid) => vid.toString() === reviewId.toString()) : false;
          return {
            id: review._id,
            itemId: review.item,
            userId: review.user,
            userName: populatedUser.name || "Anonymous",
            userAvatar: undefined,
            rating: review.rating,
            title: review.title,
            comment: review.comment,
            helpful: review.helpful,
            verified: review.verified,
            hasVoted: hasVoted,
            createdAt: (review as unknown as { createdAt?: Date }).createdAt || review.createAt,
            updatedAt: (review as unknown as { updatedAt?: Date }).updatedAt || review.updateAt,
          };
        }),
      });
    } catch (error) {
      console.error("Get item reviews error:", error);
      return res.status(500).json({ success: false, error: "Server error" });
    }
  };

  // GET /api/reviews/item/:itemId/summary - Get review summary for an item
  getReviewSummary = async (req: Request, res: Response): Promise<Response> => {
    try {
      const { itemId } = req.params;

      if (!mongoose.Types.ObjectId.isValid(itemId)) {
        return res.status(400).json({ success: false, error: "Invalid item ID" });
      }

      const reviews = await Review.find({ item: itemId });

      if (reviews.length === 0) {
        return res.json({
          success: true,
          summary: {
            averageRating: 0,
            totalReviews: 0,
            ratingDistribution: {
              1: 0,
              2: 0,
              3: 0,
              4: 0,
              5: 0,
            },
          },
        });
      }

      const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
      const averageRating = totalRating / reviews.length;

      const ratingDistribution = {
        1: 0,
        2: 0,
        3: 0,
        4: 0,
        5: 0,
      };

      reviews.forEach((review) => {
        const rating = review.rating as 1 | 2 | 3 | 4 | 5;
        ratingDistribution[rating]++;
      });

      return res.json({
        success: true,
        summary: {
          averageRating: Math.round(averageRating * 10) / 10,
          totalReviews: reviews.length,
          ratingDistribution,
        },
      });
    } catch (error) {
      console.error("Get review summary error:", error);
      return res.status(500).json({ success: false, error: "Server error" });
    }
  };

  // POST /api/reviews/:id/helpful - Mark review as helpful
  // DELETE /api/reviews/:id/helpful - Unmark review as helpful
  markHelpful = async (req: Request, res: Response): Promise<Response> => {
    try {
      const userId = (req as AuthenticatedRequest).user?.id;
      if (!userId) {
        return res.status(401).json({ success: false, error: "Unauthorized" });
      }

      const { id } = req.params;
      const isDelete = req.method === "DELETE";

      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ success: false, error: "Invalid review ID" });
      }

      const review = await Review.findById(id);
      if (!review) {
        return res.status(404).json({ success: false, error: "Review not found" });
      }

      // Find existing vote
      const existingVote = await HelpfulVote.findOne({
        review: id,
        user: userId,
      });

      if (isDelete) {
        // Unmark helpful - delete vote
        if (!existingVote) {
          return res.status(400).json({
            success: false,
            error: "You have not marked this review as helpful",
            helpful: review.helpful,
            hasVoted: false,
          });
        }

        // Delete vote and decrement helpful count
        await HelpfulVote.deleteOne({ _id: existingVote._id });
        review.helpful = Math.max(0, (review.helpful || 0) - 1);
        await review.save();

        return res.json({
          success: true,
          helpful: review.helpful,
          hasVoted: false,
        });
      } else {
        // Mark helpful - create vote
        if (existingVote) {
          return res.status(400).json({
            success: false,
            error: "You have already marked this review as helpful",
            helpful: review.helpful,
            hasVoted: true,
          });
        }

        // Create vote and increment helpful count
        await HelpfulVote.create({
          review: id,
          user: userId,
        });

        review.helpful = (review.helpful || 0) + 1;
        await review.save();

        return res.json({
          success: true,
          helpful: review.helpful,
          hasVoted: true,
        });
      }
    } catch (error) {
      console.error("Toggle helpful error:", error);
      if ((error as { code?: number }).code === 11000) {
        return res.status(400).json({
          success: false,
          error: "You have already marked this review as helpful",
        });
      }
      return res.status(500).json({ success: false, error: "Server error" });
    }
  };

  // DELETE /api/reviews/:id - Delete a review (user's own review)
  deleteReview = async (req: Request, res: Response): Promise<Response> => {
    try {
      const userId = (req as AuthenticatedRequest).user?.id;
      if (!userId) {
        return res.status(401).json({ success: false, error: "Unauthorized" });
      }

      const { id } = req.params;

      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ success: false, error: "Invalid review ID" });
      }

      const review = await Review.findById(id);
      if (!review) {
        return res.status(404).json({ success: false, error: "Review not found" });
      }

      // Check if user owns the review
      if (review.user.toString() !== userId) {
        return res.status(403).json({
          success: false,
          error: "You can only delete your own reviews",
        });
      }

      await Review.findByIdAndDelete(id);

      return res.json({
        success: true,
        message: "Review deleted successfully",
      });
    } catch (error) {
      console.error("Delete review error:", error);
      return res.status(500).json({ success: false, error: "Server error" });
    }
  };
}

