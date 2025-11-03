import { ReviewSummary as ReviewSummaryType } from "@/types/review";
import StarRating from "./StarRating";

interface ReviewSummaryProps {
  summary: ReviewSummaryType;
}

export default function ReviewSummary({ summary }: ReviewSummaryProps) {
  const getRatingPercentage = (count: number) => {
    if (summary.totalReviews === 0) return 0;
    return (count / summary.totalReviews) * 100;
  };

  return (
    <div className="bg-gray-50 rounded-lg p-4 sm:p-6 border border-gray-200">
      <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">Customer Reviews</h3>

      <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6 mb-4 sm:mb-6">
        {/* Average Rating */}
        <div className="text-center sm:text-left flex-shrink-0">
          <div className="text-3xl sm:text-4xl font-bold text-gray-900 mb-1">
            {summary.averageRating.toFixed(1)}
          </div>
          <div className="flex justify-center sm:justify-start mb-1">
            <StarRating rating={summary.averageRating} size="md" />
          </div>
          <p className="text-xs sm:text-sm text-gray-600 mt-1">
            {summary.totalReviews} {summary.totalReviews === 1 ? "review" : "reviews"}
          </p>
        </div>

        {/* Rating Distribution */}
        <div className="flex-1 w-full sm:w-auto">
          {[5, 4, 3, 2, 1].map((star) => {
            const count = summary.ratingDistribution[star as keyof typeof summary.ratingDistribution];
            const percentage = getRatingPercentage(count);

            return (
              <div key={star} className="flex items-center gap-1.5 sm:gap-2 mb-1.5 sm:mb-2">
                <span className="text-xs sm:text-sm text-gray-600 w-6 sm:w-8 flex-shrink-0">{star} ★</span>
                <div className="flex-1 bg-gray-200 rounded-full h-1.5 sm:h-2 overflow-hidden">
                  <div
                    className="bg-yellow-400 h-full transition-all duration-300"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                <span className="text-xs sm:text-sm text-gray-600 w-8 sm:w-10 text-right flex-shrink-0">{count}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

