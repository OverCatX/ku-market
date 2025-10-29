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
    const token = localStorage.getItem("authentication");
    if (!token) {
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
      const res = await getCartAPI(token);
      if (res.success) {
        setItems(res.items || []);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "";

      // If token is invalid, clear it and use guest mode
      if (
        errorMessage.toLowerCase().includes("invalid token") ||
        errorMessage.toLowerCase().includes("unauthorized")
      ) {
        console.log(
          "🔑 Invalid token detected, clearing and switching to guest mode"
        );
        localStorage.removeItem("authentication");
        localStorage.removeItem("user");
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
    const token = localStorage.getItem("authentication");
    if (!token) {
      localStorage.setItem("cart", JSON.stringify(items));
    }
  }, [items]);

  const refreshCart = async () => {
    const token = localStorage.getItem("authentication");
    if (!token) return;

    try {
      const res = await getCartAPI(token);
      if (res.success) {
        setItems(res.items || []);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "";

      // If token is invalid, clear it
      if (
        errorMessage.toLowerCase().includes("invalid token") ||
        errorMessage.toLowerCase().includes("unauthorized")
      ) {
        console.log("🔑 Invalid token detected during refresh, clearing");
        localStorage.removeItem("authentication");
        localStorage.removeItem("user");
      }

      console.error("Refresh error:", error);
    }
  };

  const addToCart = async (newItem: Omit<CartItem, "quantity">) => {
    const token = localStorage.getItem("authentication");

    if (!token) {
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
      await addToCartAPI(token, newItem.id);
      await refreshCart();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "";

      // If token is invalid, clear it and switch to guest mode
      if (
        errorMessage.toLowerCase().includes("invalid token") ||
        errorMessage.toLowerCase().includes("unauthorized")
      ) {
        console.log("🔑 Invalid token, switching to guest mode for add");
        localStorage.removeItem("authentication");
        localStorage.removeItem("user");
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
    const token = localStorage.getItem("authentication");

    if (!token) {
      setItems((prev) => prev.filter((i) => i.id !== itemId));
      return;
    }

    try {
      await removeFromCartAPI(token, itemId);
      await refreshCart();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "";

      // If token is invalid, clear it and switch to guest mode
      if (
        errorMessage.toLowerCase().includes("invalid token") ||
        errorMessage.toLowerCase().includes("unauthorized")
      ) {
        console.log("🔑 Invalid token, switching to guest mode for remove");
        localStorage.removeItem("authentication");
        localStorage.removeItem("user");
        // Remove locally
        setItems((prev) => prev.filter((i) => i.id !== itemId));
        return;
      }

      console.error("Remove error:", error);
      throw error;
    }
  };

  const updateQuantity = async (itemId: string, quantity: number) => {
    const token = localStorage.getItem("authentication");

    if (!token) {
      setItems((prev) => {
        if (quantity === 0) return prev.filter((i) => i.id !== itemId);
        return prev.map((i) => (i.id === itemId ? { ...i, quantity } : i));
      });
      return;
    }

    try {
      await updateCartQuantityAPI(token, itemId, quantity);
      await refreshCart();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "";

      // If token is invalid, clear it and switch to guest mode
      if (
        errorMessage.toLowerCase().includes("invalid token") ||
        errorMessage.toLowerCase().includes("unauthorized")
      ) {
        console.log("🔑 Invalid token, switching to guest mode for update");
        localStorage.removeItem("authentication");
        localStorage.removeItem("user");
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
    const token = localStorage.getItem("authentication");

    if (!token) {
      setItems([]);
      localStorage.removeItem("cart");
      return;
    }

    try {
      await clearCartAPI(token);
      setItems([]);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "";

      // If token is invalid, clear it and switch to guest mode
      if (
        errorMessage.toLowerCase().includes("invalid token") ||
        errorMessage.toLowerCase().includes("unauthorized")
      ) {
        console.log("🔑 Invalid token, switching to guest mode for clear");
        localStorage.removeItem("authentication");
        localStorage.removeItem("user");
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
