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
}

export async function listItems(params: ListItemsParams): Promise<ListItemsResponse> {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, val]) => {
      if (val !== undefined && val !== "") query.append(key, String(val));
    });
  
    const res = await fetch(`${API_BASE}/api/items/list?${query.toString()}`);
  
    let data: ListItemsResponse;
  
    try {
      data = await res.json();
    } catch {
      return {
        success: false,
        data: {
          items: [],
          pagination: { totalItems: 0, totalPages: 1, currentPage: params.page || 1, limit: params.limit || 10 },
        },
      };
    }
  
    if (!res.ok || !data.success) {
      return {
        success: false,
        data: {
          items: [],
          pagination: { totalItems: 0, totalPages: 1, currentPage: params.page || 1, limit: params.limit || 10 },
        },
      };
    }
  
    return data;
}