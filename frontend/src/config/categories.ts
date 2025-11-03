import { API_BASE } from "./constants";

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
}

/**
 * Get all active categories (public)
 */
export async function getCategories(): Promise<Category[]> {
  try {
    const res = await fetch(`${API_BASE}/api/categories`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    }).catch((fetchError) => {
      // Handle network errors silently
      if (fetchError instanceof TypeError && fetchError.message.includes("Failed to fetch")) {
        return null; // Indicate network error
      }
      throw fetchError;
    });

    if (!res) {
      // Network error - return fallback categories silently
      return [
        { id: "1", name: "Electronics", slug: "electronics" },
        { id: "2", name: "Books", slug: "books" },
        { id: "3", name: "Fashion", slug: "fashion" },
        { id: "4", name: "Dorm", slug: "dorm" },
        { id: "5", name: "Other", slug: "other" },
      ];
    }

    if (!res.ok) {
      // Server error - return fallback categories
      return [
        { id: "1", name: "Electronics", slug: "electronics" },
        { id: "2", name: "Books", slug: "books" },
        { id: "3", name: "Fashion", slug: "fashion" },
        { id: "4", name: "Dorm", slug: "dorm" },
        { id: "5", name: "Other", slug: "other" },
      ];
    }

    const data = await res.json();
    return data.categories || [];
  } catch (error) {
    // Any other error - return fallback categories silently
    return [
      { id: "1", name: "Electronics", slug: "electronics" },
      { id: "2", name: "Books", slug: "books" },
      { id: "3", name: "Fashion", slug: "fashion" },
      { id: "4", name: "Dorm", slug: "dorm" },
      { id: "5", name: "Other", slug: "other" },
    ];
  }
}

