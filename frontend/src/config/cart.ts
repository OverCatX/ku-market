import { API_BASE } from "./constants";

export interface CartItem {
  id: string;
  title: string;
  price: number;
  image: string;
  quantity: number;
  sellerId: string;
  sellerName: string;
  addedAt?: string;
}

export interface CartResponse {
  success: boolean;
  items?: CartItem[];
  totalItems?: number;
  totalPrice?: number;
  message?: string;
  error?: string;
}

export interface SyncCartItem {
  itemId: string;
  quantity: number;
}

// Get cart from backend
export async function getCart(token: string): Promise<CartResponse> {
  try {
    const res = await fetch(`${API_BASE}/api/cart`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const json = await res.json();

    if (!res.ok) {
      throw new Error(json.error || "Failed to get cart");
    }

    return json;
  } catch (err) {
    if (err instanceof Error) {
      throw err;
    } else {
      throw new Error("Something went wrong");
    }
  }
}

// Add item to cart
export async function addToCart(
  token: string,
  itemId: string,
  quantity: number = 1
): Promise<CartResponse> {
  try {
    const res = await fetch(`${API_BASE}/api/cart/add`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ itemId, quantity }),
    });

    const json = await res.json();

    if (!res.ok) {
      throw new Error(json.error || "Failed to add to cart");
    }

    return json;
  } catch (err) {
    if (err instanceof Error) {
      throw err;
    } else {
      throw new Error("Something went wrong");
    }
  }
}

// Update item quantity
export async function updateCartQuantity(
  token: string,
  itemId: string,
  quantity: number
): Promise<CartResponse> {
  try {
    const res = await fetch(`${API_BASE}/api/cart/update`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ itemId, quantity }),
    });

    const json = await res.json();

    if (!res.ok) {
      throw new Error(json.error || "Failed to update cart");
    }

    return json;
  } catch (err) {
    if (err instanceof Error) {
      throw err;
    } else {
      throw new Error("Something went wrong");
    }
  }
}

// Remove item from cart
export async function removeFromCart(
  token: string,
  itemId: string
): Promise<CartResponse> {
  try {
    const res = await fetch(`${API_BASE}/api/cart/remove/${itemId}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const json = await res.json();

    if (!res.ok) {
      throw new Error(json.error || "Failed to remove from cart");
    }

    return json;
  } catch (err) {
    if (err instanceof Error) {
      throw err;
    } else {
      throw new Error("Something went wrong");
    }
  }
}

// Clear cart
export async function clearCart(token: string): Promise<CartResponse> {
  try {
    const res = await fetch(`${API_BASE}/api/cart/clear`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const json = await res.json();

    if (!res.ok) {
      throw new Error(json.error || "Failed to clear cart");
    }

    return json;
  } catch (err) {
    if (err instanceof Error) {
      throw err;
    } else {
      throw new Error("Something went wrong");
    }
  }
}

// Sync cart with backend (merge local with backend)
export async function syncCart(
  token: string,
  items: SyncCartItem[]
): Promise<CartResponse> {
  try {
    const res = await fetch(`${API_BASE}/api/cart/sync`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ items }),
    });

    const json = await res.json();

    if (!res.ok) {
      throw new Error(json.error || "Failed to sync cart");
    }

    return json;
  } catch (err) {
    if (err instanceof Error) {
      throw err;
    } else {
      throw new Error("Something went wrong");
    }
  }
}

