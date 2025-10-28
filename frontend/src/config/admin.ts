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
  photo: string[];
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
