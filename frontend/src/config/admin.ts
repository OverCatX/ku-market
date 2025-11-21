import { API_BASE } from "./constants";
import { getAuthToken, clearAuthTokens } from "../lib/auth";

export interface AdminStats {
  totalUsers: number;
  pendingVerifications: number;
  pendingShops: number;
}

export interface Verification {
  id: string;
  user: {
    name: string;
    email: string;
    faculty: string;
    contact: string;
  };
  documentType: string;
  documentUrl: string;
  status: string;
  createdAt: string;
}

export interface ShopRequest {
  id: string;
  shopName: string;
  shopType: string;
  productCategory: string[];
  description: string;
  shopPhoto: string;
  status: string;
  requestDate: string;
  owner: {
    name: string;
    email: string;
    faculty: string;
    contact: string;
  };
}

export interface UserData {
  id: string;
  name: string;
  email: string;
  faculty: string;
  contact: string;
  role: string;
  isVerified: boolean;
}

export async function getStats(): Promise<AdminStats> {
  const token = getAuthToken();
  if (!token) throw new Error("Please login to view admin stats");
  
  const res = await fetch(`${API_BASE}/api/admin/stats`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  
  if (!res.ok) {
    if (res.status === 401) {
      clearAuthTokens();
      throw new Error("Please login to view admin stats");
    }
    const errorData = await res.json().catch(() => ({ error: "Unknown error" }));
    throw new Error(errorData.error || `Failed to fetch stats (${res.status})`);
  }
  
  const data = await res.json();
  return data.stats;
}

export async function getVerifications(
  token: string,
  status?: string
): Promise<Verification[]> {
  const url = status
    ? `${API_BASE}/api/admin/verifications?status=${status}`
    : `${API_BASE}/api/admin/verifications`;
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
  });
  
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({ error: "Unknown error" }));
    throw new Error(errorData.error || "Failed to fetch verifications");
  }
  
  const data = await res.json();
  return data.verifications;
}

export async function approveVerification(token: string, id: string): Promise<void> {
  const res = await fetch(`${API_BASE}/api/admin/verifications/${id}/approve`, {
    method: "PATCH",
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error("Failed to approve verification");
}

export async function rejectVerification(
  token: string,
  id: string,
  reason: string
): Promise<void> {
  const res = await fetch(`${API_BASE}/api/admin/verifications/${id}/reject`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ reason }),
  });
  if (!res.ok) throw new Error("Failed to reject verification");
}

export async function getShops(token: string, status?: string): Promise<ShopRequest[]> {
  const url = status
    ? `${API_BASE}/api/admin/shops?status=${status}`
    : `${API_BASE}/api/admin/shops`;
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error("Failed to fetch shops");
  const data = await res.json();
  return data.shops;
}

export async function approveShop(token: string, id: string): Promise<void> {
  const res = await fetch(`${API_BASE}/api/admin/shops/${id}/approve`, {
    method: "PATCH",
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error("Failed to approve shop");
}

export async function rejectShop(token: string, id: string, reason: string): Promise<void> {
  const res = await fetch(`${API_BASE}/api/admin/shops/${id}/reject`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ reason }),
  });
  if (!res.ok) throw new Error("Failed to reject shop");
}

// Users Management
export async function getUsers(token: string): Promise<UserData[]> {
  const res = await fetch(`${API_BASE}/api/admin/users`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error("Failed to fetch users");
  const data = await res.json();
  return data.users;
}

export async function promoteUser(token: string, userId: string): Promise<void> {
  const res = await fetch(`${API_BASE}/api/admin/users/${userId}/promote`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error("Failed to promote user");
}

export async function demoteUser(token: string, userId: string): Promise<void> {
  const res = await fetch(`${API_BASE}/api/admin/users/${userId}/demote`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error("Failed to demote user");
}

export async function deleteUser(token: string, userId: string): Promise<void> {
  const res = await fetch(`${API_BASE}/api/admin/users/${userId}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error("Failed to delete user");
}

// Items Management
export interface ItemData {
  id: string;
  title: string;
  description: string;
  category: string;
  price: number;
  status: "available" | "reserved" | "sold";
  approvalStatus: "pending" | "approved" | "rejected";
  rejectionReason?: string;
  photo: string[];
  owner: {
    id: string;
    name: string;
    email: string;
  };
  createdAt: string;
  updatedAt: string;
}

export async function getItems(
  token: string,
  approvalStatus?: string
): Promise<ItemData[]> {
  const url = approvalStatus
    ? `${API_BASE}/api/admin/items?approvalStatus=${approvalStatus}`
    : `${API_BASE}/api/admin/items`;
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({ error: "Unknown error" }));
    throw new Error(errorData.error || "Failed to fetch items");
  }
  const data = await res.json();
  return data.items;
}

export async function approveItem(token: string, id: string): Promise<void> {
  const res = await fetch(`${API_BASE}/api/admin/items/${id}/approve`, {
    method: "PATCH",
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({ error: "Unknown error" }));
    throw new Error(errorData.error || "Failed to approve item");
  }
}

export async function rejectItem(
  token: string,
  id: string,
  reason?: string
): Promise<void> {
  const res = await fetch(`${API_BASE}/api/admin/items/${id}/reject`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ reason }),
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({ error: "Unknown error" }));
    throw new Error(errorData.error || "Failed to reject item");
  }
}

export interface UpdateItemData {
  title?: string;
  description?: string;
  price?: number;
  status?: "available" | "reserved" | "sold";
  category?: string;
}

export async function updateItem(
  token: string,
  id: string,
  data: UpdateItemData
): Promise<void> {
  const res = await fetch(`${API_BASE}/api/admin/items/${id}`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({ error: "Unknown error" }));
    throw new Error(errorData.error || "Failed to update item");
  }
}

export async function deleteItem(token: string, id: string): Promise<void> {
  const res = await fetch(`${API_BASE}/api/admin/items/${id}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({ error: "Unknown error" }));
    throw new Error(errorData.error || "Failed to delete item");
  }
}

// Category Management
export interface CategoryData {
  id: string;
  name: string;
  slug: string;
  description?: string;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export async function getCategories(token: string): Promise<CategoryData[]> {
  const res = await fetch(`${API_BASE}/api/admin/categories`, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({ error: "Unknown error" }));
    throw new Error(errorData.error || "Failed to get categories");
  }
  const data = await res.json();
  return data.categories || [];
}

export async function createCategory(
  token: string,
  category: {
    name: string;
    description?: string;
    isActive?: boolean;
  }
): Promise<CategoryData> {
  const res = await fetch(`${API_BASE}/api/admin/categories`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(category),
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({ error: "Unknown error" }));
    throw new Error(errorData.error || "Failed to create category");
  }
  const data = await res.json();
  return data.category;
}

export async function updateCategory(
  token: string,
  id: string,
  updates: {
    name?: string;
    description?: string;
    isActive?: boolean;
  }
): Promise<CategoryData> {
  const res = await fetch(`${API_BASE}/api/admin/categories/${id}`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(updates),
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({ error: "Unknown error" }));
    throw new Error(errorData.error || "Failed to update category");
  }
  const data = await res.json();
  return data.category;
}

