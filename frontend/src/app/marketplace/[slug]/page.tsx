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

// Type for populated owner object
interface OwnerObject {
  _id: string;
  name?: string;
  email?: string;
}

export default function Page() {
  const { slug } = useParams<{ slug: string }>();
  const router = useRouter();
  const { addToCart, updateQuantity } = useCart();
  const [item, setItem] = useState<Item | null>(null);
  const [loading, setLoading] = useState(true);
  const [qty, setQty] = useState(1);
  const [isMounted, setIsMounted] = useState(false);
  const [selectedImage, setSelectedImage] = useState(0);
  const [showLightbox, setShowLightbox] = useState(false);

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
      // Add item to cart
      await addToCart({
        id: item._id,
        title: item.title,
        price: item.price,
        image: item.photo?.[0] || "",
        sellerId: item.owner || "",
        sellerName: "Seller",
      });

      // If quantity > 1, update the quantity
      if (qty > 1) {
        await updateQuantity(item._id, qty);
      }

      toast.success(`Added ${qty} item(s) to cart!`, { icon: "🛒" });
      setQty(1); // Reset quantity to 1
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
      <div className="min-h-screen" style={{ background: LIGHT }}>
        <div className="w-full" style={{ background: GREEN }}>
          <div className="mx-auto max-w-6xl px-6 py-4 text-white font-medium">
            Item Detail
          </div>
        </div>
        <main className="mx-auto max-w-6xl px-6 py-6 bg-white rounded-2xl shadow mt-6">
          <div className="animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-1/3 mb-6"></div>
            <div className="grid lg:grid-cols-2 gap-8">
              <div>
                <div className="aspect-[4/3] bg-gray-200 rounded-2xl"></div>
                <div className="mt-4 grid grid-cols-4 gap-3">
                  <div className="aspect-[4/3] bg-gray-200 rounded-2xl"></div>
                  <div className="aspect-[4/3] bg-gray-200 rounded-2xl"></div>
                  <div className="aspect-[4/3] bg-gray-200 rounded-2xl"></div>
                  <div className="aspect-[4/3] bg-gray-200 rounded-2xl"></div>
                </div>
              </div>
              <div>
                <div className="h-10 bg-gray-200 rounded w-3/4 mb-4"></div>
                <div className="h-6 bg-gray-200 rounded w-1/4 mb-6"></div>
                <div className="h-20 bg-gray-200 rounded mb-6"></div>
                <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-5/6"></div>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (!item) {
    router.replace("/404");
    return null;
  }

  const main = item.photo?.[selectedImage] || item.photo?.[0] || "https://picsum.photos/seed/fallback/800/600";
  const isSoldOrReserved = item.status === "sold" || item.status === "reserved";

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
              className="relative aspect-[4/3] overflow-hidden rounded-2xl border bg-gray-50 cursor-pointer group"
              style={{ borderColor: BORDER }}
              onClick={() => setShowLightbox(true)}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={main}
                alt={item.title}
                className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              {/* Overlay hint */}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-white/90 px-4 py-2 rounded-full text-sm font-medium">
                  Click to view all images
                </div>
              </div>
              {/* Image counter */}
              {item.photo && item.photo.length > 1 && (
                <div className="absolute top-4 right-4 bg-black/70 text-white px-3 py-1 rounded-full text-sm font-medium">
                  {selectedImage + 1} / {item.photo.length}
                </div>
              )}
            </div>

            {Array.isArray(item.photo) && item.photo.length > 1 && (
              <div className="mt-4 grid grid-cols-4 gap-3">
                {item.photo.slice(0, 4).map((src, i) => (
                  <button
                    key={src}
                    type="button"
                    onClick={() => setSelectedImage(i)}
                    className={`aspect-[4/3] rounded-2xl overflow-hidden border-2 transition-all hover:scale-105 relative ${
                      i === selectedImage
                        ? "border-[rgba(122,74,34,0.75)] ring-2 ring-[rgba(122,74,34,0.3)]"
                        : "border-[rgba(122,74,34,0.25)] hover:border-[rgba(122,74,34,0.5)]"
                    }`}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={src}
                      alt={`thumb-${i}`}
                      className="h-full w-full object-cover"
                    />
                    {/* Show "+X more" on last thumbnail if there are more images */}
                    {i === 3 && item.photo.length > 4 && (
                      <div
                        className="absolute inset-0 bg-black/60 flex items-center justify-center cursor-pointer"
                        onClick={(e) => {
                          e.stopPropagation();
                          setShowLightbox(true);
                        }}
                      >
                        <span className="text-white font-bold text-xl">
                          +{item.photo.length - 4}
                        </span>
                      </div>
                    )}
                  </button>
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

            {/* Seller Info */}
            {item.owner && (
              <div className="mt-6 p-4 bg-gray-50 rounded-xl border" style={{ borderColor: BORDER }}>
                <h3 className="text-sm font-semibold text-gray-600 mb-2">Seller Information</h3>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#69773D] to-[#84B067] flex items-center justify-center text-white font-bold">
                    {typeof item.owner === 'string' 
                      ? item.owner.charAt(0).toUpperCase()
                      : (item.owner as OwnerObject)?.name?.charAt(0)?.toUpperCase() || 'S'}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">
                      {typeof item.owner === 'string' 
                        ? `Seller ID: ${item.owner.slice(0, 8)}...`
                        : (item.owner as OwnerObject)?.name || 'Seller'}
                    </p>
                    <p className="text-sm text-gray-500">KU Market Seller</p>
                  </div>
                  <button
                    type="button"
                    className="px-4 py-2 border-2 rounded-lg font-medium text-sm hover:bg-gray-100 transition"
                    style={{ borderColor: BORDER, color: GREEN }}
                    onClick={() => toast("Chat feature coming soon!", { icon: "💬" })}
                  >
                    Contact
                  </button>
                </div>
              </div>
            )}

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
            {isSoldOrReserved ? (
              <div className="mt-8 p-4 bg-gray-100 rounded-xl border border-gray-300 text-center">
                <p className="text-gray-600 font-medium">
                  This item is currently <span className="font-bold uppercase">{item.status}</span>
                </p>
              </div>
            ) : (
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
                    className="px-4 py-2 text-gray-600 bg-white hover:bg-gray-50 transition"
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
                    className="px-4 py-2 text-gray-600 bg-white hover:bg-gray-50 transition"
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
            )}
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

      {/* Image Lightbox Modal */}
      {showLightbox && item.photo && (
        <div
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
          onClick={() => setShowLightbox(false)}
        >
          {/* Close button */}
          <button
            className="absolute top-4 right-4 text-white hover:text-gray-300 transition"
            onClick={() => setShowLightbox(false)}
          >
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* Navigation */}
          <div className="relative max-w-5xl w-full" onClick={(e) => e.stopPropagation()}>
            {/* Main image */}
            <div className="relative aspect-[4/3] overflow-hidden rounded-lg">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={item.photo[selectedImage]}
                alt={`${item.title} - ${selectedImage + 1}`}
                className="w-full h-full object-contain"
              />
            </div>

            {/* Previous button */}
            {selectedImage > 0 && (
              <button
                className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-gray-800 rounded-full p-3 shadow-lg transition"
                onClick={() => setSelectedImage((prev) => Math.max(0, prev - 1))}
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
            )}

            {/* Next button */}
            {selectedImage < item.photo.length - 1 && (
              <button
                className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-gray-800 rounded-full p-3 shadow-lg transition"
                onClick={() => setSelectedImage((prev) => Math.min(item.photo.length - 1, prev + 1))}
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            )}

            {/* Image counter */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/70 text-white px-4 py-2 rounded-full text-sm font-medium">
              {selectedImage + 1} / {item.photo.length}
            </div>

            {/* Thumbnail strip */}
            <div className="mt-4 flex gap-2 overflow-x-auto pb-2">
              {item.photo.map((src, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedImage(i)}
                  className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${
                    i === selectedImage
                      ? "border-white ring-2 ring-white/50"
                      : "border-white/30 hover:border-white/60"
                  }`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={src} alt={`thumb-${i}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
