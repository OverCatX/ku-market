/**
 * Utility functions for review-related operations
 */

/**
 * Normalize a user ID from various possible formats (string, object with _id, etc.)
 * @param userId - User ID in any format
 * @returns Normalized user ID string or null
 */
export function normalizeUserId(userId: unknown): string | null {
  if (!userId) return null;

  // If it's already a string, return it
  if (typeof userId === "string") {
    return userId.trim();
  }

  // If it's an object, try to extract _id
  if (typeof userId === "object" && userId !== null) {
    const userObj = userId as Record<string, unknown>;

    // Check if it has _id property
    if ("_id" in userObj && userObj._id) {
      const _idValue = userObj._id;

      // If _id is a string, return it
      if (typeof _idValue === "string") {
        return _idValue.trim();
      }

      // If _id is an object (MongoDB ObjectId), try to convert it
      if (typeof _idValue === "object" && _idValue !== null) {
        // Try toString() method if available
        const objId = _idValue as { toString?: () => string };
        if (objId.toString && typeof objId.toString === "function") {
          try {
            const str = objId.toString();
            // Extract ObjectId if in format "ObjectId('...')" or return the string if it's already a valid ID
            const match = str.match(/ObjectId\(['"]([^'"]+)['"]\)/);
            if (match && match[1]) {
              return match[1].trim();
            }
            // Check if string itself is a valid ObjectId (24 hex chars)
            if (/^[0-9a-fA-F]{24}$/.test(str)) {
              return str.trim();
            }
            return str.trim();
          } catch {
            // If toString fails, convert to string
            const str = String(_idValue);
            const match = str.match(/ObjectId\(['"]([^'"]+)['"]\)/);
            return match && match[1] ? match[1].trim() : str.trim();
          }
        }
        // Fallback: convert to string
        const str = String(_idValue);
        const match = str.match(/ObjectId\(['"]([^'"]+)['"]\)/);
        return match && match[1] ? match[1].trim() : str.trim();
      }
    }
  }

  // Final fallback: convert to string
  const str = String(userId);
  const match = str.match(/ObjectId\(['"]([^'"]+)['"]\)/);
  return match && match[1] ? match[1].trim() : str.trim();
}

/**
 * Check if a user ID matches the current user ID
 * @param reviewUserId - User ID from review (any format)
 * @param currentUserId - Current user ID (string)
 * @returns True if IDs match
 */
export function isSameUser(reviewUserId: unknown, currentUserId: string | null): boolean {
  if (!currentUserId) return false;

  const normalizedReviewUserId = normalizeUserId(reviewUserId);
  if (!normalizedReviewUserId) return false;

  // Normalize both to lowercase for comparison
  return normalizedReviewUserId.toLowerCase() === currentUserId.toLowerCase();
}

/**
 * Format a date string to a human-readable format
 * @param dateString - ISO date string
 * @returns Formatted date string
 */
export function formatReviewDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

