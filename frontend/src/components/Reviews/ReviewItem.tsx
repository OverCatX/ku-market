import { ThumbsUp, CheckCircle, User } from "lucide-react";
import { Review } from "@/types/review";
import StarRating from "./StarRating";
import Image from "next/image";

interface ReviewItemProps {
  review: Review;
  onHelpful?: (reviewId: string) => void;
}

export default function ReviewItem({ review, onHelpful }: ReviewItemProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div className="border-b border-gray-200 py-6 last:border-b-0">
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          {/* User Avatar */}
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#69773D] to-[#84B067] flex items-center justify-center text-white font-bold">
            {review.userAvatar ? (
              <Image
                src={review.userAvatar}
                alt={review.userName}
                width={40}
                height={40}
                className="rounded-full"
              />
            ) : (
              <User className="w-5 h-5" />
            )}
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h4 className="font-semibold text-gray-900">{review.userName}</h4>
              {review.verified && (
                <span
                  className="flex items-center gap-1 text-xs text-green-600 bg-green-50 px-2 py-0.5 rounded-full"
                  title="Verified Purchase"
                >
                  <CheckCircle className="w-3 h-3" />
                  Verified
                </span>
              )}
            </div>
            <p className="text-sm text-gray-500">{formatDate(review.createdAt)}</p>
          </div>
        </div>

        {/* Rating */}
        <StarRating rating={review.rating} size="sm" />
      </div>

      {/* Title */}
      {review.title && (
        <h5 className="font-semibold text-gray-900 mb-2">{review.title}</h5>
      )}

      {/* Comment */}
      <p className="text-gray-700 mb-3 leading-relaxed">{review.comment}</p>

      {/* Images */}
      {review.images && review.images.length > 0 && (
        <div className="flex gap-2 mb-3">
          {review.images.map((img, index) => (
            <div
              key={index}
              className="relative w-20 h-20 rounded-lg overflow-hidden border border-gray-200 hover:border-[#84B067] transition-colors cursor-pointer"
            >
              <Image
                src={img}
                alt={`Review image ${index + 1}`}
                fill
                className="object-cover"
              />
            </div>
          ))}
        </div>
      )}

      {/* Helpful Button */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => onHelpful?.(review._id)}
          className="flex items-center gap-2 text-sm text-gray-600 hover:text-[#69773D] transition-colors"
        >
          <ThumbsUp className="w-4 h-4" />
          <span>Helpful ({review.helpful})</span>
        </button>
      </div>
    </div>
  );
}

