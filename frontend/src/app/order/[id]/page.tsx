"use client";

import { useCallback, useEffect, useMemo, useState, use } from "react";
import type { ComponentType } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowLeft,
  CheckCircle,
  Clock,
  Package,
  Truck,
  XCircle,
  MessageCircle,
  Home,
  ShoppingBag,
  CreditCard,
  MapPin,
  QrCode,
  AlertCircle,
  RefreshCw,
} from "lucide-react";
import toast from "react-hot-toast";
import { API_BASE } from "@/config/constants";
import { useRouter } from "next/navigation";
import { clearAuthTokens, getAuthToken, isAuthenticated } from "@/lib/auth";

interface OrderItem {
  itemId: string;
  title: string;
  price: number;
  quantity: number;
  image?: string;
}

interface SellerDetails {
  id: string;
  name?: string;
  contact?: string;
}

interface ShippingAddress {
  address?: string;
  city?: string;
  postalCode?: string;
}

interface BuyerContact {
  fullName: string;
  phone: string;
}

interface OrderDetail {
  id: string;
  seller: SellerDetails;
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
  shippingAddress?: ShippingAddress;
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
  buyerContact: BuyerContact;
  confirmedAt?: string;
  rejectedAt?: string;
  rejectionReason?: string;
  completedAt?: string;
  buyerReceived?: boolean;
  buyerReceivedAt?: string;
  sellerDelivered?: boolean;
  sellerDeliveredAt?: string;
  createdAt?: string;
  updatedAt?: string;
}

const statusStyles: Record<
  OrderDetail["status"],
  {
    label: string;
    badge: string;
    icon: ComponentType<{ size?: number; className?: string }>;
  }
> = {
  pending_seller_confirmation: {
    label: "Pending seller confirmation",
    badge: "bg-yellow-100 text-yellow-700",
    icon: Clock,
  },
  confirmed: {
    label: "Confirmed",
    badge: "bg-[#724a24]/10 text-[#724a24]",
    icon: Package,
  },
  completed: {
    label: "Completed",
    badge: "bg-[#69773D]/10 text-[#69773D]",
    icon: CheckCircle,
  },
  rejected: {
    label: "Rejected",
    badge: "bg-[#780606]/10 text-[#780606] border border-[#780606]/20",
    icon: XCircle,
  },
  cancelled: {
    label: "Cancelled",
    badge: "bg-gray-100 text-gray-700",
    icon: XCircle,
  },
};

const statusTips: Record<OrderDetail["status"], string> = {
  pending_seller_confirmation:
    "The seller is reviewing your order. You will be notified once they confirm.",
  confirmed:
    "Seller has confirmed the order. Coordinate the meetup or delivery, and submit payment if PromtPay/transfer is required.",
  completed:
    "Order marked as completed. Thank you for shopping with KU Market!",
  rejected:
    "Seller rejected the order. Review the reason below and contact the seller if needed.",
  cancelled:
    "Order was cancelled. If this is unexpected, contact the seller for support.",
};

