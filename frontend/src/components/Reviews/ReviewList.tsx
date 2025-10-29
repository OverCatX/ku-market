"use client";

import { useState } from "react";
import { MessageSquare } from "lucide-react";
import { Review, ReviewSummary as ReviewSummaryType } from "@/types/review";
import ReviewSummary from "./ReviewSummary";
import ReviewItem from "./ReviewItem";
import ReviewForm from "./ReviewForm";

interface ReviewListProps {
  reviews: Review[];
  summary: ReviewSummaryType;
  onSubmitReview: (data: { rating: number; title?: string; comment: string }) => Promise<void>;
  onHelpful?: (reviewId: string) => void;
}

export default function ReviewList({
  reviews,
  summary,
  onSubmitReview,
  onHelpful,
}: ReviewListProps) {
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [sortBy, setSortBy] = useState<"recent" | "helpful" | "rating">("recent");

  const sortedReviews = [...reviews].sort((a, b) => {
    switch (sortBy) {
      case "helpful":
        return b.helpful - a.helpful;
      case "rating":
        return b.rating - a.rating;
      case "recent":
      default:
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    }
  });

  return (
    <div className="space-y-6">
      {/* Summary */}
      <ReviewSummary summary={summary} />

      {/* Write Review Button */}
      {!showReviewForm && (
        <button
          onClick={() => setShowReviewForm(true)}
          className="w-full px-6 py-3 border-2 border-[#84B067] text-[#69773D] rounded-lg hover:bg-[#84B067] hover:text-white transition-colors font-semibold flex items-center justify-center gap-2"
        >
          <MessageSquare className="w-5 h-5" />
          Write a Review
        </button>
      )}

      {/* Review Form */}
      {showReviewForm && (
        <ReviewForm
          onSubmit={onSubmitReview}
          onCancel={() => setShowReviewForm(false)}
        />
      )}

      {/* Reviews List */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h3 className="font-semibold text-gray-900">
            All Reviews ({reviews.length})
          </h3>

          {/* Sort Dropdown */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
            className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#84B067]"
          >
            <option value="recent">Most Recent</option>
            <option value="helpful">Most Helpful</option>
            <option value="rating">Highest Rating</option>
          </select>
        </div>

        {/* Reviews */}
        <div className="px-6">
          {sortedReviews.length > 0 ? (
            sortedReviews.map((review) => (
              <ReviewItem
                key={review._id}
                review={review}
                onHelpful={onHelpful}
              />
            ))
          ) : (
            <div className="py-12 text-center text-gray-500">
              <MessageSquare className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p>No reviews yet. Be the first to review this product!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

