"use client";

import { useCart } from "@/contexts/CartContext";
import { useState, useEffect } from "react";
import Link from "next/link";
import {
  ShoppingCart,
  Trash2,
  Plus,
  Minus,
  ArrowRight,
  RefreshCw,
} from "lucide-react";
import Image from "next/image";
import toast from "react-hot-toast";

export default function CartPage() {
  const {
    items,
    loading,
    removeFromCart,
    updateQuantity,
    getTotalPrice,
    refreshCart,
  } = useCart();
  const [isMounted, setIsMounted] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleUpdateQuantity = async (itemId: string, quantity: number) => {
    try {
      setActionLoading(itemId);
      await updateQuantity(itemId, quantity);
    } catch {
      toast.error("Failed to update quantity");
      // Refresh to get correct state
      await refreshCart();
    } finally {
      setActionLoading(null);
    }
  };

  const handleRemoveItem = async (itemId: string) => {
    try {
      setActionLoading(itemId);
      await removeFromCart(itemId);
      toast.success("Item removed from cart");
    } catch {
      toast.error("Failed to remove item");
      await refreshCart();
    } finally {
      setActionLoading(null);
    }
  };

  // Show loading state during SSR
  if (!isMounted || loading) {
    return (
      <div className="min-h-screen py-8" style={{ backgroundColor: '#F6F2E5' }}>
        <div className="container mx-auto px-4 sm:px-6 lg:px-16 max-w-6xl">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-48 mb-8"></div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-4">
                <div className="bg-white rounded-lg shadow-sm p-6 h-40"></div>
                <div className="bg-white rounded-lg shadow-sm p-6 h-40"></div>
              </div>
              <div className="lg:col-span-1">
                <div className="bg-white rounded-lg shadow-sm p-6 h-64"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen py-12" style={{ backgroundColor: '#F6F2E5' }}>
        <div className="container mx-auto px-4 sm:px-6 lg:px-16 max-w-4xl">
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <ShoppingCart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Your cart is empty
            </h2>
            <p className="text-gray-600 mb-6">Add some items to get started!</p>
            <Link
              href="/marketplace"
              className="inline-flex items-center gap-2 px-6 py-3 bg-[#84B067] text-white rounded-lg hover:bg-[#69773D] transition"
            >
              Continue Shopping
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8" style={{ backgroundColor: '#F6F2E5' }}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-16 max-w-6xl">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Shopping Cart</h1>
          <button
            onClick={refreshCart}
            className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition"
            aria-label="Refresh cart"
          >
            <RefreshCw className="w-5 h-5" />
            <span className="hidden sm:inline">Refresh</span>
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {items.map((item) => (
              <div
                key={item.id}
                className={`bg-white rounded-lg shadow-sm p-4 sm:p-6 flex gap-4 ${
                  actionLoading === item.id
                    ? "opacity-50 pointer-events-none"
                    : ""
                }`}
              >
                {/* Product Image */}
                <div className="relative w-24 h-24 sm:w-32 sm:h-32 flex-shrink-0 bg-gray-100 rounded-lg overflow-hidden">
                  <Image
                    src={item.image || "/placeholder.png"}
                    alt={item.title}
                    fill
                    className="object-cover"
                  />
                </div>

                {/* Product Details */}
                <div className="flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">
                      {item.title}
                    </h3>
                    <p className="text-sm text-gray-600">
                      Sold by {item.sellerName}
                    </p>
                    <p className="text-lg font-bold text-[#84B067] mt-2">
                      ฿{item.price.toLocaleString()}
                    </p>
                  </div>

                  {/* Quantity Controls */}
                  <div className="flex items-center justify-between mt-4">
                    <div className="flex items-center gap-2 border border-gray-300 rounded-lg">
                      <button
                        onClick={() =>
                          handleUpdateQuantity(item.id, item.quantity - 1)
                        }
                        disabled={actionLoading === item.id}
                        className="p-2 hover:bg-gray-100 transition disabled:opacity-50"
                        aria-label="Decrease quantity"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="px-4 font-medium">{item.quantity}</span>
                      <button
                        onClick={() =>
                          handleUpdateQuantity(item.id, item.quantity + 1)
                        }
                        disabled={actionLoading === item.id}
                        className="p-2 hover:bg-gray-100 transition disabled:opacity-50"
                        aria-label="Increase quantity"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>

                    <button
                      onClick={() => handleRemoveItem(item.id)}
                      disabled={actionLoading === item.id}
                      className="text-[#780606] hover:text-[#780606] p-2 hover:bg-[#780606] rounded-lg transition disabled:opacity-50"
                      aria-label="Remove item"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-6 sticky top-24">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                Order Summary
              </h2>

              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-gray-600">
                  <span>
                    Subtotal (
                    {items.reduce((sum, item) => sum + item.quantity, 0)} items)
                  </span>
                  <span>฿{getTotalPrice().toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Shipping</span>
                  <span className="text-green-600">Free</span>
                </div>
                <div className="border-t pt-3 flex justify-between text-lg font-bold text-gray-900">
                  <span>Total</span>
                  <span className="text-[#84B067]">
                    ฿{getTotalPrice().toLocaleString()}
                  </span>
                </div>
              </div>

              <Link
                href="/checkout"
                className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-[#84B067] text-white rounded-lg hover:bg-[#69773D] transition font-semibold"
              >
                Proceed to Checkout
                <ArrowRight className="w-5 h-5" />
              </Link>

              <Link
                href="/marketplace"
                className="block text-center text-sm text-gray-600 hover:text-gray-900 mt-4"
              >
                Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
