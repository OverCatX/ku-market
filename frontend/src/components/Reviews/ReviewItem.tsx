import { ThumbsUp, CheckCircle, User, Trash2, X, ChevronLeft, ChevronRight } from "lucide-react";
import { Review } from "@/types/review";
import StarRating from "./StarRating";
import Image from "next/image";
import { useState, useEffect, useRef } from "react";
import toast from "react-hot-toast";
import { isAuthenticated as checkAuth, getAuthUser } from "@/lib/auth";

interface ReviewItemProps {
  review: Review;
  onHelpful?: (reviewId: string, currentHasVoted: boolean) => Promise<{ helpful: number; hasVoted: boolean }>;
  onDelete?: (reviewId: string) => Promise<void>;
}

export default function ReviewItem({ review, onHelpful, onDelete }: ReviewItemProps) {
  const [hasVoted, setHasVoted] = useState(review.hasVoted || false);
  const [helpfulCount, setHelpfulCount] = useState(review.helpful || 0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isOwner, setIsOwner] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const modalRef = useRef<HTMLDivElement>(null);
  

  // Sync state with props when review changes
  useEffect(() => {
    setHasVoted(review.hasVoted || false);
    setHelpfulCount(review.helpful || 0);
    
    // Check if current user is the owner of this review
    if (checkAuth()) {
      const user = getAuthUser();
      
      // Handle reviewUserId - it might be a string or an object
      let reviewUserId: string | null = null;
      if (review.userId) {
        if (typeof review.userId === 'string') {
          reviewUserId = review.userId.trim();
        } else if (typeof review.userId === 'object' && review.userId !== null) {
          // If it's an object, try to get _id from it
          const userIdObj = review.userId as Record<string, unknown>;
          
          // Check if it has _id property
          if ('_id' in userIdObj && userIdObj._id) {
            const _idValue = userIdObj._id;
            // Handle ObjectId or string _id
            if (typeof _idValue === 'string') {
              reviewUserId = _idValue.trim();
            } else if (typeof _idValue === 'object' && _idValue !== null) {
              // It's likely a MongoDB ObjectId
              // Try to convert the whole object to string first to see what we get
              const objStr = String(_idValue);
              
              // Try to extract ObjectId from string representation like "new ObjectId('691d3935db46d551a8edfb2a')"
              // or just the ID itself if it's already a string
              const oidMatch = objStr.match(/ObjectId\(['"]([^'"]+)['"]\)/);
              if (oidMatch && oidMatch[1]) {
                reviewUserId = oidMatch[1].trim();
              } else if (/^[0-9a-fA-F]{24}$/.test(objStr)) {
                // If the string itself is a valid ObjectId (24 hex chars)
                reviewUserId = objStr.trim();
              } else {
                // Try toString() method if available
                const objId = _idValue as { toString?: () => string };
                if (objId.toString && typeof objId.toString === 'function') {
                  try {
                    const str = objId.toString();
                    if (/^[0-9a-fA-F]{24}$/.test(str)) {
                      reviewUserId = str.trim();
                    } else {
                      const match = str.match(/ObjectId\(['"]([^'"]+)['"]\)/);
                      if (match && match[1]) {
                        reviewUserId = match[1].trim();
                      } else {
                        reviewUserId = str.trim();
                      }
                    }
                  } catch {
                    reviewUserId = objStr.trim();
                  }
                } else {
                  reviewUserId = objStr.trim();
                }
              }
            } else {
              reviewUserId = String(_idValue).trim();
            }
          } else {
            // No _id property, try to convert the whole object
            const str = String(review.userId);
            const oidMatch = str.match(/ObjectId\(['"]([^'"]+)['"]\)/);
            if (oidMatch && oidMatch[1]) {
              reviewUserId = oidMatch[1].trim();
            } else {
              reviewUserId = str.trim();
            }
          }
        } else {
          reviewUserId = String(review.userId).trim();
        }
      }
      
      // Try multiple possible user ID fields from JWT token
      let currentUserId: string | null = null;
      if (user) {
        if (user.id) {
          currentUserId = String(user.id).trim();
        } else if ((user as { _id?: string })._id) {
          currentUserId = String((user as { _id?: string })._id).trim();
        } else if ((user as { userId?: string }).userId) {
          currentUserId = String((user as { userId?: string }).userId).trim();
        }
      }
      
      // Normalize both IDs to strings for comparison (remove any whitespace, convert to lowercase for comparison)
      const normalizedReviewUserId = reviewUserId ? reviewUserId.trim().toLowerCase() : null;
      const normalizedCurrentUserId = currentUserId ? currentUserId.trim().toLowerCase() : null;
      
      const isMatch = normalizedCurrentUserId !== null && normalizedReviewUserId !== null && normalizedCurrentUserId === normalizedReviewUserId;
      setIsOwner(isMatch);
    } else {
      setIsOwner(false);
    }
  }, [review.hasVoted, review.helpful, review.userId, review._id, onDelete]);

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

  const handleDelete = async () => {
    if (!onDelete) return;
    if (isDeleting) return;
    
    const confirmed = window.confirm("Are you sure you want to delete this review? This action cannot be undone.");
    if (!confirmed) return;

    setIsDeleting(true);
    try {
      await onDelete(review._id || (review as { id?: string }).id || "");
      toast.success("Review deleted successfully");
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to delete review";
      toast.error(errorMessage);
    } finally {
      setIsDeleting(false);
    }
  };

  const openImageModal = (index: number) => {
    setCurrentImageIndex(index);
    setShowImageModal(true);
  };

  const closeImageModal = () => {
    setShowImageModal(false);
  };

  const nextImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (review.images && review.images.length > 0) {
      const imagesLength = review.images.length;
      setCurrentImageIndex((prev) => (prev + 1) % imagesLength);
    }
  };

  const prevImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (review.images && review.images.length > 0) {
      const imagesLength = review.images.length;
      setCurrentImageIndex((prev) => (prev - 1 + imagesLength) % imagesLength);
    }
  };

  // Close modal on Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && showImageModal) {
        closeImageModal();
      }
    };
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [showImageModal]);

  return (
    <div className="border-b border-gray-200 py-4 sm:py-6 last:border-b-0">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 sm:gap-0 mb-3">
        <div className="flex items-center gap-2 sm:gap-3">
          {/* User Avatar */}
          {review.userAvatar ? (
            <div className="relative w-8 h-8 sm:w-10 sm:h-10 rounded-full overflow-hidden border-2 border-[#69773D] flex-shrink-0">
              <Image
                src={review.userAvatar}
                alt={review.userName}
                fill
                className="object-cover"
                sizes="(max-width: 640px) 32px, 40px"
              />
            </div>
          ) : (
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-[#69773D] to-[#84B067] flex items-center justify-center text-white font-bold flex-shrink-0 text-xs sm:text-sm">
              {review.userName?.charAt(0).toUpperCase() || "U"}
            </div>
          )}

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

      {/* Title - Show even if empty, but only if provided */}
      {review.title && review.title.trim() && (
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
              onClick={() => openImageModal(index)}
              className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-lg overflow-hidden border border-gray-200 hover:border-[#84B067] transition-colors cursor-pointer flex-shrink-0 group"
            >
              <Image
                src={img}
                alt={`Review image ${index + 1}`}
                fill
                className="object-cover group-hover:scale-110 transition-transform duration-200"
                sizes="(max-width: 640px) 64px, 80px"
              />
              {/* Overlay hint */}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                <div className="opacity-0 group-hover:opacity-100 transition-opacity text-white text-xs font-medium">
                  Click to view
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Image Gallery Modal */}
      {showImageModal && review.images && review.images.length > 0 && (
        <div
          ref={modalRef}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
          onClick={closeImageModal}
          role="dialog"
          aria-modal="true"
          aria-label="Review image gallery"
        >
          <div
            className="relative max-w-6xl w-full max-h-[90vh]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={closeImageModal}
              className="absolute top-4 right-4 z-10 p-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors backdrop-blur-sm"
              aria-label="Close gallery"
            >
              <X size={24} />
            </button>

            {/* Navigation Buttons */}
            {review.images.length > 1 && (
              <>
                <button
                  onClick={prevImage}
                  className="absolute left-4 top-1/2 -translate-y-1/2 z-10 p-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors backdrop-blur-sm"
                  aria-label="Previous image"
                >
                  <ChevronLeft size={24} />
                </button>
                <button
                  onClick={nextImage}
                  className="absolute right-4 top-1/2 -translate-y-1/2 z-10 p-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors backdrop-blur-sm"
                  aria-label="Next image"
                >
                  <ChevronRight size={24} />
                </button>
              </>
            )}

            {/* Image Container */}
            <div className="relative w-full h-[85vh] bg-gray-900 rounded-lg overflow-hidden">
              <Image
                src={review.images[currentImageIndex]}
                alt={`Review image ${currentImageIndex + 1}`}
                fill
                className="object-contain"
                sizes="90vw"
                priority
              />
            </div>

            {/* Image Counter */}
            {review.images.length > 1 && (
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/60 text-white px-4 py-2 rounded-full text-sm font-medium backdrop-blur-sm">
                {currentImageIndex + 1} / {review.images.length}
              </div>
            )}

            {/* Thumbnail Strip */}
            {review.images.length > 1 && (
              <div className="absolute bottom-16 left-1/2 -translate-x-1/2 flex gap-2 max-w-full overflow-x-auto px-4 py-2 bg-black/40 rounded-lg backdrop-blur-sm">
                {review.images.map((img, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentImageIndex(index)}
                    className={`relative w-16 h-16 rounded-lg overflow-hidden border-2 transition-all flex-shrink-0 ${
                      index === currentImageIndex
                        ? "border-white scale-110"
                        : "border-transparent hover:border-white/50 opacity-70 hover:opacity-100"
                    }`}
                  >
                    <Image
                      src={img}
                      alt={`Thumbnail ${index + 1}`}
                      fill
                      className="object-cover"
                      sizes="64px"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Helpful Button and Delete Button */}
      <div className="flex items-center justify-between gap-2 sm:gap-4">
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
        
        {/* Delete Button - Only show if user owns the review */}
        {isOwner && onDelete && (
          <button
            onClick={handleDelete}
            disabled={isDeleting}
            className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm text-red-600 hover:text-red-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
            title="Delete your review"
          >
            <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span>{isDeleting ? "Deleting..." : "Delete"}</span>
          </button>
        )}
        
      </div>
    </div>
  );
}

