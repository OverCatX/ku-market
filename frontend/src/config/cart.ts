import { API_BASE } from "./constants";

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
export async function getCart(token: string): Promise<CartResponse> {
  try {
    console.log("📡 GET /api/cart");
    const res = await fetch(`${API_BASE}/api/cart`, {
      method: "GET",
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
      throw new Error(json.error || json.message || "Failed to get cart");
    }

    console.log(`✅ Got cart: ${json.items?.length || 0} items`);
    return json;
  } catch (error) {
    console.error("❌ Get cart error:", error);
    throw error;
  }
}

/**
 * Add item to cart
 */
export async function addToCart(
  token: string,
  itemId: string,
  quantity: number = 1
): Promise<CartResponse> {
  try {
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
  token: string,
  itemId: string,
  quantity: number
): Promise<CartResponse> {
  try {
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
  token: string,
  itemId: string
): Promise<CartResponse> {
  try {
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
export async function clearCart(token: string): Promise<CartResponse> {
  try {
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
      throw new Error(json.error || json.message || "Failed to clear cart");
    }

    console.log("✅ Cart cleared");
    return json;
  } catch (error) {
    console.error("❌ Clear cart error:", error);
    throw error;
  }
}
