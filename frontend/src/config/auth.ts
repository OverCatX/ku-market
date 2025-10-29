import { API_BASE } from "./constants";

// ===== Types =====
export type SignupData = {
  name: string;
  kuEmail: string;
  password: string;
  confirm_password: string;
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

// ===== Helper Function =====
async function request<T>(url: string, options: RequestInit): Promise<T> {
  const res = await fetch(url, options);
  const json = (await res.json()) as T & { message?: string; error?: string };

  if (!res.ok) {
    const errorMessage = json.error || json.message || "Request failed";
    throw new Error(errorMessage);
  }
  return json;
}

// ===== API Functions =====
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

// Login function that returns both token and user data
export async function login(
  email: string,
  password: string
): Promise<{ token: string; user: unknown }> {
  const res = await fetch(`${API_BASE}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ kuEmail: email, password }),
  });

  if (!res.ok) {
    const json = (await res.json()) as { message?: string; error?: string };
    const errorMessage = json.error || json.message || "Login failed";
    throw new Error(errorMessage);
  }

  const data = (await res.json()) as {
    token: string;
    user: unknown;
    message?: string;
  };

  if (!data.token || !data.user) {
    throw new Error("Invalid response from server");
  }

  return { token: data.token, user: data.user };
}
