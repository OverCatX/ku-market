"use client";

import { useState, useEffect, useRef } from "react";
import { X, Image as ImageIcon, Trash2, Shield } from "lucide-react";
import StarRating from "./StarRating";
import toast from "react-hot-toast";
import {
  isAuthenticated as checkAuth,
  getAuthUser,
  updateStoredUser,
} from "@/lib/auth";
import { getProfile } from "@/config/profile";
import Image from "next/image";

interface ReviewFormProps {
  itemId: string;
  onSubmit: (data: {
    rating: number;
    title?: string;
    comment: string;
    images?: File[];
  }) => Promise<void>;
  onCancel?: () => void;
}

export default function ReviewForm({
  onSubmit,
  onCancel,
}: Omit<ReviewFormProps, "itemId">) {
  const [rating, setRating] = useState(0);
  const [title, setTitle] = useState("");
  const [comment, setComment] = useState("");
  const [images, setImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const lastVerificationCheckRef = useRef(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const refreshVerificationFromServer = async () => {
    try {
      const profile = await getProfile();
      if (profile?.isVerified) {
        updateStoredUser({ isVerified: true });
        setIsVerified(true);
        return true;
      }
    } catch (error) {
      console.warn("Failed to refresh verification status", error);
    }
    return false;
  };

  // Check authentication and verification status on mount and listen for changes
  useEffect(() => {
    const checkAuthStatus = () => {
      const authenticated = checkAuth();
      setIsAuthenticated(authenticated);

      if (authenticated) {
        const user = getAuthUser();
        setIsVerified(Boolean(user?.isVerified));
        if (!user?.isVerified) {
          const now = Date.now();
          if (now - lastVerificationCheckRef.current > 5000) {
            lastVerificationCheckRef.current = now;
            refreshVerificationFromServer();
          }
        }
      } else {
        setIsVerified(false);
      }
    };

    checkAuthStatus();
    // Check periodically in case token is added or expires
    const interval = setInterval(checkAuthStatus, 1000);

    return () => clearInterval(interval);
  }, []);

  const checkAuthAndVerification = () => {
    if (!checkAuth()) {
      toast.error("Please login to submit a review", {
        duration: 3000,
        icon: "🔒",
      });
      return false;
    }

    const user = getAuthUser();
    if (!user?.isVerified) {
      // Attempt to refresh verification once more when user tries to submit
      refreshVerificationFromServer();
      toast.error(
        "You must verify your identity before submitting a review. Please complete identity verification first.",
        {
          duration: 5000,
          icon: "🆔",
        }
      );
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Check authentication and verification first
    if (!checkAuthAndVerification()) {
      return;
    }

    // Validate rating
    if (rating === 0) {
      toast.error("Please select a rating");
      return;
    }

    if (rating < 1 || rating > 5) {
      toast.error("Rating must be between 1 and 5");
      return;
    }

    // Validate comment
    if (!comment || comment.trim().length === 0) {
      toast.error("Comment is required");
      return;
    }

    if (comment.trim().length < 10) {
      toast.error("Comment must be at least 10 characters");
      return;
    }

    if (comment.trim().length > 2000) {
      toast.error("Comment must not exceed 2000 characters");
      return;
    }

    // Validate title if provided
    if (title && title.trim().length > 200) {
      toast.error("Title must not exceed 200 characters");
      return;
    }

    setSubmitting(true);
    try {
      await onSubmit({
        rating,
        title: title.trim() || undefined,
        comment: comment.trim(),
        images: images.length > 0 ? images : undefined,
      });

      // Don't show toast here - parent component will handle it

      // Reset form
      setRating(0);
      setTitle("");
      setComment("");
      setImages([]);
      setImagePreviews([]);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      onCancel?.();
    } catch (error) {
      // Don't show toast here - parent component will handle it
      // Just log for debugging
      console.error("Review submission error:", error);
      // Re-throw so parent can handle
      throw error;
    } finally {
      setSubmitting(false);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (images.length + files.length > 5) {
      toast.error("Maximum 5 images allowed");
      return;
    }

    const newImages = [...images, ...files];
    setImages(newImages);

    // Create previews
    const newPreviews = files.map((file) => URL.createObjectURL(file));
    setImagePreviews([...imagePreviews, ...newPreviews]);
  };

  const removeImage = (index: number) => {
    // Revoke object URL to free memory before removing
    if (imagePreviews[index]) {
      URL.revokeObjectURL(imagePreviews[index]);
    }

    const newImages = images.filter((_, i) => i !== index);
    const newPreviews = imagePreviews.filter((_, i) => i !== index);

    setImages(newImages);
    setImagePreviews(newPreviews);
  };

  // Cleanup object URLs on unmount
  useEffect(() => {
    return () => {
      // Cleanup all object URLs on unmount
      imagePreviews.forEach((preview) => {
        if (preview) {
          URL.revokeObjectURL(preview);
        }
      });
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run on mount/unmount

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-gray-50 rounded-lg p-4 sm:p-6 border border-gray-200"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base sm:text-lg font-semibold text-gray-900">
          Write a Review
        </h3>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="p-1 sm:p-1.5 hover:bg-gray-200 rounded-full transition-colors"
            aria-label="Close"
          >
            <X className="w-4 h-4 sm:w-5 sm:h-5 text-gray-500" />
          </button>
        )}
      </div>

      {/* Authentication warning */}
      {!isAuthenticated && (
        <div className="mb-4 p-2.5 sm:p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-xs sm:text-sm text-yellow-800">
            <span className="font-medium">⚠️ Login Required:</span> You must be
            logged in to submit a review.
          </p>
        </div>
      )}

      {/* Verification warning */}
      {isAuthenticated && !isVerified && (
        <div className="mb-4 p-2.5 sm:p-3 bg-orange-50 border border-orange-200 rounded-lg">
          <p className="text-xs sm:text-sm text-orange-800">
            <span className="font-medium">🆔 Verification Required:</span> You
            must verify your identity before submitting a review.
          </p>
          <a
            href="/verify-identity"
            className="mt-2 inline-block text-xs sm:text-sm text-orange-700 hover:text-orange-900 underline font-medium"
          >
            Verify Identity Now →
          </a>
        </div>
      )}

      {/* Security info - shown when authenticated and verified */}
      {isAuthenticated && isVerified && (
        <div className="mb-4 p-2.5 sm:p-3 bg-green-50 border border-[#84B067]/30 rounded-lg">
          <div className="flex items-start gap-2">
            <Shield className="w-4 h-4 sm:w-5 sm:h-5 text-[#69773D] mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-xs sm:text-sm text-[#69773D]">
                <span className="font-medium">Protected Reviews:</span> All
                reviews are verified and protected. You can submit up to 5
                reviews per hour. Reviews from verified purchases are marked
                with a badge.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Rating */}
      <div className="mb-3 sm:mb-4">
        <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
          Your Rating <span className="text-red-500">*</span>
        </label>
        <StarRating
          rating={rating}
          interactive={isAuthenticated && isVerified}
          onChange={setRating}
          size="lg"
          disabled={!isAuthenticated || !isVerified}
        />
      </div>

      {/* Title */}
      <div className="mb-3 sm:mb-4">
        <label
          htmlFor="review-title"
          className="block text-xs sm:text-sm font-medium text-gray-700 mb-2"
        >
          Review Title (Optional)
        </label>
        <input
          id="review-title"
          type="text"
          value={title}
          onChange={(e) => {
            const value = e.target.value;
            if (value.length <= 200) {
              setTitle(value);
            }
          }}
          placeholder="Sum up your review"
          maxLength={200}
          disabled={!isAuthenticated || !isVerified}
          className="w-full px-3 py-2 sm:px-4 text-sm sm:text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#84B067] focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
        />
        {title.length > 0 && (
          <p className="text-xs text-gray-500 mt-1">
            {title.length}/200 characters
          </p>
        )}
      </div>

      {/* Comment */}
      <div className="mb-3 sm:mb-4">
        <label
          htmlFor="review-comment"
          className="block text-xs sm:text-sm font-medium text-gray-700 mb-2"
        >
          Your Review <span className="text-red-500">*</span>
        </label>
        <textarea
          id="review-comment"
          value={comment}
          onChange={(e) => {
            const value = e.target.value;
            if (value.length <= 2000) {
              setComment(value);
            }
          }}
          placeholder="Share your experience with this product (minimum 10 characters)"
          rows={4}
          minLength={10}
          maxLength={2000}
          required
          disabled={!isAuthenticated || !isVerified}
          className="w-full px-3 py-2 sm:px-4 text-sm sm:text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#84B067] focus:border-transparent resize-none disabled:bg-gray-100 disabled:cursor-not-allowed"
        />
        <p className="text-xs text-gray-500 mt-1">
          {comment.length}/2000 characters
          {comment.length < 10 && comment.length > 0 && (
            <span className="text-red-500 ml-2">
              (Minimum 10 characters required)
            </span>
          )}
        </p>
      </div>

      {/* Image Upload */}
      <div className="mb-3 sm:mb-4">
        <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
          Photos (Optional, max 5)
        </label>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={handleImageChange}
          disabled={!isAuthenticated || !isVerified || images.length >= 5}
          className="hidden"
          id="review-images"
        />
        <label
          htmlFor="review-images"
          className={`inline-flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg cursor-pointer transition-colors ${
            !isAuthenticated || !isVerified || images.length >= 5
              ? "bg-gray-100 cursor-not-allowed opacity-50"
              : "bg-white hover:bg-gray-50"
          }`}
        >
          <ImageIcon className="w-4 h-4" />
          <span className="text-sm">Add Photos</span>
        </label>
        {images.length > 0 && (
          <p className="text-xs text-gray-500 mt-1">{images.length}/5 images</p>
        )}

        {/* Image Previews */}
        {imagePreviews.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-3">
            {imagePreviews.map((preview, index) => (
              <div
                key={index}
                className="relative w-20 h-20 rounded-lg overflow-hidden border border-gray-200"
              >
                <Image
                  src={preview}
                  alt={`Preview ${index + 1}`}
                  fill
                  className="object-cover"
                  sizes="80px"
                />
                <button
                  type="button"
                  onClick={() => removeImage(index)}
                  className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                  aria-label="Remove image"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Buttons */}
      <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
        <button
          type="submit"
          disabled={
            submitting ||
            rating === 0 ||
            comment.trim().length < 10 ||
            !isAuthenticated ||
            !isVerified
          }
          className="flex-1 px-4 py-2.5 sm:px-6 sm:py-3 bg-[#84B067] text-white rounded-lg hover:bg-[#69773D] transition-colors text-sm sm:text-base font-semibold disabled:bg-gray-300 disabled:cursor-not-allowed"
          title={
            !isAuthenticated
              ? "Please login to submit a review"
              : !isVerified
              ? "Please verify your identity to submit a review"
              : ""
          }
        >
          {submitting
            ? "Submitting..."
            : !isAuthenticated
            ? "Login to Review"
            : !isVerified
            ? "Verify Identity"
            : "Submit Review"}
        </button>
        <div className="flex gap-2 sm:gap-3">
          {!isAuthenticated && (
            <button
              type="button"
              onClick={() => {
                toast.error("Please login to submit a review", {
                  duration: 3000,
                  icon: "🔒",
                });
              }}
              className="flex-1 sm:flex-none px-4 py-2.5 sm:px-6 sm:py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm sm:text-base font-semibold"
            >
              Login
            </button>
          )}
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 sm:flex-none px-4 py-2.5 sm:px-6 sm:py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm sm:text-base font-semibold"
            >
              Cancel
            </button>
          )}
        </div>
      </div>
    </form>
  );
}
