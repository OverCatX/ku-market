import { isTokenExpired, decodeJWT } from "./jwt";

const USER_STORAGE_KEY = "user";

const parseStoredUser = (): Record<string, unknown> | null => {
  try {
    const raw = localStorage.getItem(USER_STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as Record<string, unknown>;
  } catch (error) {
    return null;
  }
};

/**
 * Get the authentication token from localStorage
 * Removes expired tokens automatically
 */
export function getAuthToken(): string | null {
  // Try "authentication" first (primary key used in most places)
  let token = localStorage.getItem("authentication");
  
  // If not found, try "token" (fallback for admin)
  if (!token) {
    token = localStorage.getItem("token");
  }
  
  // If no token found, return null
  if (!token) {
    return null;
  }
  
  // Check if token is expired
  if (isTokenExpired(token)) {
    clearAuthTokens();
    return null;
  }
  
  return token;
}

/**
 * Clear all authentication tokens from localStorage
 */
export function clearAuthTokens(): void {
  localStorage.removeItem("authentication");
  localStorage.removeItem("token");
  localStorage.removeItem(USER_STORAGE_KEY);
}

/**
 * Set authentication token (normalize to use "authentication" key)
 */
export function setAuthToken(token: string): void {
  // Store in "authentication" key
  localStorage.setItem("authentication", token);
  // Also remove "token" if exists to avoid confusion
  localStorage.removeItem("token");
}

export function updateStoredUser(partial: Record<string, unknown>): void {
  try {
    const current = parseStoredUser() ?? {};
    const merged = { ...current, ...partial };
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(merged));
  } catch (error) {
    try {
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(partial));
    } catch {
      // ignore storage errors
    }
  }
}

/**
 * Check if user is authenticated with valid token
 */
export function isAuthenticated(): boolean {
  const token = getAuthToken();
  return token !== null;
}

/**
 * Get user data from token (if token is valid)
 */
export function getAuthUser() {
  const token = getAuthToken();
  if (!token) return null;
  const decoded = decodeJWT(token);
  const stored = parseStoredUser();

  if (stored && decoded && typeof decoded === "object") {
    return { ...decoded, ...stored };
  }

  if (stored) {
    return stored;
  }

  return decoded;
}

