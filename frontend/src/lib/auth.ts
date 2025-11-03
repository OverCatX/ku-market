import { isTokenExpired, decodeJWT } from "./jwt";

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
    console.log("🔑 Token expired, clearing authentication");
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
  localStorage.removeItem("user");
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
  
  return decodeJWT(token);
}

