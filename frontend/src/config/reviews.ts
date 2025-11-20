import { API_BASE } from "./constants";
import { Review, ReviewSummary, CreateReviewInput } from "../types/review";
import { getAuthToken, clearAuthTokens } from "../lib/auth";

/**
 * Create a review for an item
 */
export async function createReview(
  itemId: string,
  data: CreateReviewInput
): Promise<Review> {
  // Validate authentication (automatically checks expiry)
  const token = getAuthToken();
  if (!token) {
    throw new Error("Please login to submit a review");
  }

  // Validate inputs
  if (!itemId || itemId.trim() === "") {
    throw new Error("Item ID is required");
  }

  if (!data.rating || data.rating < 1 || data.rating > 5) {
    throw new Error("Rating must be between 1 and 5");
  }

  if (!data.comment || data.comment.trim().length < 10) {
    throw new Error("Comment must be at least 10 characters");
  }

  if (data.comment.trim().length > 2000) {
    throw new Error("Comment must not exceed 2000 characters");
  }

  if (data.title && data.title.trim().length > 200) {
    throw new Error("Title must not exceed 200 characters");
  }

  // Handle image uploads
  const formData = new FormData();
  formData.append("itemId", itemId);
  formData.append("rating", String(data.rating));
  formData.append("comment", data.comment.trim());
  if (data.title?.trim()) {
    formData.append("title", data.title.trim());
  }
  
  if (data.images && data.images.length > 0) {
    if (data.images.length > 5) {
      throw new Error("Maximum 5 images allowed");
    }
    data.images.forEach((file) => {
      formData.append("images", file);
    });
  }

  const response = await fetch(`${API_BASE}/api/reviews`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      // Don't set Content-Type - browser will set it with boundary for FormData
    },
    body: formData,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: "Unknown error" }));
    const errorMessage = errorData.error || "Failed to create review";
    
    // Handle specific error cases
    if (response.status === 401) {
      // Token expired or invalid - clear it
      clearAuthTokens();
      throw new Error("Please login to submit a review");
    }
    if (response.status === 403 && errorMessage.includes("verify")) {
      // User not verified
      throw new Error("You must verify your identity before submitting a review. Please complete identity verification first.");
    }
    // Only show "already reviewed" error if user is authenticated
    // (if not authenticated, 401 would have been caught above)
    if (response.status === 400 && errorMessage.includes("already reviewed")) {
      // Double-check authentication before showing "already reviewed"
      const currentToken = getAuthToken();
      if (!currentToken) {
        clearAuthTokens();
        throw new Error("Please login to submit a review");
      }
      throw new Error("You have already reviewed this item");
    }
    
    throw new Error(errorMessage);
  }

  const result = await response.json();
  // Normalize review: convert 'id' to '_id' for consistency
  const review = result.review || {};
  return {
    ...review,
    _id: review._id || review.id || String(review),
  };
}

/**
 * Get all reviews for an item
 */
export async function getItemReviews(itemId: string): Promise<Review[]> {
  // Try to get token for optional authentication (to check hasVoted status)
  // getAuthToken automatically removes expired tokens
  const token = getAuthToken();
  
  const headers: HeadersInit = {
    "Content-Type": "application/json",
  };
  
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE}/api/reviews/item/${itemId}`, {
    method: "GET",
    headers,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: "Unknown error" }));
    throw new Error(errorData.error || "Failed to fetch reviews");
  }

  const result = await response.json();
  // Normalize reviews: convert 'id' to '_id' for consistency
  return (result.reviews || []).map((review: { id?: string; _id?: string; [key: string]: unknown }) => ({
    ...review,
    _id: review._id || review.id || String(review),
  }));
}

/**
 * Get review summary for an item
 */
export async function getReviewSummary(itemId: string): Promise<ReviewSummary> {
  const response = await fetch(`${API_BASE}/api/reviews/item/${itemId}/summary`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: "Unknown error" }));
    throw new Error(errorData.error || "Failed to fetch review summary");
  }

  const result = await response.json();
  return result.summary || {
    averageRating: 0,
    totalReviews: 0,
    ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
  };
}

/**
 * Get review summaries for multiple items (batch) - more efficient than individual calls
 */
export async function getBatchReviewSummaries(itemIds: string[]): Promise<Record<string, ReviewSummary>> {
  if (!Array.isArray(itemIds) || itemIds.length === 0) {
    return {};
  }

  const response = await fetch(`${API_BASE}/api/reviews/summaries/batch`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ itemIds }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: "Unknown error" }));
    throw new Error(errorData.error || "Failed to fetch review summaries");
  }

  const result = await response.json();
  return result.summaries || {};
}

/**
 * Toggle helpful vote for a review (mark/unmark as helpful)
 */
export async function toggleHelpful(reviewId: string, currentHasVoted: boolean): Promise<{ helpful: number; hasVoted: boolean }> {
  // Validate authentication (automatically checks expiry)
  const token = getAuthToken();
  if (!token) {
    throw new Error("Please login to mark review as helpful");
  }

  // Validate review ID
  if (!reviewId || reviewId.trim() === "") {
    throw new Error("Review ID is required");
  }

  // If already voted, unmark (DELETE), otherwise mark (POST)
  const method = currentHasVoted ? "DELETE" : "POST";
  const response = await fetch(`${API_BASE}/api/reviews/${reviewId}/helpful`, {
    method,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: "Unknown error" }));
    const errorMessage = errorData.error || "Failed to toggle helpful vote";
    
    // Handle specific error cases
    if (response.status === 401) {
      // Token expired or invalid - clear it
      clearAuthTokens();
      throw new Error("Please login to mark review as helpful");
    }
    
    throw new Error(errorMessage);
  }

  const result = await response.json();
  return {
    helpful: result.helpful || 0,
    hasVoted: result.hasVoted || false,
  };
}

/**
 * Mark a review as helpful (legacy function for backward compatibility)
 * @deprecated Use toggleHelpful instead
 */
export async function markHelpful(reviewId: string): Promise<{ helpful: number; hasVoted: boolean }> {
  return toggleHelpful(reviewId, false);
}

/**
 * Delete a review (user's own review)
 */
export async function deleteReview(reviewId: string): Promise<void> {
  // Validate authentication (automatically checks expiry)
  const token = getAuthToken();
  if (!token) {
    throw new Error("Please login to delete a review");
  }

  // Validate review ID
  if (!reviewId || reviewId.trim() === "") {
    throw new Error("Review ID is required");
  }

  const response = await fetch(`${API_BASE}/api/reviews/${reviewId}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: "Unknown error" }));
    const errorMessage = errorData.error || "Failed to delete review";
    
    if (response.status === 401) {
      // Token expired or invalid - clear it
      clearAuthTokens();
      throw new Error("Please login to delete a review");
    }
    if (response.status === 403) {
      throw new Error("You can only delete your own reviews");
    }
    
    throw new Error(errorMessage);
  }
}

