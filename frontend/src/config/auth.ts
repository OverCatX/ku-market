import { API_BASE } from "./index";

// ===== Types =====
export type SignupData = {
  name: string;
  kuEmail: string;
  password: string;
  confirmPassword: string;
  faculty: string;
  contact: string;
};

export type SignupResponse = {
  message: string;
  userId?: string;
};

export type SignInData = {
  kuEmail: string;
  password: string;
};

export type SignInResponse = {
  message: string;
  token?: string;
  userId?: string;
};

async function request<T>(url: string, options: RequestInit): Promise<T> {
  const res = await fetch(url, options);
  const json = (await res.json()) as T & { message?: string };

  if (!res.ok) throw new Error(json.message || "Request failed");
  return json;
}

export function signup(data: SignupData): Promise<SignupResponse> {
  return request(`${API_BASE}/api/auth/signup`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
}

export function signin(data: SignInData): Promise<SignInResponse> {
  return request(`${API_BASE}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
}