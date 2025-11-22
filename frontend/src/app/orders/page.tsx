"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import dynamic from "next/dynamic";
import { API_BASE } from "@/config/constants";
import {
  RefreshCw,
  Clock,
  CheckCircle,
  XCircle,
  Package,
  MessageCircle,
  CreditCard,
  MapPin,
  ExternalLink,
  HelpCircle,
} from "lucide-react";
import toast from "react-hot-toast";
import { ComponentType } from "react";
import { clearAuthTokens, getAuthToken, isAuthenticated } from "@/lib/auth";
import { Pagination } from "@/components/admin/Pagination";

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
  seller: { id: string; name?: string; contact?: string };
  items: OrderItem[];
  totalPrice: number;
  status:
    | "pending_seller_confirmation"
    | "confirmed"
    | "rejected"
    | "completed"
    | "cancelled";
  deliveryMethod: "pickup" | "delivery";
  paymentMethod: "cash" | "transfer" | "promptpay";
  paymentStatus?:
    | "pending"
    | "awaiting_payment"
    | "payment_submitted"
    | "paid"
    | "not_required";
  paymentSubmittedAt?: string;
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
  createdAt?: string;
}

interface StatusCounts {
  pending_seller_confirmation: number;
  confirmed: number;
  completed: number;
  rejected: number;
  cancelled: number;
}

const normalizePaymentMethod = (
  value?: OrderData["paymentMethod"]
): "cash" | "promptpay" | "transfer" | null => {
  if (!value) return null;
  const lowered = value.trim().toLowerCase();
  if (lowered === "cash" || lowered === "promptpay" || lowered === "transfer") {
    return lowered as "cash" | "promptpay" | "transfer";
  }
  return null;
};

const normalizeStatus = (
  status?: OrderData["status"]
): OrderData["status"] | null => {
  if (!status) return null;
  const lowered = status.trim().toLowerCase();
  const map: Record<string, OrderData["status"]> = {
    pending_seller_confirmation: "pending_seller_confirmation",
    confirmed: "confirmed",
    rejected: "rejected",
    completed: "completed",
    cancelled: "cancelled",
  };
  return map[lowered] ?? null;
};

const normalizePaymentStatus = (
  status?: OrderData["paymentStatus"]
): OrderData["paymentStatus"] | null => {
  if (!status) return null;
  const lowered = status.trim().toLowerCase();
  const map: Record<string, OrderData["paymentStatus"]> = {
    pending: "pending",
    awaiting_payment: "awaiting_payment",
    payment_submitted: "payment_submitted",
    paid: "paid",
    not_required: "not_required",
  };
  return map[lowered] ?? null;
};

