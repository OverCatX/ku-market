import { API_BASE } from "./constants";
import { getAuthToken, clearAuthTokens } from "../lib/auth";

export interface CartItem {
  id: string;
  title: string;
  price: number;
  image: string;
  quantity: number;
  sellerId?: string;
  sellerName?: string;
  addedAt?: Date;
}

export interface CartResponse {
  success: boolean;
  items: CartItem[];
  totalItems?: number;
  totalPrice?: number;
  error?: string;
  message?: string;
}

/**
 * Get cart from backend
 */
export async function getCart(): Promise<CartResponse> {
  const token = getAuthToken();
  if (!token) {
    // Return empty cart if not authenticated (guest mode)
    return { success: true, items: [], totalItems: 0, totalPrice: 0 };
  }
  try {
    console.log("📡 GET /api/cart");
    const res = await fetch(`${API_BASE}/api/cart`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    }).catch((fetchError) => {
      console.error("❌ Network error:", fetchError);
      throw new Error(
        fetchError instanceof TypeError && fetchError.message.includes("Failed to fetch")
          ? "Cannot connect to server. Please check if the backend is running."
          : fetchError instanceof Error
          ? fetchError.message
          : "Network error occurred"
      );
    });

    if (!res.ok) {
      // Handle 401/403 - not authenticated or unauthorized
      if (res.status === 401 || res.status === 403) {
        // Token expired or invalid - clear it
        clearAuthTokens();
        console.warn("Cart API: Token expired, returning empty cart");
        return { success: true, items: [], totalItems: 0, totalPrice: 0 };
      }

      const contentType = res.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        const json = await res.json().catch(() => ({}));
        const errorMessage = json.error || json.message || `Server error: ${res.status}`;
        
        // For other errors, log but return empty cart gracefully
        console.warn("Cart API error:", errorMessage);
        return { success: true, items: [], totalItems: 0, totalPrice: 0 };
      } else {
        // For non-JSON errors, return empty cart gracefully
        console.warn(`Cart API error: ${res.status} ${res.statusText}`);
        return { success: true, items: [], totalItems: 0, totalPrice: 0 };
      }
    }

    const contentType = res.headers.get("content-type");
    if (!contentType || !contentType.includes("application/json")) {
      console.warn("❌ Expected JSON but got:", contentType, "- returning empty cart");
      return { success: true, items: [], totalItems: 0, totalPrice: 0 };
    }

    const json = await res.json().catch(() => {
      console.warn("❌ Failed to parse JSON response - returning empty cart");
      return { success: true, items: [], totalItems: 0, totalPrice: 0 };
    });

    // Validate response structure
    if (!json.success || !Array.isArray(json.items)) {
      console.warn("❌ Invalid cart response structure - returning empty cart");
      return { success: true, items: [], totalItems: 0, totalPrice: 0 };
    }

    console.log(`✅ Got cart: ${json.items?.length || 0} items`);
    return json;
  } catch (error) {
    // Network errors or other exceptions - return empty cart gracefully
    const errorMessage = error instanceof Error ? error.message : String(error);
    
    // Network/server connection errors - return empty cart
    if (
      errorMessage.toLowerCase().includes("failed to fetch") ||
      errorMessage.toLowerCase().includes("cannot connect to server") ||
      errorMessage.toLowerCase().includes("network error")
    ) {
      console.warn("⚠️ Cart API network error - returning empty cart:", errorMessage);
      return { success: true, items: [], totalItems: 0, totalPrice: 0 };
    }
    
    // For other errors, log but still return empty cart
    console.warn("⚠️ Cart API error - returning empty cart:", errorMessage);
    return { success: true, items: [], totalItems: 0, totalPrice: 0 };
  }
}

/**
 * Add item to cart
 */
export async function addToCart(
  itemId: string,
  quantity: number = 1
): Promise<CartResponse> {
  try {
    const token = getAuthToken();
    if (!token) throw new Error("Please login to add items to cart");
    
    console.log(`📡 POST /api/cart/add (itemId: ${itemId}, qty: ${quantity})`);
    const res = await fetch(`${API_BASE}/api/cart/add`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ itemId, quantity }),
    });

    const contentType = res.headers.get("content-type");
    if (!contentType || !contentType.includes("application/json")) {
      console.error("❌ Expected JSON but got:", contentType);
      throw new Error(`Server error: ${res.status}`);
    }

    const json = await res.json();

    if (!res.ok) {
      if (res.status === 401) {
        clearAuthTokens();
        throw new Error("Please login to add items to cart");
      }
      throw new Error(json.error || json.message || "Failed to add to cart");
    }

    console.log("✅ Item added to cart");
    return json;
  } catch (error) {
    console.error("❌ Add to cart error:", error);
    throw error;
  }
}

/**
 * Update cart item quantity
 */
export async function updateCartQuantity(
  itemId: string,
  quantity: number
): Promise<CartResponse> {
  try {
    const token = getAuthToken();
    if (!token) throw new Error("Please login to update cart");
    
    console.log(`📡 PUT /api/cart/update (itemId: ${itemId}, qty: ${quantity})`);
    const res = await fetch(`${API_BASE}/api/cart/update`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ itemId, quantity }),
    });

    const contentType = res.headers.get("content-type");
    if (!contentType || !contentType.includes("application/json")) {
      console.error("❌ Expected JSON but got:", contentType);
      throw new Error(`Server error: ${res.status}`);
    }

    const json = await res.json();

    if (!res.ok) {
      if (res.status === 401) {
        clearAuthTokens();
        throw new Error("Please login to update cart");
      }
      throw new Error(json.error || json.message || "Failed to update cart");
    }

    console.log("✅ Cart updated");
    return json;
  } catch (error) {
    console.error("❌ Update cart error:", error);
    throw error;
  }
}

/**
 * Remove item from cart
 */
export async function removeFromCart(
  itemId: string
): Promise<CartResponse> {
  try {
    const token = getAuthToken();
    if (!token) throw new Error("Please login to remove items from cart");
    
    console.log(`📡 DELETE /api/cart/remove/${itemId}`);
    const res = await fetch(`${API_BASE}/api/cart/remove/${itemId}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    const contentType = res.headers.get("content-type");
    if (!contentType || !contentType.includes("application/json")) {
      console.error("❌ Expected JSON but got:", contentType);
      throw new Error(`Server error: ${res.status}`);
    }

    const json = await res.json();

    if (!res.ok) {
      if (res.status === 401) {
        clearAuthTokens();
        throw new Error("Please login to remove items from cart");
      }
      throw new Error(json.error || json.message || "Failed to remove from cart");
    }

    console.log("✅ Item removed from cart");
    return json;
  } catch (error) {
    console.error("❌ Remove from cart error:", error);
    throw error;
  }
}

/**
 * Clear cart
 */
export async function clearCart(): Promise<CartResponse> {
  try {
    const token = getAuthToken();
    if (!token) throw new Error("Please login to clear cart");
    
    console.log("📡 DELETE /api/cart/clear");
    const res = await fetch(`${API_BASE}/api/cart/clear`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    const contentType = res.headers.get("content-type");
    if (!contentType || !contentType.includes("application/json")) {
      console.error("❌ Expected JSON but got:", contentType);
      throw new Error(`Server error: ${res.status}`);
    }

    const json = await res.json();

    if (!res.ok) {
      if (res.status === 401) {
        clearAuthTokens();
        throw new Error("Please login to clear cart");
      }
      throw new Error(json.error || json.message || "Failed to clear cart");
    }

    console.log("✅ Cart cleared");
    return json;
  } catch (error) {
    console.error("❌ Clear cart error:", error);
    throw error;
  }
}
