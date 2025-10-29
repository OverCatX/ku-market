"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Filter } from "lucide-react";
import { Review, ReviewSummary } from "@/types/review";
import { ReviewList, ReviewSummary as ReviewSummaryComponent } from "@/components/Reviews";
import { getItem } from "@/config/items";
import toast from "react-hot-toast";

const LIGHT = "#f7f4f1";

export default function ReviewsPage() {
  const { slug } = useParams<{ slug: string }>();
  const router = useRouter();
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
    // Fetch item details to get title
    (async () => {
      try {
        const res = await getItem(String(slug));
        if (res.item) {
          setItemTitle(res.item.title);
        }
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
  }) => {
    await new Promise((resolve) => setTimeout(resolve, 1000));

    const userName = localStorage.getItem("user_name") || "Anonymous User";

    const newReview: Review = {
      _id: Date.now().toString(),
      itemId: String(slug),
      userId: "current-user",
      userName: userName,
      rating: data.rating,
      title: data.title,
      comment: data.comment,
      helpful: 0,
      verified: false,
      createdAt: new Date().toISOString(),
    };

    setReviews((prev) => [newReview, ...prev]);

    const newTotalReviews = reviewSummary.totalReviews + 1;
    const currentTotal = reviewSummary.averageRating * reviewSummary.totalReviews;
    const newAverage = (currentTotal + data.rating) / newTotalReviews;

    const newDistribution = { ...reviewSummary.ratingDistribution };
    newDistribution[data.rating as keyof typeof newDistribution] += 1;

    setReviewSummary({
      averageRating: newAverage,
      totalReviews: newTotalReviews,
      ratingDistribution: newDistribution,
    });
  };

  const handleHelpful = (reviewId: string) => {
    setReviews((prev) =>
      prev.map((review) =>
        review._id === reviewId
          ? { ...review, helpful: review.helpful + 1 }
          : review
      )
    );

    toast.success("Thank you for your feedback!");
  };

  const filteredReviews = filterRating
    ? reviews.filter((r) => r.rating === filterRating)
    : reviews;

  if (loading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ background: LIGHT }}
      >
        Loading...
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: LIGHT }}>
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="mx-auto max-w-6xl px-6 py-4">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors mb-3"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Product
          </button>

          <h1 className="text-2xl font-bold text-gray-900">Customer Reviews</h1>
          {itemTitle && (
            <p className="text-sm text-gray-600 mt-1">for {itemTitle}</p>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="mx-auto max-w-6xl px-6 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Sidebar - Summary & Filters */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-6">
              {/* Summary */}
              <ReviewSummaryComponent summary={reviewSummary} />

              {/* Filter by Rating */}
              <div className="bg-white rounded-lg p-6 border border-gray-200">
                <div className="flex items-center gap-2 mb-4">
                  <Filter className="w-5 h-5 text-gray-700" />
                  <h3 className="font-semibold text-gray-900">Filter by Rating</h3>
                </div>

                <div className="space-y-2">
                  <button
                    onClick={() => setFilterRating(null)}
                    className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
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
                        className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
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
            />
          </div>
        </div>
      </div>
    </div>
  );
}

