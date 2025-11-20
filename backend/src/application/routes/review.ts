import express from "express";
import ReviewController from "../controllers/review.controller";
import { authenticate } from "../middlewares/authentication";
import { optionalAuthenticate } from "../middlewares/optionalAuth";
import { upload } from "../../lib/upload";

const router = express.Router();
const reviewController = new ReviewController();

// POST /api/reviews - Create a review (authenticated, with optional image uploads)
router.post("/", authenticate, upload.array("images", 5), reviewController.createReview);

// GET /api/reviews/item/:itemId - Get all reviews for an item (public, but checks auth for hasVoted)
router.get("/item/:itemId", optionalAuthenticate, reviewController.getItemReviews);

// GET /api/reviews/item/:itemId/summary - Get review summary (public)
router.get("/item/:itemId/summary", reviewController.getReviewSummary);

// POST /api/reviews/summaries/batch - Get review summaries for multiple items (public, batch)
router.post("/summaries/batch", reviewController.getBatchReviewSummaries);

// POST /api/reviews/:id/helpful - Mark review as helpful (authenticated)
// DELETE /api/reviews/:id/helpful - Unmark review as helpful (authenticated)
router.post("/:id/helpful", authenticate, reviewController.markHelpful);
router.delete("/:id/helpful", authenticate, reviewController.markHelpful);

// DELETE /api/reviews/:id - Delete own review (authenticated)
router.delete("/:id", authenticate, reviewController.deleteReview);

export default router;

