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
    <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Customer Reviews</h3>

      <div className="flex items-center gap-6 mb-6">
        {/* Average Rating */}
        <div className="text-center">
          <div className="text-4xl font-bold text-gray-900 mb-1">
            {summary.averageRating.toFixed(1)}
          </div>
          <StarRating rating={summary.averageRating} size="md" />
          <p className="text-sm text-gray-600 mt-1">
            {summary.totalReviews} {summary.totalReviews === 1 ? "review" : "reviews"}
          </p>
        </div>

        {/* Rating Distribution */}
        <div className="flex-1">
          {[5, 4, 3, 2, 1].map((star) => {
            const count = summary.ratingDistribution[star as keyof typeof summary.ratingDistribution];
            const percentage = getRatingPercentage(count);

            return (
              <div key={star} className="flex items-center gap-2 mb-2">
                <span className="text-sm text-gray-600 w-8">{star} ★</span>
                <div className="flex-1 bg-gray-200 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-yellow-400 h-full transition-all duration-300"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                <span className="text-sm text-gray-600 w-10 text-right">{count}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

