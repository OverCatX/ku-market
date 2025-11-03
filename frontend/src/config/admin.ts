import { API_BASE } from "./constants";

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

export async function getStats(token: string): Promise<AdminStats> {
  const res = await fetch(`${API_BASE}/api/admin/stats`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  
  if (!res.ok) {
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
