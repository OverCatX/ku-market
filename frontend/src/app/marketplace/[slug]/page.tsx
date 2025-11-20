"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { getItem, Item } from "@/config/items";
import { useCart } from "@/contexts/CartContext";
import toast from "react-hot-toast";
import { ReviewList } from "@/components/Reviews";
import { Review, ReviewSummary } from "@/types/review";
import { API_BASE } from "@/config/constants";
import {
  clearAuthTokens,
  getAuthToken,
  getAuthUser,
  isAuthenticated,
} from "@/lib/auth";

const GREEN = "#69773D";
const LIGHT = "#f7f4f1";
const BORDER = "rgba(122,74,34,0.25)";

// Type for populated owner object
interface OwnerObject {
  _id: string;
  name?: string;
  email?: string;
}

const isOwnerObject = (value: unknown): value is OwnerObject =>
  typeof value === "object" &&
  value !== null &&
  "_id" in (value as Record<string, unknown>);

const resolveOwnerInfo = (
  owner: unknown
): { id: string | null; name: string | null } => {
  if (typeof owner === "string") {
    return { id: owner, name: null };
  }
  if (isOwnerObject(owner)) {
    return {
      id: owner._id ?? null,
      name: owner.name ?? null,
    };
  }
  return { id: null, name: null };
};

