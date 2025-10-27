"use client";

import { useCart } from "@/contexts/CartContext";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { CreditCard, MapPin, Package } from "lucide-react";
import Image from "next/image";

export default function CheckoutPage() {
  const { items, getTotalPrice, clearCart } = useCart();
  const router = useRouter();
  const [isProcessing, setIsProcessing] = useState(false);

  const [shippingInfo, setShippingInfo] = useState({
    fullName: "",
    phone: "",
    address: "",
    city: "",
    postalCode: "",
  });

  const [paymentMethod, setPaymentMethod] = useState<"credit-card" | "promptpay" | "cod">("credit-card");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Generate order ID
    const orderId = `ORD-${Date.now()}`;

    // Clear cart and redirect to success page
    clearCart();
    router.push(`/order/${orderId}`);
  };

  if (items.length === 0) {
    router.push("/cart");
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 sm:px-6 lg:px-16 max-w-6xl">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Checkout</h1>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Checkout Form */}
            <div className="lg:col-span-2 space-y-6">
              {/* Shipping Information */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center gap-2 mb-4">
                  <MapPin className="w-5 h-5 text-[#84B067]" />
                  <h2 className="text-xl font-bold text-gray-900">Shipping Information</h2>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={shippingInfo.fullName}
                      onChange={(e) =>
                        setShippingInfo({ ...shippingInfo, fullName: e.target.value })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#84B067]"
                      placeholder="John Doe"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      required
                      value={shippingInfo.phone}
                      onChange={(e) =>
                        setShippingInfo({ ...shippingInfo, phone: e.target.value })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#84B067]"
                      placeholder="081-234-5678"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Address *
                    </label>
                    <textarea
                      required
                      value={shippingInfo.address}
                      onChange={(e) =>
                        setShippingInfo({ ...shippingInfo, address: e.target.value })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#84B067]"
                      rows={3}
                      placeholder="123 Main Street, Apt 4B"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        City *
                      </label>
                      <input
                        type="text"
                        required
                        value={shippingInfo.city}
                        onChange={(e) =>
                          setShippingInfo({ ...shippingInfo, city: e.target.value })
                        }
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#84B067]"
                        placeholder="Bangkok"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Postal Code *
                      </label>
                      <input
                        type="text"
                        required
                        value={shippingInfo.postalCode}
                        onChange={(e) =>
                          setShippingInfo({ ...shippingInfo, postalCode: e.target.value })
                        }
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#84B067]"
                        placeholder="10110"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Payment Method */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center gap-2 mb-4">
                  <CreditCard className="w-5 h-5 text-[#84B067]" />
                  <h2 className="text-xl font-bold text-gray-900">Payment Method</h2>
                </div>

                <div className="space-y-3">
                  <label className="flex items-center gap-3 p-4 border-2 border-gray-300 rounded-lg cursor-pointer hover:border-[#84B067] transition">
                    <input
                      type="radio"
                      name="payment"
                      value="credit-card"
                      checked={paymentMethod === "credit-card"}
                      onChange={(e) => setPaymentMethod(e.target.value as "credit-card")}
                      className="w-4 h-4 text-[#84B067]"
                    />
                    <CreditCard className="w-5 h-5" />
                    <span className="font-medium">Credit/Debit Card</span>
                  </label>

                  <label className="flex items-center gap-3 p-4 border-2 border-gray-300 rounded-lg cursor-pointer hover:border-[#84B067] transition">
                    <input
                      type="radio"
                      name="payment"
                      value="promptpay"
                      checked={paymentMethod === "promptpay"}
                      onChange={(e) => setPaymentMethod(e.target.value as "promptpay")}
                      className="w-4 h-4 text-[#84B067]"
                    />
                    <span className="font-medium">PromptPay</span>
                  </label>

                  <label className="flex items-center gap-3 p-4 border-2 border-gray-300 rounded-lg cursor-pointer hover:border-[#84B067] transition">
                    <input
                      type="radio"
                      name="payment"
                      value="cod"
                      checked={paymentMethod === "cod"}
                      onChange={(e) => setPaymentMethod(e.target.value as "cod")}
                      className="w-4 h-4 text-[#84B067]"
                    />
                    <Package className="w-5 h-5" />
                    <span className="font-medium">Cash on Delivery</span>
                  </label>
                </div>
              </div>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-sm p-6 sticky top-24">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Order Summary</h2>

                <div className="space-y-4 mb-6 max-h-64 overflow-y-auto">
                  {items.map((item) => (
                    <div key={item.id} className="flex gap-3">
                      <div className="relative w-16 h-16 flex-shrink-0 bg-gray-100 rounded-lg overflow-hidden">
                        <Image
                          src={item.image || "/placeholder.png"}
                          alt={item.title}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900 line-clamp-1">
                          {item.title}
                        </p>
                        <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
                        <p className="text-sm font-bold text-[#84B067]">
                          ฿{(item.price * item.quantity).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="space-y-3 mb-6 border-t pt-4">
                  <div className="flex justify-between text-gray-600">
                    <span>Subtotal</span>
                    <span>฿{getTotalPrice().toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Shipping</span>
                    <span className="text-green-600">Free</span>
                  </div>
                  <div className="border-t pt-3 flex justify-between text-lg font-bold text-gray-900">
                    <span>Total</span>
                    <span className="text-[#84B067]">฿{getTotalPrice().toLocaleString()}</span>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isProcessing}
                  className="w-full px-6 py-3 bg-[#84B067] text-white rounded-lg hover:bg-[#69773D] transition font-semibold disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  {isProcessing ? "Processing..." : "Place Order"}
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

