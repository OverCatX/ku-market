"use client";

import { useEffect, useMemo, useState } from "react";
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
} from "lucide-react";
import toast from "react-hot-toast";
import { ComponentType } from "react";
import { clearAuthTokens, getAuthToken, isAuthenticated } from "@/lib/auth";

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
  seller: { id: string; name?: string };
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
      <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
        <div className="flex items-start gap-2">
          <MapPin size={16} className="mt-0.5 text-gray-500 flex-shrink-0" />
          <div className="text-sm flex-1">
            <p className="font-medium text-gray-900">
              {pickupDetails.locationName}
            </p>
            {pickupDetails.address && (
              <p className="text-gray-600 text-xs mt-0.5">
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
                  className="inline-flex items-center gap-1 text-xs font-medium text-blue-600 hover:text-blue-700 hover:underline transition"
                >
                  <ExternalLink size={12} />
                  Open in Google Maps
                </a>
              </div>
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

  useEffect(() => {
    // Scroll to top when page loads
    window.scrollTo({ top: 0, behavior: "smooth" });
    loadOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadOrders = async (): Promise<void> => {
    setLoading(true);
    try {
      const token = localStorage.getItem("authentication");
      if (!token) {
        router.replace("/login?redirect=/orders");
        return;
      }
      const res = await fetch(`${API_BASE}/api/orders`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        throw new Error("Failed to load orders");
      }
      const data = await res.json();
      setOrders(data.orders || []);
    } catch (error) {
      console.error("Failed to load orders:", error);
      toast.error("Failed to load orders");
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

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

  const statusCounts = useMemo(() => {
    const counts: Record<OrderData["status"], number> = {
      pending_seller_confirmation: 0,
      confirmed: 0,
      completed: 0,
      rejected: 0,
      cancelled: 0,
    };

    orders.forEach((order) => {
      const normalized = normalizeStatus(order.status);
      if (normalized) {
        counts[normalized] += 1;
      }
    });

    return counts;
  }, [orders]);

  const totalCount = orders.length;

  const filteredOrders = useMemo(() => {
    if (filter === "all") return orders;
    return orders.filter((order) => normalizeStatus(order.status) === filter);
  }, [orders, filter]);

  const sortedOrders = useMemo(
    () =>
      [...filteredOrders].sort((a, b) => {
        const aTime = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const bTime = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return bTime - aTime;
      }),
    [filteredOrders]
  );

  const formatDate = (date?: string) => {
    if (!date) return "Unknown";
    return new Date(date).toLocaleString("th-TH", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  };

  const filterOptions = useMemo(
    () => [
      { value: "all" as const, label: "All", count: totalCount },
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
    [totalCount, statusCounts]
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
        className: "bg-blue-50 text-blue-700 border-blue-200",
        Icon: Package,
      },
      completed: {
        label: "Completed",
        className: "bg-green-50 text-green-700 border-green-200",
        Icon: CheckCircle,
      },
      rejected: {
        label: "Rejected",
        className: "bg-red-50 text-red-700 border-red-200",
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
        className: "bg-orange-50 text-orange-700 border-orange-200",
      },
      payment_submitted: {
        label: "Payment submitted",
        className: "bg-blue-50 text-blue-700 border-blue-200",
      },
      paid: {
        label: "Paid",
        className: "bg-green-50 text-green-700 border-green-200",
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
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">My Orders</h1>
              <p className="mt-1 text-sm text-gray-500">
                Manage and track your orders
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={loadOrders}
                disabled={loading}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-white border border-gray-300 text-gray-700 text-sm font-medium hover:bg-gray-50 transition disabled:opacity-50"
              >
                <RefreshCw
                  size={16}
                  className={loading ? "animate-spin" : ""}
                />
                Refresh
              </button>
              <Link
                href="/marketplace"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#84B067] text-white text-sm font-medium hover:bg-[#73995a] transition"
              >
                Continue Shopping
              </Link>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              {
                label: "Total",
                value: totalCount,
                color: "text-gray-700",
                Icon: Package,
              },
              {
                label: "Pending",
                value: statusCounts.pending_seller_confirmation,
                color: "text-yellow-600",
                Icon: Clock,
              },
              {
                label: "Confirmed",
                value: statusCounts.confirmed,
                color: "text-blue-600",
                Icon: Package,
              },
              {
                label: "Completed",
                value: statusCounts.completed,
                color: "text-green-600",
                Icon: CheckCircle,
              },
            ].map(({ label, value, color, Icon }) => (
              <div
                key={label}
                className="bg-white rounded-lg border border-gray-200 p-4"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-gray-500 mb-1">{label}</p>
                    <p className={`text-2xl font-bold ${color}`}>{value}</p>
                  </div>
                  <Icon size={20} className={`${color} opacity-60`} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex flex-wrap gap-2 mb-6">
          {filterOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => setFilter(option.value)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === option.value
                  ? "bg-[#84B067] text-white"
                  : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-200"
              }`}
            >
              {option.label}
              <span className="ml-1.5 text-xs opacity-75">
                ({option.count})
              </span>
            </button>
          ))}
        </div>

        {/* Orders List */}
        {loading ? (
          <div className="bg-white rounded-lg border border-gray-200 p-12 text-center text-gray-500">
            <RefreshCw size={24} className="animate-spin mx-auto mb-2" />
            <p>Loading orders...</p>
          </div>
        ) : sortedOrders.length === 0 ? (
          <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100 text-gray-400">
              <Package size={32} />
            </div>
            <p className="text-lg font-semibold text-gray-900 mb-1">
              No orders found
            </p>
            <p className="text-sm text-gray-500">
              Start shopping to see your orders here
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {sortedOrders.map((order) => {
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
                  <div className="p-5 border-b border-gray-100">
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          {statusBadge(displayStatus)}
                          {paymentStatusBadge(
                            normalizedPaymentStatus ?? undefined
                          )}
                        </div>
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-600">
                          <span>
                            <span className="font-medium text-gray-900">
                              {order.totalPrice.toLocaleString()} THB
                            </span>
                          </span>
                          <span className="text-gray-300">•</span>
                          <span className="capitalize">
                            {order.deliveryMethod}
                          </span>
                          <span className="text-gray-300">•</span>
                          <span>
                            {formatPaymentMethod(order.paymentMethod)}
                          </span>
                          <span className="text-gray-300">•</span>
                          <span className="text-gray-500">
                            {formatDate(order.createdAt)}
                          </span>
                        </div>
                      </div>
                      <div className="text-sm text-gray-600">
                        <span className="text-gray-500">Seller:</span>{" "}
                        <span className="font-medium text-gray-900">
                          {order.seller?.name || "Unknown"}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Order Items */}
                  <div className="p-5">
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-4">
                      {order.items.slice(0, 3).map((it, idx) => (
                        <div
                          key={`${order.id}-${idx}`}
                          className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 transition"
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={it.image || "/placeholder.png"}
                            alt={it.title}
                            className="w-14 h-14 rounded-md object-cover border border-gray-200"
                          />
                          <div className="min-w-0 flex-1">
                            <div className="text-sm font-medium text-gray-900 truncate">
                              {it.title}
                            </div>
                            <div className="text-xs text-gray-500">
                              {it.quantity} × {it.price.toLocaleString()} THB
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {order.items.length > 3 && (
                      <p className="text-xs text-gray-500 mb-4">
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
                        className="flex-1 sm:flex-none px-4 py-2 text-sm font-medium rounded-lg bg-[#84B067] text-white hover:bg-[#73995a] transition text-center"
                      >
                        View Details
                      </Link>
                      {awaitingBuyerPayment && !paymentComplete && (
                        <button
                          type="button"
                          onClick={() => handleMakePayment(order)}
                          disabled={submittingPaymentOrderId === order.id}
                          className={`px-4 py-2 text-sm font-medium rounded-lg border flex items-center justify-center gap-2 transition ${
                            submittingPaymentOrderId === order.id
                              ? "bg-gray-50 border-gray-200 text-gray-400 cursor-not-allowed"
                              : "bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
                          }`}
                        >
                          <CreditCard size={16} />
                          {submittingPaymentOrderId === order.id
                            ? "Submitting..."
                            : "Make Payment"}
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => handleContactSeller(order)}
                        disabled={contactingOrderId === order.id}
                        className={`px-4 py-2 text-sm font-medium rounded-lg border flex items-center justify-center gap-2 transition ${
                          contactingOrderId === order.id
                            ? "bg-gray-50 border-gray-200 text-gray-400 cursor-not-allowed"
                            : "bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
                        }`}
                      >
                        <MessageCircle size={16} />
                        {contactingOrderId === order.id
                          ? "Opening..."
                          : "Contact"}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
