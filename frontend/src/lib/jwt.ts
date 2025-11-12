/**
 * JWT Helper Functions
 * Decode JWT token to get user data without API calls
 */

interface JWTPayload {
  id: string;
  email: string;
  role: string;
  isVerified: boolean;
  iat?: number;
  exp?: number;
}

/**
 * Decode JWT token (without verification - use only for reading data)
 * For security-critical operations, always verify on backend
 */
export function decodeJWT(token: string): JWTPayload | null {
  try {
    const base64Url = token.split('.')[1];
    if (!base64Url) return null;
    
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );

    return JSON.parse(jsonPayload) as JWTPayload;
  } catch (error) {
    console.error('Failed to decode JWT:', error);
    return null;
  }
}

/**
 * Check if token is expired
 */
export function isTokenExpired(token: string): boolean {
  const payload = decodeJWT(token);
  if (!payload || !payload.exp) return true;
  
  return Date.now() >= payload.exp * 1000;
}

/**
 * Get user data from token
 */
export function getUserFromToken(token: string): JWTPayload | null {
  if (!token) return null;
  if (isTokenExpired(token)) return null;
  
  return decodeJWT(token);
}

