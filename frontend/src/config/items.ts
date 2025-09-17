import { API_BASE } from "./index";

export type Item = {
  _id: string;
  owner?: { name: string; email: string };
  title: string;
  description?: string;
  category?: string;
  price: number;
  status: "available" | "reserved" | "sold";
  photo: string[];
  createAt?: string;
  updateAt?: string;
};

export type Pagination = {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
  nextPage: number | null;
  prevPage: number | null;
};

export type ListItemsResponse = {
  success: boolean;
  data: {
    items: Item[];
    pagination: Pagination;
  };
};

type ListItemsParams = {
  page?: number;
  limit?: number;
  status?: string;
  search?: string;
  category?: string;
  sortBy?: "price" | "title" | "createAt" | "updateAt" | "relevance";
  sortOrder?: "asc" | "desc";
};

async function request<T>(url: string): Promise<T> {
  const res = await fetch(url);
  const json = (await res.json()) as T & { message?: string };
  if (!res.ok) throw new Error(json.message || "Request failed");
  return json;
}

export function listItems(params: ListItemsParams = {}): Promise<ListItemsResponse> {
  const query = new URLSearchParams();

  if (params.page) query.append("page", params.page.toString());
  if (params.limit) query.append("limit", params.limit.toString());
  if (params.status) query.append("status", params.status);
  if (params.search) query.append("search", params.search);
  if (params.category) query.append("category", params.category);
  if (params.sortBy) query.append("sortBy", params.sortBy);
  if (params.sortOrder) query.append("sortOrder", params.sortOrder);

  return request(`${API_BASE}/api/items/list?${query.toString()}`);
}