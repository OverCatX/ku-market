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
    });

    if (!res.ok) {
      throw new Error("Failed to fetch categories");
    }

    const data = await res.json();
    return data.categories || [];
  } catch (error) {
    console.error("Get categories error:", error);
    // Return default categories as fallback
    return [
      { id: "1", name: "Electronics", slug: "electronics" },
      { id: "2", name: "Books", slug: "books" },
      { id: "3", name: "Fashion", slug: "fashion" },
      { id: "4", name: "Dorm", slug: "dorm" },
      { id: "5", name: "Other", slug: "other" },
    ];
  }
}

