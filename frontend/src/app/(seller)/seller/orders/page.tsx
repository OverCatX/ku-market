"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import {
  ShoppingBag,
  CheckCircle,
  XCircle,
  Clock,
  RefreshCw,
  Printer,
  MapPin,
  ExternalLink,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { API_BASE } from "@/config/constants";
import toast from "react-hot-toast";

const StaticMap = dynamic(() => import("@/components/maps/StaticMap"), {
  ssr: false,
});

interface OrderItem {
  itemId: string;
  title: string;
  price: number;
  quantity: number;
  image?: string;
}

interface OrderData {
  id: string;
  buyer: {
    id: string;
    name: string;
    email: string;
  };
  items: OrderItem[];
  totalPrice: number;
  deliveryMethod: "pickup" | "delivery";
  paymentMethod: "cash" | "transfer";
  status: "pending_seller_confirmation" | "confirmed" | "rejected" | "completed" | "cancelled";
  buyerContact: {
    fullName: string;
    phone: string;
  };
  shippingAddress?: {
    address: string;
    city: string;
    postalCode: string;
  };
  pickupDetails?: {
    locationName: string;
    address?: string;
    note?: string;
    coordinates?: {
      lat: number;
      lng: number;
    };
    preferredTime?: string;
  };
  createdAt: string;
  confirmedAt?: string;
  rejectedAt?: string;
  rejectionReason?: string;
  buyerReceived?: boolean;
  buyerReceivedAt?: string;
  sellerDelivered?: boolean;
  sellerDeliveredAt?: string;
}

