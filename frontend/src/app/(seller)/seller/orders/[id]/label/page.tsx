"use client";

import type { ReactElement } from "react";
import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Printer } from "lucide-react";
import toast from "react-hot-toast";
import { API_BASE } from "@/config/constants";

interface OrderItem {
  itemId: string;
  title: string;
  price: number;
  quantity: number;
  image?: string;
}

interface ShippingAddress {
  address: string;
  city: string;
  postalCode: string;
}

interface SenderAddress {
  address: string;
  city: string;
  postalCode: string;
}

interface OrderDetailResponse {
  order: {
    id: string;
    items: OrderItem[];
    totalPrice: number;
    status: string;
    deliveryMethod: "pickup" | "delivery";
    shippingAddress?: ShippingAddress;
    paymentMethod: "cash" | "transfer";
    buyerContact: {
      fullName: string;
      phone: string;
    };
    createdAt: string;
    confirmedAt?: string;
    rejectedAt?: string;
    rejectionReason?: string;
    completedAt?: string;
    updatedAt: string;
  };
  buyer: {
    id: string;
    name?: string;
    email?: string;
    phone?: string;
  };
  seller: {
    id: string;
    name?: string;
    email?: string;
    phone?: string;
    shopName: string;
    shopType: string;
  };
}

export default function SellerOrderLabelPage(): ReactElement {
  const params = useParams();
  const router = useRouter();
  const orderId = useMemo(() => {
    const rawId = params?.id;
    if (!rawId) return null;
    return Array.isArray(rawId) ? rawId[0] : rawId;
  }, [params]);

  const [data, setData] = useState<OrderDetailResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [senderAddress, setSenderAddress] = useState<SenderAddress>({
    address: "",
    city: "",
    postalCode: "",
  });
  const [originalSenderAddress, setOriginalSenderAddress] = useState<SenderAddress>({
    address: "",
    city: "",
    postalCode: "",
  });
  const [isEditingSender, setIsEditingSender] = useState(false);

  // Load sender address from backend or localStorage
  useEffect(() => {
    const loadSenderAddress = async () => {
      const token = typeof window !== "undefined" ? localStorage.getItem("authentication") : null;
      if (!token) {
        // Fallback to localStorage if not logged in
        const saved = localStorage.getItem("senderAddress");
        if (saved) {
          try {
            const loaded = JSON.parse(saved);
            setSenderAddress(loaded);
            setOriginalSenderAddress(loaded);
          } catch {
            // Invalid JSON, ignore
          }
        }
        return;
      }

      try {
        const response = await fetch(`${API_BASE}/api/shop/sender-address`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const result = await response.json();
          if (result.success && result.senderAddress) {
            const addr = result.senderAddress;
            // Only set if address exists (not empty)
            if (addr.address || addr.city || addr.postalCode) {
              const loadedAddress = {
                address: addr.address || "",
                city: addr.city || "",
                postalCode: addr.postalCode || "",
              };
              setSenderAddress(loadedAddress);
              setOriginalSenderAddress(loadedAddress);
            }
          }
        }
      } catch (error) {
        console.error("Failed to load sender address from backend:", error);
        // Fallback to localStorage
        const saved = localStorage.getItem("senderAddress");
        if (saved) {
          try {
            const loaded = JSON.parse(saved);
            setSenderAddress(loaded);
            setOriginalSenderAddress(loaded);
          } catch {
            // Invalid JSON, ignore
          }
        }
      }
    };

    void loadSenderAddress();
  }, [orderId]);

  // Show warning toast when sender address is missing after data loads
  useEffect(() => {
    if (!loading && data && !isEditingSender) {
      const hasAddress = !!(senderAddress.address && senderAddress.city && senderAddress.postalCode);
      if (!hasAddress && data.order.deliveryMethod === "delivery") {
        // Show toast once when page loads
        const hasShownWarning = sessionStorage.getItem("senderAddressWarningShown");
        if (!hasShownWarning) {
          toast(
            (t) => (
              <div className="flex items-center gap-2">
                <span>⚠️ Please add your sender address for the delivery label</span>
                <button
                  onClick={() => {
                    setOriginalSenderAddress({ ...senderAddress });
                    setIsEditingSender(true);
                    toast.dismiss(t.id);
                  }}
                  className="text-yellow-800 underline font-medium text-sm"
                >
                  Add Now
                </button>
              </div>
            ),
            {
              duration: 5000,
              icon: "⚠️",
            }
          );
          sessionStorage.setItem("senderAddressWarningShown", "true");
        }
      }
    }
  }, [loading, data, senderAddress, isEditingSender]);

  // Clear warning flag when address is saved
  useEffect(() => {
    const hasAddress = !!(senderAddress.address && senderAddress.city && senderAddress.postalCode);
    if (hasAddress) {
      sessionStorage.removeItem("senderAddressWarningShown");
    }
  }, [senderAddress]);

  useEffect(() => {
    if (!orderId) {
      setLoading(false);
      return;
    }

    const token = typeof window !== "undefined" ? localStorage.getItem("authentication") : null;
    if (!token) {
      toast.error("Please login first");
      router.replace("/login?redirect=/seller/orders");
      return;
    }

    const loadOrder = async () => {
      setLoading(true);
      try {
        const response = await fetch(`${API_BASE}/api/seller/orders/${orderId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.error || "Failed to load order");
        }

        const payload: OrderDetailResponse = await response.json();
        setData(payload);
      } catch (error) {
        console.error("Failed to load label data:", error);
        toast.error(error instanceof Error ? error.message : "Failed to load order");
        router.push("/seller/orders");
      } finally {
        setLoading(false);
      }
    };

    void loadOrder();
  }, [orderId, router]);

  const handleSenderAddressChange = (field: keyof SenderAddress, value: string) => {
    const updated = { ...senderAddress, [field]: value };
    setSenderAddress(updated);
    // Save to localStorage as backup
    if (typeof window !== "undefined") {
      localStorage.setItem("senderAddress", JSON.stringify(updated));
    }
  };

  const handleSaveSenderAddress = async () => {
    if (!senderAddress.address || !senderAddress.city || !senderAddress.postalCode) {
      toast.error("Please fill in all sender address fields");
      return;
    }

    const token = typeof window !== "undefined" ? localStorage.getItem("authentication") : null;
    if (!token) {
      // Fallback to localStorage only
      setIsEditingSender(false);
      toast.success("Sender address saved locally");
      return;
    }

    try {
      const response = await fetch(`${API_BASE}/api/shop/sender-address`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(senderAddress),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to save sender address");
      }

      setIsEditingSender(false);
      setOriginalSenderAddress(senderAddress);
      toast.success("Sender address saved successfully");
    } catch (error) {
      console.error("Failed to save sender address:", error);
      toast.error(error instanceof Error ? error.message : "Failed to save sender address");
      // Still save to localStorage as backup
      setIsEditingSender(false);
      toast("Saved locally as backup");
    }
  };

  const isDeliveryOrder = useMemo(() => data?.order.deliveryMethod === "delivery", [data?.order.deliveryMethod]);

  const formattedAddress = useMemo(() => {
    if (!data?.order.shippingAddress) return "No shipping address provided";
    const address = data.order.shippingAddress;
    return `${address.address}, ${address.city} ${address.postalCode}`;
  }, [data?.order.shippingAddress]);

  const formattedDate = useMemo(() => {
    if (!data?.order.createdAt) return "";
    try {
      return new Intl.DateTimeFormat("th-TH", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }).format(new Date(data.order.createdAt));
    } catch {
      return new Date(data.order.createdAt).toLocaleString();
    }
  }, [data?.order.createdAt]);

  if (loading) {
    return (
      <div className="flex flex-col gap-4 animate-pulse bg-white rounded-xl p-6 shadow-sm">
        <div className="h-6 w-40 bg-gray-200 rounded" />
        <div className="h-72 bg-gray-200 rounded-lg" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-6">
        <p className="text-gray-600">Order information not available.</p>
        <button
          onClick={() => router.push("/seller/orders")}
          className="mt-4 inline-flex items-center gap-2 text-[#5C8140] hover:text-[#4a6b33] font-semibold"
        >
          <ArrowLeft size={18} />
          Back to orders
        </button>
      </div>
    );
  }

  if (!isDeliveryOrder) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h1 className="text-xl font-bold text-[#4A5130] mb-2">Delivery slip not available</h1>
        <p className="text-[#69773D]">This order is set as pickup. Labels are available only for delivery orders.</p>
        <button
          onClick={() => router.push("/seller/orders")}
          className="mt-4 inline-flex items-center gap-2 text-[#5C8140] hover:text-[#4a6b33] font-semibold"
        >
          <ArrowLeft size={18} />
          Back to orders
        </button>
      </div>
    );
  }

  const labelRef = data.order.id.slice(-8).toUpperCase();
  const hasSenderAddress = !!(senderAddress.address && senderAddress.city && senderAddress.postalCode);

  return (
    <div className="min-h-screen p-6 print:bg-white print:p-0" style={{ backgroundColor: '#F6F2E5' }}>
      {/* Warning banner if sender address is missing */}
      {!hasSenderAddress && !isEditingSender && (
        <div className="max-w-4xl mx-auto mb-4 print:hidden">
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-r-lg shadow-sm">
            <div className="flex items-start justify-between">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3 flex-1">
                  <h3 className="text-sm font-medium text-yellow-800">
                    Sender Address Required
                  </h3>
                  <p className="mt-1 text-sm text-yellow-700">
                    Please add your sender address to complete the delivery label. This information is required for shipping labels.
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setOriginalSenderAddress({ ...senderAddress });
                  setIsEditingSender(true);
                }}
                className="ml-4 flex-shrink-0 inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-yellow-800 bg-yellow-100 hover:bg-yellow-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500"
              >
                Add Address Now
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex justify-between items-center max-w-4xl mx-auto mb-4 print:hidden">
        <button
          onClick={() => router.push("/seller/orders")}
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors font-medium"
        >
          <ArrowLeft size={18} />
          Back
        </button>
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-500">Order #{labelRef}</span>
          <button
            onClick={() => window.print()}
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#69773D] text-white rounded-lg hover:bg-[#5a6530] transition-colors font-semibold shadow-sm"
          >
            <Printer size={18} />
            Print
          </button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-xl border border-gray-200 overflow-hidden print:shadow-none print:border print:rounded-none">
        <div className="p-6 border-b border-gray-200 flex items-center justify-between bg-[#69773D] text-[#F6F2E5] print:bg-white print:text-gray-900">
          <div>
            <h1 className="text-2xl font-bold">KU Market Delivery Slip</h1>
            <p className="text-sm opacity-90">Order #{labelRef}</p>
          </div>
          <div className="text-right">
            <p className="text-sm font-semibold">Issued: {formattedDate}</p>
            <p className="text-sm uppercase tracking-wide">Delivery</p>
          </div>
        </div>

        <div className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="border border-gray-200 rounded-lg p-4 bg-[#F6F2E5]/30">
              <div className="flex justify-between items-start mb-2 print:hidden">
                <h2 className="text-sm font-semibold text-gray-500 uppercase">Sender</h2>
                {!isEditingSender && (
                  <button
                    onClick={() => {
                      setOriginalSenderAddress({ ...senderAddress });
                      setIsEditingSender(true);
                    }}
                    className="text-xs text-[#69773D] hover:text-[#5a6530] font-medium"
                  >
                    Edit Address
                  </button>
                )}
              </div>
              <h2 className="text-sm font-semibold text-gray-500 uppercase mb-2 hidden print:block">Sender</h2>
              <p className="text-lg font-bold text-gray-900">{data.seller.shopName || data.seller.name}</p>
              <p className="text-sm text-gray-600 mt-1">{data.seller.name}</p>
              {data.seller.phone && <p className="text-sm text-gray-600 mt-1">Phone: {data.seller.phone}</p>}
              <p className="text-sm text-gray-500 mt-1">{data.seller.email}</p>
              
              {isEditingSender ? (
                <div className="mt-4 space-y-3 print:hidden">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Address</label>
                    <input
                      type="text"
                      value={senderAddress.address}
                      onChange={(e) => handleSenderAddressChange("address", e.target.value)}
                      placeholder="Enter street address"
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#69773D]"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">City</label>
                      <input
                        type="text"
                        value={senderAddress.city}
                        onChange={(e) => handleSenderAddressChange("city", e.target.value)}
                        placeholder="City"
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#69773D]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Postal Code</label>
                      <input
                        type="text"
                        value={senderAddress.postalCode}
                        onChange={(e) => handleSenderAddressChange("postalCode", e.target.value)}
                        placeholder="Postal code"
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#69773D]"
                      />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={handleSaveSenderAddress}
                      className="px-3 py-1.5 text-xs bg-[#69773D] text-white rounded-md hover:bg-[#5a6530] font-medium"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => {
                        setIsEditingSender(false);
                        // Revert to original state before editing
                        setSenderAddress({ ...originalSenderAddress });
                      }}
                      className="px-3 py-1.5 text-xs bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 font-medium"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="mt-3">
                  {senderAddress.address && senderAddress.city && senderAddress.postalCode ? (
                    <p className="text-sm text-gray-600 mt-1">
                      {senderAddress.address}, {senderAddress.city} {senderAddress.postalCode}
                    </p>
                  ) : (
                    <div className="mt-2 print:hidden">
                      <div className="bg-amber-50 border border-amber-200 rounded-md p-2">
                        <p className="text-xs text-amber-800 font-medium mb-1">⚠️ Sender address missing</p>
                        <p className="text-xs text-amber-700">
                          This address is required for delivery labels. Please add your address above.
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              )}
              
              <p className="text-xs text-gray-400 mt-3">Shop type: {data.seller.shopType}</p>
            </div>

            <div className="border border-gray-200 rounded-lg p-4 bg-[#F6F2E5]/30">
              <h2 className="text-sm font-semibold text-gray-500 uppercase mb-2">Recipient</h2>
              <p className="text-lg font-bold text-gray-900">
                {data.order.buyerContact.fullName || data.buyer.name || "Buyer"}
              </p>
              <p className="text-sm text-gray-600 mt-1">{formattedAddress}</p>
              <p className="text-sm text-gray-600 mt-1">Phone: {data.order.buyerContact.phone}</p>
              {data.buyer.email && <p className="text-sm text-gray-500 mt-1">{data.buyer.email}</p>}
            </div>
          </div>

          <div className="border border-gray-200 rounded-lg overflow-hidden bg-[#F6F2E5]/30">
            <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-gray-200">
              <div className="p-4">
                <p className="text-xs uppercase text-gray-500 font-semibold">Payment</p>
                <p className="text-sm font-bold text-gray-900 mt-1 capitalize">{data.order.paymentMethod}</p>
              </div>
              <div className="p-4">
                <p className="text-xs uppercase text-gray-500 font-semibold">Total Amount</p>
                <p className="text-sm font-bold text-gray-900 mt-1">
                  ฿{data.order.totalPrice.toLocaleString()}
                </p>
              </div>
              <div className="p-4">
                <p className="text-xs uppercase text-gray-500 font-semibold">Delivery Method</p>
                <p className="text-sm font-bold text-gray-900 mt-1 capitalize">{data.order.deliveryMethod}</p>
              </div>
              <div className="p-4">
                <p className="text-xs uppercase text-gray-500 font-semibold">Order Status</p>
                <p className="text-sm font-bold text-gray-900 mt-1 capitalize">
                  {data.order.status.replace(/_/g, " ")}
                </p>
              </div>
            </div>
          </div>

          <div className="border border-gray-200 rounded-lg overflow-hidden">
            <div className="bg-[#F6F2E5]/30 px-4 py-2 border-b border-gray-200">
              <h3 className="text-sm font-semibold text-gray-700 uppercase">Items</h3>
            </div>
            <div className="divide-y divide-gray-200">
              {data.order.items.map((item, index) => (
                <div key={`${item.itemId}-${index}`} className="px-4 py-3 flex justify-between items-center">
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{item.title}</p>
                    <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                  </div>
                  <p className="text-sm font-semibold text-gray-900">
                    ฿{(item.price * item.quantity).toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="border border-dashed border-gray-300 rounded-lg px-4 py-6 text-center text-gray-500 tracking-widest text-lg font-semibold">
            {labelRef}
          </div>
        </div>

        <div className="px-6 py-4 bg-[#F6F2E5]/30 border-t border-gray-200 text-xs text-gray-500 flex justify-between">
          <span>Generated by KU Market Seller Panel</span>
          <span>Present this slip when dropping off the parcel</span>
        </div>
      </div>
    </div>
  );
}