function PickupLocationSection({
  pickupDetails,
}: {
  pickupDetails: OrderData["pickupDetails"];
}) {
  const [showMap, setShowMap] = useState(false);

  if (!pickupDetails) return null;

  return (
    <div className="mt-4 space-y-3">
      <div className="p-3 bg-[#F6F2E5]/30 rounded-lg border border-gray-200">
        <div className="flex items-start gap-2">
          <MapPin size={16} className="mt-0.5 text-[#4A5130] flex-shrink-0" />
          <div className="text-sm flex-1">
            <p className="font-medium text-[#4A5130]">
              {pickupDetails.locationName}
            </p>
            {pickupDetails.address && (
              <p className="text-[#69773D] text-xs mt-0.5">
                {pickupDetails.address}
              </p>
            )}
            {pickupDetails.coordinates && (
              <div className="mt-1 flex items-center gap-2 flex-wrap">
                <p className="text-gray-500 text-xs font-mono">
                  {pickupDetails.coordinates.lat.toFixed(6)},{" "}
                  {pickupDetails.coordinates.lng.toFixed(6)}
                </p>
                <a
                  href={`https://www.google.com/maps?q=${pickupDetails.coordinates.lat},${pickupDetails.coordinates.lng}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-bold text-white bg-[#5C8140] hover:bg-[#4a6b33] rounded-md transition shadow-sm hover:shadow"
                >
                  <ExternalLink size={14} />
                  Open in Google Maps
                </a>
              </div>
            )}
            {pickupDetails.coordinates && (
              <button
                onClick={() => setShowMap(!showMap)}
                className="mt-2 inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[#5C8140] hover:text-[#4a6b33] hover:bg-white rounded-md transition"
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
            height="180px"
          />
        </div>
      )}
    </div>
  );
}

export default function OrdersPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<OrderData[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<
    | "all"
    | "pending_seller_confirmation"
    | "confirmed"
    | "completed"
    | "rejected"
    | "cancelled"
  >("all");
  const [contactingOrderId, setContactingOrderId] = useState<string | null>(
    null
  );
  const [submittingPaymentOrderId, setSubmittingPaymentOrderId] = useState<
    string | null
  >(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [statusCounts, setStatusCounts] = useState<StatusCounts>({
    pending_seller_confirmation: 0,
    confirmed: 0,
    completed: 0,
    rejected: 0,
    cancelled: 0,
  });
  const itemsPerPage = 10;

  const loadOrders = useCallback(async (): Promise<void> => {
    setLoading(true);
    try {
      const token = localStorage.getItem("authentication");
      if (!token) {
        router.replace("/login?redirect=/orders");
        return;
      }

      const params = new URLSearchParams();
      if (filter !== "all") {
        params.set("status", filter);
      }
      params.set("page", String(currentPage));
      params.set("limit", String(itemsPerPage));

      const res = await fetch(`${API_BASE}/api/orders?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        throw new Error("Failed to load orders");
      }
      const data = await res.json();
      setOrders(data.orders || []);
      setTotalPages(data.pagination?.totalPages || 1);
      setTotalItems(data.pagination?.total || 0);
      // Use status counts from backend if available, otherwise fallback to calculating from current page
      if (data.statusCounts) {
        setStatusCounts(data.statusCounts);
      }
    } catch (error) {
      console.error("Failed to load orders:", error);
      toast.error("Failed to load orders");
      setOrders([]);
    } finally {
      setLoading(false);
    }
  }, [filter, currentPage, itemsPerPage, router]);

  useEffect(() => {
    // Scroll to top when page loads
    window.scrollTo({ top: 0, behavior: "smooth" });
    loadOrders();
  }, [loadOrders]);

  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const handleMakePayment = async (order: OrderData) => {
    if (!isAuthenticated()) {
      toast.error("Please login to submit payment");
      router.push("/login?redirect=/orders");
      return;
    }

    const token = getAuthToken();
    if (!token) {
      clearAuthTokens();
      toast.error("Please login to submit payment");
      router.push("/login?redirect=/orders");
      return;
    }

    // For PromptPay, redirect to Stripe Elements payment page
    if (order.paymentMethod === "promptpay") {
      router.push(`/payment/${order.id}`);
      return;
    }

    // For other payment methods, submit payment notification directly
    setSubmittingPaymentOrderId(order.id);

    try {
      const response = await fetch(
        `${API_BASE}/api/orders/${order.id}/payment`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          credentials: "include",
        }
      );

      if (!response.ok) {
        const payload = await response.json().catch(() => ({}));
        const message =
          (payload as { error?: string }).error ||
          (payload as { message?: string }).message ||
          "Failed to submit payment";
        throw new Error(message);
      }

      toast.success("Payment submitted! Seller will verify shortly.");
      await loadOrders();
    } catch (error) {
      console.error("Make payment error:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to submit payment"
      );
    } finally {
      setSubmittingPaymentOrderId(null);
    }
  };

  const handleContactSeller = async (order: OrderData) => {
    if (!order?.seller?.id) {
      toast.error("Seller information unavailable");
      return;
    }

    if (!isAuthenticated()) {
      toast.error("Please login to contact the seller");
      router.push("/login?redirect=/orders");
      return;
    }

    const token = getAuthToken();
    if (!token) {
      clearAuthTokens();
      toast.error("Please login to contact the seller");
      router.push("/login?redirect=/orders");
      return;
    }

    setContactingOrderId(order.id);
    try {
      const response = await fetch(`${API_BASE}/api/chats/threads`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        credentials: "include",
        body: JSON.stringify({
          sellerId: order.seller.id,
        }),
      });

      if (response.status === 401) {
        clearAuthTokens();
        toast.error("Session expired. Please login again");
        router.push("/login?redirect=/orders");
        return;
      }

      if (!response.ok) {
        const errorPayload = (await response.json().catch(() => null)) as {
          error?: string;
          message?: string;
        } | null;
        const message =
          errorPayload?.error ||
          errorPayload?.message ||
          "Failed to start chat with seller";
        throw new Error(message);
      }

      const data = (await response.json().catch(() => null)) as {
        id?: string;
        threadId?: string;
        _id?: string;
      } | null;
      const threadId = data?.id || data?.threadId || data?._id;

      if (!threadId) {
        throw new Error("Chat thread not available");
      }

      router.push(`/chats?threadId=${encodeURIComponent(threadId)}`);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to contact seller";
      toast.error(message);
    } finally {
      setContactingOrderId(null);
    }
  };

  // Status counts are now provided by backend
  // Use backend status counts for accurate totals across all pages

  const formatDate = (date?: string) => {
    if (!date) return "Unknown";
    return new Date(date).toLocaleString("th-TH", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  };

  const filterOptions = useMemo(
    () => [
      { value: "all" as const, label: "All", count: totalItems },
      {
        value: "pending_seller_confirmation" as const,
        label: "Pending",
        count: statusCounts.pending_seller_confirmation,
      },
      {
        value: "confirmed" as const,
        label: "Confirmed",
        count: statusCounts.confirmed,
      },
      {
        value: "completed" as const,
        label: "Completed",
        count: statusCounts.completed,
      },
      {
        value: "rejected" as const,
        label: "Rejected",
        count: statusCounts.rejected,
      },
      {
        value: "cancelled" as const,
        label: "Cancelled",
        count: statusCounts.cancelled,
      },
    ],
    [totalItems, statusCounts]
  );

  const statusBadge = (status: OrderData["status"]) => {
    type StatusIcon = ComponentType<{ size?: number }>;
    const map: Record<
      OrderData["status"],
      { label: string; className: string; Icon: StatusIcon }
    > = {
      pending_seller_confirmation: {
        label: "Pending",
        className: "bg-yellow-50 text-yellow-700 border-yellow-200",
        Icon: Clock,
      },
      confirmed: {
        label: "Confirmed",
        className: "bg-[#724a24]/10 text-[#724a24] border-[#724a24]/20",
        Icon: Package,
      },
      completed: {
        label: "Completed",
        className: "bg-[#69773D]/10 text-[#69773D] border-[#69773D]/20",
        Icon: CheckCircle,
      },
      rejected: {
        label: "Rejected",
        className: "bg-[#780606]/10 text-[#780606] border-[#780606]/20",
        Icon: XCircle,
      },
      cancelled: {
        label: "Cancelled",
        className: "bg-gray-50 text-gray-700 border-gray-200",
        Icon: XCircle,
      },
    };
    const s = map[status];
    const Icon = s.Icon;
    return (
      <span
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium border ${s.className}`}
      >
        <Icon size={13} />
        {s.label}
      </span>
    );
  };

  const paymentStatusBadge = (status?: OrderData["paymentStatus"]) => {
    if (!status || status === "not_required") {
      return null;
    }

    const map: Record<
      Exclude<OrderData["paymentStatus"], undefined>,
      { label: string; className: string }
    > = {
      pending: {
        label: "Pending review",
        className: "bg-gray-50 text-gray-700 border-gray-200",
      },
      awaiting_payment: {
        label: "Awaiting payment",
        className: "bg-[#780606]/10 text-[#780606] border-[#780606]/20",
      },
      payment_submitted: {
        label: "Payment submitted",
        className: "bg-[#69773D]/10 text-[#69773D] border-[#69773D]/20",
      },
      paid: {
        label: "Paid",
        className: "bg-[#69773D]/10 text-[#69773D] border-[#69773D]/20",
      },
      not_required: {
        label: "Not required",
        className: "bg-gray-50 text-gray-600 border-gray-200",
      },
    };

    const badge = map[status] ?? map.pending;

    return (
      <span
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium border ${badge.className}`}
      >
        <CreditCard size={12} />
        {badge.label}
      </span>
    );
  };

  const formatPaymentMethod = (value: OrderData["paymentMethod"]) => {
    const normalized = normalizePaymentMethod(value);
    if (normalized === "promptpay") return "PromptPay";
    if (normalized === "transfer") return "Bank transfer";
    return "Cash";
  };

  return (
    <div className="min-h-screen py-10" style={{ backgroundColor: "#F6F2E5" }}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-16 max-w-6xl">
        <section className="rounded-3xl bg-white border border-gray-200 shadow-lg shadow-gray-200/50 p-6 sm:p-8 mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-[#4A5130]">My Orders</h1>
              <p className="mt-1 text-sm text-[#69773D]">
                Manage and track your orders
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
              <Link
                href="/guide"
                className="inline-flex items-center gap-2 px-3 sm:px-4 py-2 bg-[#69773D] text-white rounded-lg hover:bg-[#5a632d] transition-colors text-xs sm:text-sm font-medium shadow-sm hover:shadow-md"
              >
                <HelpCircle size={16} className="sm:w-[18px] sm:h-[18px]" />
                <span className="hidden xs:inline">User Guide</span>
                <span className="xs:hidden">Guide</span>
              </Link>
              <button
                onClick={loadOrders}
                disabled={loading}
                className="flex items-center gap-2 px-4 py-2 bg-transparent text-[#4A5130] rounded-lg hover:bg-[#69773D]/10 hover:text-[#4A5130] disabled:opacity-50 transition-colors"
              >
                <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
                Refresh
              </button>
              <Link
                href="/marketplace"
                className="inline-flex items-center gap-2 px-3 sm:px-4 py-2 rounded-lg bg-[#5C8140] text-white text-xs sm:text-sm font-medium hover:bg-[#4a6b33] transition"
              >
                <span className="hidden sm:inline">Continue Shopping</span>
                <span className="sm:hidden">Shop</span>
              </Link>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
            {[
              {
                label: "Total",
                value: totalItems,
                color: "#2F5A32",
                borderColor: "#2F5A32",
                titleColor: "#2F5A32",
                Icon: Package,
              },
              {
                label: "Pending",
                value: statusCounts.pending_seller_confirmation,
                color: "#eab308",
                borderColor: "#eab308",
                titleColor: "#eab308",
                Icon: Clock,
              },
              {
                label: "Confirmed",
                value: statusCounts.confirmed,
                color: "#724a24",
                borderColor: "#724a24",
                titleColor: "#724a24",
                Icon: Package,
              },
              {
                label: "Completed",
                value: statusCounts.completed,
                color: "#69773D",
                borderColor: "#69773D",
                titleColor: "#69773D",
                Icon: CheckCircle,
              },
            ].map(({ label, value, color, borderColor, titleColor, Icon }) => (
              <div
                key={label}
                className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 p-6 border-l-4 relative overflow-hidden group"
                style={{ borderLeftColor: borderColor || color }}
              >
                <div
                  className="absolute inset-0 bg-gradient-to-br from-transparent to-gray-50/50 opacity-0 group-hover:opacity-100 transition-opacity"
                  style={{ borderColor: color }}
                />
                <div className="relative flex items-center justify-between">
                  <div className="flex-1">
                    <p
                      className="text-xs font-semibold uppercase tracking-wide mb-1"
                      style={{ color: titleColor || borderColor || color }}
                    >
                      {label}
                    </p>
                    <p
                      className="text-3xl font-bold"
                      style={{ color: titleColor || borderColor || color }}
                    >
                      {value}
                    </p>
                  </div>
                  <div
                    className="w-14 h-14 rounded-xl flex items-center justify-center shadow-md transition-transform group-hover:scale-110"
                    style={{
                      backgroundColor: color + "15",
                      border: `2px solid ${color}40`,
                    }}
                  >
                    <Icon size={28} style={{ color }} />
                  </div>
                </div>
                <div
                  className="absolute top-0 right-0 w-20 h-20 opacity-10"
                  style={{ borderColor: color }}
                >
                  <div
                    className="absolute inset-0 rounded-full"
                    style={{
                      backgroundColor: color,
                      transform: "translate(30%, -30%)",
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Filter Tabs */}
        <div className="overflow-x-auto -mx-4 sm:mx-0 px-4 sm:px-0 mb-6">
          <div className="flex gap-2 min-w-max sm:flex-wrap">
            {filterOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => {
                  setFilter(option.value);
                  setCurrentPage(1);
                }}
                className={`px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors whitespace-nowrap ${
                  filter === option.value
                    ? "bg-[#5C8140] text-white"
                    : "bg-white text-[#4A5130] hover:bg-gray-50 border border-gray-200"
                }`}
              >
                {option.label}
                <span className="ml-1.5 text-xs opacity-75">
                  ({option.count})
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Orders List */}
        {loading ? (
          <div className="bg-white rounded-lg border border-gray-200 p-12 text-center text-[#4A5130]">
            <RefreshCw size={24} className="animate-spin mx-auto mb-2" />
            <p>Loading orders...</p>
          </div>
        ) : orders.length === 0 ? (
          <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100 text-gray-400">
              <Package size={32} />
            </div>
            <p className="text-lg font-semibold text-[#4A5130] mb-1">
              No orders found
            </p>
            <p className="text-sm text-[#69773D]">
              Start shopping to see your orders here
            </p>
          </div>
        ) : (
          <>
            <div className="space-y-4">
              {orders.map((order) => {
                const normalizedMethod = normalizePaymentMethod(
                  order.paymentMethod
                );
                const normalizedStatus = normalizeStatus(order.status);
                const normalizedPaymentStatus = normalizePaymentStatus(
                  order.paymentStatus
                );

                const rawMethod = order.paymentMethod
                  ? order.paymentMethod.trim().toLowerCase()
                  : null;
                const requiresPayment =
                  normalizedMethod === "promptpay" ||
                  normalizedMethod === "transfer" ||
                  (rawMethod !== null && rawMethod !== "cash");
                const awaitingBuyerPayment =
                  requiresPayment &&
                  normalizedStatus === "confirmed" &&
                  (normalizedPaymentStatus === "awaiting_payment" ||
                    normalizedPaymentStatus === "pending" ||
                    normalizedPaymentStatus === null);
                const paymentComplete =
                  normalizedPaymentStatus === "payment_submitted" ||
                  normalizedPaymentStatus === "paid";
                const displayStatus =
                  normalizedStatus ?? "pending_seller_confirmation";

                return (
                  <div
                    key={order.id}
                    className="bg-white rounded-lg border border-gray-200 hover:border-gray-300 transition-colors overflow-hidden"
                  >
                    {/* Order Header */}
                    <div className="p-4 sm:p-5 border-b border-gray-100">
                      <div className="flex flex-col gap-3 sm:gap-4">
                        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                          {statusBadge(displayStatus)}
                          {paymentStatusBadge(
                            normalizedPaymentStatus ?? undefined
                          )}
                        </div>
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-4">
                          <div className="flex-1 min-w-0">
                            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs sm:text-sm text-[#69773D]">
                              <span>
                                <span className="font-medium text-[#4A5130]">
                                  {order.totalPrice.toLocaleString()} THB
                                </span>
                              </span>
                              <span className="text-gray-300 hidden sm:inline">
                                •
                              </span>
                              <span className="capitalize">
                                {order.deliveryMethod}
                              </span>
                              <span className="text-gray-300 hidden sm:inline">
                                •
                              </span>
                              <span className="break-words font-semibold text-[#4A5130]">
                                {formatPaymentMethod(order.paymentMethod)}
                              </span>
                              <span className="text-gray-300 hidden sm:inline">
                                •
                              </span>
                              <span className="text-[#69773D] text-xs">
                                {formatDate(order.createdAt)}
                              </span>
                            </div>
                          </div>
                          <div className="text-xs sm:text-sm text-[#69773D]">
                            <span className="text-[#69773D]">Seller:</span>{" "}
                            <span className="font-medium text-[#4A5130]">
                              {order.seller?.name || "Unknown"}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Order Items */}
                    <div className="p-4 sm:p-5">
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-4">
                        {order.items.slice(0, 3).map((it, idx) => (
                          <div
                            key={`${order.id}-${idx}`}
                            className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 transition"
                          >
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={it.image || "/placeholder.png"}
                              alt={it.title}
                              className="w-12 h-12 sm:w-14 sm:h-14 rounded-md object-cover border border-gray-200 flex-shrink-0"
                            />
                            <div className="min-w-0 flex-1">
                              <div className="text-xs sm:text-sm font-medium text-[#4A5130] truncate">
                                {it.title}
                              </div>
                              <div className="text-xs text-[#69773D]">
                                {it.quantity} × {it.price.toLocaleString()} THB
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>

                      {order.items.length > 3 && (
                        <p className="text-xs text-[#69773D] mb-4">
                          +{order.items.length - 3} more item
                          {order.items.length - 3 > 1 ? "s" : ""}
                        </p>
                      )}

                      {order.deliveryMethod === "pickup" &&
                        order.pickupDetails && (
                          <PickupLocationSection
                            pickupDetails={order.pickupDetails}
                          />
                        )}

                      {/* Action Buttons */}
                      <div className="mt-4 pt-4 border-t border-gray-100 flex flex-col sm:flex-row gap-2">
                        <Link
                          href={`/order/${order.id}`}
                          className="flex-1 px-4 py-2 text-xs sm:text-sm font-medium rounded-lg bg-[#5C8140] text-white hover:bg-[#4a6b33] transition text-center"
                        >
                          View Details
                        </Link>
                        {awaitingBuyerPayment && !paymentComplete && (
                          <button
                            type="button"
                            onClick={() => handleMakePayment(order)}
                            disabled={submittingPaymentOrderId === order.id}
                            className={`flex-1 sm:flex-none px-4 py-2 text-xs sm:text-sm font-medium rounded-lg border flex items-center justify-center gap-2 transition ${
                              submittingPaymentOrderId === order.id
                                ? "bg-gray-50 border-gray-200 text-gray-400 cursor-not-allowed"
                                : "bg-white border-gray-300 text-[#4A5130] hover:bg-gray-50"
                            }`}
                          >
                            <CreditCard size={14} className="sm:w-4 sm:h-4" />
                            <span className="hidden sm:inline">
                              {submittingPaymentOrderId === order.id
                                ? "Submitting..."
                                : "Make Payment"}
                            </span>
                            <span className="sm:hidden">Pay</span>
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => handleContactSeller(order)}
                          disabled={contactingOrderId === order.id}
                          className={`flex-1 sm:flex-none px-4 py-2 text-xs sm:text-sm font-medium rounded-lg border flex items-center justify-center gap-2 transition ${
                            contactingOrderId === order.id
                              ? "bg-gray-50 border-gray-200 text-gray-400 cursor-not-allowed"
                              : "bg-white border-gray-300 text-[#4A5130] hover:bg-gray-50"
                          }`}
                        >
                          <MessageCircle size={14} className="sm:w-4 sm:h-4" />
                          <span className="hidden sm:inline">
                            {contactingOrderId === order.id
                              ? "Opening..."
                              : "Contact"}
                          </span>
                          <span className="sm:hidden">Chat</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
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
