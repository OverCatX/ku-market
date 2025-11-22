"use client";

import { useEffect, useState, useCallback } from "react";
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
import { Pagination } from "@/components/admin/Pagination";

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
  paymentMethod: "cash" | "transfer" | "promptpay";
  paymentStatus?:
    | "pending"
    | "awaiting_payment"
    | "payment_submitted"
    | "paid"
    | "not_required";
  status:
    | "pending_seller_confirmation"
    | "confirmed"
    | "rejected"
    | "completed"
    | "cancelled";
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

export default function SellerOrders() {
  const [orders, setOrders] = useState<OrderData[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<
    "all" | "pending_seller_confirmation" | "confirmed" | "completed"
  >("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [statusCounts, setStatusCounts] = useState({
    pending_seller_confirmation: 0,
    confirmed: 0,
    completed: 0,
  });
  const itemsPerPage = 10;
  // const [selectedOrder, setSelectedOrder] = useState<OrderData | null>(null);

  const loadStatusCounts = useCallback(async (): Promise<void> => {
    try {
      const token = localStorage.getItem("authentication");
      if (!token) return;

      // Load all orders without pagination to count statuses
      const response = await fetch(`${API_BASE}/api/seller/orders?limit=1000`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        const allOrders = data.orders || [];
        setStatusCounts({
          pending_seller_confirmation: allOrders.filter(
            (o: OrderData) => o.status === "pending_seller_confirmation"
          ).length,
          confirmed: allOrders.filter(
            (o: OrderData) => o.status === "confirmed"
          ).length,
          completed: allOrders.filter(
            (o: OrderData) => o.status === "completed"
          ).length,
        });
      }
    } catch (error) {
      console.error("Failed to load status counts:", error);
    }
  }, []);

  const loadOrders = useCallback(async (): Promise<void> => {
    setLoading(true);
    try {
      const token = localStorage.getItem("authentication");
      if (!token) {
        setLoading(false);
        return;
      }

      const params = new URLSearchParams();
      if (filter !== "all") {
        params.set("status", filter);
      }
      params.set("page", String(currentPage));
      params.set("limit", String(itemsPerPage));

      const url = `${API_BASE}/api/seller/orders?${params.toString()}`;

      const response = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        throw new Error("Failed to load orders");
      }

      const data = await response.json();
      setOrders(data.orders || []);
      setTotalPages(data.pagination?.totalPages || 1);
      setTotalItems(data.pagination?.total || 0);

      // Update status counts after loading orders
      await loadStatusCounts();
    } catch (error) {
      console.error("Failed to load orders:", error);
      toast.error("Failed to load orders");
      setOrders([]);
    } finally {
      setLoading(false);
    }
  }, [filter, currentPage, itemsPerPage, loadStatusCounts]);

  useEffect(() => {
    loadOrders();
    loadStatusCounts();
  }, [loadOrders, loadStatusCounts]);

  const handleConfirmOrder = async (orderId: string): Promise<void> => {
    try {
      const token = localStorage.getItem("authentication");
      if (!token) {
        toast.error("Please login first");
        return;
      }

      const response = await fetch(
        `${API_BASE}/api/seller/orders/${orderId}/confirm`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to confirm order");
      }

      toast.success("Order confirmed successfully!");
      await loadOrders();
      await loadStatusCounts();
    } catch (error) {
      console.error("Failed to confirm order:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to confirm order"
      );
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

      const response = await fetch(
        `${API_BASE}/api/seller/orders/${orderId}/reject`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ reason: reason || undefined }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to reject order");
      }

      toast.success("Order rejected");
      await loadOrders();
      await loadStatusCounts();
    } catch (error) {
      console.error("Failed to reject order:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to reject order"
      );
    }
  };

  const handleMarkDelivered = async (orderId: string): Promise<void> => {
    try {
      const token = localStorage.getItem("authentication");
      if (!token) {
        toast.error("Please login first");
        return;
      }

      const response = await fetch(
        `${API_BASE}/api/seller/orders/${orderId}/delivered`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to mark as delivered");
      }

      toast.success("Order marked as delivered!");
      await loadOrders();
      await loadStatusCounts();
    } catch (error) {
      console.error("Failed to mark as delivered:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to mark as delivered"
      );
    }
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      pending_seller_confirmation:
        "bg-yellow-400/10 text-yellow-900 border-2 border-yellow-500/20",
      confirmed: "bg-[#8c522f]/10 text-[#8c522f] border-2 border-[#8c522f]/20",
      rejected: "bg-[#780606]/10 text-[#780606] border-2 border-[#780606]/20",
      completed: "bg-[#69773D]/10 text-[#69773D] border-2 border-[#69773D]/20",
      cancelled: "bg-gray-400 text-gray-900 border-2 border-gray-500",
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

  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading orders...</div>
      </div>
    );
  }

  return (
    <div
      style={{
        backgroundColor: "#FEFCF9",
        minHeight: "100vh",
        padding: "2rem",
      }}
    >
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-4xl font-extrabold text-[#4A5130] tracking-tight">
            Orders
          </h1>
          <p className="text-[#69773D] mt-2 font-medium text-base">
            Manage your customer orders
          </p>
        </div>
        <button
          onClick={loadOrders}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-white text-[#4A5130] rounded-lg hover:bg-gray-50 hover:text-[#4A5130] disabled:opacity-50 transition-colors border border-gray-200"
        >
          <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
          Refresh
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 mb-6">
        {[
          { value: "all" as const, label: "All" },
          { value: "pending_seller_confirmation" as const, label: "Pending" },
          { value: "confirmed" as const, label: "Confirmed" },
          { value: "completed" as const, label: "Completed" },
        ].map((f) => (
          <button
            key={f.value}
            onClick={() => {
              setFilter(f.value);
              setCurrentPage(1); // Will trigger useEffect to reload
            }}
            className={`px-5 py-2.5 rounded-lg font-semibold transition-all shadow-sm ${
              filter === f.value
                ? "bg-[#5C8140] text-white shadow-md"
                : "bg-white text-[#4A5130] hover:bg-[#5C8140] hover:text-white border border-gray-200"
            }`}
          >
            {f.label}
            {f.value !== "all" && (
              <span className="ml-2 text-xs">
                ({statusCounts[f.value] || 0})
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
          <>
            {orders.map((order) => (
              <div key={order.id} className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
                  <div>
                    <h3 className="text-xl font-extrabold text-[#4A5130] mb-1">
                      Order #{order.id.slice(-8)}
                    </h3>
                    <p className="text-sm font-medium text-gray-700">
                      {order.createdAt
                        ? (() => {
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
                          })()
                        : "N/A"}
                    </p>
                  </div>
                  <span
                    className={`inline-flex items-center gap-1.5 px-4 py-1.5 text-sm font-bold rounded-full shadow-sm ${getStatusBadge(
                      order.status
                    )}`}
                  >
                    {order.status === "pending_seller_confirmation" && (
                      <Clock size={12} />
                    )}
                    {order.status === "confirmed" && <CheckCircle size={12} />}
                    {order.status === "rejected" && <XCircle size={12} />}
                    {getStatusLabel(order.status)}
                  </span>
                </div>

                {/* Buyer Info */}
                <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-bold text-lg text-[#4A5130] mb-3">
                    Buyer Information
                  </h4>
                  <div className="text-sm space-y-2.5">
                    <p>
                      <span className="font-extrabold text-base text-[#4A5130]">
                        Name:
                      </span>{" "}
                      <span className="font-medium text-gray-600">
                        {order.buyerContact.fullName}
                      </span>
                    </p>
                    <p>
                      <span className="font-extrabold text-base text-[#4A5130]">
                        Email:
                      </span>{" "}
                      <span className="font-medium text-gray-600">
                        {order.buyer.email}
                      </span>
                    </p>
                    <p>
                      <span className="font-extrabold text-base text-[#4A5130]">
                        Phone:
                      </span>{" "}
                      <span className="font-medium text-gray-600">
                        {order.buyerContact.phone}
                      </span>
                    </p>
                    <p>
                      <span className="font-extrabold text-base text-[#4A5130]">
                        Delivery:
                      </span>{" "}
                      <span className="font-medium text-gray-600">
                        {order.deliveryMethod === "pickup"
                          ? "Self Pick-up"
                          : "Delivery"}
                      </span>
                    </p>
                    {order.deliveryMethod === "delivery" &&
                      order.shippingAddress && (
                        <div className="mt-2 pt-2 border-t-2 border-gray-300">
                          <p className="font-extrabold text-base text-[#4A5130] mb-1">
                            Shipping Address:
                          </p>
                          <p className="font-medium text-gray-600">
                            {order.shippingAddress.address},{" "}
                            {order.shippingAddress.city}{" "}
                            {order.shippingAddress.postalCode}
                          </p>
                        </div>
                      )}
                    {order.deliveryMethod === "pickup" &&
                      order.pickupDetails && (
                        <div className="mt-2 pt-2 border-t border-gray-200">
                          <p className="font-bold text-base flex items-center gap-1.5 text-[#4A5130] mb-2">
                            <MapPin size={16} className="text-[#5C8140]" />
                            Meetup Point
                          </p>
                          <div className="mt-1 space-y-2">
                            <p className="font-bold text-[#4A5130] text-base">
                              {order.pickupDetails.locationName}
                            </p>
                            {order.pickupDetails.address && (
                              <p className="text-sm font-semibold text-gray-700">
                                {order.pickupDetails.address}
                              </p>
                            )}
                            {order.pickupDetails.preferredTime && (
                              <p className="text-sm font-semibold text-gray-700">
                                <Clock size={14} className="inline mr-1.5" />
                                Preferred time:{" "}
                                <span className="text-[#5C8140]">
                                  {new Date(
                                    order.pickupDetails.preferredTime
                                  ).toLocaleString("th-TH", {
                                    year: "numeric",
                                    month: "short",
                                    day: "numeric",
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  })}
                                </span>
                              </p>
                            )}
                            {order.pickupDetails.coordinates && (
                              <div className="flex items-center gap-2 flex-wrap">
                                <p className="text-xs text-gray-600 font-mono">
                                  📍{" "}
                                  {order.pickupDetails.coordinates.lat.toFixed(
                                    5
                                  )}
                                  ,{" "}
                                  {order.pickupDetails.coordinates.lng.toFixed(
                                    5
                                  )}
                                </p>
                                <a
                                  href={`https://www.google.com/maps?q=${order.pickupDetails.coordinates.lat},${order.pickupDetails.coordinates.lng}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-bold text-white bg-[#5C8140] hover:bg-[#4a6b33] rounded-md transition shadow-sm hover:shadow"
                                >
                                  <ExternalLink size={14} />
                                  Open in Google Maps
                                </a>
                              </div>
                            )}
                            {order.pickupDetails.note && (
                              <p className="text-sm font-medium text-gray-700 italic bg-gray-50 p-2 rounded border border-gray-200">
                                <span className="font-bold text-[#4A5130]">
                                  Note:
                                </span>{" "}
                                {order.pickupDetails.note}
                              </p>
                            )}
                          </div>
                        </div>
                      )}
                    <p>
                      <span className="font-extrabold text-base text-[#4A5130]">
                        Payment:
                      </span>{" "}
                      <span className="font-medium text-gray-600">
                        {order.paymentMethod === "cash"
                          ? "Cash"
                          : order.paymentMethod === "promptpay"
                          ? "PromptPay"
                          : "Bank Transfer"}
                      </span>
                    </p>
                    {order.rejectionReason && (
                      <p className="text-red-700 mt-2">
                        <span className="font-extrabold text-base">
                          Rejection Reason:
                        </span>{" "}
                        <span className="font-medium">
                          {order.rejectionReason}
                        </span>
                      </p>
                    )}
                  </div>
                </div>

                {/* Items */}
                <div className="space-y-2 mb-4">
                  {order.items.map((item, index) => (
                    <div
                      key={item.itemId || index}
                      className="flex items-center gap-3"
                    >
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
                        <p className="font-bold text-base text-[#4A5130]">
                          {item.title}
                        </p>
                        <p className="text-sm font-semibold text-gray-700">
                          Qty: {item.quantity} × ฿{item.price.toLocaleString()}
                        </p>
                      </div>
                      <p className="font-extrabold text-lg text-[#5C8140]">
                        ฿{(item.price * item.quantity).toLocaleString()}
                      </p>
                    </div>
                  ))}
                </div>

                {/* Total & Label */}
                <div className="flex flex-col gap-3 pt-4 border-t">
                  <div className="flex justify-between items-center bg-[#F6F2E5]/50 p-3 rounded-lg border-2 border-[#5C8140]/20">
                    <span className="text-xl font-extrabold text-[#4A5130]">
                      Total
                    </span>
                    <span className="text-2xl font-extrabold text-[#5C8140]">
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
                      className="flex-1 px-5 py-3 bg-[#5C8140] text-white rounded-lg hover:bg-[#4a6b33] transition-all font-bold shadow-md hover:shadow-lg"
                    >
                      <CheckCircle size={20} className="inline mr-2" />
                      Confirm Order
                    </button>
                    <button
                      onClick={() => handleRejectOrder(order.id)}
                      className="flex-1 px-5 py-3 bg-[#780606] text-white rounded-lg hover:bg-[#5c0505] transition-all font-bold shadow-md hover:shadow-lg"
                    >
                      <XCircle size={20} className="inline mr-2" />
                      Reject Order
                    </button>
                  </div>
                )}
                {order.status === "confirmed" && !order.sellerDelivered && (
                  <div className="mt-4">
                    {/* Check if payment is required and completed */}
                    {(order.paymentMethod === "promptpay" ||
                      order.paymentMethod === "transfer") &&
                    order.paymentStatus !== "paid" &&
                    order.paymentStatus !== "payment_submitted" ? (
                      <div className="w-full px-4 py-3 bg-yellow-100 border-2 border-yellow-400 text-yellow-900 rounded-lg font-bold text-center shadow-sm">
                        <Clock size={20} className="inline mr-2" />
                        Waiting for buyer payment
                      </div>
                    ) : (
                      <button
                        onClick={() => handleMarkDelivered(order.id)}
                        className="w-full px-5 py-3 bg-[#5C8140] text-white rounded-lg hover:bg-[#4a6b33] transition-all font-bold shadow-md hover:shadow-lg"
                      >
                        <CheckCircle size={20} className="inline mr-2" />
                        Mark as Delivered
                      </button>
                    )}
                  </div>
                )}
                {order.sellerDelivered && (
                  <div className="mt-4">
                    <div className="w-full px-4 py-3 bg-[#5C8140]/20 border-2 border-[#5C8140]/40 text-[#5C8140] rounded-lg font-bold text-center shadow-sm">
                      <CheckCircle size={20} className="inline mr-2" />
                      You have confirmed delivery
                    </div>
                  </div>
                )}
                {order.buyerReceived && order.sellerDelivered && (
                  <div className="mt-2">
                    <div className="w-full px-4 py-3 bg-[#e0cd95]/10 border-2 border-[#e0cd95]/20 text-[#A0704F] rounded-lg font-bold text-center shadow-sm">
                      <CheckCircle size={20} className="inline mr-2 text-[#A0704F]" />
                      Both parties confirmed - Order completed
                    </div>
                  </div>
                )}
              </div>
            ))}
            {totalPages > 1 && (
              <div className="mt-6">
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={handlePageChange}
                  totalItems={totalItems}
                  itemsPerPage={itemsPerPage}
                />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
