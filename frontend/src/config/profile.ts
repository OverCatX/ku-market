import { API_BASE } from "./index";

// ===== Types =====
export type ProfileData = {
  name: string;
  faculty: string;
  contact: string;
  email: string;
  isVerified?: boolean;
  role?: string;
};

export type ProfileResponse = ProfileData;

export type UpdateProfileData = {
  name?: string;
  faculty?: string;
  contact?: string;
};

async function request<T>(url: string, options: RequestInit): Promise<T> {
  const res = await fetch(url, options);
  const json = (await res.json()) as T & { message?: string };

  if (!res.ok) throw new Error(json.message || "Request failed");
  return json;
}

// Fetch profile
export function getProfile(token: string): Promise<ProfileResponse> {
  return request(`${API_BASE}/api/profile/view`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
}

// Update profile
export function updateProfile(
  token: string,
  data: UpdateProfileData
): Promise<ProfileResponse> {
  return request(`${API_BASE}/api/profile/update`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });
}