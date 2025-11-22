"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
  useCallback,
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

// Request deduplication: Track pending requests to prevent duplicate API calls
const pendingRequests = new Map<string, Promise<unknown>>();

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const pendingOperationsRef = useRef<Set<string>>(new Set()); // Track pending operations
  const localStorageSyncRef = useRef<NodeJS.Timeout | null>(null);

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
        // Cannot connect to backend, using local storage
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
        // Invalid token detected, clearing and switching to guest mode
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

  // Debounced localStorage sync for guest mode (only sync when not authenticated)
  useEffect(() => {
    const token = getAuthToken();
    if (!token && items.length >= 0) {
      // Clear previous timeout
      if (localStorageSyncRef.current) {
        clearTimeout(localStorageSyncRef.current);
      }

      // Debounce localStorage writes to avoid blocking UI
      localStorageSyncRef.current = setTimeout(() => {
        try {
          localStorage.setItem("cart", JSON.stringify(items));
        } catch (error) {
          // Failed to save cart to localStorage
        }
      }, 300); // 300ms debounce
    }

    return () => {
      if (localStorageSyncRef.current) {
        clearTimeout(localStorageSyncRef.current);
      }
    };
  }, [items]);

  const refreshCart = useCallback(async (): Promise<void> => {
    const token = getAuthToken();
    if (!token) return;

    const requestKey = "refresh-cart";

    // Deduplicate concurrent refresh requests
    if (pendingRequests.has(requestKey)) {
      await pendingRequests.get(requestKey);
      return;
    }

    const refreshPromise = (async (): Promise<void> => {
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
          // Invalid token detected during refresh, clearing
          clearAuthTokens();
        }

        console.error("Refresh error:", error);
      } finally {
        pendingRequests.delete(requestKey);
      }
    })();

    pendingRequests.set(requestKey, refreshPromise);
    await refreshPromise;
  }, []);

  const addToCart = useCallback(
    async (newItem: Omit<CartItem, "quantity">) => {
      const MAX_QUANTITY_PER_ITEM = 10;
      const token = getAuthToken();
      const operationKey = `add-${newItem.id}`;

      // Prevent duplicate operations
      if (pendingOperationsRef.current.has(operationKey)) {
        return; // Already processing this item
      }

      // Prevent adding own items
      try {
        const user =
          JSON.parse(localStorage.getItem("user") || "null") || undefined;
        if (
          user?._id &&
          newItem.sellerId &&
          String(user._id) === String(newItem.sellerId)
        ) {
          // Attempt to add own item to cart blocked
          throw new Error("You cannot purchase your own item");
        }
      } catch {
        // ignore parse errors
      }

      if (!token) {
        // Guest mode - optimistic update with immediate UI feedback
        let shouldThrow = false;
        let errorMessage = "";

        setItems((prev) => {
          const idx = prev.findIndex((i) => i.id === newItem.id);
          if (idx > -1) {
            const updated = [...prev];
            // Check if already at max quantity
            if (updated[idx].quantity >= MAX_QUANTITY_PER_ITEM) {
              shouldThrow = true;
              errorMessage = `Maximum quantity per item is ${MAX_QUANTITY_PER_ITEM}. You already have ${updated[idx].quantity} in your cart.`;
              return prev; // Don't update if already at max
            }
            updated[idx].quantity += 1;
            return updated;
          }
          return [...prev, { ...newItem, quantity: 1 }];
        });

        // Throw error after state update if needed (outside of setState callback)
        if (shouldThrow) {
          throw new Error(errorMessage);
        }
        return;
      }

      // Authenticated mode - optimistic update + API call
      // Step 1: Optimistic update (immediate UI feedback)
      let optimisticUpdate: CartItem[] | null = null;
      let shouldRevert = false;

      setItems((prev) => {
        const idx = prev.findIndex((i) => i.id === newItem.id);
        if (idx > -1) {
          const updated = [...prev];
          if (updated[idx].quantity >= MAX_QUANTITY_PER_ITEM) {
            shouldRevert = true;
            return prev;
          }
          updated[idx].quantity += 1;
          optimisticUpdate = updated;
          return updated;
        }
        optimisticUpdate = [...prev, { ...newItem, quantity: 1 }];
        return optimisticUpdate;
      });

      if (shouldRevert) {
        throw new Error(
          `Maximum quantity per item is ${MAX_QUANTITY_PER_ITEM}. You already have ${MAX_QUANTITY_PER_ITEM} in your cart.`
        );
      }

      // Step 2: API call (background sync)
      pendingOperationsRef.current.add(operationKey);

      try {
        // Deduplicate concurrent requests for the same item
        const requestKey = `add-api-${newItem.id}`;
        let apiPromise = pendingRequests.get(requestKey);

        if (!apiPromise) {
          apiPromise = addToCartAPI(newItem.id)
            .then(async (res) => {
              // Use response data if available, otherwise refresh
              if (res.success && res.items) {
                setItems(res.items);
              } else {
                await refreshCart();
              }
              pendingRequests.delete(requestKey);
              return res;
            })
            .catch((error) => {
              pendingRequests.delete(requestKey);
              throw error;
            });

          pendingRequests.set(requestKey, apiPromise);
        }

        await apiPromise;
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "";

        // Revert optimistic update on error
        if (optimisticUpdate) {
          setItems((prev) => {
            const idx = prev.findIndex((i) => i.id === newItem.id);
            if (idx > -1 && prev[idx].quantity > 0) {
              const reverted = [...prev];
              reverted[idx].quantity -= 1;
              if (reverted[idx].quantity === 0) {
                return reverted.filter((i) => i.id !== newItem.id);
              }
              return reverted;
            }
            return prev.filter((i) => i.id !== newItem.id);
          });
        }

        // If token is invalid, clear it and switch to guest mode
        if (
          errorMessage.toLowerCase().includes("invalid token") ||
          errorMessage.toLowerCase().includes("unauthorized") ||
          errorMessage.toLowerCase().includes("please login")
        ) {
          // Invalid token, switching to guest mode for add
          clearAuthTokens();
          // Add to cart locally with quantity limit check
          setItems((prev) => {
            const idx = prev.findIndex((i) => i.id === newItem.id);
            if (idx > -1) {
              const updated = [...prev];
              if (updated[idx].quantity >= MAX_QUANTITY_PER_ITEM) {
                return prev;
              }
              updated[idx].quantity += 1;
              return updated;
            }
            return [...prev, { ...newItem, quantity: 1 }];
          });
          return;
        }

        console.error("Add error:", error);
        throw error;
      } finally {
        pendingOperationsRef.current.delete(operationKey);
      }
    },
    [refreshCart]
  );

  const removeFromCart = useCallback(
    async (itemId: string) => {
      const token = getAuthToken();
      const operationKey = `remove-${itemId}`;

      if (pendingOperationsRef.current.has(operationKey)) {
        return;
      }

      // Optimistic update
      let removedItem: CartItem | null = null;
      setItems((prev) => {
        const item = prev.find((i) => i.id === itemId);
        if (item) removedItem = item;
        return prev.filter((i) => i.id !== itemId);
      });

      if (!token) {
        return;
      }

      pendingOperationsRef.current.add(operationKey);

      try {
        const requestKey = `remove-api-${itemId}`;
        let apiPromise = pendingRequests.get(requestKey);

        if (!apiPromise) {
          apiPromise = removeFromCartAPI(itemId)
            .then(async (res) => {
              if (res.success && res.items) {
                setItems(res.items);
              } else {
                await refreshCart();
              }
              pendingRequests.delete(requestKey);
              return res;
            })
            .catch((error) => {
              pendingRequests.delete(requestKey);
              throw error;
            });

          pendingRequests.set(requestKey, apiPromise);
        }

        await apiPromise;
      } catch (error) {
        // Revert optimistic update
        if (removedItem) {
          setItems((prev) => {
            const exists = prev.find((i) => i.id === itemId);
            if (!exists) {
              return [...prev, removedItem!];
            }
            return prev;
          });
        }

        const errorMessage = error instanceof Error ? error.message : "";

        if (
          errorMessage.toLowerCase().includes("invalid token") ||
          errorMessage.toLowerCase().includes("unauthorized") ||
          errorMessage.toLowerCase().includes("please login")
        ) {
          // Invalid token, switching to guest mode for remove
          clearAuthTokens();
          return;
        }

        console.error("Remove error:", error);
        throw error;
      } finally {
        pendingOperationsRef.current.delete(operationKey);
      }
    },
    [refreshCart]
  );

  const updateQuantity = useCallback(
    async (itemId: string, quantity: number) => {
      const MAX_QUANTITY_PER_ITEM = 10;
      const token = getAuthToken();
      const operationKey = `update-${itemId}`;

      if (pendingOperationsRef.current.has(operationKey)) {
        return;
      }

      // Validate maximum quantity
      if (quantity > MAX_QUANTITY_PER_ITEM) {
        throw new Error(
          `Maximum quantity per item is ${MAX_QUANTITY_PER_ITEM}.`
        );
      }

      // Optimistic update
      let previousQuantity: number | null = null;
      setItems((prev) => {
        const existingItem = prev.find((i) => i.id === itemId);
        if (existingItem) previousQuantity = existingItem.quantity;

        if (quantity === 0) return prev.filter((i) => i.id !== itemId);
        if (quantity > MAX_QUANTITY_PER_ITEM) return prev;
        return prev.map((i) => (i.id === itemId ? { ...i, quantity } : i));
      });

      if (!token) {
        return;
      }

      pendingOperationsRef.current.add(operationKey);

      try {
        const requestKey = `update-api-${itemId}`;
        let apiPromise = pendingRequests.get(requestKey);

        if (!apiPromise) {
          apiPromise = updateCartQuantityAPI(itemId, quantity)
            .then(async (res) => {
              if (res.success && res.items) {
                setItems(res.items);
              } else {
                await refreshCart();
              }
              pendingRequests.delete(requestKey);
              return res;
            })
            .catch((error) => {
              pendingRequests.delete(requestKey);
              throw error;
            });

          pendingRequests.set(requestKey, apiPromise);
        }

        await apiPromise;
      } catch (error) {
        // Revert optimistic update
        if (previousQuantity !== null) {
          setItems((prev) => {
            const exists = prev.find((i) => i.id === itemId);
            if (!exists && previousQuantity! > 0) {
              // Item was removed, need to restore it (but we don't have full item data)
              // Just refresh from server instead
              refreshCart();
              return prev;
            }
            return prev.map((i) =>
              i.id === itemId ? { ...i, quantity: previousQuantity! } : i
            );
          });
        }

        const errorMessage = error instanceof Error ? error.message : "";

        if (
          errorMessage.toLowerCase().includes("invalid token") ||
          errorMessage.toLowerCase().includes("unauthorized") ||
          errorMessage.toLowerCase().includes("please login")
        ) {
          // Invalid token, switching to guest mode for update
          clearAuthTokens();
          return;
        }

        console.error("Update error:", error);
        throw error;
      } finally {
        pendingOperationsRef.current.delete(operationKey);
      }
    },
    [refreshCart]
  );

  const clearCart = useCallback(async () => {
    const token = getAuthToken();

    // Optimistic update
    const previousItems = items;
    setItems([]);

    if (!token) {
      localStorage.removeItem("cart");
      return;
    }

    try {
      await clearCartAPI();
    } catch (error) {
      // Revert optimistic update
      setItems(previousItems);

      const errorMessage = error instanceof Error ? error.message : "";

      if (
        errorMessage.toLowerCase().includes("invalid token") ||
        errorMessage.toLowerCase().includes("unauthorized") ||
        errorMessage.toLowerCase().includes("please login")
      ) {
        // Invalid token, switching to guest mode for clear
        clearAuthTokens();
        localStorage.removeItem("cart");
        return;
      }

      console.error("Clear error:", error);
      throw error;
    }
  }, [items]);

  // Memoize totals to avoid recalculating on every render
  const getTotalItems = useCallback(() => {
    return items.reduce((sum, i) => sum + i.quantity, 0);
  }, [items]);

  const getTotalPrice = useCallback(() => {
    return items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  }, [items]);

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
