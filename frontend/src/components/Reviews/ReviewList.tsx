"use client";

import { useState, useEffect } from "react";
import { MessageSquare } from "lucide-react";
import { Review, ReviewSummary as ReviewSummaryType } from "@/types/review";
import ReviewSummary from "./ReviewSummary";
import ReviewItem from "./ReviewItem";
import ReviewForm from "./ReviewForm";
import toast from "react-hot-toast";
import { isAuthenticated as checkAuth, getAuthUser } from "@/lib/auth";

interface ReviewListProps {
  reviews: Review[];
  summary: ReviewSummaryType;
  onSubmitReview: (data: { rating: number; title?: string; comment: string }) => Promise<void>;
  onHelpful?: (reviewId: string, currentHasVoted: boolean) => Promise<{ helpful: number; hasVoted: boolean }>;
}

export default function ReviewList({
  reviews,
  summary,
  onSubmitReview,
  onHelpful,
}: ReviewListProps) {
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [sortBy, setSortBy] = useState<"recent" | "helpful" | "rating">("recent");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isVerified, setIsVerified] = useState(false);

  // Check authentication and verification on mount and listen for changes
  useEffect(() => {
    const checkAuthStatus = () => {
      const authenticated = checkAuth();
      setIsAuthenticated(authenticated);
      
      if (authenticated) {
        const user = getAuthUser();
        setIsVerified(user?.isVerified || false);
      } else {
        setIsVerified(false);
      }
    };
    
    checkAuthStatus();
    // Check periodically in case token is added or expires
    const interval = setInterval(checkAuthStatus, 1000);
    
    return () => clearInterval(interval);
  }, []);

  const handleWriteReviewClick = () => {
    if (!checkAuth()) {
      toast.error("Please login to submit a review", {
        duration: 3000,
        icon: "🔒",
      });
      return;
    }

    const user = getAuthUser();
    if (!user?.isVerified) {
      toast.error("You must verify your identity before submitting a review. Please complete identity verification first.", {
        duration: 5000,
        icon: "🆔",
      });
      return;
    }

    setShowReviewForm(true);
  };

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
    <div className="space-y-4 sm:space-y-6">
      {/* Summary */}
      <ReviewSummary summary={summary} />

      {/* Write Review Button */}
      {!showReviewForm && (
        <button
          onClick={handleWriteReviewClick}
          className="w-full px-4 py-2.5 sm:px-6 sm:py-3 border-2 border-[#84B067] text-[#69773D] rounded-lg hover:bg-[#84B067] hover:text-white transition-colors text-sm sm:text-base font-semibold flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          title={!isAuthenticated ? "Please login to submit a review" : ""}
        >
          <MessageSquare className="w-4 h-4 sm:w-5 sm:h-5" />
          <span className="hidden sm:inline">
            {isAuthenticated ? "Write a Review" : "Login to Write a Review"}
          </span>
          <span className="sm:hidden">
            {isAuthenticated ? "Write Review" : "Login to Review"}
          </span>
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
        <div className="px-3 sm:px-6 py-3 sm:py-4 border-b border-gray-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <h3 className="text-sm sm:text-base font-semibold text-gray-900">
            All Reviews ({reviews.length})
          </h3>

          {/* Sort Dropdown */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
            className="w-full sm:w-auto px-3 py-1.5 border border-gray-300 rounded-lg text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#84B067]"
          >
            <option value="recent">Most Recent</option>
            <option value="helpful">Most Helpful</option>
            <option value="rating">Highest Rating</option>
          </select>
        </div>

        {/* Reviews */}
        <div className="px-3 sm:px-6">
          {sortedReviews.length > 0 ? (
            sortedReviews.map((review, index) => (
              <ReviewItem
                key={review._id || review.id || `review-${index}`}
                review={review}
                onHelpful={onHelpful}
              />
            ))
          ) : (
            <div className="py-8 sm:py-12 text-center text-gray-500">
              <MessageSquare className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-2 sm:mb-3 text-gray-300" />
              <p className="text-sm sm:text-base">No reviews yet. Be the first to review this product!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