export async function deleteCategory(token: string, id: string): Promise<void> {
  const res = await fetch(`${API_BASE}/api/admin/categories/${id}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({ error: "Unknown error" }));
    throw new Error(errorData.error || "Failed to delete category");
  }
}

// Review Management
export interface AdminReview {
  id: string;
  itemId: string;
  itemTitle: string;
  userId: string;
  userName: string;
  userEmail: string;
  rating: number;
  title?: string;
  comment: string;
  helpful: number;
  verified: boolean;
  createdAt: string;
  updatedAt?: string;
}

export async function getItemReviews(
  token: string,
  itemId: string
): Promise<AdminReview[]> {
  const res = await fetch(`${API_BASE}/api/admin/reviews/item/${itemId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({ error: "Unknown error" }));
    throw new Error(errorData.error || "Failed to get reviews");
  }
  const data = await res.json();
  return data.reviews || [];
}

export async function deleteReview(token: string, reviewId: string): Promise<void> {
  const res = await fetch(`${API_BASE}/api/admin/reviews/${reviewId}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({ error: "Unknown error" }));
    throw new Error(errorData.error || "Failed to delete review");
  }
}

export interface ActivityLog {
  _id: string;
  userId: string;
  userRole: "buyer" | "seller" | "admin";
  userName: string;
  userEmail: string;
  activityType: string;
  entityType: string;
  entityId?: string;
  description: string;
  metadata?: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
  createdAt: string;
}

export interface ActivityLogsResponse {
  success: boolean;
  logs: ActivityLog[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface ActivityLogStats {
  success: boolean;
  stats: {
    totalLogs: number;
    logsByType: Record<string, number>;
    logsByRole: Record<string, number>;
    recentActivity: ActivityLog[];
  };
}

export async function getActivityLogs(params?: {
  page?: number;
  limit?: number;
  userId?: string;
  userRole?: string;
  activityType?: string;
  entityType?: string;
  entityId?: string;
  startDate?: string;
  endDate?: string;
  search?: string;
}): Promise<ActivityLogsResponse> {
  const token = getAuthToken();
  if (!token) {
    throw new Error("Please login");
  }

  const queryParams = new URLSearchParams();
  if (params?.page) queryParams.append("page", String(params.page));
  if (params?.limit) queryParams.append("limit", String(params.limit));
  if (params?.userId) queryParams.append("userId", params.userId);
  if (params?.userRole) queryParams.append("userRole", params.userRole);
  if (params?.activityType) queryParams.append("activityType", params.activityType);
  if (params?.entityType) queryParams.append("entityType", params.entityType);
  if (params?.entityId) queryParams.append("entityId", params.entityId);
  if (params?.startDate) queryParams.append("startDate", params.startDate);
  if (params?.endDate) queryParams.append("endDate", params.endDate);
  if (params?.search) queryParams.append("search", params.search);

  const response = await fetch(
    `${API_BASE}/api/admin/activity-logs?${queryParams.toString()}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!response.ok) {
    if (response.status === 401) {
      clearAuthTokens();
      throw new Error("Please login");
    }
    const error = await response.json().catch(() => ({ error: "Failed to fetch activity logs" }));
    throw new Error(error.error || "Failed to fetch activity logs");
  }

  return response.json();
}

export async function getActivityLogStats(params?: {
  startDate?: string;
  endDate?: string;
}): Promise<ActivityLogStats> {
  const token = getAuthToken();
  if (!token) {
    throw new Error("Please login");
  }

  const queryParams = new URLSearchParams();
  if (params?.startDate) queryParams.append("startDate", params.startDate);
  if (params?.endDate) queryParams.append("endDate", params.endDate);

  const response = await fetch(
    `${API_BASE}/api/admin/activity-logs/stats?${queryParams.toString()}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!response.ok) {
    if (response.status === 401) {
      clearAuthTokens();
      throw new Error("Please login");
    }
    const error = await response.json().catch(() => ({ error: "Failed to fetch activity log stats" }));
    throw new Error(error.error || "Failed to fetch activity log stats");
  }

  return response.json();
}
