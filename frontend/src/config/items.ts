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
    if (val !== undefined && val !== "") {
      query.append(key, String(val));
    }
  });

  const url = `${API_BASE}/api/items/list?${query.toString()}`;

  try {
    const res = await fetch(url, {
      signal,
      headers: {
        "Content-Type": "application/json",
      },
      cache: "no-store",
    });

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

    if (!data.success) {
      console.error("API returned success: false", data);
    }

    return data;
  } catch (err: unknown) {
    if (err instanceof Error) {
      if (err.name === "AbortError") throw err;
      console.error("Fetch error:", err.message);
    }

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
export interface GetItemResponse {
  success: boolean;
  item: Item | null;
  error?: string;
}

export async function getItem(id: string): Promise<GetItemResponse> {
  const url = `${API_BASE}/api/items/${id}`; // แก้ให้ตรงกับ listItems

  try {
    const res = await fetch(url, {
      headers: { "Content-Type": "application/json" },
      cache: "no-store",
    });

    if (!res.ok) {
      const errorText = await res.text();
      console.error(`API Error (${res.status}):`, errorText);
      return { success: false, item: null, error: `HTTP ${res.status}` };
    }

    const data = (await res.json()) as { item?: Item } | Item;
    const item = "item" in data ? data.item ?? null : (data as Item);

    return { success: true, item };
  } catch (err: unknown) {
    if (err instanceof Error) {
      console.error("getItem error:", err.message);
    }
    return { success: false, item: null, error: "Network error" };
  }
}