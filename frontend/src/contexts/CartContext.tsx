"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import {
  getCart as getCartAPI,
  addToCart as addToCartAPI,
  updateCartQuantity as updateCartQuantityAPI,
  removeFromCart as removeFromCartAPI,
  clearCart as clearCartAPI,
  CartItem,
} from "@/config/cart";
import { getAuthToken, clearAuthTokens } from "@/lib/auth";

interface CartContextType {
  items: CartItem[];
  loading: boolean;
  addToCart: (item: Omit<CartItem, "quantity">) => Promise<void>;
  removeFromCart: (itemId: string) => Promise<void>;
  updateQuantity: (itemId: string, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
  refreshCart: () => Promise<void>;
  getTotalItems: () => number;
  getTotalPrice: () => number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);

  const loadCart = async () => {
    const token = getAuthToken();
    if (!token) {
      // Guest mode - use local storage
      const saved = localStorage.getItem("cart");
      if (saved) {
        try {
          setItems(JSON.parse(saved));
        } catch {
          setItems([]);
        }
      }
      setLoading(false);
      return;
    }

    try {
      const res = await getCartAPI();
      if (res.success) {
        setItems(res.items || []);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "";

      // Network/server connection errors - fallback to local storage
      if (
        errorMessage.toLowerCase().includes("failed to fetch") ||
        errorMessage.toLowerCase().includes("cannot connect to server") ||
        errorMessage.toLowerCase().includes("network error")
      ) {
        console.warn("⚠️ Cannot connect to backend. Using local cart storage.");
        const saved = localStorage.getItem("cart");
        if (saved) {
          try {
            setItems(JSON.parse(saved));
          } catch {
            setItems([]);
          }
        }
        setLoading(false);
        return;
      }

      // If token is invalid, clear it and use guest mode
      if (
        errorMessage.toLowerCase().includes("invalid token") ||
        errorMessage.toLowerCase().includes("unauthorized") ||
        errorMessage.toLowerCase().includes("please login")
      ) {
        console.log(
          "🔑 Invalid token detected, clearing and switching to guest mode"
        );
        clearAuthTokens();
      }

      console.error("Load cart error:", error);
      const saved = localStorage.getItem("cart");
      if (saved) {
        try {
          setItems(JSON.parse(saved));
        } catch {
          setItems([]);
        }
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCart();
  }, []);

  useEffect(() => {
    const token = getAuthToken();
    if (!token) {
      // Guest mode - save to local storage
      localStorage.setItem("cart", JSON.stringify(items));
    }
  }, [items]);

  const refreshCart = async () => {
    const token = getAuthToken();
    if (!token) return;

    try {
      const res = await getCartAPI();
      if (res.success) {
        setItems(res.items || []);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "";

      // If token is invalid, clear it
      if (
        errorMessage.toLowerCase().includes("invalid token") ||
        errorMessage.toLowerCase().includes("unauthorized") ||
        errorMessage.toLowerCase().includes("please login")
      ) {
        console.log("🔑 Invalid token detected during refresh, clearing");
        clearAuthTokens();
      }

      console.error("Refresh error:", error);
    }
  };

  const addToCart = async (newItem: Omit<CartItem, "quantity">) => {
    const token = getAuthToken();
    // Prevent adding own items
    try {
      const user = JSON.parse(localStorage.getItem("user") || "null") || undefined;
      if (user?._id && newItem.sellerId && String(user._id) === String(newItem.sellerId)) {
        console.warn("Attempt to add own item to cart blocked");
        throw new Error("You cannot purchase your own item");
      }
    } catch {
      // ignore parse errors
    }

    if (!token) {
      // Guest mode - add to local cart
      setItems((prev) => {
        const idx = prev.findIndex((i) => i.id === newItem.id);
        if (idx > -1) {
          const updated = [...prev];
          updated[idx].quantity += 1;
          return updated;
        }
        return [...prev, { ...newItem, quantity: 1 }];
      });
      return;
    }

    try {
      await addToCartAPI(newItem.id);
      await refreshCart();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "";

      // If token is invalid, clear it and switch to guest mode
      if (
        errorMessage.toLowerCase().includes("invalid token") ||
        errorMessage.toLowerCase().includes("unauthorized") ||
        errorMessage.toLowerCase().includes("please login")
      ) {
        console.log("🔑 Invalid token, switching to guest mode for add");
        clearAuthTokens();
        // Add to cart locally
        setItems((prev) => {
          const idx = prev.findIndex((i) => i.id === newItem.id);
          if (idx > -1) {
            const updated = [...prev];
            updated[idx].quantity += 1;
            return updated;
          }
          return [...prev, { ...newItem, quantity: 1 }];
        });
        return;
      }

      console.error("Add error:", error);
      throw error;
    }
  };

  const removeFromCart = async (itemId: string) => {
    const token = getAuthToken();

    if (!token) {
      // Guest mode - remove from local cart
      setItems((prev) => prev.filter((i) => i.id !== itemId));
      return;
    }

    try {
      await removeFromCartAPI(itemId);
      await refreshCart();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "";

      // If token is invalid, clear it and switch to guest mode
      if (
        errorMessage.toLowerCase().includes("invalid token") ||
        errorMessage.toLowerCase().includes("unauthorized") ||
        errorMessage.toLowerCase().includes("please login")
      ) {
        console.log("🔑 Invalid token, switching to guest mode for remove");
        clearAuthTokens();
        // Remove locally
        setItems((prev) => prev.filter((i) => i.id !== itemId));
        return;
      }

      console.error("Remove error:", error);
      throw error;
    }
  };

  const updateQuantity = async (itemId: string, quantity: number) => {
    const token = getAuthToken();

    if (!token) {
      // Guest mode - update local cart
      setItems((prev) => {
        if (quantity === 0) return prev.filter((i) => i.id !== itemId);
        return prev.map((i) => (i.id === itemId ? { ...i, quantity } : i));
      });
      return;
    }

    try {
      await updateCartQuantityAPI(itemId, quantity);
      await refreshCart();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "";

      // If token is invalid, clear it and switch to guest mode
      if (
        errorMessage.toLowerCase().includes("invalid token") ||
        errorMessage.toLowerCase().includes("unauthorized") ||
        errorMessage.toLowerCase().includes("please login")
      ) {
        console.log("🔑 Invalid token, switching to guest mode for update");
        clearAuthTokens();
        // Update locally
        setItems((prev) => {
          if (quantity === 0) return prev.filter((i) => i.id !== itemId);
          return prev.map((i) => (i.id === itemId ? { ...i, quantity } : i));
        });
        return;
      }

      console.error("Update error:", error);
      throw error;
    }
  };

  const clearCart = async () => {
    const token = getAuthToken();

    if (!token) {
      // Guest mode - clear local cart
      setItems([]);
      localStorage.removeItem("cart");
      return;
    }

    try {
      await clearCartAPI();
      setItems([]);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "";

      // If token is invalid, clear it and switch to guest mode
      if (
        errorMessage.toLowerCase().includes("invalid token") ||
        errorMessage.toLowerCase().includes("unauthorized") ||
        errorMessage.toLowerCase().includes("please login")
      ) {
        console.log("🔑 Invalid token, switching to guest mode for clear");
        clearAuthTokens();
        // Clear locally
        setItems([]);
        localStorage.removeItem("cart");
        return;
      }

      console.error("Clear error:", error);
      throw error;
    }
  };

  const getTotalItems = () => items.reduce((sum, i) => sum + i.quantity, 0);
  const getTotalPrice = () =>
    items.reduce((sum, i) => sum + i.price * i.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        loading,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        refreshCart,
        getTotalItems,
        getTotalPrice,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used within CartProvider");
  return context;
}
