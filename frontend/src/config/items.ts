import { API_BASE } from "./index";

export interface Item {
  _id: string;
  title: string;
  description: string;
  price: number;
  photo: string[];
  status: string;
  category?: string;
  owner?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface ListItemsParams {
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
  status?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface Pagination {
  totalItems: number;
  totalPages: number;
  currentPage: number;
  limit: number;
}

export interface ListItemsResponse {
  success: boolean;
  data: {
    items: Item[];
    pagination: Pagination;
  };
  error?: string;
}

export async function listItems(
  params: ListItemsParams,
  signal?: AbortSignal
): Promise<ListItemsResponse> {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, val]) => {
    if (val !== undefined && val !== "") query.append(key, String(val));
  });

  // ✅ API_BASE should already be like http://localhost:5050/api
  const url = `${API_BASE}/items/list?${query.toString()}`;

  try {
    const res = await fetch(url, { signal, cache: "no-store" });

    if (!res.ok) {
      const errorText = await res.text();
      console.error(`API Error (${res.status}):`, errorText);
      return {
        success: false,
        data: {
          items: [],
          pagination: {
            totalItems: 0,
            totalPages: 1,
            currentPage: params.page || 1,
            limit: params.limit || 10,
          },
        },
        error: `Server error: ${res.status}`,
      };
    }

    const data: ListItemsResponse = await res.json();
    return data;
  } catch (err: any) {
    if (err?.name === "AbortError") throw err;
    console.error("Fetch error:", err?.message || err);
    return {
      success: false,
      data: {
        items: [],
        pagination: {
          totalItems: 0,
          totalPages: 1,
          currentPage: params.page || 1,
          limit: params.limit || 10,
        },
      },
      error: "Network error",
    };
  }
}

// --- Get single item by ID ---
export async function getItem(id: string) {
  // API_BASE is like http://localhost:5050/api
  const url = `${API_BASE}/items/${id}`; // ✅ remove the extra /api

  try {
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) throw new Error(`Failed to fetch item (${res.status})`);
    const data = await res.json();
    return { success: true, item: data.item ?? data };
  } catch (err) {
    console.error("getItem error:", err);
    return { success: false, item: null };
  }
}