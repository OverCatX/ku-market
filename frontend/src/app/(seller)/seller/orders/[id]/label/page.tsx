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

  return (
    <div className="min-h-screen bg-gray-100 p-6 print:bg-white print:p-0">
      <div className="flex justify-between items-center max-w-4xl mx-auto mb-4 print:hidden">
        <button
          onClick={() => router.back()}
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
        <div className="p-6 border-b border-gray-200 flex items-center justify-between bg-[#69773D] text-white print:bg-white print:text-gray-900">
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
            <div className="border border-gray-200 rounded-lg p-4">
              <h2 className="text-sm font-semibold text-gray-500 uppercase mb-2">Sender</h2>
              <p className="text-lg font-bold text-gray-900">{data.seller.shopName || data.seller.name}</p>
              <p className="text-sm text-gray-600 mt-1">
                {data.seller.name}
                {data.seller.phone ? ` • ${data.seller.phone}` : ""}
              </p>
              <p className="text-sm text-gray-500 mt-1">{data.seller.email}</p>
              <p className="text-xs text-gray-400 mt-3">Shop type: {data.seller.shopType}</p>
            </div>

            <div className="border border-gray-200 rounded-lg p-4">
              <h2 className="text-sm font-semibold text-gray-500 uppercase mb-2">Recipient</h2>
              <p className="text-lg font-bold text-gray-900">
                {data.order.buyerContact.fullName || data.buyer.name || "Buyer"}
              </p>
              <p className="text-sm text-gray-600 mt-1">{formattedAddress}</p>
              <p className="text-sm text-gray-600 mt-1">Phone: {data.order.buyerContact.phone}</p>
              {data.buyer.email && <p className="text-sm text-gray-500 mt-1">{data.buyer.email}</p>}
            </div>
          </div>

          <div className="border border-gray-200 rounded-lg overflow-hidden">
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
            <div className="bg-gray-50 px-4 py-2 border-b border-gray-200">
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

        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 text-xs text-gray-500 flex justify-between">
          <span>Generated by KU Market Seller Panel</span>
          <span>Present this slip when dropping off the parcel</span>
        </div>
      </div>
    </div>
  );
}
