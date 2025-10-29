"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { getItem, Item } from "@/config/items";
import { useCart } from "@/contexts/CartContext";
import toast from "react-hot-toast";
import { ReviewList } from "@/components/Reviews";
import { Review, ReviewSummary } from "@/types/review";

const GREEN = "#69773D";
const LIGHT = "#f7f4f1";
const BORDER = "rgba(122,74,34,0.25)";

export default function Page() {
  const { slug } = useParams<{ slug: string }>();
  const router = useRouter();
  const { addToCart } = useCart();
  const [item, setItem] = useState<Item | null>(null);
  const [loading, setLoading] = useState(true);
  const [qty, setQty] = useState(1);
  const [isMounted, setIsMounted] = useState(false);

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

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    let ok = true;
    (async () => {
      try {
        const res = await getItem(String(slug));
        if (ok) setItem(res.item);
      } catch {
        if (ok) setItem(null);
      } finally {
        if (ok) setLoading(false);
      }
    })();
    return () => {
      ok = false;
    };
  }, [slug]);

  const handleAddToCart = async () => {
    if (!isMounted || !item) return;

    try {
      await addToCart({
        id: item._id,
        title: item.title,
        price: item.price,
        image: item.photo?.[0] || "",
        sellerId: item.owner || "",
        sellerName: "Seller",
      });

      toast.success("Added to cart!", { icon: "🛒" });
    } catch (error) {
      console.error("Add to cart error:", error);
      toast.error("Failed to add item");
    }
  };

  const handleSubmitReview = async (data: { rating: number; title?: string; comment: string }) => {
    // TODO: Replace with actual API call when backend is ready
    await new Promise((resolve) => setTimeout(resolve, 1000)); // Simulate API delay
    
    // Get user name from localStorage or use default
    const userName = localStorage.getItem("user_name") || "Anonymous User";
    
    // Create new review
    const newReview: Review = {
      _id: Date.now().toString(), // Generate temporary ID
      itemId: String(slug),
      userId: "current-user",
      userName: userName,
      rating: data.rating,
      title: data.title,
      comment: data.comment,
      helpful: 0,
      verified: false, // Would be true if user actually purchased
      createdAt: new Date().toISOString(),
    };
    
    // Add to reviews list
    setReviews((prev) => [newReview, ...prev]); // Add at beginning
    
    // Update summary
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
    // TODO: Replace with actual API call when backend is ready
    
    // Update the helpful count for this review
    setReviews((prev) =>
      prev.map((review) =>
        review._id === reviewId
          ? { ...review, helpful: review.helpful + 1 }
          : review
      )
    );
    
    toast.success("Thank you for your feedback!");
  };

  if (loading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ background: LIGHT }}
      >
        Loading…
      </div>
    );
  }

  if (!item) {
    // either redirect to 404 or show inline message
    router.replace("/404");
    return null;
  }

  const main = item.photo?.[0] || "https://picsum.photos/seed/fallback/800/600";

  return (
    <div className="min-h-screen" style={{ background: LIGHT }}>
      <div className="w-full" style={{ background: GREEN }}>
        <div className="mx-auto max-w-6xl px-6 py-4 text-white font-medium">
          Item Detail
        </div>
      </div>

      <main className="mx-auto max-w-6xl px-6 py-6 bg-white rounded-2xl shadow mt-6">
        <p className="text-sm text-gray-500 mb-6">
          marketplace / browse /{" "}
          <span className="text-gray-700">{item.title}</span>
        </p>

        <div className="grid lg:grid-cols-2 gap-8 items-start">
          <section>
            <div
              className="relative aspect-[4/3] overflow-hidden rounded-2xl border bg-gray-50"
              style={{ borderColor: BORDER }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={main}
                alt={item.title}
                className="h-full w-full object-cover"
              />
            </div>

            {Array.isArray(item.photo) && item.photo.length > 1 && (
              <div className="mt-4 grid grid-cols-3 gap-4">
                {item.photo.slice(0, 3).map((src, i) => (
                  <div
                    key={src}
                    className={`aspect-[4/3] rounded-2xl overflow-hidden border-2 ${
                      i === 0
                        ? "border-[rgba(122,74,34,0.75)]"
                        : "border-[rgba(122,74,34,0.25)]"
                    }`}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={src}
                      alt={`thumb-${i}`}
                      className="h-full w-full object-cover"
                    />
                  </div>
                ))}
              </div>
            )}
          </section>

          <section>
            <h1 className="text-4xl md:text-5xl font-extrabold text-gray-800 mb-2 leading-tight">
              {item.title}
            </h1>

            <p className="mt-1 text-sm text-gray-500">
              Status:{" "}
              <span className="font-medium" style={{ color: GREEN }}>
                {item.status ?? "available"}
              </span>
            </p>

            <div className="mt-6 flex items-end gap-6">
              <div
                className="rounded-2xl px-5 py-3"
                style={{ background: "#e7efdb" }}
              >
                <div className="text-sm" style={{ color: GREEN }}>
                  THB
                </div>
                <div
                  className="text-3xl font-extrabold"
                  style={{ color: "#2f3b11" }}
                >
                  {item.price}
                </div>
              </div>
            </div>

            <p className="mt-6 text-gray-700 leading-relaxed">
              {item.description}
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              {item.category && (
                <span
                  className="inline-flex items-center gap-2 rounded-2xl border px-4 py-2 text-sm text-gray-700"
                  style={{ borderColor: BORDER }}
                >
                  {item.category}
                </span>
              )}
              {item.status && (
                <span
                  className="inline-flex items-center gap-2 rounded-2xl border px-4 py-2 text-sm text-gray-700"
                  style={{ borderColor: BORDER }}
                >
                  {item.status}
                </span>
              )}
            </div>

            {/* Qty */}
            <div className="mt-8 flex items-center gap-4">
              <label className="text-sm text-gray-600">Qty</label>

              <div
                className="inline-flex items-stretch rounded-xl overflow-hidden border shadow-sm select-none"
                style={{ borderColor: BORDER }}
                role="group"
                aria-label="Quantity"
              >
                <button
                  type="button"
                  className="px-4 py-2 text-gray-600 bg-white"
                  onClick={() => setQty((q) => Math.max(1, q - 1))}
                  aria-label="Decrease quantity"
                >
                  —
                </button>

                <div className="min-w-[3.5rem] px-4 py-2 flex items-center justify-center font-semibold text-gray-800 bg-white">
                  {qty}
                </div>

                <button
                  type="button"
                  className="px-4 py-2 text-gray-600 bg-white"
                  onClick={() => setQty((q) => q + 1)}
                  aria-label="Increase quantity"
                >
                  +
                </button>
              </div>

              <button
                type="button"
                className="rounded-xl px-6 py-3 font-semibold text-white shadow hover:opacity-90 transition"
                style={{ background: GREEN }}
                onClick={handleAddToCart}
              >
                Add to Cart
              </button>
            </div>
          </section>
        </div>

        {/* Reviews Section */}
        <div className="mx-auto max-w-6xl px-6 py-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Customer Reviews</h2>
            <Link
              href={`/marketplace/${item._id}/reviews`}
              className="text-[#84B067] hover:text-[#69773D] font-semibold transition-colors flex items-center gap-1"
            >
              View All Reviews
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
          <ReviewList
            itemId={item._id}
            reviews={reviews.slice(0, 3)}
            summary={reviewSummary}
            onSubmitReview={handleSubmitReview}
            onHelpful={handleHelpful}
          />
        </div>
      </main>
    </div>
  );
}
