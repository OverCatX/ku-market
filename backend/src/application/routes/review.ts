import express from "express";
import ReviewController from "../controllers/review.controller";
import { authenticate } from "../middlewares/authentication";
import { optionalAuthenticate } from "../middlewares/optionalAuth";

const router = express.Router();
const reviewController = new ReviewController();

// POST /api/reviews - Create a review (authenticated)
router.post("/", authenticate, reviewController.createReview);

// GET /api/reviews/item/:itemId - Get all reviews for an item (public, but checks auth for hasVoted)
router.get("/item/:itemId", optionalAuthenticate, reviewController.getItemReviews);

// GET /api/reviews/item/:itemId/summary - Get review summary (public)
router.get("/item/:itemId/summary", reviewController.getReviewSummary);

// POST /api/reviews/:id/helpful - Mark review as helpful (authenticated)
// DELETE /api/reviews/:id/helpful - Unmark review as helpful (authenticated)
router.post("/:id/helpful", authenticate, reviewController.markHelpful);
router.delete("/:id/helpful", authenticate, reviewController.markHelpful);

// DELETE /api/reviews/:id - Delete own review (authenticated)
router.delete("/:id", authenticate, reviewController.deleteReview);

export default router;

