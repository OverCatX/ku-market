"use client";

import { useCart } from "@/contexts/CartContext";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Wallet,
  MapPin,
  Package,
  QrCode,
  CheckCircle2,
  AlertCircle,
  User,
  Truck,
  Store,
} from "lucide-react";
import Image from "next/image";
import type { UserData } from "@/config/auth";

type PaymentMethod = "cash" | "promptpay";
type DeliveryMethod = "pickup" | "delivery";

interface ShippingInfo {
  fullName: string;
  phone: string;
  address: string;
  city: string;
  postalCode: string;
}

export default function CheckoutPage() {
  const { items, getTotalPrice, clearCart } = useCart();
  const router = useRouter();
  const [isProcessing, setIsProcessing] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  const [deliveryMethod, setDeliveryMethod] =
    useState<DeliveryMethod>("pickup");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("cash");

  const [shippingInfo, setShippingInfo] = useState<ShippingInfo>({
    fullName: "",
    phone: "",
    address: "",
    city: "",
    postalCode: "",
  });

  // Wait for client-side mount
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Check authentication and verification status
  useEffect(() => {
    if (!isMounted) return;

    const token = localStorage.getItem("authentication");
    const userStr = localStorage.getItem("user");

    // Not logged in - redirect to login
    if (!token || !userStr) {
      router.push("/login?redirect=/checkout");
      return;
    }

    try {
      const user = JSON.parse(userStr) as UserData;

      if (user.isVerified) {
        setIsVerified(true);
        // Pre-fill contact info if available
        if (user.name) {
          setShippingInfo((prev) => ({ ...prev, fullName: user.name }));
        }
      } else {
        // Not verified - show verification required page
        setIsVerified(false);
      }
    } catch {
      // Invalid user data
      router.push("/login?redirect=/checkout");
      return;
    }

    setIsCheckingAuth(false);
  }, [isMounted, router]);

  // Redirect if cart is empty (client-side)
  useEffect(() => {
    if (isMounted && items.length === 0 && !isCheckingAuth) {
      router.push("/cart");
    }
  }, [items, router, isMounted, isCheckingAuth]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Show confirmation dialog first
    setShowConfirmation(true);
  };

  const handleConfirmOrder = async () => {
    setIsProcessing(true);

    try {
      // Simulate sending order to sellers
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Generate order ID
      const orderId = `ORD-${Date.now()}`;

      // TODO: Send order to backend API
      // const orderData = {
      //   items,
      //   contactInfo: {
      //     fullName: shippingInfo.fullName,
      //     phone: shippingInfo.phone,
      //   },
      //   deliveryMethod,
      //   shippingAddress: deliveryMethod === "delivery" ? {
      //     address: shippingInfo.address,
      //     city: shippingInfo.city,
      //     postalCode: shippingInfo.postalCode,
      //   } : null,
      //   paymentMethod,
      //   total: getTotalPrice(),
      //   status: "pending_seller_confirmation",
      // };
      // await createOrder(orderData);

      // Clear cart
      await clearCart();

      // Redirect to order confirmation page
      router.push(`/order/${orderId}`);
    } catch (error) {
      console.error("Order failed:", error);
      alert("Failed to place order. Please try again.");
      setIsProcessing(false);
    }
  };

  // Show loading state during SSR, initial mount, or auth check
  if (!isMounted || isCheckingAuth) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4 sm:px-6 lg:px-16 max-w-6xl">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-48 mb-8"></div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-6">
                <div className="bg-white rounded-lg shadow-sm p-6 h-96"></div>
                <div className="bg-white rounded-lg shadow-sm p-6 h-64"></div>
              </div>
              <div className="lg:col-span-1">
                <div className="bg-white rounded-lg shadow-sm p-6 h-96"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show verification required page if not verified
  if (!isVerified) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4 sm:px-6 lg:px-16 max-w-2xl">
          <div className="bg-white rounded-lg shadow-sm p-8 md:p-12 text-center">
            <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertCircle className="w-12 h-12 text-yellow-600" />
            </div>

            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
              Verification Required
            </h1>

            <p className="text-gray-600 mb-6 leading-relaxed">
              To place an order, you need to verify your identity first. This
              helps us maintain a safe and trusted marketplace for all users.
            </p>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <p className="text-sm text-blue-800">
                <strong>Why verify?</strong>
              </p>
              <ul className="text-sm text-blue-700 mt-2 space-y-1 text-left list-disc list-inside">
                <li>Build trust with sellers</li>
                <li>Secure your transactions</li>
                <li>Unlock full marketplace features</li>
              </ul>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={() => router.push("/verify-identity")}
                className="px-6 py-3 bg-[#84B067] text-white rounded-lg hover:bg-[#69773D] transition font-semibold flex items-center justify-center gap-2"
              >
                <CheckCircle2 className="w-5 h-5" />
                Verify My Identity
              </button>

              <button
                onClick={() => router.push("/marketplace")}
                className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-semibold"
              >
                Back to Marketplace
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Redirect if cart is empty (after mount and auth check)
  if (items.length === 0) {
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
              {/* Delivery Method */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Truck className="w-5 h-5 text-[#84B067]" />
                  <h2 className="text-xl font-bold text-gray-900">
                    Delivery Method
                  </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Self Pick-up */}
                  <label
                    className={`flex items-start gap-3 p-4 border-2 rounded-lg cursor-pointer transition ${
                      deliveryMethod === "pickup"
                        ? "border-[#84B067] bg-green-50"
                        : "border-gray-300 hover:border-[#84B067]"
                    }`}
                  >
                    <input
                      type="radio"
                      name="delivery"
                      value="pickup"
                      checked={deliveryMethod === "pickup"}
                      onChange={(e) =>
                        setDeliveryMethod(e.target.value as DeliveryMethod)
                      }
                      className="w-4 h-4 text-[#84B067] mt-1"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Store className="w-5 h-5 text-[#84B067]" />
                        <div className="font-medium">Self Pick-up</div>
                      </div>
                      <div className="text-sm text-gray-600">
                        Meet with seller at agreed location
                      </div>
                    </div>
                  </label>

                  {/* Delivery */}
                  <label
                    className={`flex items-start gap-3 p-4 border-2 rounded-lg cursor-pointer transition ${
                      deliveryMethod === "delivery"
                        ? "border-[#84B067] bg-green-50"
                        : "border-gray-300 hover:border-[#84B067]"
                    }`}
                  >
                    <input
                      type="radio"
                      name="delivery"
                      value="delivery"
                      checked={deliveryMethod === "delivery"}
                      onChange={(e) =>
                        setDeliveryMethod(e.target.value as DeliveryMethod)
                      }
                      className="w-4 h-4 text-[#84B067] mt-1"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Truck className="w-5 h-5 text-[#84B067]" />
                        <div className="font-medium">Delivery</div>
                      </div>
                      <div className="text-sm text-gray-600">
                        Deliver to your address
                      </div>
                    </div>
                  </label>
                </div>
              </div>

              {/* Contact Information */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center gap-2 mb-4">
                  <User className="w-5 h-5 text-[#84B067]" />
                  <h2 className="text-xl font-bold text-gray-900">
                    Contact Information
                  </h2>
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
                        setShippingInfo({
                          ...shippingInfo,
                          fullName: e.target.value,
                        })
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
                        setShippingInfo({
                          ...shippingInfo,
                          phone: e.target.value,
                        })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#84B067]"
                      placeholder="081-234-5678"
                    />
                  </div>
                </div>
              </div>

              {/* Shipping Address - Only show if delivery selected */}
              {deliveryMethod === "delivery" && (
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <MapPin className="w-5 h-5 text-[#84B067]" />
                    <h2 className="text-xl font-bold text-gray-900">
                      Shipping Address
                    </h2>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Address *
                      </label>
                      <textarea
                        required
                        value={shippingInfo.address}
                        onChange={(e) =>
                          setShippingInfo({
                            ...shippingInfo,
                            address: e.target.value,
                          })
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
                            setShippingInfo({
                              ...shippingInfo,
                              city: e.target.value,
                            })
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
                            setShippingInfo({
                              ...shippingInfo,
                              postalCode: e.target.value,
                            })
                          }
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#84B067]"
                          placeholder="10110"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Payment Method */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Wallet className="w-5 h-5 text-[#84B067]" />
                  <h2 className="text-xl font-bold text-gray-900">
                    Payment Method
                  </h2>
                </div>

                <div className="space-y-3">
                  {/* Cash Payment */}
                  <label
                    className={`flex items-center gap-3 p-4 border-2 rounded-lg cursor-pointer transition ${
                      paymentMethod === "cash"
                        ? "border-[#84B067] bg-green-50"
                        : "border-gray-300 hover:border-[#84B067]"
                    }`}
                  >
                    <input
                      type="radio"
                      name="payment"
                      value="cash"
                      checked={paymentMethod === "cash"}
                      onChange={(e) =>
                        setPaymentMethod(e.target.value as PaymentMethod)
                      }
                      className="w-4 h-4 text-[#84B067]"
                    />
                    <Package className="w-5 h-5 text-[#84B067]" />
                    <div className="flex-1">
                      <div className="font-medium">Cash</div>
                      <div className="text-sm text-gray-600">
                        Pay when you receive the item
                      </div>
                    </div>
                  </label>

                  {/* PromptPay Payment */}
                  <label
                    className={`flex items-center gap-3 p-4 border-2 rounded-lg cursor-pointer transition ${
                      paymentMethod === "promptpay"
                        ? "border-[#84B067] bg-green-50"
                        : "border-gray-300 hover:border-[#84B067]"
                    }`}
                  >
                    <input
                      type="radio"
                      name="payment"
                      value="promptpay"
                      checked={paymentMethod === "promptpay"}
                      onChange={(e) =>
                        setPaymentMethod(e.target.value as PaymentMethod)
                      }
                      className="w-4 h-4 text-[#84B067]"
                    />
                    <QrCode className="w-5 h-5 text-[#84B067]" />
                    <div className="flex-1">
                      <div className="font-medium">PromptPay</div>
                      <div className="text-sm text-gray-600">
                        Transfer via QR Code
                      </div>
                    </div>
                  </label>

                  {/* Show QR Code if PromptPay selected */}
                  {paymentMethod === "promptpay" && (
                    <div className="mt-4 p-6 bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg border-2 border-blue-200">
                      <div className="text-center mb-4">
                        <h3 className="text-lg font-bold text-gray-900 mb-2">
                          Scan QR Code to Pay
                        </h3>
                        <p className="text-sm text-gray-600">
                          Amount:{" "}
                          <span className="font-bold text-[#84B067]">
                            ฿{getTotalPrice().toLocaleString("th-TH")}
                          </span>
                        </p>
                      </div>

                      {/* QR Code Placeholder */}
                      <div className="flex justify-center mb-4">
                        <div className="bg-white p-4 rounded-lg shadow-md">
                          <div className="w-48 h-48 bg-white border-2 border-gray-300 rounded-lg flex items-center justify-center">
                            <div className="text-center">
                              <QrCode className="w-16 h-16 mx-auto mb-2 text-gray-400" />
                              <p className="text-xs text-gray-500">
                                Payment QR Code
                              </p>
                              <p className="text-xs text-gray-400 mt-1">
                                (Will be displayed after order confirmation)
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                        <div className="flex items-start gap-2">
                          <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                          <div className="text-sm text-yellow-800">
                            <p className="font-medium mb-1">Note:</p>
                            <ul className="list-disc list-inside space-y-1 text-xs">
                              <li>Please transfer within 24 hours</li>
                              <li>Keep your payment proof for verification</li>
                              <li>
                                Seller will confirm order after payment
                                verification
                              </li>
                            </ul>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-sm p-6 sticky top-24">
                <h2 className="text-xl font-bold text-gray-900 mb-4">
                  Order Summary
                </h2>

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
                        <p className="text-sm text-gray-600">
                          Qty: {item.quantity}
                        </p>
                        <p className="text-sm font-bold text-[#84B067]">
                          ฿
                          {(item.price * item.quantity).toLocaleString("th-TH")}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="space-y-3 mb-6 border-t pt-4">
                  <div className="flex justify-between text-gray-600">
                    <span>Subtotal</span>
                    <span>฿{getTotalPrice().toLocaleString("th-TH")}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Shipping</span>
                    <span className="text-green-600">Free</span>
                  </div>
                  <div className="border-t pt-3 flex justify-between text-lg font-bold text-gray-900">
                    <span>Total</span>
                    <span className="text-[#84B067]">
                      ฿{getTotalPrice().toLocaleString("th-TH")}
                    </span>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isProcessing}
                  className="w-full px-6 py-3 bg-[#84B067] text-white rounded-lg hover:bg-[#69773D] transition font-semibold disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  {isProcessing ? "Processing..." : "Confirm Order"}
                </button>

                {/* Order Info */}
                <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div className="text-xs text-blue-800">
                      <p className="font-medium mb-1">Order Details:</p>
                      <p className="mb-1">
                        <span className="font-medium">Delivery:</span>{" "}
                        {deliveryMethod === "pickup"
                          ? "Self Pick-up (Meetup point will be arranged)"
                          : "Delivery to your address"}
                      </p>
                      <p>
                        <span className="font-medium">Payment:</span>{" "}
                        {paymentMethod === "cash"
                          ? "Cash (Pay when receiving)"
                          : "PromptPay (Transfer within 24 hours)"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>

      {/* Confirmation Modal */}
      {showConfirmation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              {/* Header */}
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle2 className="w-10 h-10 text-blue-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  Confirm Your Order
                </h2>
                <p className="text-gray-600 text-sm">
                  Please review the details before confirming
                </p>
              </div>

              {/* Order Summary */}
              <div className="space-y-4 mb-6">
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 mb-3">
                    Order Items ({items.length} items)
                  </h3>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {items.map((item) => (
                      <div
                        key={item.id}
                        className="flex justify-between text-sm"
                      >
                        <span className="text-gray-700 flex-1 mr-2 line-clamp-1">
                          {item.title} x{item.quantity}
                        </span>
                        <span className="font-medium text-gray-900 whitespace-nowrap">
                          ฿
                          {(item.price * item.quantity).toLocaleString("th-TH")}
                        </span>
                      </div>
                    ))}
                  </div>
                  <div className="border-t mt-3 pt-3">
                    <div className="flex justify-between font-bold text-lg">
                      <span>Total</span>
                      <span className="text-[#84B067]">
                        ฿{getTotalPrice().toLocaleString("th-TH")}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Contact & Delivery Info */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 mb-2">
                    {deliveryMethod === "pickup"
                      ? "Contact & Pickup Info"
                      : "Delivery Information"}
                  </h3>
                  <div className="text-sm text-gray-700 space-y-1">
                    <p>
                      <span className="font-medium">Name:</span>{" "}
                      {shippingInfo.fullName}
                    </p>
                    <p>
                      <span className="font-medium">Phone:</span>{" "}
                      {shippingInfo.phone}
                    </p>
                    {deliveryMethod === "delivery" && (
                      <>
                        <p>
                          <span className="font-medium">Address:</span>{" "}
                          {shippingInfo.address}
                        </p>
                        <p>
                          {shippingInfo.city} {shippingInfo.postalCode}
                        </p>
                      </>
                    )}
                    {deliveryMethod === "pickup" && (
                      <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded">
                        <p className="text-xs text-blue-800">
                          <Store className="w-4 h-4 inline mr-1" />
                          Meetup location will be arranged with seller after
                          confirmation
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Payment Method */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 mb-2">
                    Payment Method
                  </h3>
                  <div className="flex items-center gap-2 text-sm text-gray-700">
                    {paymentMethod === "cash" ? (
                      <>
                        <Package className="w-5 h-5 text-[#84B067]" />
                        <span>Cash (Pay when receiving)</span>
                      </>
                    ) : (
                      <>
                        <QrCode className="w-5 h-5 text-[#84B067]" />
                        <span>PromptPay (Transfer within 24 hours)</span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Important Notice */}
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-yellow-800">
                    <p className="font-medium mb-1">Important:</p>
                    <ul className="list-disc list-inside space-y-1 text-xs">
                      <li>Order will be sent to seller for confirmation</li>
                      <li>
                        Wait for seller confirmation (approximately 1-2 days)
                      </li>
                      {deliveryMethod === "pickup" && (
                        <li className="text-orange-700 font-medium">
                          Meetup point will be arranged after seller confirms
                        </li>
                      )}
                      {paymentMethod === "promptpay" && (
                        <li className="text-orange-700 font-medium">
                          Please transfer within 24 hours
                        </li>
                      )}
                      <li>Track order status in your order history</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={() => setShowConfirmation(false)}
                  disabled={isProcessing}
                  className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmOrder}
                  disabled={isProcessing}
                  className="flex-1 px-6 py-3 bg-[#84B067] text-white rounded-lg hover:bg-[#69773D] transition font-semibold disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isProcessing ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Sending order...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-5 h-5" />
                      <span>Confirm Order</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
