import { ThumbsUp, CheckCircle, User } from "lucide-react";
import { Review } from "@/types/review";
import StarRating from "./StarRating";
import Image from "next/image";
import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { isAuthenticated as checkAuth } from "@/lib/auth";

interface ReviewItemProps {
  review: Review;
  onHelpful?: (reviewId: string, currentHasVoted: boolean) => Promise<{ helpful: number; hasVoted: boolean }>;
}

export default function ReviewItem({ review, onHelpful }: ReviewItemProps) {
  const [hasVoted, setHasVoted] = useState(review.hasVoted || false);
  const [helpfulCount, setHelpfulCount] = useState(review.helpful || 0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Sync state with props when review changes
  useEffect(() => {
    setHasVoted(review.hasVoted || false);
    setHelpfulCount(review.helpful || 0);
  }, [review.hasVoted, review.helpful]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const handleHelpfulClick = async () => {
    // Check authentication first - prevent click if not logged in
    if (!checkAuth()) {
      toast.error("Please login to mark review as helpful", {
        duration: 3000,
        icon: "🔒",
      });
      return;
    }

    if (!onHelpful) return;
    if (isSubmitting) return;

    setIsSubmitting(true);
    try {
      const result = await onHelpful(review._id || (review as { id?: string }).id || "", hasVoted);
      // Update state based on response
      if (result) {
        setHasVoted(result.hasVoted);
        setHelpfulCount(result.helpful);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to mark review as helpful";
      if (errorMessage.includes("login")) {
        toast.error("Please login to mark review as helpful", {
          duration: 3000,
          icon: "🔒",
        });
      } else {
        toast.error(errorMessage);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="border-b border-gray-200 py-4 sm:py-6 last:border-b-0">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 sm:gap-0 mb-3">
        <div className="flex items-center gap-2 sm:gap-3">
          {/* User Avatar */}
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-[#69773D] to-[#84B067] flex items-center justify-center text-white font-bold flex-shrink-0">
            {review.userAvatar ? (
              <Image
                src={review.userAvatar}
                alt={review.userName}
                width={40}
                height={40}
                className="rounded-full w-full h-full"
              />
            ) : (
              <User className="w-4 h-4 sm:w-5 sm:h-5" />
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
              <h4 className="text-sm sm:text-base font-semibold text-gray-900 truncate">{review.userName}</h4>
              {review.verified && (
                <span
                  className="flex items-center gap-1 text-[10px] sm:text-xs text-green-600 bg-green-50 px-1.5 sm:px-2 py-0.5 rounded-full flex-shrink-0"
                  title="Verified Purchase"
                >
                  <CheckCircle className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                  <span className="hidden sm:inline">Verified</span>
                </span>
              )}
            </div>
            <p className="text-xs sm:text-sm text-gray-500 mt-0.5">{formatDate(review.createdAt)}</p>
          </div>
        </div>

        {/* Rating */}
        <div className="flex-shrink-0">
          <StarRating rating={review.rating} size="sm" />
        </div>
      </div>

      {/* Title */}
      {review.title && (
        <h5 className="text-sm sm:text-base font-semibold text-gray-900 mb-2">{review.title}</h5>
      )}

      {/* Comment */}
      <p className="text-sm sm:text-base text-gray-700 mb-3 leading-relaxed break-words">{review.comment}</p>

      {/* Images */}
      {review.images && review.images.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-3">
          {review.images.map((img, index) => (
            <div
              key={index}
              className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-lg overflow-hidden border border-gray-200 hover:border-[#84B067] transition-colors cursor-pointer flex-shrink-0"
            >
              <Image
                src={img}
                alt={`Review image ${index + 1}`}
                fill
                className="object-cover"
                sizes="(max-width: 640px) 64px, 80px"
              />
            </div>
          ))}
        </div>
      )}

      {/* Helpful Button */}
      <div className="flex items-center gap-2 sm:gap-4">
        <button
          onClick={handleHelpfulClick}
          disabled={isSubmitting || !checkAuth()}
          className={`flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm transition-colors ${
            hasVoted
              ? "text-[#84B067] hover:text-[#69773D] cursor-pointer"
              : checkAuth()
              ? "text-gray-600 hover:text-[#69773D] cursor-pointer"
              : "text-gray-400 cursor-not-allowed"
          } disabled:opacity-60 disabled:cursor-not-allowed`}
          title={
            !checkAuth()
              ? "Please login to mark review as helpful"
              : hasVoted
              ? "Click to unmark as helpful"
              : "Mark as helpful"
          }
        >
          <ThumbsUp
            className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${hasVoted ? "fill-[#84B067]" : ""}`}
          />
          <span>
            Helpful ({helpfulCount})
            {hasVoted && <span className="ml-1 text-[#84B067]">✓</span>}
          </span>
        </button>
      </div>
    </div>
  );
}