function PickupLocationSection({
  pickupDetails,
}: {
  pickupDetails: OrderData["pickupDetails"];
}) {
  const [showMap, setShowMap] = useState(false);

  if (!pickupDetails) return null;

  return (
    <div className="mt-2 pt-2 border-t border-gray-200">
      <p className="font-medium flex items-center gap-1 text-green-700 mb-2">
        <MapPin size={14} />
        Meetup Point
      </p>
      <div className="space-y-2">
        <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
          <div className="flex items-start gap-2">
            <MapPin size={16} className="mt-0.5 text-gray-500 flex-shrink-0" />
            <div className="text-sm flex-1">
              <p className="font-semibold text-gray-900">{pickupDetails.locationName}</p>
              {pickupDetails.address && (
                <p className="text-gray-600 text-xs mt-0.5">
                  {pickupDetails.address}
                </p>
              )}
              {pickupDetails.coordinates && (
                <div className="mt-1 flex items-center gap-2 flex-wrap">
                  <p className="text-gray-500 text-xs font-mono">
                    {pickupDetails.coordinates.lat.toFixed(6)}, {pickupDetails.coordinates.lng.toFixed(6)}
                  </p>
                  <a
                    href={`https://www.google.com/maps?q=${pickupDetails.coordinates.lat},${pickupDetails.coordinates.lng}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs font-medium text-blue-600 hover:text-blue-700 hover:underline transition"
                  >
                    <ExternalLink size={12} />
                    Open in Google Maps
                  </a>
                </div>
              )}
              {pickupDetails.preferredTime && (
                <p className="text-sm text-blue-600 mt-1">
                  <Clock size={12} className="inline mr-1" />
                  Preferred time: {new Date(pickupDetails.preferredTime).toLocaleString("th-TH", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              )}
              {pickupDetails.note && (
                <p className="text-sm text-gray-600 italic mt-1">
                  Note: {pickupDetails.note}
                </p>
              )}
              {pickupDetails.coordinates && (
                <button
                  onClick={() => setShowMap(!showMap)}
                  className="mt-2 inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[#84B067] hover:text-[#73995a] hover:bg-white rounded-md transition"
                >
                  <MapPin size={14} />
                  {showMap ? "Hide Map" : "Show Map"}
                </button>
              )}
            </div>
          </div>
        </div>
        {showMap && pickupDetails.coordinates && (
          <div className="mt-2 relative z-0">
            <StaticMap
              position={{
                lat: pickupDetails.coordinates.lat,
                lng: pickupDetails.coordinates.lng,
              }}
              locationName={pickupDetails.locationName}
              height="200px"
            />
          </div>
        )}
      </div>
    </div>
  );
}

export default function SellerOrders() {
  const [orders, setOrders] = useState<OrderData[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<
    "all" | "pending_seller_confirmation" | "confirmed" | "completed"
  >("all");
  // const [selectedOrder, setSelectedOrder] = useState<OrderData | null>(null);

  useEffect(() => {
    loadOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter]);

  const loadOrders = async (): Promise<void> => {
    setLoading(true);
    try {
      const token = localStorage.getItem("authentication");
      if (!token) {
        setLoading(false);
        return;
      }

      const url = filter === "all" 
        ? `${API_BASE}/api/seller/orders`
        : `${API_BASE}/api/seller/orders?status=${filter}`;

      const response = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!response.ok) {
        throw new Error("Failed to load orders");
      }

      const data = await response.json();
      setOrders(data.orders || []);
    } catch (error) {
      console.error("Failed to load orders:", error);
      toast.error("Failed to load orders");
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmOrder = async (orderId: string): Promise<void> => {
    try {
      const token = localStorage.getItem("authentication");
      if (!token) {
        toast.error("Please login first");
        return;
      }

      const response = await fetch(`${API_BASE}/api/seller/orders/${orderId}/confirm`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to confirm order");
      }

      toast.success("Order confirmed successfully!");
      await loadOrders();
    } catch (error) {
      console.error("Failed to confirm order:", error);
      toast.error(error instanceof Error ? error.message : "Failed to confirm order");
    }
  };

  const handleRejectOrder = async (orderId: string): Promise<void> => {
    const reason = prompt("Please provide a reason for rejection (optional):");
    
    try {
      const token = localStorage.getItem("authentication");
      if (!token) {
        toast.error("Please login first");
        return;
      }

      const response = await fetch(`${API_BASE}/api/seller/orders/${orderId}/reject`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ reason: reason || undefined }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to reject order");
      }

      toast.success("Order rejected");
      await loadOrders();
    } catch (error) {
      console.error("Failed to reject order:", error);
      toast.error(error instanceof Error ? error.message : "Failed to reject order");
    }
  };

  const handleMarkDelivered = async (orderId: string): Promise<void> => {
    try {
      const token = localStorage.getItem("authentication");
      if (!token) {
        toast.error("Please login first");
        return;
      }

      const response = await fetch(`${API_BASE}/api/seller/orders/${orderId}/delivered`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to mark as delivered");
      }

      toast.success("Order marked as delivered!");
      await loadOrders();
    } catch (error) {
      console.error("Failed to mark as delivered:", error);
      toast.error(error instanceof Error ? error.message : "Failed to mark as delivered");
    }
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      pending_seller_confirmation: "bg-yellow-100 text-yellow-800",
      confirmed: "bg-[#69773D]/10 text-[#69773D]",
      rejected: "bg-[#780606] text-[#780606]",
      completed: "bg-[#69773D]/10 text-[#69773D]",
      cancelled: "bg-gray-100 text-gray-800",
    };
    return styles[status] || styles.pending_seller_confirmation;
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      pending_seller_confirmation: "Pending",
      confirmed: "Confirmed",
      rejected: "Rejected",
      completed: "Completed",
      cancelled: "Cancelled",
    };
    return labels[status] || status;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading orders...</div>
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: '#F6F2E5', minHeight: '100vh', padding: '2rem' }}>
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold text-[#4A5130]">Orders</h1>
          <p className="text-[#69773D] mt-1">Manage your customer orders</p>
        </div>
        <button
          onClick={loadOrders}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-[#F6F2E5] text-[#4A5130] rounded-lg hover:bg-[#69773D]/10 hover:text-[#4A5130] disabled:opacity-50 transition-colors"
        >
          <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
          Refresh
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 mb-6">
        {([
          { value: "all" as const, label: "All" },
          { value: "pending_seller_confirmation" as const, label: "Pending" },
          { value: "confirmed" as const, label: "Confirmed" },
          { value: "completed" as const, label: "Completed" },
        ]).map((f) => (
          <button
            key={f.value}
            onClick={() => setFilter(f.value)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === f.value
                ? "bg-[#69773D] text-[#F6F2E5]"
                : "bg-white text-[#69773D] hover:bg-[#69773D] hover:text-[#F6F2E5]"
            }`}
          >
            {f.label}
            {f.value !== "all" && (
              <span className="ml-2 text-xs">
                ({orders.filter((o) => o.status === f.value).length})
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Orders List */}
      <div className="space-y-4">
        {orders.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <ShoppingBag size={48} className="mx-auto text-[#69773D] mb-4" />
            <h3 className="text-lg font-medium text-[#4A5130] mb-2">
              No orders found
            </h3>
            <p className="text-[#69773D]">
              {filter === "all"
                ? "You haven't received any orders yet"
                : `No ${getStatusLabel(filter)} orders`}
            </p>
          </div>
        ) : (
          orders.map((order) => (
            <div key={order.id} className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
                <div>
                  <h3 className="text-lg font-bold text-[#4A5130]">
                    Order #{order.id.slice(-8)}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {order.createdAt ? (() => {
                      try {
                        const date = new Date(order.createdAt);
                        if (isNaN(date.getTime())) {
                          return "Invalid date";
                        }
                        return new Intl.DateTimeFormat("th-TH", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        }).format(date);
                      } catch {
                        return "Invalid date";
                      }
                    })() : "N/A"}
                  </p>
                </div>
                <span
                  className={`inline-flex items-center gap-1 px-3 py-1 text-xs font-semibold rounded-full ${getStatusBadge(
                    order.status
                  )}`}
                >
                  {order.status === "pending_seller_confirmation" && <Clock size={12} />}
                  {order.status === "confirmed" && <CheckCircle size={12} />}
                  {order.status === "rejected" && <XCircle size={12} />}
                  {getStatusLabel(order.status)}
                </span>
              </div>

              {/* Buyer Info */}
              <div className="mb-4 p-4 bg-[#F6F2E5]/30 rounded-lg">
                <h4 className="font-semibold text-[#4A5130] mb-2">
                  Buyer Information
                </h4>
                <div className="text-sm text-gray-700 space-y-1">
                  <p>
                    <span className="font-medium">Name:</span>{" "}
                    {order.buyerContact.fullName}
                  </p>
                  <p>
                    <span className="font-medium">Email:</span>{" "}
                    {order.buyer.email}
                  </p>
                  <p>
                    <span className="font-medium">Phone:</span>{" "}
                    {order.buyerContact.phone}
                  </p>
                  <p>
                    <span className="font-medium">Delivery:</span>{" "}
                    {order.deliveryMethod === "pickup"
                      ? "Self Pick-up"
                      : "Delivery"}
                  </p>
                  {order.deliveryMethod === "delivery" && order.shippingAddress && (
                    <div className="mt-2 pt-2 border-t border-gray-200">
                      <p className="font-medium">Shipping Address:</p>
                      <p className="text-gray-600">
                        {order.shippingAddress.address}, {order.shippingAddress.city} {order.shippingAddress.postalCode}
                      </p>
                    </div>
                  )}
                  {order.deliveryMethod === "pickup" && order.pickupDetails && (
                    <div className="mt-2 pt-2 border-t border-gray-200">
                      <p className="font-medium flex items-center gap-1 text-[#69773D]">
                        <MapPin size={14} className="text-[#69773D]" />
                        Meetup Point
                      </p>
                      <div className="mt-1 space-y-1 text-[#69773D]">
                        <p className="font-semibold text-[#4A5130]">{order.pickupDetails.locationName}</p>
                        {order.pickupDetails.address && (
                          <p className="text-sm text-[#69773D]">{order.pickupDetails.address}</p>
                        )}
                        {order.pickupDetails.preferredTime && (
                          <p className="text-sm text-[#69773D]">
                            <Clock size={12} className="inline mr-1" />
                            Preferred time: {new Date(order.pickupDetails.preferredTime).toLocaleString("th-TH", {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </p>
                        )}
                        {order.pickupDetails.coordinates && (
                          <p className="text-xs text-[#69773D]">
                            📍 {order.pickupDetails.coordinates.lat.toFixed(5)}, {order.pickupDetails.coordinates.lng.toFixed(5)}
                          </p>
                        )}
                        {order.pickupDetails.note && (
                          <p className="text-sm text-[#69773D] italic">
                            Note: {order.pickupDetails.note}
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                  <p>
                    <span className="font-medium text-[#4A5130]">Payment:</span>{" "}
                    {order.paymentMethod === "cash" ? "Cash" : "Transfer"}
                  </p>
                  {order.rejectionReason && (
                    <p className="text-[#780606] mt-2">
                      <span className="font-medium">Rejection Reason:</span>{" "}
                      {order.rejectionReason}
                    </p>
                  )}
                </div>
              </div>

              {/* Items */}
              <div className="space-y-2 mb-4">
                {order.items.map((item, index) => (
                  <div key={item.itemId || index} className="flex items-center gap-3">
                    {item.image && (
                      <div className="relative w-16 h-16 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                        <Image
                          src={item.image}
                          alt={item.title}
                          fill
                          className="object-cover"
                        />
                      </div>
                    )}
                    <div className="flex-1">
                      <p className="font-medium text-[#4A5130]">{item.title}</p>
                      <p className="text-sm text-gray-600">
                        Qty: {item.quantity} × ฿{item.price.toLocaleString()}
                      </p>
                    </div>
                    <p className="font-bold text-[#69773D]">
                      ฿{(item.price * item.quantity).toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>

              {/* Total & Label */}
              <div className="flex flex-col gap-3 pt-4 border-t">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-bold text-[#4A5130]">Total</span>
                  <span className="text-lg font-bold text-[#69773D]">
                    ฿{order.totalPrice.toLocaleString()}
                  </span>
                </div>
                {order.deliveryMethod === "delivery" && (
                  <Link
                    href={`/seller/orders/${order.id}/label`}
                    target="_blank"
                    className="inline-flex items-center justify-center gap-2 px-4 py-2 border-2 border-[#69773D] text-[#69773D] rounded-lg hover:border-[#5a6530] hover:text-[#5a6530] transition-colors font-medium"
                  >
                    <Printer size={16} />
                    Print Delivery Slip
                  </Link>
                )}
              </div>

              {/* Actions */}
              {order.status === "pending_seller_confirmation" && (
                <div className="flex gap-2 mt-4">
                  <button
                    onClick={() => handleConfirmOrder(order.id)}
                    className="flex-1 px-4 py-2 bg-[#69773D] text-white rounded-lg hover:bg-[#5a6530] transition-colors font-medium"
                  >
                    <CheckCircle size={18} className="inline mr-2" />
                    Confirm Order
                  </button>
                  <button
                    onClick={() => handleRejectOrder(order.id)}
                    className="flex-1 px-4 py-2 bg-[#780606] text-white rounded-lg hover:bg-[#780606] transition-colors font-medium"
                  >
                    <XCircle size={18} className="inline mr-2" />
                    Reject Order
                  </button>
                </div>
              )}
              {order.status === "confirmed" &&
                order.deliveryMethod === "pickup" &&
                !order.sellerDelivered && (
                  <div className="mt-4">
                    <button
                      onClick={() => handleMarkDelivered(order.id)}
                      className="w-full px-4 py-2 bg-[#69773D] text-white rounded-lg hover:bg-[#5a6530] transition-colors font-medium"
                    >
                      <CheckCircle size={18} className="inline mr-2" />
                      Mark as delivered
                    </button>
                  </div>
                )}
              {order.sellerDelivered && (
                <div className="mt-4">
                  <div className="w-full px-4 py-2 bg-[#69773D]/10 text-[#69773D] rounded-lg font-medium text-center">
                    <CheckCircle size={18} className="inline mr-2" />
                    You have confirmed delivery
                  </div>
                </div>
              )}
              {order.buyerReceived && order.sellerDelivered && (
                <div className="mt-2">
                  <div className="w-full px-4 py-2 bg-[#5C8140]/30 text-[#5C8140] rounded-lg font-medium text-center">
                    <CheckCircle size={18} className="inline mr-2" />
                    Both parties confirmed - Order completed
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