const extractUserId = (user: unknown): string | null => {
  if (typeof user !== "object" || user === null) {
    return null;
  }
  const candidate =
    (user as Record<string, unknown>).id ??
    (user as Record<string, unknown>)._id ??
    (user as Record<string, unknown>).sub;
  return typeof candidate === "string" ? candidate : null;
};

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
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

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

  const ownerInfo = item
    ? resolveOwnerInfo(item.owner)
    : { id: null, name: null };
  const isOwnItem = Boolean(
    ownerInfo.id && currentUserId && ownerInfo.id === currentUserId
  );
  const sellerInitial =
    ownerInfo.name?.charAt(0).toUpperCase() ??
    ownerInfo.id?.charAt(0).toUpperCase() ??
    "S";
  const sellerDisplayName =
    ownerInfo.name ??
    (ownerInfo.id ? `Seller ID: ${ownerInfo.id.slice(0, 8)}...` : "Seller");

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    const authUser = getAuthUser();
    setCurrentUserId(extractUserId(authUser));
  }, []);

  useEffect(() => {
    let ok = true;
    (async () => {
      try {
        const res = await getItem(String(slug));
        if (ok) {
          setItem(res.item);
        }

        // Load reviews and summary
        const { getItemReviews, getReviewSummary } = await import(
          "@/config/reviews"
        );
        const [reviewsData, summaryData] = await Promise.all([
          getItemReviews(String(slug)).catch(() => []),
          getReviewSummary(String(slug)).catch(() => ({
            averageRating: 0,
            totalReviews: 0,
            ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
          })),
        ]);

        if (ok) {
          setReviews(reviewsData);
          setReviewSummary(summaryData);
        }
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
    if (isOwnItem) {
      toast.error("You cannot add your own item");
      return;
    }

    try {
      // Add item to cart
      await addToCart({
        id: item._id,
        title: item.title,
        price: item.price,
        image: item.photo?.[0] || "",
        sellerId: ownerInfo.id || "",
        sellerName: ownerInfo.name || "Seller",
      });

      // If quantity > 1, update the quantity
      if (qty > 1) {
        await updateQuantity(item._id, qty);
      }

      toast.success(`Added ${qty} item(s) to cart!`, { icon: "🛒" });
      setQty(1); // Reset quantity to 1
    } catch (error) {
      const message = error instanceof Error ? error.message : "";
      if (message.toLowerCase().includes("own item")) {
        toast.error("You cannot add your own item");
        return;
      }
      console.error("Add to cart error:", error);
      toast.error("Failed to add item");
    }
  };

  const handleContactSeller = async () => {
    if (!item) {
      return;
    }

    if (!ownerInfo.id) {
      toast.error("Seller information is unavailable");
      return;
    }

    if (isOwnItem) {
      toast.error("You cannot contact yourself");
      return;
    }

    if (!isAuthenticated()) {
      toast.error("Please login to contact the seller");
      const redirect = encodeURIComponent(`/marketplace/${item._id}`);
      router.push(`/login?redirect=${redirect}`);
      return;
    }

    const token = getAuthToken();
    if (!token) {
      toast.error("Please login to contact the seller");
      const redirect = encodeURIComponent(`/marketplace/${item._id}`);
      router.push(`/login?redirect=${redirect}`);
      return;
    }

    try {
      const response = await fetch(`${API_BASE}/api/chats/threads`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        credentials: "include",
        body: JSON.stringify({
          sellerId: ownerInfo.id,
        }),
      });

      if (response.status === 401) {
        clearAuthTokens();
        toast.error("Session expired. Please login again");
        const redirect = encodeURIComponent(`/marketplace/${item._id}`);
        router.push(`/login?redirect=${redirect}`);
        return;
      }

      if (!response.ok) {
        const errorPayload = (await response.json().catch(() => null)) as {
          error?: string;
          message?: string;
        } | null;
        const message =
          errorPayload?.error ||
          errorPayload?.message ||
          "Failed to start chat with seller";
        throw new Error(message);
      }

      const data = (await response.json().catch(() => null)) as {
        id?: string;
        threadId?: string;
        _id?: string;
      } | null;
      const threadId = data?.id || data?.threadId || data?._id;

      if (!threadId) {
        throw new Error("Chat thread not available");
      }

      router.push(`/chats?threadId=${encodeURIComponent(threadId)}`);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to contact seller";
      toast.error(message);
    }
  };

  const handleSubmitReview = async (data: {
    rating: number;
    title?: string;
    comment: string;
  }) => {
    // Authentication check is done in createReview API function
    // It will automatically handle expired tokens

    try {
      const { createReview: createReviewAPI, getReviewSummary } = await import(
        "@/config/reviews"
      );

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
      const errorMessage =
        error instanceof Error ? error.message : "Failed to submit review";

      // Show specific error messages (only show once)
      if (
        errorMessage.includes("login") ||
        errorMessage.includes("authenticated")
      ) {
        toast.error("Please login to submit a review");
      } else if (errorMessage.includes("already reviewed")) {
        toast.error("You have already reviewed this item");
      } else {
        toast.error(errorMessage);
      }
      // Don't re-throw - error already handled
    }
  };

  const handleHelpful = async (
    reviewId: string,
    currentHasVoted: boolean
  ): Promise<{ helpful: number; hasVoted: boolean }> => {
    try {
      const { toggleHelpful } = await import("@/config/reviews");
      const result = await toggleHelpful(reviewId, currentHasVoted);

      // Update the helpful count and hasVoted status for this review
      setReviews((prev) =>
        prev.map((review) => {
          const reviewIdValue =
            review._id || (review as { id?: string }).id || "";
          return reviewIdValue === reviewId
            ? { ...review, helpful: result.helpful, hasVoted: result.hasVoted }
            : review;
        })
      );

      toast.success(
        currentHasVoted
          ? "Removed helpful vote"
          : "Thank you for your feedback!"
      );
      return result;
    } catch (error) {
      // Error handling is done in ReviewItem component
      throw error;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen" style={{ background: '#F6F2E5' }}>
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

  const main =
    item.photo?.[selectedImage] ||
    item.photo?.[0] ||
    "https://picsum.photos/seed/fallback/800/600";
  const isSoldOrReserved = item.status === "sold" || item.status === "reserved";

  const handleReportItem = () => {
    const params = new URLSearchParams();
    if (item._id) params.set("itemId", String(item._id));
    if (item.title) params.set("title", item.title);
    router.push(
      `/report-item${params.toString() ? `?${params.toString()}` : ""}`
    );
  };

  return (
    <div className="min-h-screen" style={{ background: '#F6F2E5' }}>
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
            <h1 className="text-4xl md:text-5xl font-extrabold text-[#4A5130] mb-2 leading-tight">
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

            {(ownerInfo.id || ownerInfo.name) && (
              <div
                className="mt-6 p-4 rounded-xl border"
                style={{ backgroundColor: 'rgba(231, 239, 219, 0.5)', borderColor: 'rgba(231, 239, 219, 0.8)' }}
              >
                <h3 className="text-sm font-semibold text-[#4A5130] mb-2">
                  Seller Information
                </h3>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#69773D] to-[#84B067] flex items-center justify-center text-white font-bold">
                    {sellerInitial}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-[#4A5130]">
                      {sellerDisplayName}
                    </p>
                    <p className="text-sm text-gray-500">KU Market Seller</p>
                  </div>
                  <button
                    type="button"
                    className={`px-4 py-2 border-2 rounded-lg font-medium text-sm transition ${
                      isOwnItem
                        ? "opacity-50 cursor-not-allowed"
                        : "hover:bg-gray-100"
                    }`}
                    style={{ borderColor: BORDER, backgroundColor: 'rgba(122,74,34,0.85)', color: '#F6F2E5' }}
                    onClick={handleContactSeller}
                    disabled={isOwnItem}
                    title={
                      isOwnItem
                        ? "You cannot contact yourself"
                        : "Chat with seller"
                    }
                  >
                    {isOwnItem ? "Your item" : "Contact Seller"}
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

            <div className="mt-8 flex flex-col gap-3">
              {!isSoldOrReserved && (
                <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                  <div
                    className="flex items-center gap-2 rounded-xl border bg-white shadow-sm"
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
                    className={`rounded-xl px-6 py-3 font-semibold text-white shadow transition ${
                      item.owner === currentUserId
                        ? "opacity-50 cursor-not-allowed"
                        : "hover:opacity-90"
                    }`}
                    style={{ background: GREEN }}
                    onClick={handleAddToCart}
                    disabled={item.owner === currentUserId}
                    title={
                      item.owner === currentUserId
                        ? "You cannot add your own item"
                        : "Add to cart"
                    }
                  >
                    Add to Cart
                  </button>
                </div>
              )}

              <button
                type="button"
                onClick={handleReportItem}
                className="inline-flex items-center justify-center gap-2 rounded-xl px-5 py-3 font-semibold text-white bg-[#780606] shadow-md hover:shadow-lg hover:bg-[#5c0505] transition-all duration-300 hover:scale-[1.01] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#780606]"
              >
                Report this item
              </button>
            </div>
          </section>
        </div>

        {/* Reviews Section */}
        <div className="mx-auto max-w-6xl px-4 sm:px-6 py-6 sm:py-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-0 mb-4 sm:mb-6">
            <h2 className="text-xl sm:text-2xl font-bold text-[#4A5130]">
              Customer Reviews
            </h2>
            <Link
              href={`/marketplace/${item._id}/reviews`}
              className="text-[#69773D] hover:text-[#5a6530] font-semibold text-sm sm:text-base transition-colors flex items-center gap-1 self-start sm:self-auto"
            >
              <span className="hidden sm:inline">View All Reviews</span>
              <span className="sm:hidden">View All</span>
              <svg
                className="w-3.5 h-3.5 sm:w-4 sm:h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </Link>
          </div>
          <ReviewList
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
            <svg
              className="w-8 h-8"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>

          {/* Navigation */}
          <div
            className="relative max-w-5xl w-full"
            onClick={(e) => e.stopPropagation()}
          >
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
                onClick={() =>
                  setSelectedImage((prev) => Math.max(0, prev - 1))
                }
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
              </button>
            )}

            {/* Next button */}
            {selectedImage < item.photo.length - 1 && (
              <button
                className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-gray-800 rounded-full p-3 shadow-lg transition"
                onClick={() =>
                  setSelectedImage((prev) =>
                    Math.min(item.photo.length - 1, prev + 1)
                  )
                }
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
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
                  <img
                    src={src}
                    alt={`thumb-${i}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
