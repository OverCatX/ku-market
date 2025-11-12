"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
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
} from "lucide-react";
import toast from "react-hot-toast";
import { ComponentType } from "react";
import { clearAuthTokens, getAuthToken, isAuthenticated } from "@/lib/auth";

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
  };
  createdAt?: string;
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
      counts[order.status] += 1;
    });

    return counts;
  }, [orders]);

  const totalCount = orders.length;

  const filteredOrders = useMemo(() => {
    if (filter === "all") return orders;
    return orders.filter((order) => order.status === filter);
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
        className: "bg-yellow-100 text-yellow-700",
        Icon: Clock,
      },
      confirmed: {
        label: "Confirmed",
        className: "bg-blue-100 text-blue-700",
        Icon: Package,
      },
      completed: {
        label: "Completed",
        className: "bg-green-100 text-green-700",
        Icon: CheckCircle,
      },
      rejected: {
        label: "Rejected",
        className: "bg-red-100 text-red-700",
        Icon: XCircle,
      },
      cancelled: {
        label: "Cancelled",
        className: "bg-gray-100 text-gray-700",
        Icon: XCircle,
      },
    };
    const s = map[status];
    const Icon = s.Icon;
    return (
      <span
        className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-semibold ${s.className}`}
      >
        <Icon size={14} />
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
        label: "Pending seller review",
        className: "bg-gray-100 text-gray-700",
      },
      awaiting_payment: {
        label: "Awaiting your payment",
        className: "bg-orange-100 text-orange-800",
      },
      payment_submitted: {
        label: "Payment submitted",
        className: "bg-blue-100 text-blue-700",
      },
      paid: {
        label: "Payment completed",
        className: "bg-green-100 text-green-700",
      },
      not_required: {
        label: "Payment not required",
        className: "bg-gray-100 text-gray-600",
      },
    };

    const badge = map[status] ?? map.pending;

    return (
      <span
        className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-medium ${badge.className}`}
      >
        <CreditCard size={12} />
        {badge.label}
      </span>
    );
  };

  const formatPaymentMethod = (value: OrderData["paymentMethod"]) => {
    if (value === "promptpay") return "PromptPay";
    if (value === "transfer") return "Bank transfer";
    return "Cash";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f5f8f1] via-white to-[#eef4e6] py-10">
      <div className="container mx-auto px-4 sm:px-6 lg:px-16 max-w-6xl">
        <section className="rounded-3xl bg-white/90 border border-[#e4ecd7] shadow-xl shadow-[#c8d3ba]/30 p-6 sm:p-8 mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-[#3d4a29]">
                My Orders
              </h1>
              <p className="mt-2 text-gray-600">
                Track every purchase from pending confirmation to completion.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={loadOrders}
                disabled={loading}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#84B067] text-white font-semibold shadow hover:shadow-lg transition disabled:opacity-60"
              >
                <RefreshCw
                  size={18}
                  className={loading ? "animate-spin" : ""}
                />
                Refresh
              </button>
              <Link
                href="/marketplace"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-[#d6e4c3] text-[#4c5c2f] font-semibold hover:bg-[#f3f8ed] transition"
              >
                Continue Shopping
              </Link>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              {
                label: "Total Orders",
                value: totalCount,
                accent: "bg-[#eef6e5] text-[#2f3b11]",
                Icon: Package,
              },
              {
                label: "Pending",
                value: statusCounts.pending_seller_confirmation,
                accent: "bg-[#fff7e6] text-[#b26a00]",
                Icon: Clock,
              },
              {
                label: "Confirmed",
                value: statusCounts.confirmed,
                accent: "bg-[#e6f2ff] text-[#1f4aa8]",
                Icon: Package,
              },
              {
                label: "Completed",
                value: statusCounts.completed,
                accent: "bg-[#e6f7ef] text-[#1f7a3c]",
                Icon: CheckCircle,
              },
            ].map(({ label, value, accent, Icon }) => (
              <div
                key={label}
                className={`rounded-2xl p-4 flex items-center gap-3 border border-[#e4ecd7] ${accent}`}
              >
                <div className="p-2 rounded-full bg-white shadow">
                  <Icon size={24} />
                </div>
                <div>
                  <p className="text-sm font-medium opacity-80">{label}</p>
                  <p className="text-xl font-bold">{value}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <div className="flex flex-wrap gap-2 mb-6">
          {filterOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => setFilter(option.value)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === option.value
                  ? "bg-[#84B067] text-white shadow"
                  : "bg-white text-gray-700 hover:bg-[#f3f8ed] border border-[#d6e4c3]"
              }`}
            >
              {option.label}
              <span className="ml-2 text-xs opacity-70">({option.count})</span>
            </button>
          ))}
        </div>

        {loading ? (
          <div className="bg-white rounded-3xl border border-[#e4ecd7] shadow-sm p-6 text-gray-500">
            Loading...
          </div>
        ) : sortedOrders.length === 0 ? (
          <div className="bg-white/80 rounded-3xl border border-dashed border-[#d6e4c3] shadow-sm p-10 text-center text-gray-500">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[#eef6e5] text-[#4c5c2f]">
              <Package size={28} />
            </div>
            <p className="text-lg font-semibold text-gray-700">
              No orders in this category yet.
            </p>
            <p className="mt-2 text-sm text-gray-500">
              Browse the marketplace and start your first purchase!
            </p>
          </div>
        ) : (
          <div className="space-y-5">
            {sortedOrders.map((order) => {
              const requiresPayment =
                order.paymentMethod === "promptpay" ||
                order.paymentMethod === "transfer";
              const awaitingBuyerPayment =
                requiresPayment &&
                order.status === "confirmed" &&
                (order.paymentStatus === "awaiting_payment" ||
                  order.paymentStatus === "pending" ||
                  order.paymentStatus === undefined);
              const paymentComplete =
                order.paymentStatus === "payment_submitted" ||
                order.paymentStatus === "paid";

              return (
                <div
                  key={order.id}
                  className="bg-white/90 rounded-3xl border border-[#e4ecd7] shadow-lg shadow-[#c8d3ba]/20 p-5 sm:p-6"
                >
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:gap-4">
                      <div className="flex items-center gap-3">
                        {statusBadge(order.status)}
                        <div className="text-sm text-gray-600">
                          Seller:{" "}
                          <span className="font-semibold text-gray-900">
                            {order.seller?.name || "Unknown"}
                          </span>
                        </div>
                      </div>
                      <div className="text-xs sm:text-sm text-gray-500 font-medium">
                        Placed: {formatDate(order.createdAt)}
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-3 text-sm text-gray-600">
                      <div>
                        <span className="font-semibold text-gray-900">
                          {order.totalPrice.toLocaleString()} THB
                        </span>{" "}
                        total
                      </div>
                      <span className="text-gray-300">•</span>
                      <div className="capitalize">
                        Delivery:{" "}
                        <span className="font-medium text-gray-900">
                          {order.deliveryMethod}
                        </span>
                      </div>
                      <span className="text-gray-300">•</span>
                      <div className="capitalize">
                        Payment:{" "}
                        <span className="font-medium text-gray-900">
                          {formatPaymentMethod(order.paymentMethod)}
                        </span>
                      </div>
                    </div>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {paymentStatusBadge(order.paymentStatus)}
                      {order.deliveryMethod === "pickup" &&
                        order.pickupDetails && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-[#eef4e6] px-2.5 py-1 text-[11px] font-medium text-[#4c5c2f]">
                            <MapPin size={12} />
                            {order.pickupDetails.locationName}
                          </span>
                        )}
                    </div>
                  </div>

                  {order.deliveryMethod === "pickup" && order.pickupDetails && (
                    <div className="mt-4 rounded-xl border border-dashed border-[#cbd9b5] bg-[#f8fbef] p-4 text-sm text-[#3f5124]">
                      <div className="flex items-start gap-2">
                        <MapPin size={16} className="mt-0.5 text-[#6b7d3a]" />
                        <div className="space-y-1">
                          <p className="font-semibold">Pickup location</p>
                          <p className="font-medium">
                            {order.pickupDetails.locationName}
                          </p>
                          {order.pickupDetails.address && (
                            <p className="text-gray-600">
                              {order.pickupDetails.address}
                            </p>
                          )}
                          {order.pickupDetails.note && (
                            <p className="text-gray-500 text-xs">
                              Note: {order.pickupDetails.note}
                            </p>
                          )}
                          {order.pickupDetails.coordinates && (
                            <p className="text-[11px] text-gray-500">
                              Coordinates:{" "}
                              {order.pickupDetails.coordinates.lat.toFixed(6)},{" "}
                              {order.pickupDetails.coordinates.lng.toFixed(6)}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="mt-4 grid sm:grid-cols-2 md:grid-cols-3 gap-3">
                    {order.items.slice(0, 3).map((it, idx) => (
                      <div
                        key={`${order.id}-${idx}`}
                        className="flex items-center gap-3"
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={it.image || "/placeholder.png"}
                          alt={it.title}
                          className="w-12 h-12 rounded-lg object-cover border border-[#e4ecd7]"
                        />
                        <div className="min-w-0">
                          <div className="text-sm font-medium text-gray-900 truncate">
                            {it.title}
                          </div>
                          <div className="text-xs text-gray-500">
                            {it.quantity} × {it.price} THB
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="text-xs text-gray-500">
                      Showing {Math.min(order.items.length, 3)} of{" "}
                      {order.items.length} item
                      {order.items.length > 1 ? "s" : ""}
                    </div>
                    <div className="flex flex-col sm:flex-row gap-2">
                      <Link
                        href={`/order/${order.id}`}
                        className="px-4 py-2 text-sm font-semibold rounded-lg bg-[#4c5c2f] text-white hover:bg-[#3a4b23] transition"
                      >
                        View details
                      </Link>
                      {awaitingBuyerPayment && !paymentComplete && (
                        <button
                          type="button"
                          onClick={() => handleMakePayment(order)}
                          disabled={submittingPaymentOrderId === order.id}
                          className={`px-4 py-2 text-sm font-semibold rounded-lg border flex items-center gap-2 transition ${
                            submittingPaymentOrderId === order.id
                              ? "bg-[#f3f8ed] border-[#d6e4c3] text-gray-400 cursor-not-allowed"
                              : "bg-[#f8fbf1] border-[#b9c99f] text-[#4c5c2f] hover:bg-[#eef5df]"
                          }`}
                        >
                          <CreditCard size={16} />
                          {submittingPaymentOrderId === order.id
                            ? "Submitting..."
                            : "Make payment"}
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => handleContactSeller(order)}
                        disabled={contactingOrderId === order.id}
                        className={`px-4 py-2 text-sm font-semibold rounded-lg border flex items-center gap-2 transition ${
                          contactingOrderId === order.id
                            ? "bg-[#f3f8ed] border-[#d6e4c3] text-gray-400 cursor-not-allowed"
                            : "bg-white border-[#d6e4c3] text-gray-700 hover:bg-[#f3f8ed]"
                        }`}
                      >
                        <MessageCircle size={16} />
                        {contactingOrderId === order.id
                          ? "Opening chat..."
                          : "Contact seller"}
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