const paymentStatusBadge = (status?: OrderDetail["paymentStatus"]) => {
  if (!status || status === "not_required") {
    return null;
  }

  const map: Record<
    Exclude<OrderDetail["paymentStatus"], undefined>,
    { label: string; className: string }
  > = {
    pending: {
      label: "Pending seller review",
      className: "bg-gray-100 text-gray-700",
    },
    awaiting_payment: {
      label: "Awaiting your payment",
      className: "bg-[#780606]/10 text-[#780606]",
    },
    payment_submitted: {
      label: "Payment submitted",
      className: "bg-[#69773D]/10 text-[#69773D]",
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

const formatPaymentMethod = (method: OrderDetail["paymentMethod"]) => {
  const normalized = normalizePaymentMethod(method);
  if (normalized === "promptpay") return "PromptPay";
  if (normalized === "transfer") return "Bank transfer";
  return "Cash";
};

const formatDateTime = (value?: string) => {
  if (!value) return "—";
  return new Date(value).toLocaleString("th-TH", {
    dateStyle: "medium",
    timeStyle: "short",
  });
};

const normalizeStatus = (
  status?: OrderDetail["status"]
): OrderDetail["status"] | null => {
  if (!status) return null;
  const lowered = status.trim().toLowerCase();
  const map: Record<string, OrderDetail["status"]> = {
    pending_seller_confirmation: "pending_seller_confirmation",
    confirmed: "confirmed",
    rejected: "rejected",
    completed: "completed",
    cancelled: "cancelled",
  };
  return map[lowered] ?? null;
};

const normalizePaymentStatus = (
  status?: OrderDetail["paymentStatus"]
): OrderDetail["paymentStatus"] | null => {
  if (!status) return null;
  const lowered = status.trim().toLowerCase();
  const map: Record<string, OrderDetail["paymentStatus"]> = {
    pending: "pending",
    awaiting_payment: "awaiting_payment",
    payment_submitted: "payment_submitted",
    paid: "paid",
    not_required: "not_required",
  };
  return map[lowered] ?? null;
};

const normalizePaymentMethod = (
  method?: OrderDetail["paymentMethod"]
): "cash" | "promptpay" | "transfer" | null => {
  if (!method) return null;
  const lowered = method.trim().toLowerCase();
  if (lowered === "cash" || lowered === "promptpay" || lowered === "transfer") {
    return lowered as "cash" | "promptpay" | "transfer";
  }
  return null;
};

const resolveMessage = (
  payload: Record<string, unknown>,
  fallback: string
): string => {
  const fromError =
    typeof payload.error === "string" ? payload.error : undefined;
  const fromMessage =
    typeof payload.message === "string" ? payload.message : undefined;
  return fromError || fromMessage || fallback;
};

export default function OrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: orderId } = use(params);
  const router = useRouter();

  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [contactingSeller, setContactingSeller] = useState(false);
  const [markingReceived, setMarkingReceived] = useState(false);

  const fetchOrder = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem("authentication");
      if (!token) {
        setError("Please login to view this order.");
        return;
      }

      const response = await fetch(`${API_BASE}/api/orders/${orderId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const payloadText = await response.text();
      let payload: Record<string, unknown> = {};
      if (payloadText) {
        try {
          payload = JSON.parse(payloadText);
        } catch {
          payload = {};
        }
      }

      if (response.status === 401) {
        setError("Your session expired. Please login again.");
        return;
      }

      if (response.status === 403) {
        setError(
          resolveMessage(payload, "You do not have access to this order.")
        );
        return;
      }

      if (response.status === 404) {
        setError(resolveMessage(payload, "This order could not be found."));
        return;
      }

      if (!response.ok) {
        throw new Error(resolveMessage(payload, "Failed to load order"));
      }

      if (!payload.order) {
        throw new Error("Order details are unavailable.");
      }

      setOrder(payload.order as OrderDetail);
    } catch (err) {
      console.error("Order detail failed: ", err);
      setError(
        err instanceof Error ? err.message : "Failed to load order details"
      );
    } finally {
      setLoading(false);
    }
  }, [orderId]);

  useEffect(() => {
    fetchOrder();
  }, [fetchOrder]);

  const handleMakePayment = useCallback(async () => {
    if (!order) {
      return;
    }

    // Only for PromptPay method
    if (order.paymentMethod !== "promptpay") {
      return;
    }

    // Redirect to Stripe Elements payment page
    router.push(`/payment/${order.id}`);
  }, [order, router]);

  const handleMarkReceived = useCallback(async () => {
    if (!order) {
      return;
    }

    if (!isAuthenticated()) {
      toast.error("Please login first");
      return;
    }

    const token = getAuthToken();
    if (!token) {
      clearAuthTokens();
      toast.error("Please login first");
      return;
    }

    setMarkingReceived(true);
    try {
      const response = await fetch(
        `${API_BASE}/api/orders/${order.id}/buyer-received`,
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
          "Failed to mark as received";
        throw new Error(message);
      }

      toast.success("Order marked as received!");
      await fetchOrder();
    } catch (err) {
      console.error("Mark received error:", err);
      toast.error(
        err instanceof Error ? err.message : "Failed to mark as received"
      );
    } finally {
      setMarkingReceived(false);
    }
  }, [fetchOrder, order]);

  const handleContactSeller = useCallback(async () => {
    if (!order?.seller?.id) {
      toast.error("Seller information unavailable");
      return;
    }

    if (!isAuthenticated()) {
      toast.error("Please login to contact the seller");
      router.push(`/login?redirect=/order/${order.id}`);
      return;
    }

    const token = getAuthToken();
    if (!token) {
      clearAuthTokens();
      toast.error("Please login to contact the seller");
      router.push(`/login?redirect=/order/${order.id}`);
      return;
    }

    setContactingSeller(true);
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
        router.push(`/login?redirect=/order/${order.id}`);
        return;
      }

      if (!response.ok) {
        const payload = (await response.json().catch(() => null)) as {
          error?: string;
          message?: string;
        } | null;
        const message =
          payload?.error || payload?.message || "Failed to contact seller";
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
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to contact seller";
      toast.error(message);
    } finally {
      setContactingSeller(false);
    }
  }, [order, router]);

  const statusBlock = useMemo(() => {
    if (!order) return null;
    const normalizedStatus =
      normalizeStatus(order.status) ?? "pending_seller_confirmation";
    const meta = statusStyles[normalizedStatus];
    const Icon = meta.icon;
    return (
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="inline-flex items-center gap-2">
          <span
            className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-sm font-semibold ${meta.badge}`}
          >
            <Icon size={16} />
            {meta.label}
          </span>
          <span className="text-xs text-gray-500">
            Placed on {formatDateTime(order.createdAt)}
          </span>
        </div>
        <div className="text-xs text-gray-500">
          Last updated {formatDateTime(order.updatedAt)}
        </div>
      </div>
    );
  }, [order]);

  const paymentState = useMemo(() => {
    if (!order) {
      return {
        requiresPayment: false,
        awaitingBuyerPayment: false,
        paymentComplete: false,
      };
    }

    const normalizedMethod = normalizePaymentMethod(order.paymentMethod);
    const rawMethod = order.paymentMethod
      ? order.paymentMethod.trim().toLowerCase()
      : null;
    const normalizedStatus = normalizeStatus(order.status);
    const normalizedPaymentStatus = normalizePaymentStatus(order.paymentStatus);

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

    return { requiresPayment, awaitingBuyerPayment, paymentComplete };
  }, [order]);

  const { paymentComplete } = paymentState;

  if (loading) {
    return (
      <div
        className="min-h-screen py-12"
        style={{ backgroundColor: "#F6F2E5" }}
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-16 max-w-4xl">
          <div className="rounded-3xl bg-white p-8 shadow animate-pulse">
            <div className="h-8 w-40 rounded bg-gray-200" />
            <div className="mt-6 h-4 w-full rounded bg-gray-200" />
            <div className="mt-4 h-4 w-3/4 rounded bg-gray-200" />
            <div className="mt-10 grid gap-3">
              {[1, 2, 3].map((item) => (
                <div key={item} className="flex items-center gap-4">
                  <div className="h-14 w-14 rounded bg-gray-200" />
                  <div className="flex-1 space-y-2">
                    <div className="h-3 w-1/2 rounded bg-gray-200" />
                    <div className="h-3 w-1/3 rounded bg-gray-200" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div
        className="min-h-screen py-12"
        style={{ backgroundColor: "#F6F2E5" }}
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-16 max-w-3xl">
          <div className="rounded-3xl bg-white p-8 shadow text-center">
            <XCircle className="mx-auto h-12 w-12 text-[#780606]" />
            <h1 className="mt-4 text-2xl font-bold text-gray-900">Oops!</h1>
            <p className="mt-2 text-gray-600">
              {error || "We couldn’t find this order."}
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <Link
                href="/orders"
                className="inline-flex items-center gap-2 rounded-xl bg-[#69773D] px-4 py-2 text-sm font-semibold text-white hover:bg-[#55602f]"
              >
                <ArrowLeft size={16} /> Back to orders
              </Link>
              <Link
                href="/"
                className="inline-flex items-center gap-2 rounded-xl border border-[#d6e4c3] px-4 py-2 text-sm font-semibold text-[#4c5c2f] hover:bg-[#f3f8ed]"
              >
                <Home size={16} /> Home
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const normalizedStatus =
    normalizeStatus(order.status) ?? "pending_seller_confirmation";
  const meta = statusStyles[normalizedStatus];
  const StatusIcon = meta.icon;

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f5f8f1] via-white to-[#eef4e6] py-4 sm:py-6 lg:py-10">
      <div className="container mx-auto px-4 sm:px-6 lg:px-16 max-w-4xl">
        <div className="mb-3 sm:mb-4">
          <Link
            href="/orders"
            className="inline-flex items-center gap-2 text-xs sm:text-sm font-medium text-[#4c5c2f] hover:text-[#2f3816]"
          >
            <ArrowLeft size={14} className="sm:w-4 sm:h-4" />{" "}
            <span className="hidden sm:inline">Back to orders</span>
            <span className="sm:hidden">Back</span>
          </Link>
          <button
            onClick={fetchOrder}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-[#F6F2E5] text-[#4A5130] rounded-lg hover:bg-[#69773D]/10 hover:text-[#4A5130] disabled:opacity-50 transition-colors"
          >
            <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
            Refresh
          </button>
        </div>

        <div className="rounded-2xl sm:rounded-3xl bg-white/90 border border-[#e4ecd7] shadow-xl shadow-[#c8d3ba]/30 p-4 sm:p-6 lg:p-8">
          <div className="flex flex-col gap-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
              <div className="min-w-0 flex-1">
                <span className="text-xs uppercase tracking-wider font-bold text-gray-600">
                  Order ID
                </span>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-[#4A5130] break-words mt-1">
                  {order.id}
                </h1>
              </div>
              <StatusIcon
                size={28}
                className="text-[#69773D] flex-shrink-0 sm:w-8 sm:h-8"
              />
            </div>

            {statusBlock}

            <div className="rounded-xl sm:rounded-2xl bg-[#f3f8ed] border border-[#dfe7cf] p-3 sm:p-4">
              <p className="text-xs sm:text-sm text-gray-600">
                {statusTips[normalizedStatus]}
              </p>
              {order.rejectionReason && (
                <p className="mt-2 text-xs sm:text-sm font-semibold text-[#780606]">
                  Reason: {order.rejectionReason}
                </p>
              )}
            </div>

            <section className="rounded-xl sm:rounded-2xl border border-[#e4ecd7] bg-white p-4 sm:p-6">
              <h2 className="mb-3 sm:mb-4 text-lg sm:text-xl font-extrabold text-[#4A5130]">
                Items in this order
              </h2>
              <div className="space-y-4">
                {order.items.map((item) => (
                  <div
                    key={item.itemId}
                    className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-[#eef2e1] pb-3 last:border-none"
                  >
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <div className="relative h-12 w-12 sm:h-14 sm:w-14 overflow-hidden rounded-lg sm:rounded-xl bg-[#f5f9ef] border border-[#e4ecd7] flex-shrink-0">
                        <Image
                          src={item.image || "/placeholder.png"}
                          alt={item.title}
                          fill
                          sizes="(max-width: 640px) 48px, 56px"
                          className="object-cover"
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="text-sm sm:text-base font-bold text-[#4A5130] truncate">
                          {item.title}
                        </div>
                        <div className="text-xs sm:text-sm font-semibold text-gray-600">
                          {item.quantity} × ฿{item.price.toLocaleString()}
                        </div>
                      </div>
                    </div>
                    <div className="text-base sm:text-lg font-extrabold text-[#5C8140] flex-shrink-0">
                      ฿{(item.price * item.quantity).toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4 pt-4 border-t-2 border-[#5C8140]/20 bg-[#F6F2E5]/50 p-3 rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="text-base sm:text-lg font-extrabold text-[#4A5130]">
                    Total amount
                  </span>
                  <span className="text-xl sm:text-2xl font-extrabold text-[#5C8140]">
                    ฿{order.totalPrice.toLocaleString()}
                  </span>
                </div>
              </div>
            </section>

            <section className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-xl sm:rounded-2xl border border-[#e4ecd7] bg-white p-3 sm:p-4">
                <h3 className="text-sm sm:text-base font-extrabold text-[#4A5130] mb-3 sm:mb-3">
                  Delivery & Payment
                </h3>
                <div className="mt-2 space-y-2.5 text-sm text-gray-700">
                  <div className="flex items-center gap-2">
                    <Truck size={18} className="text-[#5C8140]" />
                    <span className="font-bold capitalize text-[#4A5130]">
                      {order.deliveryMethod}
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <Package size={18} className="text-[#5C8140]" />
                    <span className="font-bold text-[#4A5130]">
                      {formatPaymentMethod(order.paymentMethod)}
                    </span>
                    {paymentStatusBadge(
                      normalizePaymentStatus(order.paymentStatus) ?? undefined
                    )}
                  </div>
                  {order.deliveryMethod === "delivery" &&
                    order.shippingAddress && (
                      <div className="mt-2 space-y-1 rounded-lg border-2 border-[#5C8140]/30 bg-[#f8fbef] p-3 text-sm">
                        <p className="font-extrabold text-base text-[#4A5130]">
                          Shipping Address
                        </p>
                        <p className="font-semibold text-gray-800">
                          {order.shippingAddress.address}
                        </p>
                        <p className="font-semibold text-gray-700">
                          {order.shippingAddress.city}{" "}
                          {order.shippingAddress.postalCode}
                        </p>
                      </div>
                    )}
                  {order.deliveryMethod === "pickup" && order.pickupDetails && (
                    <div className="mt-2 space-y-2 rounded-lg border-2 border-[#5C8140]/30 bg-[#f8fbef] p-3 text-sm">
                      <p className="font-extrabold text-base text-[#4A5130] flex items-center gap-1.5">
                        <MapPin size={16} className="text-[#5C8140]" />
                        Meetup Point
                      </p>
                      <p className="font-bold text-[#4A5130] text-base">
                        {order.pickupDetails.locationName}
                      </p>
                      {order.pickupDetails.address && (
                        <p className="font-semibold text-gray-700">
                          {order.pickupDetails.address}
                        </p>
                      )}
                      {order.pickupDetails.coordinates && (
                        <p className="text-xs font-medium text-gray-600 font-mono">
                          📍 Coordinates:{" "}
                          {order.pickupDetails.coordinates.lat.toFixed(5)},{" "}
                          {order.pickupDetails.coordinates.lng.toFixed(5)}
                        </p>
                      )}
                      {order.pickupDetails.note && (
                        <p className="text-xs font-semibold text-gray-700 bg-gray-50 p-2 rounded border border-gray-200">
                          <span className="font-bold text-[#4A5130]">
                            Note:
                          </span>{" "}
                          {order.pickupDetails.note}
                        </p>
                      )}
                      {order.pickupDetails.preferredTime && (
                        <p className="text-sm text-[#5C8140] font-bold flex items-center gap-1.5">
                          <Clock size={14} />
                          Preferred time:{" "}
                          <span className="text-[#4A5130]">
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
                    </div>
                  )}
                </div>
              </div>
              <div className="rounded-xl sm:rounded-2xl border border-[#e4ecd7] bg-white p-3 sm:p-4">
                <h3 className="text-sm sm:text-base font-extrabold text-[#4A5130] mb-3 sm:mb-3">
                  Seller Contact
                </h3>
                <div className="mt-2 text-sm text-gray-700">
                  <p className="font-extrabold text-lg text-[#4A5130] break-words">
                    {order.seller?.name || "Unknown"}
                  </p>
                  {order.seller?.contact && (
                    <p className="font-semibold text-gray-700 break-words mt-1">
                      {order.seller.contact}
                    </p>
                  )}
                </div>
                <div className="mt-3 sm:mt-4">
                  <button
                    type="button"
                    onClick={handleContactSeller}
                    disabled={contactingSeller}
                    className={`w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-lg border-2 px-4 py-2.5 text-sm sm:text-base font-bold transition shadow-md hover:shadow-lg ${
                      contactingSeller
                        ? "border-gray-300 bg-gray-100 text-gray-400 cursor-not-allowed"
                        : "bg-[#5C8140] text-white hover:bg-[#4a6b33] border-[#5C8140]"
                    }`}
                  >
                    <MessageCircle size={14} className="sm:w-4 sm:h-4" />
                    <span className="hidden sm:inline">
                      {contactingSeller ? "Opening chat..." : "Contact seller"}
                    </span>
                    <span className="sm:hidden">
                      {contactingSeller ? "Opening..." : "Contact"}
                    </span>
                  </button>
                </div>
              </div>
            </section>

            <div className="mt-4 sm:mt-6 flex flex-col sm:flex-row flex-wrap gap-2 sm:gap-3">
              {/* Payment button for PromptPay when order is confirmed */}
              {normalizedStatus === "confirmed" &&
                order.paymentMethod === "promptpay" &&
                !paymentComplete && (
                  <button
                    type="button"
                    onClick={handleMakePayment}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-lg sm:rounded-xl px-5 py-3 text-sm sm:text-base font-bold transition bg-blue-600 text-white hover:bg-blue-700 shadow-md hover:shadow-lg"
                  >
                    <QrCode size={14} className="sm:w-4 sm:h-4" />
                    Make Payment
                  </button>
                )}
              {/* Payment button for Transfer when order is confirmed */}
              {normalizedStatus === "confirmed" &&
                order.paymentMethod === "transfer" &&
                !paymentComplete && (
                  <button
                    type="button"
                    onClick={handleMakePayment}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-lg sm:rounded-xl px-5 py-3 text-sm sm:text-base font-bold transition bg-[#5C8140] text-white hover:bg-[#4a6b33] shadow-md hover:shadow-lg"
                  >
                    <CreditCard size={14} className="sm:w-4 sm:h-4" />
                    <span className="hidden sm:inline">
                      Submit Payment Notification
                    </span>
                    <span className="sm:hidden">Submit Payment</span>
                  </button>
                )}
              {normalizedStatus === "confirmed" &&
                order.deliveryMethod === "pickup" &&
                !order.buyerReceived && (
                  <>
                    {/* For PromptPay/Transfer: Only show button if payment is submitted */}
                    {(order.paymentMethod === "promptpay" ||
                      order.paymentMethod === "transfer") &&
                      !paymentComplete && (
                        <div className="w-full sm:w-auto inline-flex items-center gap-2 rounded-lg sm:rounded-xl bg-yellow-100 border-2 border-yellow-400 px-4 sm:px-5 py-2.5 text-sm sm:text-base font-bold text-yellow-900 shadow-sm">
                          <AlertCircle
                            size={14}
                            className="sm:w-4 sm:h-4 flex-shrink-0"
                          />
                          <span className="hidden sm:inline">
                            Please submit payment first before confirming
                            receipt
                          </span>
                          <span className="sm:hidden">
                            Submit payment first
                          </span>
                        </div>
                      )}
                    {/* Show button only if: cash payment OR payment is completed */}
                    {(order.paymentMethod === "cash" ||
                      ((order.paymentMethod === "promptpay" ||
                        order.paymentMethod === "transfer") &&
                        paymentComplete)) && (
                      <button
                        type="button"
                        onClick={handleMarkReceived}
                        disabled={markingReceived}
                        className={`w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-lg sm:rounded-xl px-5 py-3 text-sm sm:text-base font-bold transition shadow-md hover:shadow-lg ${
                          markingReceived
                            ? "bg-gray-100 text-gray-400 border-2 border-gray-300 cursor-not-allowed"
                            : "bg-[#e0cd95] text-[#8c522f] hover:bg-[#d4c085] border-2 border-[#8c522f]/30"
                        }`}
                      >
                        <CheckCircle size={14} className="sm:w-4 sm:h-4" />
                        <span className="hidden sm:inline">
                          {markingReceived
                            ? "Saving..."
                            : "I received the product"}
                        </span>
                        <span className="sm:hidden">
                          {markingReceived ? "Saving..." : "Received"}
                        </span>
                      </button>
                    )}
                  </>
                )}
              {order.buyerReceived && !order.sellerDelivered && (
                <div className="w-full sm:w-auto inline-flex items-center gap-2 rounded-lg sm:rounded-xl bg-[#e0cd95]/30 px-3 sm:px-4 py-2 text-xs sm:text-sm font-semibold text-[#8c522f]">
                  <CheckCircle
                    size={14}
                    className="sm:w-4 sm:h-4 flex-shrink-0"
                  />
                  <span className="hidden sm:inline">
                    You have confirmed receiving the product
                  </span>
                  <span className="sm:hidden">Received</span>
                </div>
              )}
              {/* For delivery orders: Show button to mark as received after seller has delivered */}
              {order.deliveryMethod === "delivery" &&
                normalizedStatus === "confirmed" &&
                order.sellerDelivered &&
                !order.buyerReceived && (
                  <button
                    type="button"
                    onClick={handleMarkReceived}
                    disabled={markingReceived}
                    className={`w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-lg sm:rounded-xl px-5 py-3 text-sm sm:text-base font-bold transition shadow-md hover:shadow-lg ${
                      markingReceived
                        ? "bg-gray-100 text-gray-400 border-2 border-gray-300 cursor-not-allowed"
                        : "bg-[#e0cd95] text-[#8c522f] hover:bg-[#d4c085] border-2 border-[#8c522f]/30"
                    }`}
                  >
                    <CheckCircle size={14} className="sm:w-4 sm:h-4" />
                    <span className="hidden sm:inline">
                      {markingReceived ? "Saving..." : "I received the product"}
                    </span>
                    <span className="sm:hidden">
                      {markingReceived ? "Saving..." : "Received"}
                    </span>
                  </button>
                )}
              {/* Status message for delivery orders when seller delivered but buyer hasn't received yet */}
              {order.deliveryMethod === "delivery" &&
                order.sellerDelivered &&
                !order.buyerReceived && (
                  <div className="w-full sm:w-auto inline-flex items-center gap-2 rounded-lg sm:rounded-xl bg-blue-100 px-3 sm:px-4 py-2 text-xs sm:text-sm font-semibold text-blue-700">
                    <CheckCircle
                      size={14}
                      className="sm:w-4 sm:h-4 flex-shrink-0"
                    />
                    <span className="hidden sm:inline">
                      Seller has confirmed delivery - Please confirm receipt
                    </span>
                    <span className="sm:hidden">Please confirm receipt</span>
                  </div>
                )}
              {order.buyerReceived && order.sellerDelivered && (
                <div className="w-full sm:w-auto inline-flex items-center gap-2 rounded-lg sm:rounded-xl bg-green-200 px-3 sm:px-4 py-2 text-xs sm:text-sm font-semibold text-green-800">
                  <CheckCircle
                    size={14}
                    className="sm:w-4 sm:h-4 flex-shrink-0"
                  />
                  <span className="hidden sm:inline">
                    Both parties confirmed - Order completed
                  </span>
                  <span className="sm:hidden">Order completed</span>
                </div>
              )}
              <Link
                href="/orders"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-lg sm:rounded-xl bg-[#69773D] px-4 py-2 text-xs sm:text-sm font-semibold text-white hover:bg-[#55602f] transition"
              >
                <ArrowLeft size={14} className="sm:w-4 sm:h-4" />{" "}
                <span className="hidden sm:inline">Back to my orders</span>
                <span className="sm:hidden">Back</span>
              </Link>
              <Link
                href="/marketplace"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-lg sm:rounded-xl border border-[#d6e4c3] px-4 py-2 text-xs sm:text-sm font-semibold text-[#4c5c2f] hover:bg-[#f3f8ed] transition"
              >
                <ShoppingBag size={14} className="sm:w-4 sm:h-4" />{" "}
                <span className="hidden sm:inline">Continue shopping</span>
                <span className="sm:hidden">Shop</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
