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
  syncCart as syncCartAPI,
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
  const [isInitialized, setIsInitialized] = useState(false);

  // Load and sync cart on mount
  useEffect(() => {
    const initializeCart = async () => {
      const token = localStorage.getItem("authentication");

      if (!token) {
        // Not logged in, use local storage
        const savedCart = localStorage.getItem("cart");
        if (savedCart) {
          try {
            setItems(JSON.parse(savedCart));
          } catch (error) {
            console.error("Failed to load cart from localStorage:", error);
          }
        }
        setLoading(false);
        setIsInitialized(true);
        return;
      }

      // Logged in, sync with backend
      try {
        const localCart = localStorage.getItem("cart");
        const localItems: CartItem[] = localCart ? JSON.parse(localCart) : [];

        // If there are local items, sync them with backend
        if (localItems.length > 0) {
          try {
            await syncCartAPI(
              token,
              localItems.map((item) => ({
                itemId: item.id,
                quantity: item.quantity,
              }))
            );
            // Clear local storage after successful sync
            localStorage.removeItem("cart");
          } catch (syncError) {
            console.error(
              "Failed to sync local cart, will keep in localStorage:",
              syncError
            );
            // Don't clear localStorage if sync fails
          }
        }

        // Fetch cart from backend
        const response = await getCartAPI(token);
        if (response.success && response.items) {
          setItems(response.items);
        }
      } catch (error) {
        console.error("Failed to load cart from backend:", error);

        // Check if it's an auth error
        if (
          error instanceof Error &&
          (error.message.includes("Invalid token") ||
            error.message.includes("Unauthorized") ||
            error.message.includes("401"))
        ) {
          // Token is invalid, clear it and use local storage
          console.log("Token invalid, clearing authentication");
          localStorage.removeItem("authentication");
        }

        // Fallback to local storage
        const savedCart = localStorage.getItem("cart");
        if (savedCart) {
          try {
            setItems(JSON.parse(savedCart));
          } catch (err) {
            console.error("Failed to load cart from localStorage:", err);
          }
        }
      } finally {
        setLoading(false);
        setIsInitialized(true);
      }
    };

    initializeCart();
  }, []);

  // Save to localStorage for non-logged in users
  useEffect(() => {
    if (isInitialized && !localStorage.getItem("authentication")) {
      localStorage.setItem("cart", JSON.stringify(items));
    }
  }, [items, isInitialized]);

  const addToCart = async (newItem: Omit<CartItem, "quantity">) => {
    const token = localStorage.getItem("authentication");

    if (!token) {
      // Offline mode - use local storage
      setItems((prevItems) => {
        const existingItem = prevItems.find((item) => item.id === newItem.id);

        if (existingItem) {
          return prevItems.map((item) =>
            item.id === newItem.id
              ? { ...item, quantity: item.quantity + 1 }
              : item
          );
        } else {
          return [...prevItems, { ...newItem, quantity: 1 }];
        }
      });
      return;
    }

    // Online mode - use backend
    try {
      await addToCartAPI(token, newItem.id);

      // Optimistic update
      setItems((prevItems) => {
        const existingItem = prevItems.find((item) => item.id === newItem.id);

        if (existingItem) {
          return prevItems.map((item) =>
            item.id === newItem.id
              ? { ...item, quantity: item.quantity + 1 }
              : item
          );
        } else {
          return [...prevItems, { ...newItem, quantity: 1 }];
        }
      });
    } catch (error) {
      console.error("Failed to add to cart:", error);

      // Check if auth error
      if (
        error instanceof Error &&
        (error.message.includes("Invalid token") ||
          error.message.includes("Unauthorized"))
      ) {
        localStorage.removeItem("authentication");
      }

      throw error;
    }
  };

  const removeFromCart = async (itemId: string) => {
    const token = localStorage.getItem("authentication");

    if (!token) {
      // Offline mode
      setItems((prevItems) => prevItems.filter((item) => item.id !== itemId));
      return;
    }

    // Online mode
    try {
      await removeFromCartAPI(token, itemId);

      // Optimistic update
      setItems((prevItems) => prevItems.filter((item) => item.id !== itemId));
    } catch (error) {
      console.error("Failed to remove from cart:", error);
      throw error;
    }
  };

  const updateQuantity = async (itemId: string, quantity: number) => {
    const token = localStorage.getItem("authentication");

    if (!token) {
      // Offline mode
      if (quantity <= 0) {
        setItems((prevItems) => prevItems.filter((item) => item.id !== itemId));
      } else {
        setItems((prevItems) =>
          prevItems.map((item) =>
            item.id === itemId ? { ...item, quantity } : item
          )
        );
      }
      return;
    }

    // Online mode
    try {
      await updateCartQuantityAPI(token, itemId, quantity);

      // Optimistic update
      if (quantity <= 0) {
        setItems((prevItems) => prevItems.filter((item) => item.id !== itemId));
      } else {
        setItems((prevItems) =>
          prevItems.map((item) =>
            item.id === itemId ? { ...item, quantity } : item
          )
        );
      }
    } catch (error) {
      console.error("Failed to update quantity:", error);
      throw error;
    }
  };

  const clearCart = async () => {
    const token = localStorage.getItem("authentication");

    if (!token) {
      // Offline mode
      setItems([]);
      return;
    }

    // Online mode
    try {
      await clearCartAPI(token);
      setItems([]);
    } catch (error) {
      console.error("Failed to clear cart:", error);
      throw error;
    }
  };

  const refreshCart = async () => {
    const token = localStorage.getItem("authentication");

    if (!token) return;

    try {
      setLoading(true);
      const response = await getCartAPI(token);
      if (response.success && response.items) {
        setItems(response.items);
      }
    } catch (error) {
      console.error("Failed to refresh cart:", error);
    } finally {
      setLoading(false);
    }
  };

  const getTotalItems = () => {
    return items.reduce((total, item) => total + item.quantity, 0);
  };

  const getTotalPrice = () => {
    return items.reduce((total, item) => total + item.price * item.quantity, 0);
  };

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
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}

export type { CartItem };
