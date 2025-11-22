"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { ArrowLeft, Filter } from "lucide-react";
import { Review, ReviewSummary } from "@/types/review";
import { ReviewList, ReviewSummary as ReviewSummaryComponent } from "@/components/Reviews";
import { getItem } from "@/config/items";
import { getItemReviews, getReviewSummary } from "@/config/reviews";
import toast from "react-hot-toast";

export default function ReviewsPage() {
  const { slug } = useParams<{ slug: string }>();
  const [itemTitle, setItemTitle] = useState<string>("");
  const [loading, setLoading] = useState(true);

  // Reviews data (will be fetched from API when backend is ready)
  const [reviews, setReviews] = useState<Review[]>([]);

  const [reviewSummary, setReviewSummary] = useState<ReviewSummary>({
    averageRating: 0,
    totalReviews: 0,
    ratingDistribution: {
      5: 0,
      4: 0,
      3: 0,
      2: 0,
      1: 0,
    },
  });

  const [filterRating, setFilterRating] = useState<number | null>(null);

  useEffect(() => {
    // Fetch item details and reviews
    (async () => {
      try {
        const res = await getItem(String(slug));
        if (res.item) {
          setItemTitle(res.item.title);
        }

        // Load reviews and summary
        const [reviewsData, summaryData] = await Promise.all([
          getItemReviews(String(slug)).catch(() => []),
          getReviewSummary(String(slug)).catch(() => ({
            averageRating: 0,
            totalReviews: 0,
            ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
          })),
        ]);

        setReviews(reviewsData);
        setReviewSummary(summaryData);
      } catch (error) {
        console.error("Failed to fetch item:", error);
      } finally {
        setLoading(false);
      }
    })();
  }, [slug]);

  const handleSubmitReview = async (data: {
    rating: number;
    title?: string;
    comment: string;
    images?: File[];
  }) => {
    // Authentication check is done in createReview API function
    // It will automatically handle expired tokens

    try {
      const { createReview: createReviewAPI, getReviewSummary } = await import("@/config/reviews");
      
      // Validate before submitting
      if (!data.rating || data.rating < 1 || data.rating > 5) {
        toast.error("Rating must be between 1 and 5");
        return;
      }

      if (!data.comment || data.comment.trim().length < 10) {
        toast.error("Comment must be at least 10 characters");
        return;
      }

      if (data.comment.trim().length > 2000) {
        toast.error("Comment must not exceed 2000 characters");
        return;
      }

      // Create review via API
      const newReview = await createReviewAPI(String(slug), data);
      
      // Add to reviews list
      setReviews((prev) => [newReview, ...prev]);

      // Fetch updated summary
      const updatedSummary = await getReviewSummary(String(slug));
      setReviewSummary(updatedSummary);
      
      toast.success("Review submitted successfully!");
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to submit review";
      
      // Show specific error messages (only show once)
      if (errorMessage.includes("login") || errorMessage.includes("authenticated")) {
        toast.error("Please login to submit a review", {
          duration: 3000,
          icon: "🔒",
        });
      } else if (errorMessage.includes("already reviewed")) {
        toast.error("You have already reviewed this item");
      } else if (errorMessage.includes("Too many") || errorMessage.includes("rate limit") || errorMessage.includes("per hour")) {
        toast.error(errorMessage, {
          duration: 6000,
          icon: "⏱️",
        });
      } else {
        toast.error(errorMessage);
      }
      // Don't re-throw - error already handled
    }
  };

  const handleHelpful = async (reviewId: string, currentHasVoted: boolean): Promise<{ helpful: number; hasVoted: boolean }> => {
    try {
      const { toggleHelpful } = await import("@/config/reviews");
      const result = await toggleHelpful(reviewId, currentHasVoted);
      
      // Update the helpful count and hasVoted status for this review
      setReviews((prev) =>
        prev.map((review) => {
          const reviewIdValue = review._id || (review as { id?: string }).id || "";
          return reviewIdValue === reviewId
            ? { ...review, helpful: result.helpful, hasVoted: result.hasVoted }
            : review;
        })
      );

      toast.success(currentHasVoted ? "Removed helpful vote" : "Thank you for your feedback!");
      return result;
    } catch (error) {
      // Error handling is done in ReviewItem component
      throw error;
    }
  };

  const handleDeleteReview = async (reviewId: string): Promise<void> => {
    try {
      const { deleteReview, getReviewSummary } = await import("@/config/reviews");
      await deleteReview(reviewId);
      
      // Remove review from list
      setReviews((prev) =>
        prev.filter((review) => {
          const reviewIdValue = review._id || (review as { id?: string }).id || "";
          return reviewIdValue !== reviewId;
        })
      );

      // Fetch updated summary
      const updatedSummary = await getReviewSummary(String(slug));
      setReviewSummary(updatedSummary);
    } catch (error) {
      // Error handling is done in ReviewItem component
      throw error;
    }
  };

  const filteredReviews = filterRating
    ? reviews.filter((r) => r.rating === filterRating)
    : reviews;

  if (loading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ background: '#F6F2E5' }}
      >
        Loading...
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: '#F6F2E5' }}>
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 py-3 sm:py-4">
          <button
            onClick={() => window.history.back()}
            className="flex items-center gap-2 text-sm sm:text-base text-gray-600 hover:text-gray-900 transition-colors mb-2 sm:mb-3"
          >
            <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
            <span className="hidden sm:inline">Back to Product</span>
            <span className="sm:hidden">Back</span>
          </button>

          <h1 className="text-xl sm:text-2xl font-bold text-[#4A5130]">Customer Reviews</h1>
          {itemTitle && (
            <p className="text-xs sm:text-sm text-gray-600 mt-1 line-clamp-1">for {itemTitle}</p>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="mx-auto max-w-6xl px-4 sm:px-6 py-4 sm:py-8">
        <div className="grid lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
          {/* Sidebar - Summary & Filters */}
          <div className="lg:col-span-1">
            <div className="sticky top-20 lg:top-24 space-y-4 sm:space-y-6">
              {/* Summary */}
              <ReviewSummaryComponent summary={reviewSummary} />

              {/* Filter by Rating */}
              <div className="bg-white rounded-lg p-4 sm:p-6 border border-gray-200">
                <div className="flex items-center gap-2 mb-3 sm:mb-4">
                  <Filter className="w-4 h-4 sm:w-5 sm:h-5 text-gray-700" />
                  <h3 className="text-sm sm:text-base font-semibold text-gray-900">Filter by Rating</h3>
                </div>

                <div className="space-y-1.5 sm:space-y-2">
                  <button
                    onClick={() => setFilterRating(null)}
                    className={`w-full text-left px-2.5 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm rounded-lg transition-colors ${
                      filterRating === null
                        ? "bg-[#84B067] text-white"
                        : "hover:bg-gray-100"
                    }`}
                  >
                    All Reviews ({reviews.length})
                  </button>

                  {[5, 4, 3, 2, 1].map((rating) => {
                    const count = reviews.filter((r) => r.rating === rating).length;
                    return (
                      <button
                        key={rating}
                        onClick={() => setFilterRating(rating)}
                        className={`w-full text-left px-2.5 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm rounded-lg transition-colors ${
                          filterRating === rating
                            ? "bg-[#84B067] text-white"
                            : "hover:bg-gray-100"
                        }`}
                      >
                        {rating} Stars ({count})
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Reviews List */}
          <div className="lg:col-span-2">
            <ReviewList
              reviews={filteredReviews}
              summary={reviewSummary}
              onSubmitReview={handleSubmitReview}
              onHelpful={handleHelpful}
              onDelete={handleDeleteReview}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

