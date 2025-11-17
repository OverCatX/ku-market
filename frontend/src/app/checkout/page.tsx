"use client";

import { useCart } from "@/contexts/CartContext";
import { getVerificationStatus } from "@/config/verification";
import { useState, useEffect, useRef } from "react";
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
import { API_BASE } from "@/config/constants";
import toast from "react-hot-toast";
import type { Dispatch, MouseEvent, SetStateAction } from "react";

type PaymentMethod = "cash" | "promptpay";
type DeliveryMethod = "pickup" | "delivery";

interface ShippingInfo {
  fullName: string;
  phone: string;
  address: string;
  city: string;
  postalCode: string;
}

interface PickupDetailsState {
  locationName: string;
  address: string;
  note: string;
  marker?: {
    percentX: number;
    percentY: number;
  };
  coordinates?: {
    lat: number;
    lng: number;
  };
}

export default function CheckoutPage() {
  const { items, getTotalPrice, clearCart, refreshCart } = useCart();
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
  const [pickupDetails, setPickupDetails] = useState<PickupDetailsState>({
    locationName: "",
    address: "",
    note: "",
  });

  // Wait for client-side mount
  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (deliveryMethod !== "pickup") {
      return;
    }
    setPickupDetails((prev) => {
      if (prev.marker && prev.coordinates && prev.locationName) {
        return prev;
      }
      return {
        ...prev,
        marker: prev.marker ?? { percentX: 0.5, percentY: 0.5 },
        coordinates: prev.coordinates ?? { lat: 13.736717, lng: 100.523186 },
        locationName:
          prev.locationName || "Kasetsart University front entrance",
      };
    });
  }, [deliveryMethod]);

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
        // Not verified - attempt to refresh verification status from server
        (async () => {
          try {
            const statusRes = await getVerificationStatus();
            const approved =
              statusRes.success &&
              statusRes.verification &&
              (statusRes.verification as { status?: string }).status ===
                "approved";
            if (approved) {
              setIsVerified(true);
              // Update localStorage user to reflect verified status so other pages update immediately
              try {
                const latestUserStr = localStorage.getItem("user");
                const latestUser = latestUserStr
                  ? JSON.parse(latestUserStr)
                  : user;
                const updatedUser = { ...latestUser, isVerified: true };
                localStorage.setItem("user", JSON.stringify(updatedUser));
              } catch {
                // ignore storage errors
              }
            } else {
              setIsVerified(false);
            }
          } catch {
            setIsVerified(false);
          }
        })();
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

    // Strong client-side validation
    const name = (shippingInfo.fullName || "").trim();
    const rawPhone = (shippingInfo.phone || "").trim();
    const phone = rawPhone.replace(/\D/g, ""); // keep digits only
    const address = (shippingInfo.address || "").trim();
    const city = (shippingInfo.city || "").trim();
    const postal = (shippingInfo.postalCode || "").trim();

    // Basic required fields
    if (!name) {
      toast.error("Please enter your full name");
      return;
    }

    // Thailand mobile format: exactly 10 digits and starts with 0
    const thPhoneStrict = /^0\d{9}$/;
    if (!thPhoneStrict.test(phone)) {
      toast.error(
        "Please enter a valid 10-digit Thai phone number (starts with 0)"
      );
      return;
    }

    if (deliveryMethod === "delivery") {
      if (!address || address.length < 5) {
        toast.error("Please enter a valid address (min 5 characters)");
        return;
      }
      if (!city || city.length < 2) {
        toast.error("Please enter a valid city");
        return;
      }
      // Thailand postal code (5 digits) or allow 3-10 digits for international
      const thPostal = /^\d{5}$/;
      const intlPostal = /^\w[\w\s-]{2,9}$/;
      if (!(thPostal.test(postal) || intlPostal.test(postal))) {
        toast.error("Please enter a valid postal code");
        return;
      }
    }

    if (deliveryMethod === "pickup") {
      if (!pickupDetails.locationName.trim()) {
        toast.error("Please enter a pickup location name");
        return;
      }
    }

    // Inform buyer and show confirmation dialog before sending to seller
    toast("Please confirm your order details before sending to seller", {
      icon: "🧾",
    });
    setShowConfirmation(true);
  };

  const handleConfirmOrder = async () => {
    setIsProcessing(true);

    try {
      const token = localStorage.getItem("authentication");
      if (!token) {
        router.push("/login?redirect=/checkout");
        return;
      }

      // Normalize and trim before sending
      const normalizedInfo = {
        fullName: (shippingInfo.fullName || "").trim(),
        phone: (shippingInfo.phone || "").trim().replace(/\D/g, ""),
        address: (shippingInfo.address || "").trim(),
        city: (shippingInfo.city || "").trim(),
        postalCode: (shippingInfo.postalCode || "").trim(),
      };

      const payload: {
        deliveryMethod: DeliveryMethod;
        paymentMethod: PaymentMethod;
        buyerContact: { fullName: string; phone: string };
        shippingAddress?: { address: string; city: string; postalCode: string };
        pickupDetails?: {
          locationName: string;
          address?: string;
          note?: string;
          coordinates?: { lat: number; lng: number };
        };
      } = {
        deliveryMethod,
        paymentMethod,
        buyerContact: {
          fullName: normalizedInfo.fullName,
          phone: normalizedInfo.phone,
        },
      };

      if (deliveryMethod === "delivery") {
        payload.shippingAddress = {
          address: normalizedInfo.address,
          city: normalizedInfo.city,
          postalCode: normalizedInfo.postalCode,
        };
      } else {
        payload.pickupDetails = {
          locationName: pickupDetails.locationName.trim(),
          address: pickupDetails.address.trim() || undefined,
          note: pickupDetails.note.trim() || undefined,
          coordinates: pickupDetails.coordinates,
        };
      }

      const response = await fetch(`${API_BASE}/api/orders/checkout`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        credentials: "include",
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const message =
          errorData.error || errorData.message || "Failed to place order";
        if (
          String(message).toLowerCase().includes("invalid") ||
          String(message).toLowerCase().includes("no longer available")
        ) {
          toast.error(
            "Some items are no longer available. We've updated your cart."
          );
          try {
            await refreshCart();
          } catch {}
        }
        throw new Error(message);
      }

      const data = await response.json();
      const orderId = data?.orders?.[0]?.id;

      await clearCart();

      if (orderId) {
        toast.success("Order placed! You can track the status in Orders.");
        router.push(`/order/${orderId}`);
      } else {
        toast.success("Order placed! You can track the status in Orders.");
        router.push("/orders");
      }
    } catch (error) {
      console.error("Order failed:", error);
      const msg =
        error instanceof Error
          ? error.message
          : "Failed to place order. Please try again.";
      toast.error(msg);
      setIsProcessing(false);
    }
  };

  // Show loading state during SSR, initial mount, or auth check
  if (!isMounted || isCheckingAuth) {
    return (
      <div className="min-h-screen py-8" style={{ backgroundColor: '#F6F2E5' }}>
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

  type FakeMapProps = {
    pickupDetails: PickupDetailsState;
    onChange: Dispatch<SetStateAction<PickupDetailsState>>;
  };

  function FakeMap({ pickupDetails, onChange }: FakeMapProps) {
    const containerRef = useRef<HTMLDivElement | null>(null);

    const handleClick = (event: MouseEvent<HTMLDivElement>) => {
      const rect = containerRef.current?.getBoundingClientRect();
      if (!rect) {
        return;
      }
      const relativeX = event.clientX - rect.left;
      const relativeY = event.clientY - rect.top;
      const percentX = Math.min(Math.max(relativeX / rect.width, 0), 1);
      const percentY = Math.min(Math.max(relativeY / rect.height, 0), 1);

      const latBase = 13.736717;
      const lngBase = 100.523186;
      const lat = latBase + 0.02 * (0.5 - percentY);
      const lng = lngBase + 0.02 * (percentX - 0.5);

      onChange((prev) => ({
        ...prev,
        marker: { percentX, percentY },
        coordinates: {
          lat: Number(lat.toFixed(6)),
          lng: Number(lng.toFixed(6)),
        },
        locationName: prev.locationName.trim() || "Custom pick-up spot",
      }));
    };

    return (
      <div className="space-y-3">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm font-medium text-gray-700">
              Tap on the map to drop a pin
            </p>
            <p className="text-xs text-gray-500">
              This lightweight mock map helps you communicate the meetup point
              to the seller.
            </p>
          </div>
          <span className="rounded-full bg-[#eef5df] px-3 py-1 text-xs font-semibold text-[#4c5c2f]">
            Demo map
          </span>
        </div>
        <div
          ref={containerRef}
          onClick={handleClick}
          className="group relative h-64 cursor-crosshair overflow-hidden rounded-2xl border-2 border-dashed border-[#cbd9b5] focus:outline-none focus:ring-2 focus:ring-[#84B067]"
          style={{
            backgroundImage:
              "linear-gradient(90deg, rgba(132,176,103,0.08) 1px, transparent 1px), linear-gradient(180deg, rgba(132,176,103,0.08) 1px, transparent 1px)",
            backgroundSize: "32px 32px",
            backgroundColor: "#f5f9ef",
          }}
        >
          <div className="absolute inset-0 pointer-events-none bg-gradient-to-br from-[#f4f9ed] via-[#fbfff5] to-[#e2f0d1]" />
          {pickupDetails.marker && (
            <span
              className="absolute -translate-x-1/2 -translate-y-1/2 flex h-7 w-7 items-center justify-center rounded-full bg-[#84B067] text-xs font-semibold text-white shadow-lg ring-2 ring-white"
              style={{
                left: `${pickupDetails.marker.percentX * 100}%`,
                top: `${pickupDetails.marker.percentY * 100}%`,
              }}
            >
              ●
            </span>
          )}
          <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity group-hover:opacity-100">
            <div className="absolute left-1/2 top-0 h-full w-px bg-[#84B067]/40" />
            <div className="absolute left-0 top-1/2 h-px w-full bg-[#84B067]/40" />
          </div>
        </div>
      </div>
    );
  }

  // Show verification required page if not verified
  if (!isVerified) {
    return (
      <div className="min-h-screen py-8" style={{ backgroundColor: '#F6F2E5' }}>
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
    <div className="min-h-screen py-8" style={{ backgroundColor: '#F6F2E5' }}>
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
              {deliveryMethod === "pickup" && (
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <MapPin className="w-5 h-5 text-[#84B067]" />
                    <h2 className="text-xl font-bold text-gray-900">
                      Pickup spot preview
                    </h2>
                  </div>
                  <div className="space-y-4">
                    <div className="grid gap-3 sm:grid-cols-2">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Location name *
                        </label>
                        <input
                          type="text"
                          value={pickupDetails.locationName}
                          onChange={(e) =>
                            setPickupDetails((prev) => ({
                              ...prev,
                              locationName: e.target.value,
                            }))
                          }
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#84B067]"
                          placeholder="Building A - Gate 3"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Address / landmark (optional)
                        </label>
                        <input
                          type="text"
                          value={pickupDetails.address}
                          onChange={(e) =>
                            setPickupDetails((prev) => ({
                              ...prev,
                              address: e.target.value,
                            }))
                          }
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#84B067]"
                          placeholder="Near KU Library"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Note for seller (optional)
                      </label>
                      <textarea
                        value={pickupDetails.note}
                        onChange={(e) =>
                          setPickupDetails((prev) => ({
                            ...prev,
                            note: e.target.value,
                          }))
                        }
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#84B067]"
                        rows={2}
                        placeholder="I'm wearing a green jacket, will arrive about 10 minutes early."
                      />
                    </div>
                    <FakeMap
                      pickupDetails={pickupDetails}
                      onChange={setPickupDetails}
                    />
                    {pickupDetails.coordinates && (
                      <p className="text-xs text-gray-500">
                        Selected coordinates:{" "}
                        {pickupDetails.coordinates.lat.toFixed(5)},{" "}
                        {pickupDetails.coordinates.lng.toFixed(5)}
                      </p>
                    )}
                  </div>
                </div>
              )}

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
                        {deliveryMethod === "pickup" ? (
                          <>
                            Self Pick-up{" "}
                            {pickupDetails.locationName
                              ? `– ${pickupDetails.locationName}`
                              : "(Set meetup point before confirming)"}
                          </>
                        ) : (
                          "Delivery to your address"
                        )}
                      </p>
                      {deliveryMethod === "pickup" && pickupDetails.address && (
                        <p className="mb-1">
                          <span className="font-medium">Meetup landmark:</span>{" "}
                          {pickupDetails.address}
                        </p>
                      )}
                      {deliveryMethod === "pickup" && pickupDetails.note && (
                        <p className="mb-1">
                          <span className="font-medium">Your note:</span>{" "}
                          {pickupDetails.note}
                        </p>
                      )}
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
        <div className="fixed inset-0 bg-black/40 backdrop-blur-md flex items-center justify-center z-50 p-4">
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
                      <div className="mt-2 space-y-1 rounded border border-[#d6e4c3] bg-[#f8fbef] p-3 text-xs text-[#3f4e24]">
                        <p className="font-semibold text-[#2f3b11]">
                          <Store className="mr-1 inline h-4 w-4 text-[#84B067]" />
                          Pickup location
                        </p>
                        <p className="font-medium">
                          {pickupDetails.locationName || "Not specified yet"}
                        </p>
                        {pickupDetails.address && (
                          <p>{pickupDetails.address}</p>
                        )}
                        {pickupDetails.coordinates && (
                          <p className="text-[11px] text-gray-500">
                            Coordinates:{" "}
                            {pickupDetails.coordinates.lat.toFixed(5)},{" "}
                            {pickupDetails.coordinates.lng.toFixed(5)}
                          </p>
                        )}
                        {pickupDetails.note && (
                          <p className="text-[11px] text-gray-500">
                            Your note: {pickupDetails.note}
                          </p>
                        )}
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
                          You can adjust the meetup point anytime until the
                          seller confirms
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
